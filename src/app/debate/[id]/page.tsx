import { CalendarClock, Mic2, Plus, Trash2, Users, MapPin, Clock } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ActionNotice, BentoCard, DataTable, FormField, PrimaryButton, SelectField, StatusBadge } from "@/components/ui";
import { debateNav } from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/features/auth/current-user";
import { DebateSessionStatus, Role } from "@/generated/prisma";
import { addDebateParticipantAction, removeDebateParticipantAction, updateDebateSessionDetailsAction } from "@/features/debate/actions";
import { DebateParticipantList } from "@/components/debate/DebateParticipantList";
import { DebateStatusControl } from "@/components/debate/DebateStatusControl";
import { DebateManagementControls } from "@/components/debate/DebateManagementControls";

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
        participants: { 
          include: { 
            student: { 
              include: { 
                user: true,
                grades: true,
                debateEvaluations: true
              } 
            } 
          } 
        },
        evaluations: true
      }
    }),
    prisma.debateSession.findMany({
      where: { status: "CLOSED", id: { not: params.id } },
      include: {
        participants: true,
        evaluations: true
      },
      orderBy: { startsAt: "desc" },
      take: 5
    }),
    prisma.debateSession.findMany({
      where: { status: "SCHEDULED", id: { not: params.id } },
      orderBy: { startsAt: "asc" },
      take: 2
    })
  ]);

  if (!debate) notFound();

  const participantsWithStats = debate.participants.map((p) => {
    const s = p.student;
    
    // Speaking Skills
    const debateEvals = s.debateEvaluations ?? [];
    const debateAvg = debateEvals.length > 0 
      ? debateEvals.reduce((sum, ev) => sum + ev.fluency + ev.argumentation + ev.posture, 0) / (debateEvals.length * 3) 
      : 0;

    const speakingGrades = s.grades.filter(g => 
      g.isSpeaking || (!g.isWriting && /speaking|oral|speech|apresenta|debate|conversac/i.test(g.title))
    ) ?? [];

    let speakingPercentage = 0;
    if (debateEvals.length > 0) {
      const debateScore = debateAvg * 10; // Escala 0-100%
      if (speakingGrades.length > 0) {
        const normalizedGradesSum = speakingGrades.reduce((sum, g) => sum + ((g.score / g.maxScore) * 100) * g.weight, 0);
        const totalWeight = speakingGrades.reduce((sum, g) => sum + g.weight, 0);
        const gradesScore = totalWeight > 0 ? normalizedGradesSum / totalWeight : 0;
        speakingPercentage = (debateScore * 0.7) + (gradesScore * 0.3);
      } else {
        speakingPercentage = debateScore;
      }
    } else if (speakingGrades.length > 0) {
      const normalizedSum = speakingGrades.reduce((sum, g) => sum + ((g.score / g.maxScore) * 100) * g.weight, 0);
      const totalWeight = speakingGrades.reduce((sum, g) => sum + g.weight, 0);
      speakingPercentage = totalWeight > 0 ? normalizedSum / totalWeight : 0;
    }

    // Writing Mastery
    const writingGrades = s.grades.filter(g => 
      g.isWriting || (!g.isSpeaking && /writing|write|redaç|redac|composition|essay|escrit|gramat|grammar|dictation|ditado/i.test(g.title))
    ) ?? [];
    
    let writingPercentage = 0;
    if (writingGrades.length > 0) {
      const normalizedSum = writingGrades.reduce((sum, g) => sum + ((g.score / g.maxScore) * 100) * g.weight, 0);
      const totalWeight = writingGrades.reduce((sum, g) => sum + g.weight, 0);
      writingPercentage = totalWeight > 0 ? normalizedSum / totalWeight : 0;
    } else if (s.grades && s.grades.length > 0) {
      const nonSpeakingGrades = s.grades.filter(g => 
        !g.isSpeaking && !/speaking|oral|speech|apresenta|debate|conversac/i.test(g.title)
      );
      const gradesToUse = nonSpeakingGrades.length > 0 ? nonSpeakingGrades : s.grades;
      const normalizedSum = gradesToUse.reduce((sum, g) => sum + ((g.score / g.maxScore) * 100) * g.weight, 0);
      const totalWeight = gradesToUse.reduce((sum, g) => sum + g.weight, 0);
      writingPercentage = totalWeight > 0 ? normalizedSum / totalWeight : 0;
    }

    return {
      id: p.id,
      sessionId: p.sessionId,
      studentId: p.studentId,
      joinedAt: p.joinedAt,
      student: {
        id: s.id,
        userId: s.userId,
        studentNumber: s.studentNumber,
        studentCode: s.studentCode,
        level: s.level,
        user: {
          id: s.user.id,
          name: s.user.name,
          email: s.user.email,
          role: s.user.role,
        }
      },
      stats: {
        speaking: speakingPercentage,
        writing: writingPercentage
      }
    };
  });

  const isAdmin = ([Role.SUPER_ADMIN, Role.ADMIN] as Role[]).includes(session.role);
  const isAssignedInstructor = debate.moderatorId === session.userId && (!debate.moderatorExpiresAt || debate.moderatorExpiresAt >= new Date());
  
  // New: Check for canModerateDebates permission
  const userPerms = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { canModerateDebates: true }
  });

  const isModerator = isAssignedInstructor || userPerms?.canModerateDebates || isAdmin;
  const currentStudentProfile = await prisma.studentProfile.findUnique({ where: { userId: session.userId } });
  const isParticipant = !!(currentStudentProfile && participantsWithStats.some(p => p.studentId === currentStudentProfile.id));

  const canManageDebate = isModerator;
  const canEvaluate = isModerator;

  // For adding new participants, get list of students not yet in this debate
  const participantIds = participantsWithStats.map(p => p.studentId);
  const availableStudents = canManageDebate ? await prisma.studentProfile.findMany({
    where: { id: { notIn: participantIds }, user: { isActive: true } },
    include: { 
      user: true,
      debateEvaluations: true,
      grades: true
    },
    orderBy: { user: { name: "asc" } }
  }) : [];

  const availableStudentsWithStats = availableStudents.map(s => {
    const debateEvals = s.debateEvaluations ?? [];
    const debateAvg = debateEvals.length > 0 
      ? debateEvals.reduce((sum, ev) => sum + ev.fluency + ev.argumentation + ev.posture, 0) / (debateEvals.length * 3) 
      : 0;

    // Speaking Skills
    const speakingGrades = (s.grades ?? []).filter(g => 
      g.isSpeaking || (!g.isWriting && /speaking|oral|speech|apresenta|debate|conversac/i.test(g.title))
    );
    let speakingPercentage = 0;
    if (debateEvals.length > 0) {
      const debateScore = debateAvg * 10;
      if (speakingGrades.length > 0) {
        const normalizedGradesSum = speakingGrades.reduce((sum, g) => sum + ((g.score / g.maxScore) * 100) * g.weight, 0);
        const totalWeight = speakingGrades.reduce((sum, g) => sum + g.weight, 0);
        const gradesScore = totalWeight > 0 ? normalizedGradesSum / totalWeight : 0;
        speakingPercentage = (debateScore * 0.7) + (gradesScore * 0.3);
      } else {
        speakingPercentage = debateScore;
      }
    } else if (speakingGrades.length > 0) {
      const normalizedSum = speakingGrades.reduce((sum, g) => sum + ((g.score / g.maxScore) * 100) * g.weight, 0);
      const totalWeight = speakingGrades.reduce((sum, g) => sum + g.weight, 0);
      speakingPercentage = totalWeight > 0 ? normalizedSum / totalWeight : 0;
    }

    // Writing Skills
    const writingGrades = (s.grades ?? []).filter(g => 
      g.isWriting || (!g.isSpeaking && /writing|write|reda|composition|essay|escrit|gramat|grammar|dictation|ditado/i.test(g.title))
    );
    let writingPercentage = 0;
    if (writingGrades.length > 0) {
      const normalizedSum = writingGrades.reduce((sum, g) => sum + ((g.score / g.maxScore) * 100) * g.weight, 0);
      const totalWeight = writingGrades.reduce((sum, g) => sum + g.weight, 0);
      writingPercentage = totalWeight > 0 ? normalizedSum / totalWeight : 0;
    } else if (s.grades && s.grades.length > 0) {
      const nonSpeakingGrades = s.grades.filter(g => 
        !g.isSpeaking && !/speaking|oral|speech|apresenta|debate|conversac/i.test(g.title)
      );
      const gradesToUse = nonSpeakingGrades.length > 0 ? nonSpeakingGrades : s.grades;
      const normalizedSum = gradesToUse.reduce((sum, g) => sum + ((g.score / g.maxScore) * 100) * g.weight, 0);
      const totalWeight = gradesToUse.reduce((sum, g) => sum + g.weight, 0);
      writingPercentage = totalWeight > 0 ? normalizedSum / totalWeight : 0;
    }

    return {
      id: s.id,
      name: s.user.name,
      studentCode: s.studentCode,
      speakingPercentage: Math.min(Math.round(speakingPercentage), 100),
      writingPercentage: Math.min(Math.round(writingPercentage), 100)
    };
  });

  const lastDebate = lastDebates[0];
  const startsAtInput = new Date(debate.startsAt.getTime() - debate.startsAt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  const pastDebatesWithStats = lastDebates.map(d => {
    const evals = d.evaluations ?? [];
    const avgScore = evals.length > 0
      ? evals.reduce((sum, ev) => sum + ev.fluency + ev.argumentation + ev.posture, 0) / (evals.length * 3)
      : 0;
    return {
      id: d.id,
      topic: d.topic,
      startsAt: d.startsAt,
      participantsCount: d.participants.length,
      averageScore: avgScore
    };
  });

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
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
               <div className="flex items-center gap-3">
                  <StatusBadge tone={debate.status === "ACTIVE" ? "danger" : debate.status === "CLOSED" ? "navy" : "success"}>{debate.status}</StatusBadge>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">ID: {debate.id.slice(-6)}</span>
                  {canManageDebate && (
                    <DebateStatusControl id={debate.id} status={debate.status} />
                  )}
               </div>
               {canManageDebate && (
                 <DebateManagementControls 
                   debateId={debate.id}
                   topic={debate.topic}
                   startsAt={startsAtInput}
                   capacity={debate.capacity}
                   location={debate.location ?? ""}
                   status={debate.status}
                   canManage={canManageDebate}
                   availableStudents={availableStudentsWithStats}
                 />
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
                  <p className="text-sm font-bold">{participantsWithStats.length} / {debate.capacity} Alunos</p>
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

            {/* Histórico Geral de Debates */}
            <BentoCard>
              <h3 className="mb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Histórico de Debates</h3>
              <div className="space-y-3">
                {pastDebatesWithStats.length > 0 ? (
                  pastDebatesWithStats.map((pd) => (
                    <div key={pd.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex flex-col gap-1.5 hover:border-slate-200 hover:bg-white transition-all group">
                      <div className="flex justify-between items-start gap-2">
                        <a href={`/debate/${pd.id}`} className="text-xs font-black text-slate-900 group-hover:text-rose-600 truncate transition-all flex-1">
                          {pd.topic}
                        </a>
                        <span className="text-[9px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100 uppercase shrink-0">
                          {pd.averageScore > 0 ? `${(pd.averageScore * 10).toFixed(0)}%` : "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[9px] font-bold text-slate-400">
                        <span>{new Date(pd.startsAt).toLocaleDateString()}</span>
                        <span>{pd.participantsCount} Participantes</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] font-bold text-slate-400 italic">Nenhum debate encerrado anteriormente.</p>
                )}
              </div>
            </BentoCard>
          </div>

          {/* Participants List - Now using the client component */}
          <div className="xl:col-span-8">
            <div className="flex items-center justify-between px-2 mb-4">
                <h3 className="font-extrabold text-slate-400 uppercase text-[10px] tracking-widest">Alunos em Arena</h3>
                <StatusBadge tone="navy">{`${participantsWithStats.length} Inscritos`}</StatusBadge>
            </div>
            
            <DebateParticipantList 
              participants={participantsWithStats}
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
