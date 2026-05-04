import { BookOpen } from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { ActionNotice, BentoCard, DataTable, FormField, PrimaryButton, StatusBadge } from "@/components/ui";
import { createCourseAction, setCourseActiveAction, updateCourseAction } from "@/features/admin/actions";
import { adminNavigation } from "@/features/admin/nav";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type CoursesPageProps = {
  searchParams?: { status?: string };
};

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <DashboardLayout navItems={adminNavigation("/admin/courses")} title="Cursos" subtitle="Oferta academica" context="Super Admin" darkSidebar>
      <div className="space-y-5">
        <ActionNotice status={searchParams?.status} />
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          <BentoCard className="xl:col-span-4">
            <h3 className="mb-6 text-lg font-black text-slate-900">Novo Curso</h3>
            <form action={createCourseAction} className="space-y-4">
              <FormField name="title" label="Titulo" placeholder="Ingles Conversacional" required />
              <FormField name="level" label="Nivel" placeholder="A2" required />
              <FormField name="duration" label="Duracao" placeholder="8 semanas" />
              <FormField name="description" label="Descricao" placeholder="Curso focado em speaking." />
              <PrimaryButton className="w-full" tone="navy" type="submit">
                <BookOpen size={16} /> Criar Curso
              </PrimaryButton>
            </form>
          </BentoCard>

          <BentoCard className="p-0 xl:col-span-8">
            <div className="flex items-center justify-between p-6">
              <h3 className="font-black text-slate-900">Cursos</h3>
              <StatusBadge tone="navy">{`${courses.length} Total`}</StatusBadge>
            </div>
            <DataTable
              emptyMessage="Ainda nao existem cursos."
              headers={["Curso", "Nivel", "Estado", "Acoes"]}
              rows={courses.map((course) => [
                <form key={`${course.id}-edit`} action={updateCourseAction} className="grid w-full min-w-full sm:min-w-56 gap-2">
                  <input type="hidden" name="id" value={course.id} />
                  <input name="title" defaultValue={course.title} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" required />
                  <input name="level" defaultValue={course.level} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" required />
                  <input name="duration" defaultValue={course.duration ?? ""} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="Duracao" />
                  <input name="description" defaultValue={course.description ?? ""} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="Descricao" />
                  <button className="rounded-xl bg-navy px-3 py-2 text-[10px] font-black uppercase text-white" type="submit">Guardar</button>
                </form>,
                course.level,
                course.isActive ? "Ativo" : "Inativo",
                <form key={`${course.id}-active`} action={setCourseActiveAction} className="flex justify-end">
                  <input type="hidden" name="id" value={course.id} />
                  <input type="hidden" name="isActive" value={course.isActive ? "false" : "true"} />
                  <button className="rounded-xl border border-slate-200 px-3 py-2 text-[10px] font-black uppercase text-slate-700" type="submit">
                    {course.isActive ? "Desativar" : "Ativar"}
                  </button>
                </form>
              ])}
            />
          </BentoCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
