import { DashboardLayout } from "@/components/layout";
import { ActionNotice, BentoCard, FormField, PrimaryButton, SelectField, StatusBadge } from "@/components/ui";
import { getCurrentSession } from "@/features/auth/current-user";
import { saveAllAttendanceAction } from "@/features/teacher/actions";
import { Role } from "@/generated/prisma";
import { teacherNav } from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";
import { AttendanceStatus } from "@/generated/prisma";
import { getDictionary } from "@/i18n/locale";

export const dynamic = "force-dynamic";

type AttendancePageProps = {
  searchParams?: { status?: string; classGroupId?: string };
};

export default async function AttendancePage({ searchParams }: AttendancePageProps) {
  const session = await getCurrentSession();
  const dict = await getDictionary();
  const isTeacher = session?.role === Role.TEACHER;
  const today = new Date().toISOString().split("T")[0];

  const [allClassGroups, allEnrollments] = await Promise.all([
    prisma.classGroup.findMany({
      where: isTeacher ? { teacher: { userId: session.userId } } : undefined,
      include: { course: true, enrollments: true },
      orderBy: { name: "asc" }
    }),
    prisma.enrollment.findMany({
      include: { 
        student: { include: { user: true, attendances: true } },
        classGroup: true
      },
      orderBy: { student: { user: { name: "asc" } } }
    })
  ]);

  const selectedClassId = searchParams?.classGroupId || allClassGroups[0]?.id;
  const classGroupOptions = [
    ...allClassGroups.map((cg) => ({
      label: `${cg.name} · ${cg.course.title}`,
      value: cg.id
    }))
  ];

  const filteredEnrollments = selectedClassId
    ? allEnrollments.filter((e) => e.classGroupId === selectedClassId)
    : [];

  const selectedClass = allClassGroups.find((cg) => cg.id === selectedClassId);

  return (
    <DashboardLayout navItems={teacherNav} title={dict.attendanceTitle} subtitle={dict.attendanceSubtitle} context="Teacher Portal" darkSidebar>
      <div className="space-y-5">
        <ActionNotice status={searchParams?.status} />
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          
          {/* Selection Panel */}
          <BentoCard className="xl:col-span-4">
            <h3 className="mb-6 text-lg font-black text-slate-900">{dict.quickAttendanceTitle}</h3>
            <form action="/teacher/attendance" className="space-y-4" method="get">
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

          {/* Attendance Form Panel */}
          <BentoCard className="p-0 xl:col-span-8">
            <div className="flex items-center justify-between p-6">
              <h3 className="font-black text-slate-900">
                {selectedClassId ? dict.attendanceLogTitle : dict.selectClassPlaceholder}
              </h3>
              <StatusBadge tone="navy">
                {selectedClassId ? dict.studentCountDetail.replace("{count}", String(filteredEnrollments.length)) : dict.studentCountDetail.replace("{count}", "0")}
              </StatusBadge>
            </div>

            {selectedClassId && filteredEnrollments.length > 0 ? (
              <form action={saveAllAttendanceAction} className="p-6 space-y-4">
                <input type="hidden" name="classGroupId" value={selectedClassId} />
                <FormField 
                  name="lessonDate" 
                  label={dict.lessonDateLabel} 
                  type="date" 
                  defaultValue={today}
                  required 
                />
                
                <div className="space-y-3">
                  {filteredEnrollments.map((enrollment) => {
                    const studentAttendances = enrollment.student.attendances.filter(
                      (a) => a.classGroupId === selectedClassId
                    );
                    const presentCount = studentAttendances.filter(
                      (a) => a.status === "PRESENT"
                    ).length;
                    const absentCount = studentAttendances.filter(
                      (a) => a.status === "ABSENT"
                    ).length;

                    return (
                      <div key={enrollment.student.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                        <input type="hidden" name="studentId" value={enrollment.student.id} />
                        <div>
                          <span className="font-medium text-slate-800">
                            {enrollment.student.user.name}
                          </span>
                          <div className="flex gap-2 text-xs text-slate-500">
                            <span>P: {presentCount}</span>
                            <span>F: {absentCount}</span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {(["PRESENT", "ABSENT", "LATE", "EXCUSED"] as AttendanceStatus[]).map((status) => (
                            <label key={status} className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-bold cursor-pointer hover:bg-slate-50">
                              <input 
                                type="radio" 
                                name={`status_${enrollment.student.id}`} 
                                value={status}
                                defaultChecked={status === "PRESENT"}
                              />
                              {status === "PRESENT" ? "P" : status === "ABSENT" ? "F" : status === "LATE" ? "T" : "J"}
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <PrimaryButton tone="rose" type="submit" className="w-full">
                  {dict.saveAttendanceButton}
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
