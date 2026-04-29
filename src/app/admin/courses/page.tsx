import { BookOpen } from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { BentoCard, DataTable, FormField, PrimaryButton, StatusBadge } from "@/components/ui";
import { createCourseAction } from "@/features/admin/actions";
import { adminNavigation } from "@/features/admin/nav";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <DashboardLayout navItems={adminNavigation("/admin/courses")} title="Cursos" subtitle="Oferta academica" context="Super Admin" darkSidebar>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <BentoCard className="xl:col-span-5">
          <h3 className="mb-6 text-lg font-black text-slate-900">Novo Curso</h3>
          <form action={createCourseAction} className="space-y-4">
            <FormField name="title" label="Titulo" placeholder="Ingles Conversacional" />
            <FormField name="level" label="Nivel" placeholder="A2" />
            <FormField name="duration" label="Duracao" placeholder="8 semanas" />
            <FormField name="description" label="Descricao" placeholder="Curso focado em speaking." />
            <PrimaryButton className="w-full" tone="navy" type="submit">
              <BookOpen size={16} /> Criar Curso
            </PrimaryButton>
          </form>
        </BentoCard>

        <BentoCard className="p-0 xl:col-span-7">
          <div className="flex items-center justify-between p-6">
            <h3 className="font-black text-slate-900">Cursos</h3>
            <StatusBadge tone="navy">{`${courses.length} Total`}</StatusBadge>
          </div>
          <DataTable headers={["Titulo", "Nivel", "Duracao", "Estado"]} rows={courses.map((course) => [course.title, course.level, course.duration ?? "-", course.isActive ? "Ativo" : "Inativo"])} />
        </BentoCard>
      </div>
    </DashboardLayout>
  );
}
