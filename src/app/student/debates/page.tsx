import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BentoCard } from "@/components/ui/BentoCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { getCurrentSession } from "@/features/auth/current-user";
import { acknowledgeDebateFeedbackAction } from "@/features/debate/actions";
import { studentNav } from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";
import { Calendar, Mic2, Clock, CheckCircle2, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentDebatesPage() {
  const session = await getCurrentSession();
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
  
  // Próximos debates (sessões agendadas onde o aluno é participante ou ainda não)
  const upcomingDebates = await prisma.debateSession.findMany({
     where: { 
       startsAt: { gte: new Date() },
       status: "SCHEDULED"
     },
     orderBy: { startsAt: "asc" }
  });

  return (
    <DashboardLayout
      navItems={studentNav.map(item => ({ ...item, active: item.label === "Debates" }))}
      title="Arena de Debates"
      subtitle="Sua performance em oratória e argumentação"
      context="Student Portal"
      darkSidebar
    >
      <div className="space-y-6">
        {/* Qualitative Performance Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <BentoCard className="lg:col-span-2 bg-slate-900 text-white relative overflow-hidden" dark>
              <div className="relative z-10">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 mb-2">Perfil de Orador</p>
                 <h2 className="text-3xl font-black mb-6">
                    {evaluations.length > 0 && (evaluations[0].fluency + evaluations[0].argumentation) / 2 >= 8 
                      ? "Orador Persuasivo & Confiante" 
                      : evaluations.length > 0 
                        ? "Orador em Desenvolvimento (Tímido)" 
                        : "Aguardando Primeira Avaliação"}
                 </h2>
                 <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Código de estudante: {student?.studentCode ?? "---"}
                 </p>
                 
                 <div className="grid grid-cols-3 gap-8 mt-10">
                    <StatItem label="Fluência" value={`${(evaluations.reduce((s, e) => s + e.fluency, 0) / (evaluations.length || 1) * 10).toFixed(0)}%`} />
                    <StatItem label="Argumento" value={`${(evaluations.reduce((s, e) => s + e.argumentation, 0) / (evaluations.length || 1) * 10).toFixed(0)}%`} />
                    <StatItem label="Postura" value={`${(evaluations.reduce((s, e) => s + e.posture, 0) / (evaluations.length || 1) * 10).toFixed(0)}%`} />
                 </div>
              </div>
              <Mic2 className="absolute -bottom-10 -right-10 w-64 h-64 text-white/5 rotate-12" />
           </BentoCard>

           <BentoCard className="flex flex-col justify-between">
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Último Feedback</p>
                 <p className="text-sm font-bold text-slate-600 italic leading-relaxed">
                    &quot;{evaluations[0]?.feedback || "Participe no seu próximo debate para receber feedback do instrutor."}&quot;
                 </p>
              </div>
              <div className="mt-6 pt-6 border-t border-slate-100 flex items-center gap-3">
                 <div className="h-10 w-10 rounded-full bg-navy text-white flex items-center justify-center font-black text-xs">
                    {lastScore}
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Score Geral</p>
                    <p className="text-xs font-bold text-slate-900">Última Sessão</p>
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
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Aproveitamento (Últimos 10)</p>
              <p className="text-2xl font-black text-slate-900">{avg10}<span className="text-sm font-bold text-slate-400">%</span></p>
              <p className="text-[10px] font-bold text-slate-400">{total10} debate{total10 !== 1 ? "s" : ""} avaliado{total10 !== 1 ? "s" : ""}</p>
            </div>
          </BentoCard>
          <BentoCard className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-200">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Aproveitamento (Últimos 20)</p>
              <p className="text-2xl font-black text-slate-900">{avg20}<span className="text-sm font-bold text-slate-400">%</span></p>
              <p className="text-[10px] font-bold text-slate-400">{total20} debate{total20 !== 1 ? "s" : ""} avaliado{total20 !== 1 ? "s" : ""}</p>
            </div>
          </BentoCard>
        </div>

        {/* Sessions Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* Upcoming Debates */}
           <div className="space-y-4">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">Próximos Debates</h3>
              {upcomingDebates.length === 0 ? (
                <BentoCard className="text-center py-10">
                   <p className="text-sm font-bold text-slate-400 italic">Sem novos debates agendados.</p>
                </BentoCard>
              ) : (
                upcomingDebates.map(session => (
                  <BentoCard key={session.id} className="flex items-center justify-between group">
                     <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-navy group-hover:text-white transition-all">
                           <Calendar size={20} />
                        </div>
                        <div>
                           <h4 className="font-black text-slate-900 text-sm">{session.topic}</h4>
                           <p className="text-[10px] font-bold text-slate-400 mt-1 flex items-center gap-2 uppercase tracking-tight">
                              <Clock size={10} /> {session.startsAt.toLocaleDateString("pt-PT")} às {session.startsAt.toLocaleTimeString("pt-PT", { hour: '2-digit', minute: '2-digit' })}
                           </p>
                        </div>
                     </div>
                     <PrimaryButton tone="light" className="h-9 py-0 px-4 text-[10px]">Reservar</PrimaryButton>
                  </BentoCard>
                ))
              )}
           </div>

           {/* History and Evaluations */}
           <div className="space-y-4">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">Histórico de Performance</h3>
              {evaluations.length === 0 ? (
                <BentoCard className="text-center py-10">
                   <p className="text-sm font-bold text-slate-400 italic">Nenhum debate avaliado ainda.</p>
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
                            {student?.studentCode ?? "---"} · {ev.evaluatedAt.toLocaleDateString("pt-PT")}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-700">{score}%</span>
                          <StatusBadge tone={ev.acknowledgedAt ? "success" : "danger"}>
                            {ev.acknowledgedAt ? "Recebido" : "Novo"}
                          </StatusBadge>
                        </div>
                     </div>

                     {/* Expandable Details */}
                     <details className="group mt-2">
                       <summary className="cursor-pointer select-none list-none flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-navy hover:text-rose-600 transition-colors py-2">
                         <span className="inline-flex h-5 w-5 items-center justify-center rounded-lg bg-slate-100 text-slate-500 group-open:bg-navy group-open:text-white transition-all text-[10px]">▸</span>
                         Ver Notas Detalhadas
                       </summary>
                       <div className="mt-2 space-y-3 animate-in slide-in-from-top-2 duration-200">
                         <div className="grid grid-cols-3 gap-2">
                           <MiniStat label="Fluência" value={ev.fluency} />
                           <MiniStat label="Argum." value={ev.argumentation} />
                           <MiniStat label="Postura" value={ev.posture} />
                         </div>
                         <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                           <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Feedback do Instrutor</p>
                           <p className="mt-2 text-sm font-bold leading-relaxed text-slate-600">
                             {ev.feedback || "Sem comentário adicional."}
                           </p>
                           <p className="mt-2 text-[10px] font-bold text-slate-400">
                             Instrutor: {ev.evaluator?.name ?? "Não identificado"}
                           </p>
                         </div>
                       </div>
                     </details>

                     {ev.acknowledgedAt ? (
                       <div className="mt-3 flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-emerald-700">
                         <CheckCircle2 size={14} /> Confirmado em {ev.acknowledgedAt.toLocaleDateString("pt-PT")}
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
                           <CheckCircle2 size={14} /> Certo, recebido
                         </PrimaryButton>
                       </form>
                     )}
                  </BentoCard>
                  );
                })
              )}
           </div>
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
