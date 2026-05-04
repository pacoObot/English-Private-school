import { UserPlus } from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { ActionNotice, BentoCard, DataTable, FormField, PrimaryButton, SelectField, StatusBadge } from "@/components/ui";
import { createEnrollmentAction, createStudentAction, setStudentActiveAction, updateEnrollmentStatusAction, updateStudentAction } from "@/features/admin/actions";
import { adminNavigation } from "@/features/admin/nav";
import { EnrollmentStatus } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type StudentsPageProps = {
  searchParams?: { status?: string };
};

export default async function StudentsPage({ searchParams }: StudentsPageProps) {
  const [students, courses, classes, enrollments] = await Promise.all([
    prisma.studentProfile.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" }
    }),
    prisma.course.findMany({ where: { isActive: true }, orderBy: { title: "asc" } }),
    prisma.classGroup.findMany({ include: { course: true }, orderBy: { name: "asc" } }),
    prisma.enrollment.findMany({
      include: { student: { include: { user: true } }, course: true, classGroup: true, invoices: true },
      orderBy: { createdAt: "desc" }
    })
  ]);

  return (
    <DashboardLayout navItems={adminNavigation("/admin/students")} title="Registo de Alunos" subtitle="CRUD, matriculas e historico" context="Super Admin" darkSidebar>
      <div className="space-y-5">
        <ActionNotice status={searchParams?.status} />
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          <BentoCard className="xl:col-span-4">
            <h3 className="mb-6 text-lg font-black text-slate-900">Novo Aluno</h3>
            <form action={createStudentAction} className="space-y-4">
              <FormField name="name" label="Nome Completo" placeholder="Ex: Celso Manuel" required />
              <FormField name="email" label="Email" placeholder="aluno.teste@delsonps.local" type="email" required />
              <FormField name="studentNumber" label="Numero de Aluno" placeholder="STU-TEST-0002" required />
              <FormField name="level" label="Nivel" placeholder="B1 Intermediate" required />
              <FormField name="phone" label="Telefone" placeholder="+258 84 000 0000" />
              <FormField name="guardianName" label="Encarregado" placeholder="Nome do encarregado" />
              <PrimaryButton className="w-full" tone="rose" type="submit">
                <UserPlus size={16} /> Criar Aluno
              </PrimaryButton>
            </form>
          </BentoCard>

          <BentoCard className="xl:col-span-4">
            <h3 className="mb-6 text-lg font-black text-slate-900">Nova Matricula</h3>
            <form action={createEnrollmentAction} className="space-y-4">
              <SelectField name="studentId" label="Aluno" required options={students.map((student) => ({ label: `${student.user.name} · ${student.studentNumber}`, value: student.id }))} />
              <SelectField name="courseId" label="Curso" required options={courses.map((course) => ({ label: `${course.title} · ${course.level}`, value: course.id }))} />
              <SelectField name="classGroupId" label="Turma" required options={classes.map((classGroup) => ({ label: `${classGroup.name} · ${classGroup.course.title}`, value: classGroup.id }))} />
              <SelectField
                name="status"
                label="Status"
                options={Object.values(EnrollmentStatus).map((status) => ({ label: status, value: status }))}
                defaultValue={EnrollmentStatus.ACTIVE}
              />
              <FormField name="monthlyFeeMt" label="Mensalidade MT" placeholder="2500" type="number" min={1} required />
              <FormField name="dueDate" label="Vencimento da Fatura" type="date" required />
              <PrimaryButton className="w-full" tone="navy" type="submit">Matricular e Faturar</PrimaryButton>
            </form>
          </BentoCard>

          <BentoCard className="p-0 xl:col-span-4">
            <div className="flex items-center justify-between p-6">
              <h3 className="font-black text-slate-900">Historico</h3>
              <StatusBadge tone="navy">{`${enrollments.length} Matriculas`}</StatusBadge>
            </div>
            <DataTable
              emptyMessage="Ainda nao existem matriculas."
              headers={["Aluno", "Curso", "Turma", "Status"]}
              rows={enrollments.map((enrollment) => [
                enrollment.student.user.name,
                enrollment.course.title,
                enrollment.classGroup.name,
                <form key={enrollment.id} action={updateEnrollmentStatusAction} className="flex justify-end gap-2">
                  <input type="hidden" name="id" value={enrollment.id} />
                  <select name="status" defaultValue={enrollment.status} className="rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs font-bold">
                    {Object.values(EnrollmentStatus).map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <button className="rounded-xl bg-slate-900 px-3 py-2 text-[10px] font-black uppercase text-white" type="submit">OK</button>
                </form>
              ])}
            />
          </BentoCard>
        </div>

        <BentoCard className="p-0">
          <div className="flex items-center justify-between p-6">
            <h3 className="font-black text-slate-900">Alunos</h3>
            <StatusBadge tone="navy">{`${students.length} Total`}</StatusBadge>
          </div>
          <DataTable
            emptyMessage="Ainda nao existem alunos."
            headers={["Aluno", "Contacto", "Dados Academicos", "Acoes"]}
            rows={students.map((student) => [
              <form key={`${student.id}-identity`} action={updateStudentAction} className="grid w-full min-w-full sm:min-w-56 gap-2">
                <input type="hidden" name="id" value={student.id} />
                <input type="hidden" name="userId" value={student.userId} />
                <input name="name" defaultValue={student.user.name} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" required />
                <input name="email" defaultValue={student.user.email} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" type="email" required />
                <input name="studentNumber" defaultValue={student.studentNumber} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" required />
                <input name="level" defaultValue={student.level} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" required />
                <input name="phone" defaultValue={student.phone ?? ""} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="Telefone" />
                <input name="guardianName" defaultValue={student.guardianName ?? ""} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="Encarregado" />
                <button className="rounded-xl bg-navy px-3 py-2 text-[10px] font-black uppercase text-white" type="submit">Guardar</button>
              </form>,
              student.phone ?? "-",
              `${student.studentNumber} · ${student.level}`,
              <form key={`${student.id}-active`} action={setStudentActiveAction} className="flex justify-end">
                <input type="hidden" name="id" value={student.id} />
                <input type="hidden" name="userId" value={student.userId} />
                <input type="hidden" name="isActive" value={student.user.isActive ? "false" : "true"} />
                <button className="rounded-xl border border-slate-200 px-3 py-2 text-[10px] font-black uppercase text-slate-700" type="submit">
                  {student.user.isActive ? "Desativar" : "Ativar"}
                </button>
              </form>
            ])}
          />
        </BentoCard>
      </div>
    </DashboardLayout>
  );
}
