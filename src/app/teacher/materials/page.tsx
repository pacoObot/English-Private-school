import { DashboardLayout } from "@/components/layout";
import { ActionNotice, BentoCard, DataTable, FormField, PrimaryButton, SelectField, StatusBadge } from "@/components/ui";
import { getCurrentSession } from "@/features/auth/current-user";
import { createStudyMaterialAction, deleteStudyMaterialAction } from "@/features/teacher/actions";
import { Role } from "@/generated/prisma";
import { teacherNav } from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/i18n/locale";

export const dynamic = "force-dynamic";

type MaterialsPageProps = {
  searchParams?: { status?: string };
};

export default async function MaterialsPage({ searchParams }: MaterialsPageProps) {
  const session = await getCurrentSession();
  const dict = await getDictionary();
  const isTeacher = session?.role === Role.TEACHER;

  const teacherProfile = isTeacher
    ? await prisma.teacherProfile.findUnique({
        where: { userId: session.userId },
        include: { classGroups: { select: { courseId: true } } }
      })
    : null;

  const courseIds = teacherProfile?.classGroups.map((classGroup) => classGroup.courseId) ?? [];

  const [courses, materials] = await Promise.all([
    prisma.course.findMany({
      where: { isActive: true, ...(isTeacher ? { id: { in: courseIds } } : {}) },
      orderBy: { title: "asc" }
    }),
    prisma.studyMaterial.findMany({
      where: isTeacher
        ? {
            OR: [
              { teacherId: teacherProfile?.id },
              { courseId: { in: courseIds } }
            ]
          }
        : undefined,
      include: { course: true, teacher: { include: { user: true } } },
      orderBy: { createdAt: "desc" }
    })
  ]);

  const courseOptions = courses.map((c) => ({
    label: `${c.title} · ${c.level}`,
    value: c.id
  }));

  return (
    <DashboardLayout navItems={teacherNav} title={dict.navSendMaterials} subtitle={dict.materialsSendSubtitle} context="Teacher Portal" darkSidebar>
      <div className="space-y-5">
        <ActionNotice status={searchParams?.status} />
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          <BentoCard className="xl:col-span-4">
            <h3 className="mb-6 text-lg font-black text-slate-900">{dict.newMaterialTitle}</h3>
            <form action={createStudyMaterialAction} className="space-y-4" encType="multipart/form-data">
              <FormField name="title" label={dict.materialNameLabel} placeholder={dict.materialNamePlaceholder} required />
              <SelectField name="courseId" label={dict.courseFieldLabel} required options={courseOptions} />
              <FormField name="unit" label={dict.unitFieldLabel} placeholder={dict.unitFieldPlaceholder} />
              <FormField name="description" label={dict.descriptionFieldLabel} placeholder={dict.descriptionFieldPlaceholder} />
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">{dict.fileUploadLabel}</label>
                <input type="file" name="file" accept=".pdf,.doc,.docx" className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-navy/5 file:text-navy hover:file:bg-navy/10 transition-all cursor-pointer" />
              </div>
              <PrimaryButton className="w-full" tone="navy" type="submit">{dict.createMaterialButton}</PrimaryButton>
            </form>
          </BentoCard>

          <BentoCard className="p-0 xl:col-span-8">
            <div className="flex items-center justify-between p-6">
              <h3 className="font-black text-slate-900">{dict.availableMaterialsTitle}</h3>
              <StatusBadge tone="navy">{dict.materialsTotalDetail.replace("{count}", String(materials.length))}</StatusBadge>
            </div>
            <DataTable
              emptyMessage={dict.emptyMaterialsMessage}
              headers={[dict.tableHeaderMaterial, dict.tableHeaderCourse, dict.tableHeaderPublisher, dict.tableHeaderActions]}
              rows={materials.map((m) => [
                <div key={m.id} className="grid gap-2">
                  <p className="font-bold text-slate-800">{m.title}</p>
                  {m.unit && <p className="text-xs text-slate-500">{m.unit}</p>}
                  {m.description && <p className="text-xs text-slate-400">{m.description}</p>}
                  {m.fileUrl && <a href={m.fileUrl} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-navy hover:underline">{dict.downloadFileLink}</a>}
                </div>,
                m.course.title,
                m.teacher?.user.name ?? "Administração",
                <form key={m.id} action={deleteStudyMaterialAction} className="flex justify-end">
                  <input type="hidden" name="id" value={m.id} />
                  <PrimaryButton tone="light" className="px-3 min-h-10 py-2 text-[10px]" type="submit" disabled={isTeacher && m.teacherId !== teacherProfile?.id}>{dict.removeButtonLabel}</PrimaryButton>
                </form>
              ])}
            />
          </BentoCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
