import { DashboardLayout } from "@/components/layout";
import { ActionNotice, BentoCard, PrimaryButton, SelectField, StatusBadge } from "@/components/ui";
import { generateTeacherReportAction } from "@/features/teacher/actions";
import { teacherNav } from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/i18n/locale";

export const dynamic = "force-dynamic";

type ReportsPageProps = {
  searchParams?: { status?: string };
};

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const dict = await getDictionary();
  const [studentsCount, classCount, materialCount, gradeCount] = await Promise.all([
    prisma.studentProfile.count(),
    prisma.classGroup.count(),
    prisma.studyMaterial.count(),
    prisma.grade.count()
  ]);

  return (
    <DashboardLayout navItems={teacherNav} title={dict.navReports} subtitle={dict.reportsSubtitle} context="Teacher Portal" darkSidebar>
      <div className="space-y-5">
        <ActionNotice status={searchParams?.status} />
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          <BentoCard className="xl:col-span-4">
            <h3 className="mb-6 text-lg font-black text-slate-900">{dict.generateReportTitle}</h3>
            <form action={generateTeacherReportAction} className="space-y-4">
              <SelectField name="reportType" label={dict.reportTypeLabel} options={[
                { label: dict.optionAttendance, value: "attendance" },
                { label: dict.optionGrades, value: "grades" },
                { label: dict.optionMaterialUsage, value: "material_usage" }
              ]} />
              <PrimaryButton className="w-full" tone="navy" type="submit">{dict.generateReportTitle}</PrimaryButton>
            </form>
          </BentoCard>

          <BentoCard className="p-0 xl:col-span-8">
            <div className="flex items-center justify-between p-6">
              <h3 className="font-black text-slate-900">{dict.classSummaryTitle}</h3>
              <StatusBadge tone="navy">{dict.currentWeekBadge}</StatusBadge>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-black text-navy">{studentsCount}</p>
                  <p className="text-xs text-slate-500">{dict.totalStudentsLabel}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-navy">{classCount}</p>
                  <p className="text-xs text-slate-500">{dict.activeClassesLabel}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-navy">{materialCount}</p>
                  <p className="text-xs text-slate-500">{dict.availableWorksheetsLabel}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-navy">{gradeCount}</p>
                  <p className="text-xs text-slate-500">{dict.gradesPostedLabel}</p>
                </div>
              </div>
            </div>
          </BentoCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
