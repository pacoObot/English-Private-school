import { DashboardLayout } from "@/components/layout";
import { ActionNotice, BentoCard, DataTable, FormField, PrimaryButton, SelectField, StatusBadge } from "@/components/ui";
import { createStudyMaterialAction, deleteStudyMaterialAction } from "@/features/teacher/actions";
import { teacherNav } from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type MaterialsPageProps = {
  searchParams?: { status?: string };
};

export default async function MaterialsPage({ searchParams }: MaterialsPageProps) {
  const [courses, materials] = await Promise.all([
    prisma.course.findMany({ where: { isActive: true }, orderBy: { title: "asc" } }),
    prisma.studyMaterial.findMany({ include: { course: true }, orderBy: { createdAt: "desc" } })
  ]);

  const courseOptions = courses.map((c) => ({
    label: `${c.title} · ${c.level}`,
    value: c.id
  }));

  return (
    <DashboardLayout navItems={teacherNav} title="Enviar Fichas" subtitle="Materiais de estudo" context="Portal Docente" darkSidebar>
      <div className="space-y-5">
        <ActionNotice status={searchParams?.status} />
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          <BentoCard className="xl:col-span-4">
            <h3 className="mb-6 text-lg font-black text-slate-900">Nova Ficha</h3>
            <form action={createStudyMaterialAction} className="space-y-4">
              <FormField name="title" label="Nome da Ficha" placeholder="Ex: Unit 05 - Formal Email" required />
              <SelectField name="courseId" label="Curso" required options={courseOptions} />
              <FormField name="unit" label="Unidade" placeholder="Ex: Unit 05" />
              <FormField name="description" label="Descricao" placeholder="Detalhes adicionais" />
              <PrimaryButton className="w-full" tone="navy" type="submit">Criar Ficha</PrimaryButton>
            </form>
          </BentoCard>

          <BentoCard className="p-0 xl:col-span-8">
            <div className="flex items-center justify-between p-6">
              <h3 className="font-black text-slate-900">Fichas Disponiveis</h3>
              <StatusBadge tone="navy">{`${materials.length} Total`}</StatusBadge>
            </div>
            <DataTable
              emptyMessage="Ainda não existem fichas."
              headers={["Ficha", "Curso", "Ações"]}
              rows={materials.map((m) => [
                <div key={m.id} className="grid gap-2">
                  <p className="font-bold text-slate-800">{m.title}</p>
                  {m.unit && <p className="text-xs text-slate-500">{m.unit}</p>}
                  {m.description && <p className="text-xs text-slate-400">{m.description}</p>}
                </div>,
                m.course.title,
                <form key={m.id} action={deleteStudyMaterialAction} className="flex justify-end">
                  <input type="hidden" name="id" value={m.id} />
                  <PrimaryButton tone="light" className="px-3 min-h-10 py-2 text-[10px]" type="submit">Remover</PrimaryButton>
                </form>
              ])}
            />
          </BentoCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
