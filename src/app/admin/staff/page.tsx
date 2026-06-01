import { ShieldCheck, UserPlus, CheckCircle, Users } from "lucide-react";
import { Role } from "@/generated/prisma";
import { DashboardLayout } from "@/components/layout";
import { ActionNotice, BentoCard, DataTable, FormField, PrimaryButton, SelectField, StatusBadge } from "@/components/ui";
import { createStaffAction, setDebateModerationPermissionAction, setStaffActiveAction } from "@/features/admin/actions";
import { adminNavigation } from "@/features/admin/nav";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const DEFAULT_PASSWORD = "Delson@2026";

type StaffPageProps = {
  searchParams?: {
    status?: string;
    tab?: string;
    newCode?: string;
    newName?: string;
    missing?: string;
    invalid?: string;
    duplicate?: string;
  };
};

export default async function StaffPage({ searchParams }: StaffPageProps) {
  const activeTab = searchParams?.tab === "lista" ? "lista" : "registar";
  const newCode = searchParams?.newCode;
  const newName = searchParams?.newName;
  const showCredentials = searchParams?.status === "created" && newCode;

  const staff = await prisma.user.findMany({
    where: { role: { in: [Role.SUPER_ADMIN, Role.ADMIN, Role.TEACHER] } },
    include: { teacherProfile: true },
    orderBy: { name: "asc" }
  });

  return (
    <DashboardLayout navItems={adminNavigation("/admin/staff")} title="Gestão de Staff" subtitle="Administração e corpo docente" context="Super Admin" darkSidebar>
      <div className="space-y-5">
        <ActionNotice 
          status={searchParams?.status} 
          newCode={searchParams?.newCode}
          newName={searchParams?.newName}
          missing={searchParams?.missing}
          invalid={searchParams?.invalid}
          duplicate={searchParams?.duplicate}
        />

        {/* ── Abas ── */}
        <div className="flex gap-2">
          <a
            href="/admin/staff?tab=registar"
            className={`flex items-center gap-2 rounded-full px-6 py-3 text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === "registar"
                ? "bg-navy text-white shadow-lg shadow-navy/20"
                : "bg-white text-slate-500 border border-slate-200 hover:border-navy hover:text-navy"
            }`}
          >
            <UserPlus size={14} /> Registar Staff
          </a>
          <a
            href="/admin/staff?tab=lista"
            className={`flex items-center gap-2 rounded-full px-6 py-3 text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === "lista"
                ? "bg-navy text-white shadow-lg shadow-navy/20"
                : "bg-white text-slate-500 border border-slate-200 hover:border-navy hover:text-navy"
            }`}
          >
            <Users size={14} /> Listagem de Staff
          </a>
        </div>

        {activeTab === "registar" ? (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            <BentoCard className="lg:col-span-5">
              <div className="mb-6">
                <h3 className="text-lg font-black text-slate-900">Novo Membro</h3>
                <p className="mt-1 text-xs text-slate-400 font-semibold">
                  Crie administradores ou professores para o sistema.
                </p>
              </div>
              <form action={createStaffAction} className="space-y-4">
                <FormField name="name" label="Nome Completo" placeholder="Ex: Maria Admin" required />
                <FormField name="email" label="Email" placeholder="staff.teste@delsonps.local" type="email" required />
                <FormField name="staffNumber" label="Número Staff (apenas para Professores)" placeholder="STAFF-2026-001" />
                <FormField name="specialty" label="Especialidade / Cargo" placeholder="Ex: General English / Direção" />
                <SelectField
                  name="role"
                  label="Papel"
                  required
                  options={[
                    { label: "Professor", value: Role.TEACHER },
                    { label: "Administrador", value: Role.ADMIN }
                  ]}
                />
                <PrimaryButton className="w-full" tone="navy" type="submit">
                  <ShieldCheck size={16} /> Criar Staff
                </PrimaryButton>
              </form>
            </BentoCard>

            <BentoCard className="lg:col-span-7 bg-navy/5 border-navy/10">
              <div className="p-6 text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-navy/10 flex items-center justify-center text-navy">
                  <ShieldCheck size={32} />
                </div>
                <h3 className="text-xl font-black text-navy">Gestão Segura</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                  Todos os membros do staff têm acesso restrito com base no seu papel (RBAC).
                  Os professores gerem notas e presenças, enquanto os administradores têm controlo total sobre o sistema académico e financeiro.
                </p>
              </div>
            </BentoCard>
          </div>
        ) : (
          <BentoCard className="p-0">
            <div className="flex items-center justify-between p-6">
              <h3 className="font-black text-slate-900">Membros do Staff</h3>
              <StatusBadge tone="navy">{`${staff.length} Total`}</StatusBadge>
            </div>
            <DataTable
              emptyMessage="Ainda não existem membros de staff."
              headers={["Membro", "Papel", "Especialidade", "Debates", "Estado", "Ações"]}
              rows={staff.map((person) => [
                <div key={`${person.id}-info`}>
                  <p className="text-sm font-bold text-slate-800">{person.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{person.email}</p>
                  {person.teacherProfile?.staffNumber && (
                    <p className="text-[9px] font-black text-rose-600 tracking-widest mt-1">{person.teacherProfile.staffNumber}</p>
                  )}
                </div>,
                <StatusBadge key={`${person.id}-role`} tone={person.role === Role.SUPER_ADMIN ? "danger" : "navy"}>
                  {person.role}
                </StatusBadge>,
                <span key={`${person.id}-spec`} className="text-xs font-bold text-slate-600">
                  {person.teacherProfile?.specialty ?? "Administração"}
                </span>,
                <form key={`${person.id}-debate`} action={setDebateModerationPermissionAction} className="flex justify-end">
                  <input type="hidden" name="userId" value={person.id} />
                  <input type="hidden" name="canModerateDebates" value={person.canModerateDebates ? "false" : "true"} />
                  <input type="hidden" name="returnTo" value="/admin/staff?tab=lista" />
                  <PrimaryButton
                    tone={person.canModerateDebates ? "rose" : "light"}
                    className="min-h-8 px-3 py-1.5 text-[10px]"
                    type="submit"
                    disabled={person.role !== Role.TEACHER || !person.isActive}
                  >
                    {person.canModerateDebates ? "Instrutor ON" : "Instrutor OFF"}
                  </PrimaryButton>
                </form>,
                <StatusBadge key={`${person.id}-status`} tone={person.isActive ? "success" : "neutral"}>
                  {person.isActive ? "Ativo" : "Inativo"}
                </StatusBadge>,
                <div key={`${person.id}-actions`} className="flex justify-end gap-2">
                  <form action={setStaffActiveAction}>
                    <input type="hidden" name="id" value={person.id} />
                    <input type="hidden" name="isActive" value={person.isActive ? "false" : "true"} />
                    <PrimaryButton
                      tone={person.isActive ? "light" : "navy"}
                      className="px-3 min-h-8 py-1.5 text-[10px]"
                      type="submit"
                      disabled={person.role === Role.SUPER_ADMIN}
                    >
                      {person.isActive ? "Desativar" : "Ativar"}
                    </PrimaryButton>
                  </form>
                </div>
              ])}
            />
          </BentoCard>
        )}
      </div>
    </DashboardLayout>
  );
}
