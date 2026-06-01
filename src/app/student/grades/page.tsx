import { ActionNotice } from "@/components/ui/ActionNotice";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BentoCard } from "@/components/ui/BentoCard";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getCurrentSession } from "@/features/auth/current-user";
import { studentNav } from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";
import { Award, BookOpen, Calendar, TrendingUp } from "lucide-react";

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

  const avgGrade = student?.grades.length 
    ? student.grades.reduce((s, g) => s + g.score, 0) / student.grades.length 
    : 0;

  const totalAbsences = student?.attendances.filter(a => a.status === "ABSENT").length ?? 0;

  const debateEvals = student?.debateEvaluations ?? [];
  const debateAvg = debateEvals.length > 0 ? debateEvals.reduce((sum, ev) => sum + ev.fluency + ev.argumentation + ev.posture, 0) / (debateEvals.length * 3) : 0;

  // Habilidades reais baseadas em avaliações académicas e debates
  let speakingPercentage = 0;
  if (debateEvals.length > 0) {
    speakingPercentage = debateAvg * 10;
  } else {
    const speakingGrades = student?.grades.filter(g => 
      /speaking|oral|speech|apresenta|debate|conversac/i.test(g.title)
    ) ?? [];
    if (speakingGrades.length > 0) {
      speakingPercentage = (speakingGrades.reduce((sum, g) => sum + (g.score / g.maxScore), 0) / speakingGrades.length) * 100;
    }
  }

  const writingGrades = student?.grades.filter(g => 
    /writing|write|redaç|redac|composition|essay|escrit|gramat|grammar|dictation|ditado/i.test(g.title)
  ) ?? [];
  
  let writingPercentage = 0;
  if (writingGrades.length > 0) {
    writingPercentage = (writingGrades.reduce((sum, g) => sum + (g.score / g.maxScore), 0) / writingGrades.length) * 100;
  } else if (student?.grades && student.grades.length > 0) {
    const academicGrades = student.grades.filter(g => 
      !/speaking|oral|speech|apresenta|debate|conversac/i.test(g.title)
    );
    const gradesToUse = academicGrades.length > 0 ? academicGrades : student.grades;
    writingPercentage = (gradesToUse.reduce((sum, g) => sum + (g.score / g.maxScore), 0) / gradesToUse.length) * 100;
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
                 <span key={grade.id} className="font-bold text-slate-700">{grade.title}</span>,
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
