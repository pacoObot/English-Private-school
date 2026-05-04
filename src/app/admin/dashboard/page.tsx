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
    allGrades, allDebates, allAttendances
  ] = await Promise.all([
    prisma.studentProfile.count(),
    prisma.course.count({ where: { isActive: true } }),
    prisma.classGroup.count(),
    prisma.user.count({ where: { role: { in: [Role.SUPER_ADMIN, Role.ADMIN, Role.TEACHER] }, isActive: true } }),
    prisma.invoice.aggregate({ _sum: { amountMt: true }, where: { status: "PAID" } }),
    prisma.invoice.aggregate({ _sum: { amountMt: true }, where: { status: "PENDING" } }),
    prisma.enrollment.findMany({ take: 5, include: { student: { include: { user: true } }, course: true, classGroup: true }, orderBy: { createdAt: "desc" } }),
    prisma.invoice.findMany({ take: 6, include: { student: { include: { user: true } }, enrollment: { include: { course: true } } }, orderBy: { createdAt: "desc" } }),
    prisma.auditLog.findMany({ take: 3, orderBy: { createdAt: "desc" } }),
    prisma.grade.findMany({ select: { score: true } }),
    prisma.debateEvaluation.aggregate({ _avg: { fluency: true, argumentation: true, posture: true } }),
    prisma.attendance.groupBy({ by: ['status'], _count: true })
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

          <BentoCard>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-slate-800">Auditoria</h3>
              <Link href="/admin/logs"><span className="text-xs font-bold text-rose-500 hover:underline">Ver Todos</span></Link>
            </div>
            <div className="space-y-3">
              {auditLogs.map((log) => (
                <AdminLine key={log.id} icon={<FileText size={17} />} title={log.action} detail={`${log.entity}${log.entityId ? ` · ${log.entityId}` : ""}`} />
              ))}
              <AdminLine icon={<ShieldCheck size={17} />} title="uniexe_ready" detail="API V1 Base Preparada" />
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
