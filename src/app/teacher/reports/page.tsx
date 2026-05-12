import { DashboardLayout } from "@/components/layout";
import { ActionNotice, BentoCard, PrimaryButton, SelectField, StatusBadge } from "@/components/ui";
import { generateTeacherReportAction } from "@/features/teacher/actions";
import { teacherNav } from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type ReportsPageProps = {
  searchParams?: { status?: string };
};

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const [studentsCount, classCount, materialCount, gradeCount] = await Promise.all([
    prisma.studentProfile.count(),
    prisma.classGroup.count(),
    prisma.studyMaterial.count(),
    prisma.grade.count()
  ]);

  return (
    <DashboardLayout navItems={teacherNav} title="Relatorios" subtitle="Metrics e analytics" context="Portal Docente" darkSidebar>
      <div className="space-y-5">
        <ActionNotice status={searchParams?.status} />
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          <BentoCard className="xl:col-span-4">
            <h3 className="mb-6 text-lg font-black text-slate-900">Gerar Relatorio</h3>
            <form action={generateTeacherReportAction} className="space-y-4">
              <SelectField name="reportType" label="Tipo de Relatorio" options={[
                { label: "Frequencia Geral", value: "attendance" },
                { label: "Desempenho por Notas", value: "grades" },
                { label: "Uso de Materiais", value: "material_usage" }
              ]} />
              <PrimaryButton className="w-full" tone="navy" type="submit">Gerar Relatorio</PrimaryButton>
            </form>
          </BentoCard>

          <BentoCard className="p-0 xl:col-span-8">
            <div className="flex items-center justify-between p-6">
              <h3 className="font-black text-slate-900">Resumo da Turma</h3>
              <StatusBadge tone="navy">Semana Atual</StatusBadge>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-black text-navy">{studentsCount}</p>
                  <p className="text-xs text-slate-500">Total Alunos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-navy">{classCount}</p>
                  <p className="text-xs text-slate-500">Turmas Ativas</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-navy">{materialCount}</p>
                  <p className="text-xs text-slate-500">Fichas Disponiveis</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-navy">{gradeCount}</p>
                  <p className="text-xs text-slate-500">Notas Lançadas</p>
                </div>
              </div>
            </div>
          </BentoCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
