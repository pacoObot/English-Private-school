import { Users } from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { BentoCard, DataTable, FormField, PrimaryButton, SelectField, StatusBadge } from "@/components/ui";
import { createClassGroupAction } from "@/features/admin/actions";
import { adminNavigation } from "@/features/admin/nav";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ClassesPage() {
  const [classes, courses, teachers] = await Promise.all([
    prisma.classGroup.findMany({
      include: { course: true, teacher: { include: { user: true } } },
      orderBy: { createdAt: "desc" }
    }),
    prisma.course.findMany({ where: { isActive: true }, orderBy: { title: "asc" } }),
    prisma.teacherProfile.findMany({ include: { user: true }, orderBy: { createdAt: "desc" } })
  ]);

  return (
    <DashboardLayout navItems={adminNavigation("/admin/classes")} title="Gestao de Turmas" subtitle="Turmas, salas e horarios" context="Super Admin" darkSidebar>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <BentoCard className="xl:col-span-5">
          <h3 className="mb-6 text-lg font-black text-slate-900">Nova Turma</h3>
          <form action={createClassGroupAction} className="space-y-4">
            <FormField name="name" label="Nome" placeholder="B2 Noite" />
            <FormField name="schedule" label="Horario" placeholder="Seg/Qua 19:30" />
            <FormField name="room" label="Sala" placeholder="Sala 04" />
            <SelectField name="courseId" label="Curso" options={courses.map((course) => ({ label: `${course.title} · ${course.level}`, value: course.id }))} />
            <SelectField
              name="teacherId"
              label="Docente"
              options={[{ label: "Sem docente definido", value: "" }, ...teachers.map((teacher) => ({ label: teacher.user.name, value: teacher.id }))]}
            />
            <PrimaryButton className="w-full" tone="rose" type="submit">
              <Users size={16} /> Criar Turma
            </PrimaryButton>
          </form>
        </BentoCard>

        <BentoCard className="p-0 xl:col-span-7">
          <div className="flex items-center justify-between p-6">
            <h3 className="font-black text-slate-900">Turmas</h3>
            <StatusBadge tone="navy">{`${classes.length} Total`}</StatusBadge>
          </div>
          <DataTable
            headers={["Turma", "Curso", "Horario", "Docente"]}
            rows={classes.map((classGroup) => [classGroup.name, classGroup.course.title, classGroup.schedule, classGroup.teacher?.user.name ?? "Por definir"])}
          />
        </BentoCard>
      </div>
    </DashboardLayout>
  );
}
