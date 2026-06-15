import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BentoCard } from "@/components/ui/BentoCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { getCurrentSession } from "@/features/auth/current-user";
import { acknowledgeDebateFeedbackAction, submitStudentConcernAction, addDebateParticipantAction } from "@/features/debate/actions";
import { studentNav } from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";
import { getLocale, getDictionary } from "@/i18n/locale";
import { Calendar, Mic2, Clock, CheckCircle2, TrendingUp, Send, AlertTriangle, Zap, Laptop, Lock, Lightbulb, MessageSquare, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentDebatesPage() {
  const session = await getCurrentSession();
  const locale = await getLocale();
  const dict = await getDictionary();
  const student = session
    ? await prisma.studentProfile.findFirst({
        where: { userId: session.userId },
        include: {
          debateEvaluations: {
            include: { session: true, evaluator: true },
            orderBy: { evaluatedAt: "desc" }
          },
          debateParticipations: {
            include: { session: true }
          }
        }
      })
    : null;

  const evaluations = student?.debateEvaluations ?? [];
  const participations = student?.debateParticipations ?? [];
  const lastScore = evaluations[0]
    ? ((evaluations[0].fluency + evaluations[0].argumentation + evaluations[0].posture) / 3).toFixed(1)
    : "0.0";

  // Aproveitamento ponderado: últimos N debates
  function avgPercent(n: number): string {
    const slice = evaluations.slice(0, n);
    if (slice.length === 0) return "0";
    const sum = slice.reduce((acc, ev) => acc + ((ev.fluency + ev.argumentation + ev.posture) / 3) * 10, 0);
    return (sum / slice.length).toFixed(0);
  }
  const avg10 = avgPercent(10);
  const avg20 = avgPercent(20);
  const total10 = Math.min(evaluations.length, 10);
  const total20 = Math.min(evaluations.length, 20);
  
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // Próximos debates (sessões agendadas onde o aluno é participante ou ainda não)
  const upcomingDebates = await prisma.debateSession.findMany({
     where: { 
       startsAt: { gte: todayStart },
       status: { in: ["SCHEDULED", "ACTIVE"] }
     },
     include: {
       participants: true
     },
     orderBy: { startsAt: "asc" }
  });

  const now = new Date();
  const activeModeratingSessions = session
    ? await prisma.debateSession.findMany({
        where: {
          moderatorId: session.userId,
          status: { in: ["SCHEDULED", "ACTIVE"] },
          OR: [
            { moderatorExpiresAt: null },
            { moderatorExpiresAt: { gt: now } }
          ]
        },
        orderBy: { startsAt: "asc" }
      })
    : [];

  retu    <DashboardLayout
      navItems={studentNav.map(item => ({ ...item, active: item.label === "Debates" }))}
      title={dict.debateScoreTitle}
      subtitle={dict.debateScoreSub}
      context="Student Portal"
      darkSidebar
    >
      <div className="space-y-6">
        {/* Painel Temporário de Instrutor */}
        {activeModeratingSessions.map(modSession => {
          const expiresText = modSession.moderatorExpiresAt 
            ? `${locale === "en-US" ? "Privileges expire on" : "Privilégios expiram em"} ${modSession.moderatorExpiresAt.toLocaleDateString(locale)} ${locale === "en-US" ? "at" : "às"} ${modSession.moderatorExpiresAt.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}`
            : dict.permanentPrivileges;
            
          return (
            <BentoCard key={modSession.id} className="bg-gradient-to-r from-slate-900 to-rose-950 text-white relative overflow-hidden p-6 rounded-[2.5rem]" dark>
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex gap-4 items-start">
                  <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center text-rose-400 shrink-0">
                    <Mic2 size={24} />
                  </div>
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[8px] font-black uppercase tracking-wider">
                      {dict.tempInstructorPanel}
                    </span>
                    <h3 className="text-lg font-black mt-1.5 text-slate-100">{modSession.topic}</h3>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">
                      {expiresText}
                    </p>
                  </div>
                </div>
                
                <Link href={`/debate/${modSession.id}`} className="shrink-0">
                  <PrimaryButton tone="rose" className="w-full md:w-auto px-6 py-3 text-[10px] uppercase font-black tracking-widest flex items-center justify-center gap-2">
                    {dict.accessPrivileges} <ArrowRight size={12} />
                  </PrimaryButton>
                </Link>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
            </BentoCard>
          );
        })}

        {/* Qualitative Performance Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <BentoCard className="lg:col-span-2 bg-slate-900 text-white relative overflow-hidden" dark>
              <div className="relative z-10">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 mb-2">{dict.speakerProfile}</p>
                 <h2 className="text-3xl font-black mb-6">
                    {evaluations.length > 0 && (evaluations[0].fluency + evaluations[0].argumentation) / 2 >= 8 
                      ? dict.qualitativeSpeaker 
                      : evaluations.length > 0 
                        ? dict.qualitativeDeveloping 
                        : dict.awaitingFirstEval}
                 </h2>
                 <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                    {dict.studentCode}: {student?.studentCode ?? "---"}
                 </p>
                 
                 <div className="grid grid-cols-3 gap-8 mt-10">
                    <StatItem label={dict.fluency} value={`${(evaluations.reduce((s, e) => s + e.fluency, 0) / (evaluations.length || 1) * 10).toFixed(0)}%`} />
                    <StatItem label={locale === "en-US" ? "Argument" : "Argumento"} value={`${(evaluations.reduce((s, e) => s + e.argumentation, 0) / (evaluations.length || 1) * 10).toFixed(0)}%`} />
                    <StatItem label={dict.posture} value={`${(evaluations.reduce((s, e) => s + e.posture, 0) / (evaluations.length || 1) * 10).toFixed(0)}%`} />
                 </div>
              </div>
              <Mic2 className="absolute -bottom-10 -right-10 w-64 h-64 text-white/5 rotate-12" />
           </BentoCard>

           <BentoCard className="flex flex-col justify-between">
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">{dict.lastFeedback}</p>
                 <p className="text-sm font-bold text-slate-600 italic leading-relaxed">
                    &quot;{evaluations[0]?.feedback || dict.recentFeedbackNotice}&quot;
                 </p>
              </div>
              <div className="mt-6 pt-6 border-t border-slate-100 flex items-center gap-3">
                 <div className="h-10 w-10 rounded-full bg-navy text-white flex items-center justify-center font-black text-xs">
                    {lastScore}
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase">{dict.overallScore}</p>
                     <p className="text-xs font-bold text-slate-900">{dict.lastSession}</p>
                  </div>
              </div>
           </BentoCard>
        </div>

        {/* Cartões de Aproveitamento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BentoCard className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-200">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{dict.achievement10}</p>
              <p className="text-2xl font-black text-slate-900">{avg10}<span className="text-sm font-bold text-slate-400">%</span></p>
              <p className="text-[10px] font-bold text-slate-400">
                {locale === "en-US" 
                  ? `${total10} evaluated debate${total10 !== 1 ? "s" : ""}`
                  : `${total10} debate${total10 !== 1 ? "s" : ""} avaliado${total10 !== 1 ? "s" : ""}`}
              </p>
            </div>
          </BentoCard>
          <BentoCard className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-200">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{dict.achievement20}</p>
              <p className="text-2xl font-black text-slate-900">{avg20}<span className="text-sm font-bold text-slate-400">%</span></p>
              <p className="text-[10px] font-bold text-slate-400">
                {locale === "en-US" 
                  ? `${total20} evaluated debate${total20 !== 1 ? "s" : ""}`
                  : `${total20} debate${total20 !== 1 ? "s" : ""} avaliado${total20 !== 1 ? "s" : ""}`}
              </p>
            </div>
          </BentoCard>
        </div>

        {/* Sessions Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* Upcoming Debates */}
           <div className="space-y-4">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">{dict.upcomingDebates}</h3>
              {upcomingDebates.length === 0 ? (
                <BentoCard className="text-center py-10">
                   <p className="text-sm font-bold text-slate-400 italic">{dict.noUpcomingDebates}</p>
                </BentoCard>
              ) : (
                upcomingDebates.map(session => {
                   const isModerator = session.moderatorId === student?.userId;
                   const isParticipant = session.participants.some(p => p.studentId === student?.id);

                   return (
                     <BentoCard key={session.id} className="flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                           <div className="h-12 w-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-navy group-hover:text-white transition-all">
                              <Calendar size={20} />
                           </div>
                           <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-black text-slate-900 text-sm">{session.topic}</h4>
                                {session.status === "ACTIVE" && (
                                  <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[8px] font-black uppercase tracking-wider animate-pulse">
                                    {dict.inCourse}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] font-bold text-slate-400 mt-1 flex items-center gap-2 uppercase tracking-tight">
                                 <Clock size={10} /> {session.startsAt.toLocaleDateString(locale)} {locale === "en-US" ? "at" : "às"} {session.startsAt.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                              </p>
                           </div>
                        </div>
                        
                        {isModerator ? (
                          <StatusBadge tone="danger">{dict.moderatorBadge}</StatusBadge>
                        ) : isParticipant ? (
                          <StatusBadge tone="success">{dict.enrolledBadge}</StatusBadge>
                        ) : session.participants.length >= session.capacity ? (
                          <StatusBadge tone="neutral">{dict.fullBadge}</StatusBadge>
                        ) : student ? (
                          <form action={addDebateParticipantAction}>
                            <input type="hidden" name="sessionId" value={session.id} />
                            <input type="hidden" name="studentId" value={student.id} />
                            <PrimaryButton tone="light" type="submit" className="h-9 py-0 px-4 text-[10px]">
                              {dict.reserve}
                            </PrimaryButton>
                          </form>
                        ) : null}
                     </BentoCard>
                   );
                 })
              )}
           </div>

           {/* History and Evaluations */}
           <div className="space-y-4">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">{dict.performanceHistory}</h3>
              {evaluations.length === 0 ? (
                <BentoCard className="text-center py-10">
                   <p className="text-sm font-bold text-slate-400 italic">{dict.noEvaluationsYet}</p>
                </BentoCard>
              ) : (
                evaluations.map(ev => {
                  const score = ((ev.fluency + ev.argumentation + ev.posture) / 3 * 10).toFixed(0);
                  return (
                  <BentoCard key={ev.id} className="border-l-4 border-l-rose-500">
                     <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-black text-slate-900 text-sm">{ev.session.topic}</h4>
                          <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            {student?.studentCode ?? "---"} · {ev.evaluatedAt.toLocaleDateString(locale)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-700">{score}%</span>
                          <StatusBadge tone={ev.acknowledgedAt ? "success" : "danger"}>
                            {ev.acknowledgedAt 
                               ? (locale === "en-US" ? "Received" : "Recebido") 
                               : (locale === "en-US" ? "New" : "Novo")}
                          </StatusBadge>
                        </div>
                     </div>

                     {/* Expandable Details */}
                     <details className="group mt-2">
                       <summary className="cursor-pointer select-none list-none flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-navy hover:text-rose-600 transition-colors py-2">
                         <span className="inline-flex h-5 w-5 items-center justify-center rounded-lg bg-slate-100 text-slate-500 group-open:bg-navy group-open:text-white transition-all text-[10px]">▸</span>
                         {dict.viewDetailedGrades}
                       </summary>
                       <div className="mt-2 space-y-3 animate-in slide-in-from-top-2 duration-200">
                         <div className="grid grid-cols-3 gap-2">
                           <MiniStat label={dict.fluency} value={ev.fluency} />
                           <MiniStat label={locale === "en-US" ? "Argum." : "Argum."} value={ev.argumentation} />
                           <MiniStat label={dict.posture} value={ev.posture} />
                         </div>
                          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-3">
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                {locale === "en-US" ? "Performance Profile (Posture)" : "Perfil de Desempenho (Postura)"}
                              </p>
                              <p className="mt-1 text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                {ev.posture <= 4 ? (
                                  <>
                                    <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                                    <span>{locale === "en-US" ? "Posture: Shy/Reserved" : "Postura: Tímido/Reservado"}</span>
                                  </>
                                ) : ev.posture >= 9 ? (
                                  <>
                                    <Zap size={14} className="text-rose-500 shrink-0" />
                                    <span>{locale === "en-US" ? "Posture: Dominant/Competitive" : "Postura: Dominante/Competitivo"}</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                                    <span>{locale === "en-US" ? "Posture: Balanced/Participative" : "Postura: Equilibrado/Participativo"}</span>
                                  </>
                                )}
                              </p>
                            </div>
                            <div className="border-t border-slate-100 pt-2">
                              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                {locale === "en-US" ? "Instructor Observations" : "Observações do Instrutor"}
                              </p>
                              <p className="mt-1 text-xs font-bold leading-relaxed text-slate-600 italic">
                                &quot;{ev.feedback || (locale === "en-US" ? "No additional comments." : "Sem comentário adicional.")}&quot;
                              </p>
                            </div>
                            <p className="mt-1 text-[8px] font-bold text-slate-400">
                              {dict.evaluatedBy}: {ev.evaluator?.name ?? "Não identificado"}
                            </p>
                          </div>
                       </div>
                     </details>

                     {ev.acknowledgedAt ? (
                       <div className="mt-3 flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-emerald-700">
                         <CheckCircle2 size={14} /> {locale === "en-US" ? "Confirmed on" : "Confirmado em"} {ev.acknowledgedAt.toLocaleDateString(locale)}
                       </div>
                     ) : (
                       <form
                         action={async (formData) => {
                           "use server";
                           await acknowledgeDebateFeedbackAction(formData);
                         }}
                         className="mt-3"
                       >
                         <input type="hidden" name="evaluationId" value={ev.id} />
                         <PrimaryButton tone="rose" className="w-full min-h-10 py-2 text-[10px]" type="submit">
                           <CheckCircle2 size={14} /> {dict.receivedOk}
                         </PrimaryButton>
                       </form>
                     )}
                  </BentoCard>
                  );
                })
              )}
           </div>
        </div>

        {/* Enviar Feedback */}
        <div className="grid grid-cols-1 gap-6">
           <BentoCard>
             <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                 <Send size={18} />
               </div>
               <div>
                 <h3 className="text-sm font-extrabold text-slate-900">{dict.sendFeedback}</h3>
                 <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                   {dict.shareOpinionNotice}
                 </p>
               </div>
             </div>
             
             <form action={submitStudentConcernAction} className="space-y-4">
               <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{dict.feedbackType}</label>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                   {[
                     { value: "SYSTEM_DOUBT", label: locale === "en-US" ? "System Doubt" : "Sobre o Sistema", icon: Laptop },
                     { value: "DEBATE_QUESTION", label: locale === "en-US" ? "About a Debate" : "Sobre um Debate", icon: Mic2 },
                     { value: "PERSONAL_CONCERN", label: locale === "en-US" ? "Personal Concern" : "Preocupacao Pessoal", icon: Lock },
                     { value: "PRAISE_SUGGESTION", label: locale === "en-US" ? "Praise or Suggestion" : "Elogio ou Sugestao", icon: Lightbulb }
                   ].map((opt) => {
                     const Icon = opt.icon;
                     return (
                       <label key={opt.value} className="cursor-pointer">
                         <input type="radio" name="category" value={opt.value} defaultChecked={opt.value === "SYSTEM_DOUBT"} className="peer sr-only" />
                         <div className="p-3 rounded-2xl border-2 border-slate-100 bg-slate-50 text-center peer-checked:border-rose-500 peer-checked:bg-rose-50 text-slate-500 peer-checked:text-rose-600 transition-all hover:border-slate-200 flex flex-col items-center justify-center min-h-[85px]">
                           <Icon size={20} className="mb-2 transition-colors" />
                           <span className="text-[9px] font-black uppercase tracking-widest transition-colors">{opt.label}</span>
                         </div>
                       </label>
                     );
                   })}
                 </div>
               </div>
               <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{dict.yourMessage}</label>
                 <textarea 
                   name="message" 
                   placeholder={dict.feedbackPlaceholder} 
                   required 
                   rows={3}
                   className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:border-rose-500 transition-all resize-none"
                 />
               </div>
               <PrimaryButton tone="rose" type="submit" className="w-full md:w-auto px-8 py-3 text-[10px] uppercase font-black tracking-widest flex items-center justify-center gap-2">
                 <Send size={14} /> {dict.sendFeedbackButton}
               </PrimaryButton>
             </form>
           </BentoCard>
         </div>
      </div>
    </DashboardLayout>
  );
}

function StatItem({ label, value }: { label: string, value: string }) {
  return (
    <div>
       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
       <p className="text-2xl font-black">{value}</p>
       <div className="h-1 w-full bg-white/10 mt-2 rounded-full overflow-hidden">
          <div className="h-full bg-rose-500" style={{ width: value }} />
       </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string, value: number }) {
  return (
    <div className="bg-slate-50 p-2 rounded-xl text-center border border-slate-100">
       <p className="text-[8px] font-black text-slate-400 uppercase mb-1">{label}</p>
       <p className="text-sm font-black text-slate-700">{value}/10</p>
    </div>
  );
}
