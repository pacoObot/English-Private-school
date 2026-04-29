import { ShieldCheck } from "lucide-react";
import { Role } from "@/generated/prisma";
import { DashboardLayout } from "@/components/layout";
import { BentoCard, DataTable, FormField, PrimaryButton, SelectField, StatusBadge } from "@/components/ui";
import { createStaffAction } from "@/features/admin/actions";
import { adminNavigation } from "@/features/admin/nav";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const staff = await prisma.user.findMany({
    where: { role: { in: [Role.SUPER_ADMIN, Role.ADMIN, Role.TEACHER] } },
    include: { teacherProfile: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <DashboardLayout navItems={adminNavigation("/admin/staff")} title="Gestao de Staff" subtitle="Administracao e docentes" context="Super Admin" darkSidebar>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <BentoCard className="xl:col-span-5">
          <h3 className="mb-6 text-lg font-black text-slate-900">Novo Staff</h3>
          <form action={createStaffAction} className="space-y-4">
            <FormField name="name" label="Nome Completo" placeholder="Ex: Maria Admin" />
            <FormField name="email" label="Email" placeholder="staff.teste@delsonps.local" type="email" />
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

        <BentoCard className="p-0 xl:col-span-7">
          <div className="flex items-center justify-between p-6">
            <h3 className="font-black text-slate-900">Staff</h3>
            <StatusBadge tone="navy">{`${staff.length} Total`}</StatusBadge>
          </div>
          <DataTable
            headers={["Nome", "Email", "Papel", "Especialidade"]}
            rows={staff.map((person) => [person.name, person.email, person.role, person.teacherProfile?.specialty ?? "Administracao"])}
          />
        </BentoCard>
      </div>
    </DashboardLayout>
  );
}
