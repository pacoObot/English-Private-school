import type { ReactNode } from "react";
import Link from "next/link";
import { BookOpen, FileText, GraduationCap, Mic2, ShieldCheck, TrendingUp, Users, Wallet } from "lucide-react";
import { Role } from "@/generated/prisma";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BentoCard } from "@/components/ui/BentoCard";
import { DataTable } from "@/components/ui/DataTable";
import { MetricCard } from "@/components/ui/MetricCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ActionNotice } from "@/components/ui/ActionNotice";
import { updateInvoiceStatusAction } from "@/features/admin/actions";
import { adminNavigation } from "@/features/admin/nav";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({ searchParams }: { searchParams?: { status?: string } }) {
  const [
    studentCount, courseCount, classCount, staffCount, 
    paidAggregate, pendingAggregate, 
    latestEnrollments, invoices, auditLogs,
    allGrades, allDebates, allAttendances,
    pendingFeedbackCount, sessionsWithoutInstructor, latestMaterials
  ] = await Promise.all([
    prisma.studentProfile.count(),
    prisma.course.count({ where: { isActive: true } }),
    prisma.classGroup.count(),
    prisma.user.count({ where: { role: { in: [Role.SUPER_ADMIN, Role.ADMIN, Role.TEACHER] }, isActive: true } }),
    prisma.invoice.aggregate({ _sum: { amountMt: true }, where: { status: "PAID" } }),
    prisma.invoice.aggregate({ _sum: { amountMt: true }, where: { status: "PENDING" } }),
    prisma.enrollment.findMany({ take: 5, include: { student: { include: { user: true } }, course: true, classGroup: true }, orderBy: { createdAt: "desc" } }),
    prisma.invoice.findMany({ take: 6, include: { student: { include: { user: true } }, enrollment: { include: { course: true } }, receipt: true }, orderBy: { createdAt: "desc" } }),
    prisma.auditLog.findMany({ take: 3, orderBy: { createdAt: "desc" } }),
    prisma.grade.findMany({ select: { score: true } }),
    prisma.debateEvaluation.aggregate({ _avg: { fluency: true, argumentation: true, posture: true } }),
    prisma.attendance.groupBy({ by: ['status'], _count: true }),
    prisma.debateEvaluation.count({ where: { acknowledgedAt: null } }),
    prisma.debateSession.count({ where: { moderatorId: null } }),
    prisma.studyMaterial.findMany({ take: 3, include: { course: true, teacher: { include: { user: true } } }, orderBy: { createdAt: "desc" } })
  ]);

  const globalAverage = allGrades.length > 0 ? (allGrades.reduce((acc, g) => acc + g.score, 0) / allGrades.length).toFixed(1) : "0.0";
  const debateAvg = allDebates._avg;
  const globalDebateAvg = (( (debateAvg.fluency||0) + (debateAvg.argumentation||0) + (debateAvg.posture||0) ) / 3).toFixed(1);

  const presentCount = allAttendances.find(a => a.status === 'PRESENT')?._count || 0;
  const totalAttendance = allAttendances.reduce((acc, a) => acc + a._count, 0);
  const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

  return (
    <DashboardLayout
      navItems={adminNavigation("/admin/dashboard")}
      title="Painel de Controlo Master"
      subtitle="Maputo, Mocambique"
      context="Super Admin"
      darkSidebar
    >
      <div className="space-y-6">
        <ActionNotice status={searchParams?.status} />
        
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Média Global" value={`${globalAverage}/20`} hint="Notas" icon={TrendingUp} tone="navy" />
          <MetricCard label="Taxa Presença" value={`${attendanceRate}%`} hint="Frequência" icon={Users} tone="navy" />
          <MetricCard label="Média Debate" value={`${globalDebateAvg}/10`} hint="Skills" icon={Mic2} tone="rose" />
          <MetricCard label="Receita Paga" value={`${paidAggregate._sum.amountMt ?? 0}`} hint="MT" icon={Wallet} tone="dark" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4 border-y border-slate-200 py-6">
          <Link href="/admin/students"><PrimaryButton className="w-full" tone="rose">Gerir Alunos</PrimaryButton></Link>
          <Link href="/admin/staff"><PrimaryButton className="w-full" tone="navy">Gerir Staff</PrimaryButton></Link>
          <Link href="/admin/courses"><PrimaryButton className="w-full" tone="dark">Gerir Cursos</PrimaryButton></Link>
          <Link href="/admin/classes"><PrimaryButton className="w-full" tone="light">Gerir Turmas</PrimaryButton></Link>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <BentoCard>
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-800">Feedback por confirmar</h3>
              <StatusBadge tone={pendingFeedbackCount > 0 ? "danger" : "success"}>{pendingFeedbackCount}</StatusBadge>
            </div>
            <p className="mt-3 text-xs font-bold text-slate-500">
              Avaliações de debate enviadas ao aluno que ainda não foram marcadas como recebidas.
            </p>
            <Link href="/admin/students?tab=talentos" className="mt-4 inline-flex">
              <PrimaryButton tone="light" className="min-h-10 px-3 py-2 text-[10px]">Ver desempenho</PrimaryButton>
            </Link>
          </BentoCard>

          <BentoCard>
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-800">Sessões sem instrutor</h3>
              <StatusBadge tone={sessionsWithoutInstructor > 0 ? "warning" : "success"}>{sessionsWithoutInstructor}</StatusBadge>
            </div>
            <p className="mt-3 text-xs font-bold text-slate-500">
              Debates agendados que ainda precisam de uma pessoa designada para orientar e avaliar.
            </p>
            <Link href="/debate" className="mt-4 inline-flex">
              <PrimaryButton tone="navy" className="min-h-10 px-3 py-2 text-[10px]">Abrir debates</PrimaryButton>
            </Link>
          </BentoCard>

          <BentoCard>
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-800">Materiais recentes</h3>
              <StatusBadge tone="navy">{latestMaterials.length}</StatusBadge>
            </div>
            <div className="mt-3 space-y-2">
              {latestMaterials.length > 0 ? latestMaterials.map((material) => (
                <div key={material.id} className="rounded-xl border border-slate-100 px-3 py-2">
                  <p className="truncate text-xs font-black text-slate-800">{material.title}</p>
                  <p className="text-[10px] font-bold text-slate-400">{material.course.title} · {material.teacher?.user.name ?? "Administração"}</p>
                </div>
              )) : (
                <p className="text-xs font-bold text-slate-400">Nenhum material publicado.</p>
              )}
            </div>
          </BentoCard>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <BentoCard className="p-0">
            <div className="flex items-center justify-between p-6">
              <h3 className="font-black text-slate-800">Últimas Matrículas</h3>
              <StatusBadge tone="navy">{`${classCount} Turmas Ativas`}</StatusBadge>
            </div>
            <DataTable
              headers={["Aluno", "Curso", "Turma"]}
              rows={latestEnrollments.map((e) => [e.student.user.name, e.course.title, e.classGroup.name])}
            />
          </BentoCard>

          <BentoCard className="p-0">
            <div className="flex items-center justify-between p-6">
              <h3 className="font-black text-slate-800">Faturas Recentes</h3>
              <StatusBadge tone="danger">{`${pendingAggregate._sum.amountMt ?? 0} MT Pendente`}</StatusBadge>
            </div>
            <DataTable
              headers={["Aluno", "Valor", "Estado", "Ação"]}
              rows={invoices.map((inv: any) => [
                inv.student.user.name,
                `${inv.amountMt} MT`,
                <StatusBadge key={inv.id} tone={inv.status === "PAID" ? "success" : inv.status === "PENDING" ? "warning" : "danger"}>{inv.status}</StatusBadge>,
                <div key={`${inv.id}-actions`} className="flex gap-2">
                  {inv.status === "PAID" ? (
                    <Link href={`/admin/receipts/${inv.receipt?.id}`} className="rounded-xl border border-slate-200 px-3 py-2 text-[10px] font-black uppercase text-slate-700 flex items-center gap-1 hover:bg-slate-50">
                      <FileText size={12} /> Recibo
                    </Link>
                  ) : (
                    <form action={updateInvoiceStatusAction}>
                      <input type="hidden" name="id" value={inv.id} />
                      <input type="hidden" name="status" value="PAID" />
                      <PrimaryButton tone="navy" className="px-3 min-h-10 py-2 text-[10px]" type="submit">Pagar</PrimaryButton>
                    </form>
                  )}
                </div>
              ])}
            />
          </BentoCard>

          <BentoCard>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-slate-800">Auditoria</h3>
              <Link href="/admin/logs"><span className="text-xs font-bold text-rose-500 hover:underline">Ver Todos</span></Link>
            </div>
            <div className="space-y-3">
              {auditLogs.map((log) => (
                <AdminLine key={log.id} icon={<FileText size={17} />} title={log.action} detail={`${log.entity}${log.entityId ? ` · ${log.entityId}` : ""}`} />
              ))}
              {auditLogs.length === 0 ? (
                <AdminLine icon={<ShieldCheck size={17} />} title="Sem eventos recentes" detail="As próximas ações do sistema aparecerão aqui." />
              ) : null}
            </div>
          </BentoCard>
        </div>
      </div>
    </DashboardLayout>
  );
}

function AdminLine({ icon, title, detail }: { icon: ReactNode; title: string; detail: string }) {
  return (
    <div className="flex gap-4 rounded-2xl bg-slate-50 p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-navy">{icon}</div>
      <div>
        <p className="text-sm font-black text-slate-800">{title}</p>
        <p className="text-xs font-bold text-slate-400">{detail}</p>
      </div>
    </div>
  );
}
