import { Users } from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { ActionNotice, BentoCard, DataTable, FormField, PrimaryButton, SelectField, StatusBadge } from "@/components/ui";
import { createClassGroupAction, setClassGroupActiveAction, updateClassGroupAction } from "@/features/admin/actions";
import { adminNavigation } from "@/features/admin/nav";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type ClassesPageProps = {
  searchParams?: { status?: string };
};

export default async function ClassesPage({ searchParams }: ClassesPageProps) {
  const [classes, courses, teachers] = await Promise.all([
    prisma.classGroup.findMany({
      include: { course: true, teacher: { include: { user: true } }, enrollments: true },
      orderBy: { name: "asc" }
    }),
    prisma.course.findMany({ where: { isActive: true }, orderBy: { title: "asc" } }),
    prisma.teacherProfile.findMany({ where: { user: { isActive: true } }, include: { user: true }, orderBy: { user: { name: "asc" } } })
  ]);

  const teacherOptions = [{ label: "Sem docente definido", value: "" }, ...teachers.map((teacher) => ({ label: teacher.user.name, value: teacher.id }))];

  return (
    <DashboardLayout navItems={adminNavigation("/admin/classes")} title="Gestao de Turmas" subtitle="Turmas, salas e horarios" context="Super Admin" darkSidebar>
      <div className="space-y-5">
        <ActionNotice status={searchParams?.status} />
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          <BentoCard className="xl:col-span-4">
            <h3 className="mb-6 text-lg font-black text-slate-900">Nova Turma</h3>
            <form action={createClassGroupAction} className="space-y-4">
              <FormField name="name" label="Nome" placeholder="B2 Noite" required />
              <FormField name="schedule" label="Horario" placeholder="Seg/Qua 19:30" required />
              <FormField name="room" label="Sala" placeholder="Sala 04" />
              <SelectField name="courseId" label="Curso" required options={courses.map((course) => ({ label: `${course.title} · ${course.level}`, value: course.id }))} />
              <SelectField name="teacherId" label="Docente" options={teacherOptions} />
              <div className="grid grid-cols-2 gap-3">
                <FormField name="startsAt" label="Início" type="date" />
                <FormField name="endsAt" label="Término" type="date" />
              </div>
              <PrimaryButton className="w-full" tone="rose" type="submit">
                <Users size={16} /> Criar Turma
              </PrimaryButton>
            </form>
          </BentoCard>

          <BentoCard className="p-0 xl:col-span-8">
            <div className="flex items-center justify-between p-6">
              <h3 className="font-black text-slate-900">Turmas</h3>
              <StatusBadge tone="navy">{`${classes.length} Total`}</StatusBadge>
            </div>
            <DataTable
              emptyMessage="Ainda nao existem turmas."
              headers={["Turma", "Curso", "Docente", "Acoes"]}
              rows={classes.map((classGroup) => [
                <form key={`${classGroup.id}-edit`} action={updateClassGroupAction} className="grid w-full min-w-full sm:min-w-56 gap-2">
                  <input type="hidden" name="id" value={classGroup.id} />
                  <input name="name" defaultValue={classGroup.name} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" required />
                  <input name="schedule" defaultValue={classGroup.schedule} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" required />
                  <input name="room" defaultValue={classGroup.room ?? ""} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="Sala" />
                  <select name="courseId" defaultValue={classGroup.courseId} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>{`${course.title} · ${course.level}`}</option>
                    ))}
                  </select>
                  <select name="teacherId" defaultValue={classGroup.teacherId ?? ""} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
                    {teacherOptions.map((teacher) => (
                      <option key={teacher.value} value={teacher.value}>{teacher.label}</option>
                    ))}
                  </select>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-450 block">Início:</span>
                      <input name="startsAt" type="date" defaultValue={classGroup.startsAt ? new Date(classGroup.startsAt).toISOString().split('T')[0] : ""} className="rounded-xl border border-slate-200 px-2 py-1.5 text-xs w-full" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-455 block">Fim:</span>
                      <input name="endsAt" type="date" defaultValue={classGroup.endsAt ? new Date(classGroup.endsAt).toISOString().split('T')[0] : ""} className="rounded-xl border border-slate-200 px-2 py-1.5 text-xs w-full" />
                    </div>
                  </div>
                  <PrimaryButton tone="navy" className="px-3 min-h-10 py-2 text-[10px]" type="submit">Guardar</PrimaryButton>
                </form>,
                `${classGroup.course.title} · ${classGroup.schedule}`,
                classGroup.teacher?.user.name ?? "Por definir",
                <form key={`${classGroup.id}-active`} action={setClassGroupActiveAction} className="flex justify-end">
                  <input type="hidden" name="id" value={classGroup.id} />
                  <PrimaryButton tone="light" className="px-3 min-h-10 py-2 text-[10px]" type="submit">
                    Remover
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
