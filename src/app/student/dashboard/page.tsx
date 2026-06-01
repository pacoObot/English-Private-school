import Link from "next/link";
import { BookOpen, Download, Eye, MessageCircle, Mic2, Wallet, TrendingUp, ArrowRight } from "lucide-react";
import { ActionNotice } from "@/components/ui/ActionNotice";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BentoCard } from "@/components/ui/BentoCard";
import { DataTable } from "@/components/ui/DataTable";
import { MetricCard } from "@/components/ui/MetricCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getCurrentSession } from "@/features/auth/current-user";
import { studentNav } from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";
import { UpcomingDebatesButton } from "./UpcomingDebatesButton";

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage({ searchParams }: { searchParams?: { status?: string } }) {
  const session = await getCurrentSession();
  const student = session
    ? await prisma.studentProfile.findFirst({
        where: { userId: session.userId },
        include: {
          enrollments: { include: { course: true, classGroup: true } },
          invoices: { include: { receipt: true } },
          attendances: true,
          grades: true,
          debateEvaluations: true
        }
      })
    : null;
  const activeCourses = student?.enrollments.length ?? 0;
  const pendingAmount = student?.invoices.filter((invoice) => invoice.status === "PENDING").reduce((sum, invoice) => sum + invoice.amountMt, 0) ?? 0;
  const absences = student?.attendances.filter((attendance) => attendance.status === "ABSENT").length ?? 0;
  const gradeAverage = student?.grades.length ? student.grades.reduce((sum, grade) => sum + grade.score, 0) / student.grades.length : 0;
  
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

  const upcomingDebates = await prisma.debateSession.findMany({
    where: { 
      startsAt: { gte: new Date() },
      status: "SCHEDULED"
    },
    take: 3,
    orderBy: { startsAt: "asc" }
  });

  // Treasury logic for current month
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthName = new Intl.DateTimeFormat("pt-PT", { month: "long" }).format(now);
  
  const currentMonthInvoice = student?.invoices.find(inv => 
    inv.createdAt.getMonth() === currentMonth && 
    inv.createdAt.getFullYear() === currentYear
  );

  const nextPendingInvoice = student?.invoices
    .filter(inv => inv.status === "PENDING" || inv.status === "OVERDUE")
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())[0];

  const daysRemaining = nextPendingInvoice 
    ? Math.ceil((nextPendingInvoice.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <DashboardLayout
      navItems={studentNav}
      title={`Olá, ${session?.name.split(" ")[0] ?? "Estudante"}!`}
      subtitle={`ID: ${student?.studentCode ?? "---"}`}
      context="Language Academy"
      sidebarFooter={<QuickSupport />}
      darkSidebar
    >
      <div className="space-y-6 pb-10">
        <ActionNotice status={searchParams?.status} />
        
        {/* Main Banner - Mobile First */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <BentoCard className="lg:col-span-8 overflow-hidden relative">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <StatusBadge tone="navy">Status Académico</StatusBadge>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{student?.level}</span>
              </div>
              <h3 className="text-2xl font-black leading-tight tracking-tight text-slate-900 sm:text-4xl">
                Seu progresso de <span className="italic text-rose-600">Fluência</span> está evoluindo.
              </h3>
              <div className="mt-6 space-y-4 max-w-md">
                <Progress label="Speaking Skills" value={`${speakingPercentage.toFixed(0)}%`} tone="bg-navy" />
                <Progress label="Writing Mastery" value={`${writingPercentage.toFixed(0)}%`} tone="bg-rose-600" />
              </div>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link href="/student/grades">
                  <PrimaryButton tone="dark" className="w-full">
                    <Eye size={16} /> Ver Desempenho
                  </PrimaryButton>
                </Link>
                <Link href="/student/materials" className="w-full">
                  <PrimaryButton tone="light" className="w-full">
                    <Download size={16} /> Materiais de Estudo
                  </PrimaryButton>
                </Link>
                <UpcomingDebatesButton debates={upcomingDebates} />
              </div>
            </div>
            {/* Abstract Decorative Element */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-navy/5 rounded-full blur-3xl" />
          </BentoCard>

          {/* Treasury Quick View */}
          <Link href="/student/treasury" className="lg:col-span-4 block group">
            <BentoCard className="bg-gradient-to-br from-navy to-blue-600 text-white h-full relative overflow-hidden" dark>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md mb-6 group-hover:scale-110 transition-transform">
                <Wallet size={22} />
              </div>
              
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-100">Tesouraria • {monthName}</p>
                  <h3 className="mt-1 text-3xl font-black">{pendingAmount.toLocaleString()} MT</h3>
                </div>
                <StatusBadge tone={currentMonthInvoice?.status === "PAID" ? "success" : "warning"}>
                  {currentMonthInvoice?.status === "PAID" ? "Pago" : "Pendente"}
                </StatusBadge>
              </div>

              <div className="mt-6 flex flex-col gap-1">
                 <p className="text-[10px] font-black uppercase text-blue-100/60 tracking-widest">
                    {daysRemaining !== null && daysRemaining > 0 
                      ? `${daysRemaining} dias para o vencimento` 
                      : daysRemaining !== null && daysRemaining <= 0
                        ? "Pagamento em atraso"
                        : "Sem pagamentos pendentes"}
                 </p>
                 <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white mt-1">
                    Gerir Pagamentos <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                 </div>
              </div>
            </BentoCard>
          </Link>
        </div>

        {/* Responsive Metric Grid - 2 cols on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Cursos" value={String(activeCourses)} hint="Ativos" icon={BookOpen} tone="navy" />
          <MetricCard label="Média" value={gradeAverage > 0 ? gradeAverage.toFixed(1) : "---"} hint="Escala 20" icon={TrendingUp} tone="rose" />
          <MetricCard label="Faltas" value={String(absences)} hint="Este mês" icon={Eye} tone="light" />
          <MetricCard label="Debates" value={`${debateAvg.toFixed(1)}`} hint="Score" icon={Mic2} tone="dark" />
        </div>

        {/* Quick Access Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {/* Recent Grades Summary */}
           <BentoCard className="p-0">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                 <h3 className="font-black text-slate-800">Notas Recentes</h3>
                 <Link href="/student/grades" className="text-[10px] font-black uppercase text-rose-600 underline">Ver todas</Link>
              </div>
              <DataTable
                emptyMessage="Sem notas lançadas."
                headers={["Matéria", "Nota"]}
                rows={(student?.grades.slice(0, 3) ?? []).map(g => [
                  g.title,
                  <span key={g.id} className="font-black text-rose-600">{g.score}</span>
                ])}
              />
           </BentoCard>

           {/* Next Classes Summary */}
           <BentoCard className="p-0">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                 <h3 className="font-black text-slate-800">Meus Horários</h3>
                 <Link href="/student/courses" className="text-[10px] font-black uppercase text-navy underline">Ver cursos</Link>
              </div>
              <DataTable
                emptyMessage="Sem aulas agendadas."
                headers={["Turma", "Horário"]}
                rows={(student?.enrollments ?? []).map(enr => [
                  enr.classGroup.name,
                  enr.classGroup.schedule
                ])}
              />
           </BentoCard>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Progress({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
        <span>{label}</span>
        <span className="text-slate-700">{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className={`${tone} h-full rounded-full transition-all duration-1000`} style={{ width: value }} />
      </div>
    </div>
  );
}

function QuickSupport() {
  return (
    <div className="rounded-[1.5rem] bg-slate-900 p-4 text-white">
      <p className="text-xs font-black italic text-rose-400">Duvidas?</p>
      <p className="mt-1 text-[11px] font-medium text-slate-300">Fale diretamente com o tutor via WhatsApp.</p>
      <Link href="https://wa.me/258840000000" target="_blank" className="block mt-4">
        <PrimaryButton className="w-full min-h-10 py-2" tone="light">
          Suporte Rapido
        </PrimaryButton>
      </Link>
    </div>
  );
}
