import type { ReactNode } from "react";
import Link from "next/link";
import { BookOpen, FileText, GraduationCap, ShieldCheck, Users, Wallet } from "lucide-react";
import { Role } from "@/generated/prisma";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BentoCard } from "@/components/ui/BentoCard";
import { DataTable } from "@/components/ui/DataTable";
import { MetricCard } from "@/components/ui/MetricCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { adminNavigation } from "@/features/admin/nav";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [studentCount, courseCount, classCount, staffCount, invoiceAggregate, latestEnrollments, auditLogs] = await Promise.all([
    prisma.studentProfile.count(),
    prisma.course.count({ where: { isActive: true } }),
    prisma.classGroup.count(),
    prisma.user.count({ where: { role: { in: [Role.SUPER_ADMIN, Role.ADMIN, Role.TEACHER] }, isActive: true } }),
    prisma.invoice.aggregate({ _sum: { amountMt: true }, where: { status: "PAID" } }),
    prisma.enrollment.findMany({
      take: 5,
      include: { student: { include: { user: true } }, course: true, classGroup: true },
      orderBy: { createdAt: "desc" }
    }),
    prisma.auditLog.findMany({ take: 3, orderBy: { createdAt: "desc" } })
  ]);

  return (
    <DashboardLayout
      navItems={adminNavigation("/admin/dashboard")}
      title="Painel de Controlo Master"
      subtitle="Maputo, Mocambique"
      context="Super Admin"
      darkSidebar
      sidebarFooter={<AdminFooter />}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total Estudantes" value={String(studentCount)} hint="Real" icon={GraduationCap} tone="navy" />
          <MetricCard label="Receita Paga" value={`${invoiceAggregate._sum.amountMt ?? 0} MT`} hint="MT" icon={Wallet} tone="rose" />
          <MetricCard label="Cursos Ativos" value={String(courseCount)} hint="Ativos" icon={BookOpen} tone="dark" />
          <MetricCard label="Staff Ativo" value={String(staffCount)} icon={ShieldCheck} tone="light" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Link href="/admin/students"><PrimaryButton className="w-full" tone="rose">Gerir Alunos</PrimaryButton></Link>
          <Link href="/admin/staff"><PrimaryButton className="w-full" tone="navy">Gerir Staff</PrimaryButton></Link>
          <Link href="/admin/courses"><PrimaryButton className="w-full" tone="dark">Gerir Cursos</PrimaryButton></Link>
          <Link href="/admin/classes"><PrimaryButton className="w-full" tone="light">Gerir Turmas</PrimaryButton></Link>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <BentoCard className="p-0">
            <div className="flex items-center justify-between p-6">
              <h3 className="font-black text-slate-800">Matriculas Recentes</h3>
              <StatusBadge tone="navy">{`${classCount} Turmas`}</StatusBadge>
            </div>
            <DataTable
              headers={["Aluno", "Curso", "Turma", "Status"]}
              rows={latestEnrollments.map((enrollment) => [
                enrollment.student.user.name,
                enrollment.course.title,
                enrollment.classGroup.name,
                <StatusBadge key={enrollment.id} tone="success">{enrollment.status}</StatusBadge>
              ])}
            />
          </BentoCard>

          <BentoCard>
            <h3 className="mb-6 font-black text-slate-800">Auditoria e UNIEXE</h3>
            <div className="space-y-3">
              {auditLogs.map((log) => (
                <AdminLine key={log.id} icon={<FileText size={17} />} title={log.action} detail={`${log.entity}${log.entityId ? ` · ${log.entityId}` : ""}`} />
              ))}
              <AdminLine icon={<ShieldCheck size={17} />} title="uniexe_contract_pending" detail="Camada reservada para integracao futura" />
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

function AdminFooter() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-full border border-slate-700 bg-slate-800" />
      <div>
        <p className="text-xs font-black text-white">Super Admin</p>
        <p className="text-[9px] font-bold uppercase text-rose-500">Maputo HQ</p>
      </div>
    </div>
  );
}
