import { CalendarClock, Mic2, Plus, Trash2, Users, MapPin, Clock } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ActionNotice, BentoCard, DataTable, FormField, PrimaryButton, SelectField, StatusBadge } from "@/components/ui";
import { debateNav } from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/features/auth/current-user";
import { DebateSessionStatus, Role } from "@/generated/prisma";
import { addDebateParticipantAction, removeDebateParticipantAction, updateDebateSessionDetailsAction, updateDebateSessionStatusAction } from "@/features/debate/actions";
import { DebateParticipantList } from "@/components/debate/DebateParticipantList";

export const dynamic = "force-dynamic";

export default async function DebateDetailsPage({ params, searchParams }: { params: { id: string }; searchParams?: { status?: string } }) {
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  const [debate, lastDebates, nextSessions] = await Promise.all([
    prisma.debateSession.findUnique({
      where: { id: params.id },
      include: {
        moderator: { include: { studentProfile: true, teacherProfile: true } },
        moderatorAssignedBy: true,
        sourceProposal: { include: { proposer: true } },
        participants: { include: { student: { include: { user: true } } } },
        evaluations: true
      }
    }),
    prisma.debateSession.findMany({
      where: { status: "CLOSED", id: { not: params.id } },
      orderBy: { startsAt: "desc" },
      take: 1
    }),
    prisma.debateSession.findMany({
      where: { status: "SCHEDULED", id: { not: params.id } },
      orderBy: { startsAt: "asc" },
      take: 2
    })
  ]);

  if (!debate) notFound();

  const isAdmin = ([Role.SUPER_ADMIN, Role.ADMIN] as Role[]).includes(session.role);
  const isAssignedInstructor = debate.moderatorId === session.userId && (!debate.moderatorExpiresAt || debate.moderatorExpiresAt >= new Date());
  
  // New: Check for canModerateDebates permission
  const userPerms = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { canModerateDebates: true }
  });

  const isModerator = isAssignedInstructor || userPerms?.canModerateDebates || isAdmin;
  const currentStudentProfile = await prisma.studentProfile.findUnique({ where: { userId: session.userId } });
  const isParticipant = !!(currentStudentProfile && debate.participants.some(p => p.studentId === currentStudentProfile.id));

  const canManageDebate = isModerator;
  const canEvaluate = isModerator;

  // For adding new participants, get list of students not yet in this debate
  const participantIds = debate.participants.map(p => p.studentId);
  const availableStudents = canManageDebate ? await prisma.studentProfile.findMany({
    where: { id: { notIn: participantIds }, user: { isActive: true } },
    include: { user: true },
    orderBy: { user: { name: "asc" } }
  }) : [];

  const lastDebate = lastDebates[0];
  const startsAtInput = new Date(debate.startsAt.getTime() - debate.startsAt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  return (
    <DashboardLayout
      navItems={debateNav}
      title={debate.topic}
      subtitle="Debate Arena Master"
      context="Sessão Ativa"
      darkSidebar
    >
      <div className="space-y-6">
        <ActionNotice status={searchParams?.status} />

        {/* Hero Card inspired by Prototype */}
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
               <StatusBadge tone={debate.status === "ACTIVE" ? "danger" : debate.status === "CLOSED" ? "navy" : "success"}>{debate.status}</StatusBadge>
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">ID: {debate.id.slice(-6)}</span>
               {canManageDebate && debate.status !== "CLOSED" && (
                 <form action={updateDebateSessionStatusAction} className="ml-auto">
                   <input type="hidden" name="id" value={debate.id} />
                   <input type="hidden" name="status" value={debate.status === "SCHEDULED" ? "ACTIVE" : "CLOSED"} />
                   <PrimaryButton tone="rose" className="min-h-10 py-2 px-4 text-[10px]" type="submit">
                     {debate.status === "SCHEDULED" ? "Iniciar Debate" : "Fechar Sessão"}
                   </PrimaryButton>
                 </form>
               )}
            </div>
            <h3 className="text-3xl font-black mb-6 max-w-2xl leading-tight">{debate.topic}</h3>
            <div className="flex flex-wrap gap-8 items-center mt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <Clock className="text-rose-400" size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Horário</p>
                  <p className="text-sm font-bold">{debate.startsAt.toLocaleString("pt-PT")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <MapPin className="text-rose-400" size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Local</p>
                  <p className="text-sm font-bold">{debate.location || "Sala 04 / Arena"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <Users className="text-rose-400" size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Capacidade</p>
                  <p className="text-sm font-bold">{debate.participants.length} / {debate.capacity} Alunos</p>
                </div>
              </div>
            </div>
            {debate.sourceProposal?.proposer && (
              <p className="mt-5 text-xs font-bold text-slate-400">
                Sugestão original de {debate.sourceProposal.proposer.name}
              </p>
            )}
          </div>
          <div className="absolute right-[-20px] bottom-[-20px] text-white/5 text-9xl font-black rotate-12 select-none">
            DEBATE
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          {/* Side Info & Management */}
          <div className="xl:col-span-4 space-y-6">
            <BentoCard>
               <h3 className="mb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Gestor da Sessão</h3>
               <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-12 h-12 rounded-xl bg-navy text-white flex items-center justify-center font-black">
                    {debate.moderator?.name.charAt(0) || "I"}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">{debate.moderator?.name || "Sem instrutor designado"}</p>
                    <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">
                      {debate.moderator?.id === session.userId ? "Tu és o Instrutor" : "Designado"}
                    </p>
                    {debate.moderatorExpiresAt && (
                      <p className="mt-1 text-[10px] font-bold text-slate-400">
                        Até {debate.moderatorExpiresAt.toLocaleString("pt-PT")}
                      </p>
                    )}
                  </div>
               </div>
               {debate.moderatorNote && (
                 <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                   <p className="text-[10px] font-black uppercase tracking-widest text-navy">Nota para o instrutor</p>
                   <p className="mt-1 text-xs font-bold text-slate-600">{debate.moderatorNote}</p>
                 </div>
               )}

               {canManageDebate && debate.status !== DebateSessionStatus.CLOSED && (
                 <div className="mt-8 border-t border-slate-100 pt-6">
                   <h4 className="mb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Editar Sessão</h4>
                   <form action={updateDebateSessionDetailsAction} className="space-y-4">
                     <input type="hidden" name="id" value={debate.id} />
                     <FormField name="topic" label="Tema" defaultValue={debate.topic} required />
                     <FormField name="startsAt" label="Data e Hora" type="datetime-local" defaultValue={startsAtInput} required />
                     <FormField name="capacity" label="Capacidade" type="number" defaultValue={String(debate.capacity)} min={1} required />
                     <FormField name="location" label="Local" defaultValue={debate.location ?? ""} />
                     <PrimaryButton tone="light" type="submit" className="w-full">
                       Guardar Ajustes
                     </PrimaryButton>
                   </form>
                 </div>
               )}

               {/* Visão de Contexto para Instrutor */}
               {isModerator && (
                 <div className="mt-8 space-y-6 border-t border-slate-100 pt-6">
                    <div>
                       <h4 className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Última Arena</h4>
                       {lastDebate ? (
                         <div className="rounded-2xl bg-slate-900 p-4 text-white">
                            <p className="text-xs font-bold line-clamp-1">{lastDebate.topic}</p>
                            <p className="mt-1 text-[9px] font-black text-rose-400 uppercase">{new Date(lastDebate.startsAt).toLocaleDateString()}</p>
                         </div>
                       ) : (
                         <p className="text-[10px] font-bold text-slate-400 italic">Primeiro debate da arena.</p>
                       )}
                    </div>

                    <div>
                       <h4 className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Próximas Sessões</h4>
                       <div className="space-y-2">
                          {nextSessions.length > 0 ? (
                            nextSessions.map(s => (
                              <div key={s.id} className="rounded-xl border border-slate-100 p-3 flex justify-between items-center">
                                 <span className="text-[10px] font-bold text-slate-600 truncate max-w-[120px]">{s.topic}</span>
                                 <span className="text-[9px] font-black text-navy uppercase">{new Date(s.startsAt).toLocaleDateString()}</span>
                              </div>
                            ))
                          ) : (
                            <div className="rounded-xl bg-amber-50 p-4 text-center border border-amber-100">
                               <p className="text-[10px] font-black text-amber-700 uppercase">Nenhum debate sugerido</p>
                               {isAdmin && (
                                 <p className="mt-1 text-[9px] font-bold text-amber-600">Designa um tema no painel central.</p>
                               )}
                            </div>
                          )}
                       </div>
                    </div>
                 </div>
               )}

               {canManageDebate && debate.status !== DebateSessionStatus.CLOSED && (
                <div className="mt-8 border-t border-slate-100 pt-6">
                  <h4 className="mb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Inscrição Rápida</h4>
                  <form action={addDebateParticipantAction} className="space-y-4">
                    <input type="hidden" name="sessionId" value={debate.id} />
                    <SelectField 
                      name="studentId" 
                      label="Selecionar Aluno"
                      options={availableStudents.map(s => ({ label: `${s.user.name} (${s.studentCode})`, value: s.id }))} 
                      required 
                    />
                    <PrimaryButton tone="navy" type="submit" className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest">
                      Adicionar à Sessão
                    </PrimaryButton>
                  </form>
                </div>
              )}
              {session.role === Role.STUDENT && currentStudentProfile && !isParticipant && !isModerator && debate.status === DebateSessionStatus.SCHEDULED && (
                <div className="mt-8 border-t border-slate-100 pt-6">
                  <form action={addDebateParticipantAction}>
                    <input type="hidden" name="sessionId" value={debate.id} />
                    <input type="hidden" name="studentId" value={currentStudentProfile.id} />
                    <PrimaryButton tone="rose" type="submit" className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-200">
                      Participar do Debate
                    </PrimaryButton>
                  </form>
                </div>
              )}
            </BentoCard>
          </div>

          {/* Participants List - Now using the client component */}
          <div className="xl:col-span-8">
            <div className="flex items-center justify-between px-2 mb-4">
                <h3 className="font-extrabold text-slate-400 uppercase text-[10px] tracking-widest">Alunos em Arena</h3>
                <StatusBadge tone="navy">{`${debate.participants.length} Inscritos`}</StatusBadge>
            </div>
            
            <DebateParticipantList 
              participants={debate.participants}
              evaluations={debate.evaluations}
              canEvaluate={canEvaluate}
              canManageDebate={canManageDebate}
              moderatorUserId={debate.moderatorId}
              sessionId={debate.id}
              sessionStatus={debate.status}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
        <span>{label}</span>
        <span className="text-crimson">{value}/10</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-crimson" style={{ width: `${value * 10}%` }} />
      </div>
    </div>
  );
}
