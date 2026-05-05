import { ShieldCheck } from "lucide-react";
import { Role } from "@/generated/prisma";
import { DashboardLayout } from "@/components/layout";
import { ActionNotice, BentoCard, DataTable, FormField, PrimaryButton, SelectField, StatusBadge } from "@/components/ui";
import { createStaffAction, setStaffActiveAction, updateStaffAction } from "@/features/admin/actions";
import { adminNavigation } from "@/features/admin/nav";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type StaffPageProps = {
  searchParams?: { status?: string };
};

export default async function StaffPage({ searchParams }: StaffPageProps) {
  const staff = await prisma.user.findMany({
    where: { role: { in: [Role.SUPER_ADMIN, Role.ADMIN, Role.TEACHER] } },
    include: { teacherProfile: true },
    orderBy: { name: "asc" }
  });

  return (
    <DashboardLayout navItems={adminNavigation("/admin/staff")} title="Gestao de Staff" subtitle="Administracao e docentes" context="Super Admin" darkSidebar>
      <div className="space-y-5">
        <ActionNotice status={searchParams?.status} />
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          <BentoCard className="xl:col-span-4">
            <h3 className="mb-6 text-lg font-black text-slate-900">Novo Staff</h3>
            <form action={createStaffAction} className="space-y-4">
              <FormField name="name" label="Nome Completo" placeholder="Ex: Maria Admin" required />
              <FormField name="email" label="Email" placeholder="staff.teste@delsonps.local" type="email" required />
              <FormField name="staffNumber" label="Numero Staff" placeholder="STAFF-TEST-002" />
              <FormField name="specialty" label="Especialidade" placeholder="General English" />
              <SelectField
                name="role"
                label="Papel"
                options={[
                  { label: "Admin", value: Role.ADMIN },
                  { label: "Teacher", value: Role.TEACHER }
                ]}
              />
              <PrimaryButton className="w-full" tone="navy" type="submit">
                <ShieldCheck size={16} /> Criar Staff
              </PrimaryButton>
            </form>
          </BentoCard>

          <BentoCard className="p-0 xl:col-span-8">
            <div className="flex items-center justify-between p-6">
              <h3 className="font-black text-slate-900">Staff</h3>
              <StatusBadge tone="navy">{`${staff.length} Total`}</StatusBadge>
            </div>
            <DataTable
              emptyMessage="Ainda nao existem membros de staff."
              headers={["Identidade", "Papel", "Especialidade", "Acoes"]}
              rows={staff.map((person) => [
                <form key={`${person.id}-edit`} action={updateStaffAction} className="grid w-full min-w-full sm:min-w-56 gap-2">
                  <input type="hidden" name="id" value={person.id} />
                  <input type="hidden" name="teacherProfileId" value={person.teacherProfile?.id ?? ""} />
                  <input name="name" defaultValue={person.name} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" required />
                  <input name="email" defaultValue={person.email} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" type="email" required />
                  {person.teacherProfile ? (
                    <>
                      <input name="staffNumber" defaultValue={person.teacherProfile.staffNumber} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" required />
                      <input name="specialty" defaultValue={person.teacherProfile.specialty} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" required />
                    </>
                  ) : null}
                  <PrimaryButton tone="navy" className="px-3 min-h-10 py-2 text-[10px]" type="submit">Guardar</PrimaryButton>
                </form>,
                person.role,
                person.teacherProfile?.specialty ?? "Administracao",
                <form key={`${person.id}-active`} action={setStaffActiveAction} className="flex justify-end">
                  <input type="hidden" name="id" value={person.id} />
                  <input type="hidden" name="isActive" value={person.isActive ? "false" : "true"} />
                  <PrimaryButton tone="light" className="px-3 min-h-10 py-2 text-[10px]" type="submit">
                    {person.isActive ? "Desativar" : "Ativar"}
                  </PrimaryButton>
                </form>
              ])}
            />
          </BentoCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
