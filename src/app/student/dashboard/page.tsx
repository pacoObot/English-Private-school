import { BookOpen, Download, Eye, MessageCircle, Mic2, Wallet } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BentoCard } from "@/components/ui/BentoCard";
import { DataTable } from "@/components/ui/DataTable";
import { MetricCard } from "@/components/ui/MetricCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getCurrentSession } from "@/features/auth/current-user";
import { studentNav } from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage() {
  const session = await getCurrentSession();
  const student = session
    ? await prisma.studentProfile.findFirst({
        where: { userId: session.userId },
        include: {
          enrollments: { include: { course: true, classGroup: true } },
          invoices: true,
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

  return (
    <DashboardLayout
      navItems={studentNav}
      title={`Ola, ${session?.name.split(" ")[0] ?? "Estudante"}!`}
      subtitle="Rumo ao C1 Advanced."
      context="Language Academy"
      sidebarFooter={<QuickSupport />}
    >
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <BentoCard className="xl:col-span-8">
          <StatusBadge tone="navy">Meta Semestral</StatusBadge>
          <h3 className="mt-5 text-2xl font-black leading-tight tracking-tight text-slate-900 sm:text-4xl">
            Progresso Global de <span className="italic text-slate-700">Fluencia Corporativa</span>
          </h3>
          <div className="mt-7 space-y-5">
            <Progress label="Speaking Skills" value="85%" tone="bg-navy" />
            <Progress label="Writing Mastery" value="62%" tone="bg-crimson" />
          </div>
          <div className="mt-8 grid gap-3 sm:flex">
            <PrimaryButton tone="dark">
              <Eye size={16} /> Ver Notas
            </PrimaryButton>
            <PrimaryButton tone="light">
              <Download size={16} /> Baixar Fichas
            </PrimaryButton>
          </div>
        </BentoCard>

        <BentoCard className="bg-gradient-to-br from-navy to-blue-500 text-white xl:col-span-4" dark>
          <div className="flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md">
              <Wallet size={22} />
            </div>
            <StatusBadge tone={pendingAmount > 0 ? "warning" : "success"}>{pendingAmount > 0 ? "Pendente" : "Pago"}</StatusBadge>
          </div>
          <p className="mt-12 text-[10px] font-black uppercase tracking-widest text-blue-100">Tesouraria</p>
          <h3 className="mt-2 text-3xl font-black">{pendingAmount} MT</h3>
          <p className="mt-2 text-sm font-semibold text-blue-100">Indicador financeiro vindo do Prisma.</p>
        </BentoCard>

        <MetricCard label="Cursos Ativos" value={String(activeCourses)} hint={student?.level ?? "Nivel"} icon={BookOpen} tone="navy" />
        <MetricCard label="Debate Skills" value={`${debateAvg.toFixed(1)}/10`} hint={`${debateEvals.length} sessões`} icon={Mic2} tone="rose" />
        <MetricCard label="Faltas" value={String(absences)} hint={gradeAverage ? `${gradeAverage.toFixed(1)}/20` : "Sem notas"} icon={Eye} tone="light" />
        <MetricCard label="Suporte" value="Online" hint="Tutor" icon={MessageCircle} tone="dark" />

        <BentoCard className="p-0 xl:col-span-6">
          <div className="flex items-center justify-between p-6">
            <h3 className="font-black text-slate-800">Notas</h3>
            <StatusBadge tone="navy">{gradeAverage ? `${gradeAverage.toFixed(1)}/20` : "Sem media"}</StatusBadge>
          </div>
          <DataTable
            emptyMessage="Ainda nao existem notas lancadas."
            headers={["Avaliacao", "Nota", "Data"]}
            rows={(student?.grades ?? []).map((grade) => [grade.title, `${grade.score}/${grade.maxScore}`, grade.gradedAt.toLocaleDateString("pt-MZ")])}
          />
        </BentoCard>

        <BentoCard className="p-0 xl:col-span-6">
          <div className="flex items-center justify-between p-6">
            <h3 className="font-black text-slate-800">Presencas</h3>
            <StatusBadge tone={absences > 0 ? "warning" : "success"}>{`${absences} Faltas`}</StatusBadge>
          </div>
          <DataTable
            emptyMessage="Ainda nao existem presencas marcadas."
            headers={["Data", "Estado", "Notas"]}
            rows={(student?.attendances ?? []).map((attendance) => [
              attendance.lessonDate.toLocaleDateString("pt-MZ"),
              attendance.status,
              attendance.notes ?? "-"
            ])}
          />
        </BentoCard>

        <BentoCard className="p-0 xl:col-span-6">
          <div className="flex items-center justify-between p-6">
            <h3 className="font-black text-slate-800">Matriculas</h3>
            <StatusBadge tone="navy">{`${activeCourses} Cursos`}</StatusBadge>
          </div>
          <DataTable
            emptyMessage="Ainda nao existem matriculas."
            headers={["Curso", "Turma", "Estado"]}
            rows={(student?.enrollments ?? []).map((enrollment) => [enrollment.course.title, enrollment.classGroup.name, enrollment.status])}
          />
        </BentoCard>

        <BentoCard className="p-0 xl:col-span-6">
          <div className="flex items-center justify-between p-6">
            <h3 className="font-black text-slate-800">Faturas</h3>
            <StatusBadge tone={pendingAmount > 0 ? "warning" : "success"}>{`${pendingAmount} MT`}</StatusBadge>
          </div>
          <DataTable
            emptyMessage="Ainda nao existem faturas."
            headers={["Referencia", "Valor", "Estado"]}
            rows={(student?.invoices ?? []).map((invoice) => [invoice.reference, `${invoice.amountMt} MT`, invoice.status])}
          />
        </BentoCard>
      </div>
    </DashboardLayout>
  );
}

function Progress({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
        <span>{label}</span>
        <span className="text-slate-700">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`${tone} h-full rounded-full`} style={{ width: value }} />
      </div>
    </div>
  );
}

function QuickSupport() {
  return (
    <div className="rounded-[1.5rem] bg-slate-900 p-4 text-white">
      <p className="text-xs font-black italic text-rose-400">Duvidas?</p>
      <p className="mt-1 text-[11px] font-medium text-slate-300">Fale diretamente com o tutor via WhatsApp.</p>
      <PrimaryButton className="mt-4 w-full min-h-10 py-2" tone="light">
        Suporte Rapido
      </PrimaryButton>
    </div>
  );
}
