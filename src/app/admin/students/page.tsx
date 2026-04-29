import { UserPlus } from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { BentoCard, DataTable, FormField, PrimaryButton, StatusBadge } from "@/components/ui";
import { createStudentAction } from "@/features/admin/actions";
import { adminNavigation } from "@/features/admin/nav";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function StudentsPage() {
  const students = await prisma.studentProfile.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <DashboardLayout navItems={adminNavigation("/admin/students")} title="Registo de Alunos" subtitle="CRUD base de estudantes" context="Super Admin" darkSidebar>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <BentoCard className="xl:col-span-5">
          <h3 className="mb-6 text-lg font-black text-slate-900">Novo Aluno</h3>
          <form action={createStudentAction} className="space-y-4">
            <FormField name="name" label="Nome Completo" placeholder="Ex: Celso Manuel" />
            <FormField name="email" label="Email" placeholder="aluno.teste@delsonps.local" type="email" />
            <FormField name="studentNumber" label="Numero de Aluno" placeholder="STU-TEST-0002" />
            <FormField name="level" label="Nivel" placeholder="B1 Intermediate" />
            <PrimaryButton className="w-full" tone="rose" type="submit">
              <UserPlus size={16} /> Criar Aluno
            </PrimaryButton>
          </form>
        </BentoCard>

        <BentoCard className="p-0 xl:col-span-7">
          <div className="flex items-center justify-between p-6">
            <h3 className="font-black text-slate-900">Alunos</h3>
            <StatusBadge tone="navy">{`${students.length} Total`}</StatusBadge>
          </div>
          <DataTable
            headers={["Nome", "Email", "Numero", "Nivel"]}
            rows={students.map((student) => [student.user.name, student.user.email, student.studentNumber, student.level])}
          />
        </BentoCard>
      </div>
    </DashboardLayout>
  );
}
