import { FileText, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BentoCard, DataTable, StatusBadge } from "@/components/ui";
import { adminNavigation } from "@/features/admin/nav";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminLogsPage({ searchParams }: { searchParams?: { page?: string, limit?: string } }) {
  const page = parseInt(searchParams?.page || "1", 10);
  const limit = parseInt(searchParams?.limit || "50", 10);
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      skip,
      take: limit,
      include: { actor: true },
      orderBy: { createdAt: "desc" }
    }),
    prisma.auditLog.count()
  ]);

  return (
    <DashboardLayout
      navItems={adminNavigation("/admin/logs")}
      title="Logs de Auditoria"
      subtitle={`Total: ${total} registos`}
      context="Super Admin"
      darkSidebar
    >
      <div className="space-y-6">
        <BentoCard className="p-0">
          <div className="flex items-center justify-between p-6">
            <h3 className="font-black text-slate-800">Registo de Atividades do Sistema</h3>
            <div className="flex items-center gap-3">
              <StatusBadge tone="navy">{`Página ${page}`}</StatusBadge>
              <SlidersHorizontal size={18} className="text-slate-400" />
            </div>
          </div>
          <DataTable
            emptyMessage="Nenhum log encontrado."
            headers={["Data", "Ação", "Entidade", "ID da Entidade", "Ator"]}
            rows={logs.map((log) => [
              log.createdAt.toLocaleString("pt-PT"),
              <span key={`${log.id}-action`} className="font-bold text-navy">{log.action}</span>,
              log.entity,
              log.entityId || "-",
              log.actor?.name || "Sistema"
            ])}
          />
        </BentoCard>
      </div>
    </DashboardLayout>
  );
}
