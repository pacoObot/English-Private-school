import Link from "next/link";
import { BookOpen, Download, Eye, MessageCircle, Mic2, Wallet, TrendingUp, ArrowRight, AlertTriangle, AlertCircle, CheckCircle2, Bell } from "lucide-react";
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
import { DynamicCard } from "./DynamicCard";

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
  // Média Global Ponderada Normalizada (Base 20)
  let gradeAverage = 0;
  if (student?.grades && student.grades.length > 0) {
    const normalizedSum = student.grades.reduce((sum, g) => sum + ((g.score / g.maxScore) * 20) * g.weight, 0);
    const totalWeight = student.grades.reduce((sum, g) => sum + g.weight, 0);
    gradeAverage = totalWeight > 0 ? normalizedSum / totalWeight : 0;
  }
  
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

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const upcomingDebates = await prisma.debateSession.findMany({
    where: { 
      startsAt: { gte: todayStart },
      status: { in: ["SCHEDULED", "ACTIVE"] }
    },
    include: {
      participants: true
    },
    take: 3,
    orderBy: { startsAt: "asc" }
  });

  // Find the closest active or scheduled debate where this student is involved (moderator or participant)
  let nextDebateSession = student
    ? await prisma.debateSession.findFirst({
        where: {
          startsAt: { gte: todayStart },
          status: { in: ["SCHEDULED", "ACTIVE"] },
          OR: [
            { moderatorId: session?.userId },
            { participants: { some: { studentId: student.id } } }
          ]
        },
        include: {
          participants: true
        },
        orderBy: { startsAt: "asc" }
      })
    : null;

  // If no involved debate, check if there is any upcoming active/scheduled debate they can join
  if (!nextDebateSession && student) {
    nextDebateSession = await prisma.debateSession.findFirst({
      where: {
        startsAt: { gte: todayStart },
        status: { in: ["SCHEDULED", "ACTIVE"] }
      },
      include: {
        participants: true
      },
      orderBy: { startsAt: "asc" }
    });
  }

  let debateData = null;
  if (nextDebateSession) {
    const isModerator = nextDebateSession.moderatorId === session?.userId;
    const isParticipant = nextDebateSession.participants.some(p => p.studentId === student?.id);
    
    debateData = {
      id: nextDebateSession.id,
      topic: nextDebateSession.topic,
      startsAt: nextDebateSession.startsAt.toISOString(),
      capacity: nextDebateSession.capacity,
      location: nextDebateSession.location,
      role: isModerator ? ("moderator" as const) : isParticipant ? ("participant" as const) : ("open" as const)
    };
  }

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

  const daysRemainingText = daysRemaining !== null && daysRemaining > 0 
    ? `${daysRemaining} dias para o vencimento` 
    : daysRemaining !== null && daysRemaining <= 0
      ? "Pagamento em atraso"
      : "Sem pagamentos pendentes";

  const highlights: {
    id: string;
    type: "warning" | "danger" | "info" | "success";
    title: string;
    description: string;
    link?: string;
    actionLabel?: string;
  }[] = [];

  // 1. Unpaid Invoices
  if (nextPendingInvoice) {
    const isOverdue = nextPendingInvoice.status === "OVERDUE" || (daysRemaining !== null && daysRemaining <= 0);
    highlights.push({
      id: `invoice-${nextPendingInvoice.id}`,
      type: isOverdue ? "danger" : "warning",
      title: isOverdue ? "Mensalidade em Atraso" : "Mensalidade Próxima do Vencimento",
      description: isOverdue 
        ? `A mensalidade no valor de ${nextPendingInvoice.amountMt.toLocaleString()} MT está vencida.`
        : `O pagamento de ${nextPendingInvoice.amountMt.toLocaleString()} MT vence em ${daysRemaining} dias.`,
      link: "/student/treasury",
      actionLabel: "Pagar Agora"
    });
  }

  // 2. Unacknowledged Debate Evaluations
  const unacknowledgedEvals = student?.debateEvaluations.filter(e => !e.acknowledgedAt) ?? [];
  if (unacknowledgedEvals.length > 0) {
    highlights.push({
      id: "debate-evals",
      type: "info",
      title: "Novo Feedback de Debate",
      description: `Tens ${unacknowledgedEvals.length} nova(s) avaliação(ões) de debate aguardando tua leitura e confirmação.`,
      link: "/student/debates",
      actionLabel: "Ver Feedback"
    });
  }

  // 3. Debates today
  const debatesToday = upcomingDebates.filter(d => {
    const dDate = new Date(d.startsAt);
    const today = new Date();
    return dDate.getDate() === today.getDate() && 
           dDate.getMonth() === today.getMonth() && 
           dDate.getFullYear() === today.getFullYear();
  });
  
  for (const debate of debatesToday) {
    const isMod = debate.moderatorId === session?.userId;
    const isPart = debate.participants?.some(p => p.studentId === student?.id) ?? false;
    
    if (isMod || isPart) {
      highlights.push({
        id: `debate-today-${debate.id}`,
        type: "success",
        title: isMod ? "Apresentas Hoje como Instrutor" : "Debate Hoje",
        description: `O debate "${debate.topic}" começa às ${debate.startsAt.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}.`,
        link: "/student/debates",
        actionLabel: "Ver Detalhes"
      });
    }
  }

  // 4. Unread general notifications
  const unreadNotifications = session
    ? await prisma.notification.findMany({
        where: { userId: session.userId, isRead: false },
        orderBy: { createdAt: "desc" },
        take: 3
      })
    : [];

  for (const notif of unreadNotifications) {
    const typeLower = notif.type.toLowerCase();
    const typeMapped = (typeLower === "danger" || typeLower === "warning" || typeLower === "success" || typeLower === "info") 
      ? (typeLower as any) 
      : "info";

    highlights.push({
      id: `notif-${notif.id}`,
      type: typeMapped,
      title: notif.title,
      description: notif.message,
      link: notif.debateSessionId ? "/student/debates" : undefined
    });
  }

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

        {/* Highlights / Destaques Section */}
        {highlights.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Destaques e Avisos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {highlights.map((item) => {
                const colors = {
                  danger: "from-rose-50 to-red-100/50 border-rose-100 text-rose-900",
                  warning: "from-amber-50 to-orange-100/50 border-amber-100 text-amber-900",
                  info: "from-blue-50 to-indigo-100/50 border-blue-100 text-blue-900",
                  success: "from-emerald-50 to-teal-100/50 border-emerald-100 text-emerald-900",
                }[item.type] || "from-slate-50 to-slate-100 border-slate-200 text-slate-900";

                const iconColor = {
                  danger: "text-rose-600 bg-rose-100",
                  warning: "text-amber-600 bg-amber-100",
                  info: "text-blue-600 bg-blue-100",
                  success: "text-emerald-600 bg-emerald-100",
                }[item.type] || "text-slate-600 bg-slate-100";

                return (
                  <div 
                    key={item.id}
                    className={`p-4 rounded-[2rem] border bg-gradient-to-r ${colors} flex items-start justify-between gap-4 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300`}
                  >
                    <div className="flex gap-3 items-start">
                      <div className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 ${iconColor} font-black`}>
                        {item.type === "danger" ? (
                          <AlertTriangle size={18} />
                        ) : item.type === "warning" ? (
                          <AlertCircle size={18} />
                        ) : item.type === "success" ? (
                          <CheckCircle2 size={18} />
                        ) : (
                          <Bell size={18} />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">{item.title}</h4>
                        <p className="text-xs font-medium text-slate-600 mt-1 leading-snug">{item.description}</p>
                      </div>
                    </div>

                    {item.link && (
                      <Link href={item.link}>
                        <PrimaryButton 
                          tone={item.type === "danger" || item.type === "warning" ? "rose" : "navy"} 
                          className="py-2 px-4 rounded-xl text-[9px] font-black uppercase shrink-0 min-h-8"
                        >
                          {item.actionLabel || "Ver"} <ArrowRight size={10} className="ml-1" />
                        </PrimaryButton>
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
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

          {/* Treasury Quick View - Dynamic Card */}
          <DynamicCard
            monthName={monthName}
            pendingAmount={pendingAmount}
            isPaid={currentMonthInvoice?.status === "PAID"}
            daysRemainingText={daysRemainingText}
            debate={debateData}
          />
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
