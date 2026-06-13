import { ActionNotice } from "@/components/ui/ActionNotice";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BentoCard } from "@/components/ui/BentoCard";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getCurrentSession } from "@/features/auth/current-user";
import { studentNav } from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";
import { Award, BookOpen, Calendar, TrendingUp, Mic2, PenTool } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentGradesPage({ searchParams }: { searchParams?: { status?: string } }) {
  const session = await getCurrentSession();
  const student = session
    ? await prisma.studentProfile.findFirst({
        where: { userId: session.userId },
        include: {
          grades: { orderBy: { createdAt: "desc" } },
          attendances: { orderBy: { lessonDate: "desc" } },
          enrollments: { include: { course: true, classGroup: true } },
          debateEvaluations: true
        }
      })
    : null;

  // Média Global Ponderada Normalizada (Base 20)
  let avgGrade = 0;
  if (student?.grades && student.grades.length > 0) {
    const normalizedSum = student.grades.reduce((sum, g) => sum + ((g.score / g.maxScore) * 20) * g.weight, 0);
    const totalWeight = student.grades.reduce((sum, g) => sum + g.weight, 0);
    avgGrade = totalWeight > 0 ? normalizedSum / totalWeight : 0;
  }

  const totalAbsences = student?.attendances.filter(a => a.status === "ABSENT").length ?? 0;

  const debateEvals = student?.debateEvaluations ?? [];
  const debateAvg = debateEvals.length > 0 ? debateEvals.reduce((sum, ev) => sum + ev.fluency + ev.argumentation + ev.posture, 0) / (debateEvals.length * 3) : 0;

  // Habilidades reais baseadas em avaliações académicas e debates
  let speakingPercentage = 0;
  const speakingGrades = student?.grades.filter(g => 
    g.isSpeaking || (!g.isWriting && /speaking|oral|speech|apresenta|debate|conversac/i.test(g.title))
  ) ?? [];

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

  const writingGrades = student?.grades.filter(g => 
    g.isWriting || (!g.isSpeaking && /writing|write|redaç|redac|composition|essay|escrit|gramat|grammar|dictation|ditado/i.test(g.title))
  ) ?? [];
  
  let writingPercentage = 0;
  if (writingGrades.length > 0) {
    const normalizedSum = writingGrades.reduce((sum, g) => sum + ((g.score / g.maxScore) * 100) * g.weight, 0);
    const totalWeight = writingGrades.reduce((sum, g) => sum + g.weight, 0);
    writingPercentage = totalWeight > 0 ? normalizedSum / totalWeight : 0;
  } else if (student?.grades && student.grades.length > 0) {
    const nonSpeakingGrades = student.grades.filter(g => 
      !g.isSpeaking && !/speaking|oral|speech|apresenta|debate|conversac/i.test(g.title)
    );
    const gradesToUse = nonSpeakingGrades.length > 0 ? nonSpeakingGrades : student.grades;
    const normalizedSum = gradesToUse.reduce((sum, g) => sum + ((g.score / g.maxScore) * 100) * g.weight, 0);
    const totalWeight = gradesToUse.reduce((sum, g) => sum + g.weight, 0);
    writingPercentage = totalWeight > 0 ? normalizedSum / totalWeight : 0;
  }

  return (
    <DashboardLayout
      navItems={studentNav.map(item => ({ ...item, active: item.label === "Notas e Faltas" }))}
      title="Desempenho Académico"
      subtitle="Notas, Faltas e Médias"
      context="Student Portal"
      darkSidebar
    >
      <div className="space-y-6">
        <ActionNotice status={searchParams?.status} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <QuickStat label="Média Global" value={avgGrade.toFixed(1)} icon={TrendingUp} tone="navy" />
           <QuickStat label="Avaliações" value={String(student?.grades.length ?? 0)} icon={Award} tone="rose" />
           <QuickStat label="Faltas" value={String(totalAbsences)} icon={Calendar} tone="dark" />
           <QuickStat label="Cursos" value={String(student?.enrollments.length ?? 0)} icon={BookOpen} tone="light" />
        </div>

        <BentoCard className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-black text-slate-900">Desenvolvimento de Habilidades</h3>
            <p className="text-xs font-semibold text-slate-400">Progresso calculado em tempo real com base em debates e avaliações escritas.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400">
                <span>Speaking Skills (Oratória)</span>
                <span className="text-navy font-black">{speakingPercentage.toFixed(0)}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-navy rounded-full transition-all duration-1000" style={{ width: `${speakingPercentage}%` }}></div>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold">Calculado a partir de debates na Arena e avaliações de oratória.</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400">
                <span>Writing Mastery (Escrita & Gramática)</span>
                <span className="text-rose-600 font-black">{writingPercentage.toFixed(0)}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-rose-600 rounded-full transition-all duration-1000" style={{ width: `${writingPercentage}%` }}></div>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold">Calculado a partir de redações, fichas de exercícios e avaliações escritas.</p>
            </div>
          </div>
        </BentoCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <BentoCard className="p-0">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-lg font-black text-slate-900">Histórico de Notas</h3>
             </div>
             <DataTable
               emptyMessage="Nenhuma nota lançada."
               headers={["Avaliação", "Nota", "Máximo", "Data"]}
                rows={(student?.grades ?? []).map(grade => [
                  <div key={grade.id} className="flex flex-col gap-1">
                    <span className="font-bold text-slate-700">{grade.title}</span>
                    <div className="flex gap-1.5">
                      {grade.isSpeaking && (
                        <span className="inline-flex items-center gap-1 rounded bg-navy/10 px-1.5 py-0.5 text-[10px] font-black text-navy">
                          <Mic2 size={10} /> Oratória
                        </span>
                      )}
                      {grade.isWriting && (
                        <span className="inline-flex items-center gap-1 rounded bg-rose-600/10 px-1.5 py-0.5 text-[10px] font-black text-rose-600">
                          <PenTool size={10} /> Escrita
                        </span>
                      )}
                    </div>
                  </div>,
                  <span key={`score-${grade.id}`} className="font-black text-rose-600 text-lg">{grade.score}</span>,
                  grade.maxScore,
                  grade.createdAt.toLocaleDateString("pt-PT")
                ])}
             />
           </BentoCard>

           <BentoCard className="p-0">
             <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-black text-slate-900">Registro de Presenças</h3>
             </div>
             <DataTable
               emptyMessage="Nenhum registro de presença."
               headers={["Data", "Estado", "Observações"]}
               rows={(student?.attendances ?? []).map(att => [
                 att.lessonDate.toLocaleDateString("pt-PT"),
                 <StatusBadge key={att.id} tone={att.status === "PRESENT" ? "success" : att.status === "ABSENT" ? "danger" : "warning"}>
                   {att.status}
                 </StatusBadge>,
                 att.notes || "-"
               ])}
             />
           </BentoCard>
        </div>
      </div>
    </DashboardLayout>
  );
}

function QuickStat({ label, value, icon: Icon, tone }: { label: string, value: string, icon: any, tone: "navy" | "rose" | "dark" | "light" }) {
  const tones = {
    navy: "bg-navy text-white",
    rose: "bg-rose-600 text-white",
    dark: "bg-slate-900 text-white",
    light: "bg-slate-100 text-slate-900"
  };
  
  return (
    <BentoCard className={`${tones[tone]} flex flex-col justify-between py-4 px-5 min-h-[120px]`} dark={tone !== "light"}>
       <div className="flex justify-between items-start">
          <div className="p-2 bg-white/10 rounded-xl">
             <Icon size={18} />
          </div>
       </div>
       <div className="mt-4">
          <p className="text-[9px] font-black uppercase tracking-widest opacity-70">{label}</p>
          <p className="text-2xl font-black">{value}</p>
       </div>
    </BentoCard>
  );
}
