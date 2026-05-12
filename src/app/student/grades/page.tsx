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
          enrollments: { include: { course: true, classGroup: true } }
        }
      })
    : null;

  const avgGrade = student?.grades.length 
    ? student.grades.reduce((s, g) => s + g.score, 0) / student.grades.length 
    : 0;

  const totalAbsences = student?.attendances.filter(a => a.status === "ABSENT").length ?? 0;

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
