import { CalendarClock, MessageSquarePlus, Mic2, Plus, SlidersHorizontal, Users } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ActionNotice, BentoCard, DataTable, FormField, PrimaryButton, SelectField, StatusBadge } from "@/components/ui";
import { debateNav } from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/features/auth/current-user";
import { DebateSessionStatus, Role } from "@/generated/prisma";
import { createDebateSessionAction } from "@/features/debate/actions";

export const dynamic = "force-dynamic";

export default async function DebatePage({ searchParams }: { searchParams?: { status?: string } }) {
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  const isTeacherOrAdmin = ([Role.SUPER_ADMIN, Role.ADMIN, Role.TEACHER] as Role[]).includes(session.role);

  const students = await prisma.studentProfile.findMany({ include: { user: true } });

  let sessions: any[] = [];
  if (isTeacherOrAdmin) {
    sessions = await prisma.debateSession.findMany({
      include: { moderator: { include: { user: true } }, _count: { select: { participants: true, evaluations: true } } },
      orderBy: { startsAt: "desc" }
    });
  } else {
    const studentProfile = await prisma.studentProfile.findUnique({ where: { userId: session.userId } });
    if (studentProfile) {
      sessions = await prisma.debateSession.findMany({
        where: {
          OR: [
            { moderatorId: studentProfile.id },
            { participants: { some: { studentId: studentProfile.id } } }
          ]
        },
        include: { moderator: { include: { user: true } }, _count: { select: { participants: true, evaluations: true } } },
        orderBy: { startsAt: "desc" }
      });
    }
  }

  const nextSession = sessions.find((s) => s.status === DebateSessionStatus.SCHEDULED);

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
          {isTeacherOrAdmin && (
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
                  name="moderatorId" 
                  label="Gestor do Debate (Aluno)" 
                  options={[
                    { label: "Sem Moderador Aluno", value: "" },
                    ...students.map(s => ({ label: `${s.user.name} (${s.studentNumber})`, value: s.id }))
                  ]} 
                />
                <PrimaryButton className="w-full" tone="rose" type="submit">Criar Sessão</PrimaryButton>
              </form>
            </BentoCard>
          )}

          <BentoCard className={`p-0 ${isTeacherOrAdmin ? "xl:col-span-8" : "xl:col-span-12"}`}>
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
                s.moderator?.user.name ?? "Professor",
                <StatusBadge key={s.id} tone={s.status === "ACTIVE" ? "danger" : s.status === "CLOSED" ? "navy" : "success"}>{s.status}</StatusBadge>,
                <Link key={`${s.id}-link`} href={`/debate/${s.id}`}>
                  <button className="rounded-xl border border-slate-200 px-3 py-2 text-[10px] font-black uppercase text-slate-700">Ver / Avaliar</button>
                </Link>
              ])}
            />
          </BentoCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
