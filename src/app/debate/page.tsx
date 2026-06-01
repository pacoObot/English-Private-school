import { CalendarClock, CheckCircle2, Heart, MessageSquarePlus, SlidersHorizontal, Users, XCircle } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ActionNotice, BentoCard, DataTable, FormField, PrimaryButton, SelectField, StatusBadge } from "@/components/ui";
import { debateNav } from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/features/auth/current-user";
import { DebateSessionStatus, Role } from "@/generated/prisma";
import { approveDebateProposalAction, assignDebateInstructorAction, createDebateProposalAction, createDebateSessionAction, rejectDebateProposalAction, toggleDebateProposalSupportAction } from "@/features/debate/actions";

export const dynamic = "force-dynamic";

export default async function DebatePage({ searchParams }: { searchParams?: { status?: string } }) {
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  const isAdmin = ([Role.SUPER_ADMIN, Role.ADMIN] as Role[]).includes(session.role);
  const canApproveProposal = isAdmin || session.role === Role.TEACHER;

  const instructors = await prisma.user.findMany({
    where: {
      isActive: true
    },
    include: { studentProfile: true, teacherProfile: true },
    orderBy: { name: "asc" }
  });

  const [sessions, proposals, classGroups] = await Promise.all([
    prisma.debateSession.findMany({
      include: { moderator: true, sourceProposal: { include: { proposer: true } }, _count: { select: { participants: true, evaluations: true } } },
      orderBy: { startsAt: "desc" }
    }),
    prisma.debateProposal.findMany({
      include: {
        proposer: { include: { studentProfile: true, teacherProfile: true } },
        approvedBy: true,
        convertedSession: true,
        reactions: true,
        _count: { select: { reactions: true } }
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }]
    }),
    prisma.classGroup.findMany({
      include: { course: true },
      orderBy: { name: "asc" }
    })
  ]);

  const nextSession = sessions.find((s) => s.status === DebateSessionStatus.SCHEDULED);
  const todayForInput = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16);

  return (
    <DashboardLayout
      navItems={debateNav}
      title="Sessões de Debate"
      subtitle="Debate Arena"
      context="Debate Arena"
    >
      <div className="space-y-6">
        <ActionNotice status={searchParams?.status} />
        
        {nextSession && (
          <BentoCard dark className="relative overflow-hidden">
            <div className="relative z-10">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-2xl font-black tracking-tight">Próximo Debate: {nextSession.topic}</h3>
                <Link href={`/debate/${nextSession.id}`}>
                  <PrimaryButton tone="rose">Abrir Sessão</PrimaryButton>
                </Link>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:max-w-2xl">
                <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-rose-400"><CalendarClock size={18} /></div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Data/Hora</p>
                    <p className="text-sm font-bold text-white">{nextSession.startsAt.toLocaleString("pt-PT")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-rose-400"><Users size={18} /></div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Inscritos</p>
                    <p className="text-sm font-bold text-white">{nextSession._count.participants} / {nextSession.capacity}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-8 -right-4 rotate-12 text-7xl font-black text-white/5 sm:text-9xl">DEBATE</div>
          </BentoCard>
        )}

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          {isAdmin && (
            <BentoCard className="xl:col-span-4">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-black text-slate-800">Agendar Debate</h3>
                <MessageSquarePlus className="text-crimson" />
              </div>
              <form action={createDebateSessionAction} className="space-y-4">
                <FormField name="topic" label="Tema do Debate" placeholder="Ex: Impacto da IA na Educacao" required />
                <FormField name="startsAt" label="Data e Hora" type="datetime-local" required />
                <FormField name="capacity" label="Capacidade" type="number" defaultValue="15" required />
                <FormField name="location" label="Local" placeholder="Sala 04" />
                <SelectField
                  name="classGroupId"
                  label="Turma (Opcional)"
                  options={[
                    { label: "Qualquer turma", value: "" },
                    ...classGroups.map((cg) => ({ label: `${cg.name} · ${cg.course.title}`, value: cg.id }))
                  ]}
                />
                <SelectField 
                  name="moderatorId" 
                  label="Instrutor designado" 
                  options={[
                    { label: "Sem instrutor designado", value: "" },
                    ...instructors.map((user) => ({
                      label: `${user.name} (${user.studentProfile?.studentCode ?? user.teacherProfile?.staffNumber ?? user.role})`,
                      value: user.id
                    }))
                  ]} 
                />
                <FormField name="moderatorExpiresAt" label="Instrutor até" type="datetime-local" />
                <FormField name="moderatorNote" label="Nota para o instrutor" placeholder="Ex: foco em fluência e postura" />
                <PrimaryButton className="w-full" tone="rose" type="submit">Criar Sessão</PrimaryButton>
              </form>
            </BentoCard>
          )}

          <BentoCard className={isAdmin ? "xl:col-span-4" : "xl:col-span-4"}>
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-black text-slate-800">Sugerir Debate</h3>
              <MessageSquarePlus className="text-navy" />
            </div>
            <form action={createDebateProposalAction} className="space-y-4">
              <FormField name="topic" label="Tema" placeholder="Ex: Should English clubs be mandatory?" required />
              <FormField name="reason" label="Por que devemos debater?" placeholder="Explique em uma frase" />
              <SelectField
                  name="classGroupId"
                  label="Para alguma turma especifica?"
                  options={[
                    { label: "Qualquer turma / Publico", value: "" },
                    ...classGroups.map((cg) => ({ label: `${cg.name} · ${cg.course.title}`, value: cg.id }))
                  ]}
              />
              <PrimaryButton className="w-full" tone="navy" type="submit">Enviar Sugestão</PrimaryButton>
            </form>
          </BentoCard>

          <BentoCard className={`p-0 ${isAdmin ? "xl:col-span-4" : "xl:col-span-8"}`}>
            <div className="flex items-center justify-between p-6">
              <h3 className="font-black text-slate-800">Histórico de Sessões</h3>
              <SlidersHorizontal size={18} className="text-slate-400" />
            </div>
            <DataTable
              emptyMessage="Nenhuma sessão de debate encontrada."
              headers={["Tema", "Data", "Moderador", "Estado", "Ações"]}
              rows={sessions.map((s) => [
                s.topic,
                s.startsAt.toLocaleDateString("pt-PT"),
                <div key={`${s.id}-mod`} className="space-y-1">
                  {s.moderator ? (
                    <div className="space-y-1">
                      <p className="font-bold text-slate-700">{s.moderator.name}</p>
                      {isAdmin && s.status !== "CLOSED" && (
                        <form action={assignDebateInstructorAction} className="flex items-center gap-1 mt-1">
                          <input type="hidden" name="id" value={s.id} />
                          <input type="hidden" name="returnTo" value="/debate" />
                          <select name="moderatorId" defaultValue={s.moderatorId ?? ""} className="text-[10px] font-bold rounded-lg border border-slate-200 px-1 py-0.5 bg-white outline-none focus:border-navy max-w-[130px]">
                            <option value="">Retirar Instrutor</option>
                            {instructors.map((user) => (
                              <option key={user.id} value={user.id}>{user.name}</option>
                            ))}
                          </select>
                          <PrimaryButton tone="navy" className="min-h-6 px-1.5 py-0.5 text-[8px]" type="submit">Alt</PrimaryButton>
                        </form>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="font-bold text-amber-600 italic">Sem instrutor</p>
                      {isAdmin && s.status !== "CLOSED" && (
                        <form action={assignDebateInstructorAction} className="flex items-center gap-1 mt-1">
                          <input type="hidden" name="id" value={s.id} />
                          <input type="hidden" name="returnTo" value="/debate" />
                          <select name="moderatorId" defaultValue="" className="text-[10px] font-bold rounded-lg border border-slate-200 px-1 py-0.5 bg-white outline-none focus:border-navy max-w-[130px]">
                            <option value="">Designar...</option>
                            {instructors.map((user) => (
                              <option key={user.id} value={user.id}>{user.name}</option>
                            ))}
                          </select>
                          <PrimaryButton tone="rose" className="min-h-6 px-1.5 py-0.5 text-[8px]" type="submit">OK</PrimaryButton>
                        </form>
                      )}
                    </div>
                  )}
                  {s.sourceProposal?.proposer && <p className="text-[10px] font-bold text-slate-400">Sugerido por {s.sourceProposal.proposer.name}</p>}
                </div>,
                <StatusBadge key={s.id} tone={s.status === "ACTIVE" ? "danger" : s.status === "CLOSED" ? "navy" : "success"}>{s.status}</StatusBadge>,
                <Link key={`${s.id}-link`} href={`/debate/${s.id}`}>
                  <PrimaryButton tone="light" className="px-3 min-h-10 py-2 text-[10px]">Ver / Avaliar</PrimaryButton>
                </Link>
              ])}
            />
          </BentoCard>
        </div>

        <BentoCard className="p-0">
          <div className="flex items-center justify-between p-6">
            <h3 className="font-black text-slate-800">Sugestões da Comunidade</h3>
            <StatusBadge tone="navy">{`${proposals.filter((p) => p.status === "PENDING").length} Pendentes`}</StatusBadge>
          </div>
          <DataTable
            emptyMessage="Ainda não existem sugestões de debate."
            headers={["Sugestão", "Apoios", "Estado", "Ações"]}
            rows={proposals.map((proposal) => {
              const supportedByMe = proposal.reactions.some((reaction) => reaction.userId === session.userId);
              return [
                <div key={`${proposal.id}-topic`} className="grid gap-1">
                  <p className="font-black text-slate-800">{proposal.topic}</p>
                  <p className="text-xs font-bold text-slate-500">Sugerido por {proposal.proposer.name}</p>
                  {proposal.reason && <p className="text-xs text-slate-400">{proposal.reason}</p>}
                  {proposal.convertedSession && (
                    <Link href={`/debate/${proposal.convertedSession.id}`} className="text-[10px] font-black uppercase text-navy hover:underline">
                      Abrir sessão criada
                    </Link>
                  )}
                </div>,
                <div key={`${proposal.id}-support`} className="flex items-center gap-2">
                  <StatusBadge tone={proposal._count.reactions > 0 ? "danger" : "neutral"}>{proposal._count.reactions}</StatusBadge>
                  {proposal.status === "PENDING" && (
                    <form action={toggleDebateProposalSupportAction}>
                      <input type="hidden" name="proposalId" value={proposal.id} />
                      <PrimaryButton tone={supportedByMe ? "rose" : "light"} className="min-h-9 px-3 py-2 text-[10px]" type="submit">
                        <Heart size={12} /> {supportedByMe ? "Apoiado" : "Apoiar"}
                      </PrimaryButton>
                    </form>
                  )}
                </div>,
                <StatusBadge key={`${proposal.id}-status`} tone={proposal.status === "APPROVED" ? "success" : proposal.status === "REJECTED" ? "danger" : "warning"}>
                  {proposal.status}
                </StatusBadge>,
                proposal.status === "PENDING" && canApproveProposal ? (
                  <div key={`${proposal.id}-approve`} className="grid gap-2">
                    <form action={approveDebateProposalAction} className="grid gap-2">
                      <input type="hidden" name="proposalId" value={proposal.id} />
                      <input name="startsAt" type="datetime-local" defaultValue={todayForInput} required className="min-h-10 rounded-xl border border-slate-200 px-3 text-xs font-bold outline-none focus:border-navy" />
                      <div className="grid grid-cols-2 gap-2">
                        <input name="capacity" type="number" defaultValue={15} min={1} required className="min-h-10 rounded-xl border border-slate-200 px-3 text-xs font-bold outline-none focus:border-navy" />
                        <input name="location" placeholder="Sala" className="min-h-10 rounded-xl border border-slate-200 px-3 text-xs font-bold outline-none focus:border-navy" />
                      </div>
                      <select name="moderatorId" className="min-h-10 rounded-xl border border-slate-200 px-3 text-xs font-bold outline-none focus:border-navy" defaultValue="">
                        <option value="">Sem instrutor</option>
                        {instructors.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name} ({user.studentProfile?.studentCode ?? user.teacherProfile?.staffNumber ?? user.role})
                          </option>
                        ))}
                      </select>
                      <select name="classGroupId" className="min-h-10 rounded-xl border border-slate-200 px-3 text-xs font-bold outline-none focus:border-navy" defaultValue={proposal.classGroupId || ""}>
                        <option value="">Qualquer turma</option>
                        {classGroups.map((cg) => (
                          <option key={cg.id} value={cg.id}>
                            {cg.name} ({cg.course.title})
                          </option>
                        ))}
                      </select>
                      <input name="moderatorExpiresAt" type="datetime-local" className="min-h-10 rounded-xl border border-slate-200 px-3 text-xs font-bold outline-none focus:border-navy" />
                      <input name="moderatorNote" placeholder="Nota para o instrutor" className="min-h-10 rounded-xl border border-slate-200 px-3 text-xs font-bold outline-none focus:border-navy" />
                      <PrimaryButton tone="navy" className="min-h-9 px-3 py-2 text-[10px]" type="submit">
                        <CheckCircle2 size={12} /> Aprovar
                      </PrimaryButton>
                    </form>
                    <form action={rejectDebateProposalAction}>
                      <input type="hidden" name="proposalId" value={proposal.id} />
                      <PrimaryButton tone="light" className="w-full min-h-9 px-3 py-2 text-[10px]" type="submit">
                        <XCircle size={12} /> Rejeitar
                      </PrimaryButton>
                    </form>
                  </div>
                ) : (
                  <span key={`${proposal.id}-noop`} className="text-xs font-bold text-slate-400">Sem ação</span>
                )
              ];
            })}
          />
        </BentoCard>
      </div>
    </DashboardLayout>
  );
}
