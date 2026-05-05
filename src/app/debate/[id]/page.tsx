import { CalendarClock, Mic2, Plus, Trash2, Users, MapPin, Clock } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ActionNotice, BentoCard, DataTable, FormField, PrimaryButton, SelectField, StatusBadge } from "@/components/ui";
import { debateNav } from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/features/auth/current-user";
import { DebateSessionStatus, Role } from "@/generated/prisma";
import { addDebateParticipantAction, removeDebateParticipantAction, updateDebateSessionStatusAction } from "@/features/debate/actions";
import { DebateParticipantList } from "@/components/debate/DebateParticipantList";

export const dynamic = "force-dynamic";

export default async function DebateDetailsPage({ params, searchParams }: { params: { id: string }; searchParams?: { status?: string } }) {
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  const debate = await prisma.debateSession.findUnique({
    where: { id: params.id },
    include: {
      moderator: { include: { user: true } },
      participants: { include: { student: { include: { user: true } } } },
      evaluations: true
    }
  });

  if (!debate) notFound();

  const isTeacherOrAdmin = ([Role.SUPER_ADMIN, Role.ADMIN, Role.TEACHER] as Role[]).includes(session.role);
  
  let isModerator = false;
  let isParticipant = false;
  let currentStudentProfile: any = null;
  if (!isTeacherOrAdmin) {
    currentStudentProfile = await prisma.studentProfile.findUnique({ where: { userId: session.userId } });
    isModerator = !!(currentStudentProfile && debate.moderatorId === currentStudentProfile.id);
    isParticipant = !!(currentStudentProfile && debate.participants.some(p => p.studentId === currentStudentProfile.id));
  }

  const canEvaluate = isTeacherOrAdmin || isModerator;

  // For adding new participants, get list of students not yet in this debate
  const participantIds = debate.participants.map(p => p.studentId);
  const availableStudents = isTeacherOrAdmin ? await prisma.studentProfile.findMany({
    where: { id: { notIn: participantIds } },
    include: { user: true },
    orderBy: { user: { name: "asc" } }
  }) : [];

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
               {isTeacherOrAdmin && debate.status !== "CLOSED" && (
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
                  <div className="w-12 h-12 rounded-xl bg-rose-600 flex items-center justify-center text-white font-black">
                    {debate.moderator?.user.name.charAt(0) || "P"}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">{debate.moderator?.user.name || "Professor Responsável"}</p>
                    <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Moderador</p>
                  </div>
               </div>

               {isTeacherOrAdmin && debate.status !== DebateSessionStatus.CLOSED && (
                <div className="mt-8 border-t border-slate-100 pt-6">
                  <h4 className="mb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Inscrição Rápida</h4>
                  <form action={addDebateParticipantAction} className="space-y-4">
                    <input type="hidden" name="sessionId" value={debate.id} />
                    <SelectField 
                      name="studentId" 
                      label="Selecionar Aluno"
                      options={availableStudents.map(s => ({ label: `${s.user.name} (${s.studentNumber})`, value: s.id }))} 
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
              isTeacherOrAdmin={isTeacherOrAdmin}
              moderatorId={debate.moderatorId}
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
