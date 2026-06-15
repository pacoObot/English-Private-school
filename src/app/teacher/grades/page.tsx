import { DashboardLayout } from "@/components/layout";
import { ActionNotice, BentoCard, FormField, PrimaryButton, SelectField, StatusBadge } from "@/components/ui";
import { getCurrentSession } from "@/features/auth/current-user";
import { saveAllGradesAction } from "@/features/teacher/actions";
import { Role } from "@/generated/prisma";
import { teacherNav } from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";
import { Mic2, PenTool } from "lucide-react";
import { getDictionary } from "@/i18n/locale";

export const dynamic = "force-dynamic";

type GradesPageProps = {
  searchParams?: { status?: string; classGroupId?: string };
};

export default async function GradesPage({ searchParams }: GradesPageProps) {
  const session = await getCurrentSession();
  const dict = await getDictionary();
  const isTeacher = session?.role === Role.TEACHER;

  const [allClassGroups, allEnrollments] = await Promise.all([
    prisma.classGroup.findMany({
      where: isTeacher ? { teacher: { userId: session.userId } } : undefined,
      include: { course: true, enrollments: true },
      orderBy: { name: "asc" }
    }),
    prisma.enrollment.findMany({
      include: { 
        student: { include: { user: true, grades: true } },
        classGroup: true
      },
      orderBy: { student: { user: { name: "asc" } } }
    })
  ]);

  const selectedClassId = searchParams?.classGroupId || allClassGroups[0]?.id;
  const classGroupOptions = allClassGroups.map((cg) => ({
    label: `${cg.name} · ${cg.course.title}`,
    value: cg.id
  }));

  const filteredEnrollments = selectedClassId
    ? allEnrollments.filter((e) => e.classGroupId === selectedClassId)
    : [];

  const selectedClass = allClassGroups.find((cg) => cg.id === selectedClassId);

  return (
    <DashboardLayout navItems={teacherNav} title={dict.navPostGrades} subtitle={dict.gradesPostSubtitle} context="Teacher Portal" darkSidebar>
      <div className="space-y-5">
        <ActionNotice status={searchParams?.status} />
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          
          {/* Selection Panel */}
          <BentoCard className="xl:col-span-4">
            <h3 className="mb-6 text-lg font-black text-slate-900">{dict.selectClassTitle}</h3>
            <form action="/teacher/grades" className="space-y-4" method="get">
              <SelectField 
                name="classGroupId" 
                label={dict.classFieldLabel} 
                options={classGroupOptions}
                value={selectedClassId || ""}
              />
              <PrimaryButton tone="rose" type="submit" className="w-full">
                {dict.openClassButton}
              </PrimaryButton>
            </form>

            {selectedClassId && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <h4 className="mb-3 text-sm font-bold text-slate-600">{dict.selectedClassTitleLabel}</h4>
                <p className="text-lg font-black text-navy">{selectedClass?.name}</p>
                <p className="text-xs text-slate-500">{selectedClass?.course.title}</p>
              </div>
            )}
          </BentoCard>

          {/* Students & Grades Panel */}
          <BentoCard className="p-0 xl:col-span-8">
            <div className="flex items-center justify-between p-6">
              <h3 className="font-black text-slate-900">
                {selectedClassId ? dict.classStudentsTitle : dict.selectClassPlaceholder}
              </h3>
              <StatusBadge tone="navy">
                {selectedClassId ? dict.studentCountDetail.replace("{count}", String(filteredEnrollments.length)) : dict.studentCountDetail.replace("{count}", "0")}
              </StatusBadge>
            </div>

            {selectedClassId && filteredEnrollments.length > 0 ? (
              <form action={saveAllGradesAction} className="p-6 space-y-4">
                <input type="hidden" name="classGroupId" value={selectedClassId} />
                <FormField 
                  name="title" 
                  label={dict.evaluationTitleLabel} 
                  placeholder={dict.evaluationTitlePlaceholder}
                  required 
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2 border-b border-slate-100 mb-2">
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-200 hover:border-rose transition bg-white/50 select-none">
                    <input 
                      type="checkbox" 
                      name="isSpeaking" 
                      value="true"
                      className="w-4 h-4 rounded text-crimson focus:ring-crimson cursor-pointer border-slate-300"
                    />
                    <div>
                      <span className="font-black text-sm text-navy flex items-center gap-1.5">
                        <Mic2 size={16} className="text-rose-600 shrink-0" />
                        {dict.oralCompetencyLabel}
                      </span>
                      <span className="block text-xs text-slate-500 mt-0.5">{dict.oralCompetencyDetail}</span>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-200 hover:border-rose transition bg-white/50 select-none">
                    <input 
                      type="checkbox" 
                      name="isWriting" 
                      value="true"
                      className="w-4 h-4 rounded text-crimson focus:ring-crimson cursor-pointer border-slate-300"
                    />
                    <div>
                      <span className="font-black text-sm text-navy flex items-center gap-1.5">
                        <PenTool size={16} className="text-navy shrink-0" />
                        {dict.writtenCompetencyLabel}
                      </span>
                      <span className="block text-xs text-slate-500 mt-0.5">{dict.writtenCompetencyDetail}</span>
                    </div>
                  </label>
                </div>

                <div className="space-y-3">
                  {filteredEnrollments.map((enrollment) => {
                    const studentGrades = enrollment.student.grades.filter(
                      (g) => g.classGroupId === selectedClassId
                    );
                    const average = studentGrades.length > 0
                      ? (studentGrades.reduce((sum, g) => sum + g.score, 0) / studentGrades.length).toFixed(1)
                      : "-";

                    return (
                      <div key={enrollment.student.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                        <div className="flex items-center gap-3">
                          <input type="hidden" name="studentId" value={enrollment.student.id} />
                          <span className="font-medium text-slate-800">
                            {enrollment.student.user.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-slate-500">
                            {dict.averageLabel} {average}
                          </span>
                          <input 
                            name="score" 
                            type="number"
                            min="0"
                            max="20"
                            step="0.1"
                            placeholder="0-20"
                            className="w-24 rounded-xl border border-slate-200 px-3 py-2 text-center font-black outline-none focus:border-crimson"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <PrimaryButton tone="rose" type="submit" className="w-full">
                  {dict.saveGradesButton}
                </PrimaryButton>
              </form>
            ) : selectedClassId ? (
              <div className="p-6 text-center text-slate-500">
                {dict.noStudentsFound}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-500">
                {dict.selectClassPrompt}
              </div>
            )}
          </BentoCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
