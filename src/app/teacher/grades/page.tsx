import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { DashboardLayout } from "@/components/layout";
import { ActionNotice, BentoCard, FormField, PrimaryButton, SelectField, StatusBadge } from "@/components/ui";
import { createStudyMaterialAction, deleteStudyMaterialAction, generateTeacherReportAction, saveAllGradesAction } from "@/features/teacher/actions";
import { teacherNav } from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type GradesPageProps = {
  searchParams?: { status?: string; classGroupId?: string };
};

export default async function GradesPage({ searchParams }: GradesPageProps) {
  const selectedClassId = searchParams?.classGroupId;

  const [allClassGroups, allEnrollments] = await Promise.all([
    prisma.classGroup.findMany({
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

  const classGroupOptions = allClassGroups.map((cg) => ({
    label: `${cg.name} · ${cg.course.title}`,
    value: cg.id
  }));

  const filteredEnrollments = selectedClassId
    ? allEnrollments.filter((e) => e.classGroupId === selectedClassId)
    : [];

  const selectedClass = allClassGroups.find((cg) => cg.id === selectedClassId);

  return (
    <DashboardLayout navItems={teacherNav} title="Lancar Notas" subtitle="Avaliacao de estudantes" context="Portal Docente" darkSidebar>
      <div className="space-y-5">
        <ActionNotice status={searchParams?.status} />
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          
          {/* Selection Panel */}
          <BentoCard className="xl:col-span-4">
            <h3 className="mb-6 text-lg font-black text-slate-900">Selecionar Turma</h3>
            <form className="space-y-4">
              <SelectField 
                name="classGroupId" 
                label="Turma" 
                options={classGroupOptions}
                value={selectedClassId || ""}
              />
              <a href={`/teacher/grades${selectedClassId ? `?classGroupId=${selectedClassId}` : ""}`}>
                <PrimaryButton tone="rose" type="button" className="w-full">
                  {selectedClassId ? "Mudar Turma" : "Selecionar"}
                </PrimaryButton>
              </a>
            </form>

            {selectedClassId && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <h4 className="mb-3 text-sm font-bold text-slate-600">Turma Selecionada</h4>
                <p className="text-lg font-black text-navy">{selectedClass?.name}</p>
                <p className="text-xs text-slate-500">{selectedClass?.course.title}</p>
              </div>
            )}
          </BentoCard>

          {/* Students & Grades Panel */}
          <BentoCard className="p-0 xl:col-span-8">
            <div className="flex items-center justify-between p-6">
              <h3 className="font-black text-slate-900">
                {selectedClassId ? "Estudantes da Turma" : "Selecione uma turma"}
              </h3>
              <StatusBadge tone="navy">
                {selectedClassId ? `${filteredEnrollments.length} alunos` : "0 alunos"}
              </StatusBadge>
            </div>

            {selectedClassId && filteredEnrollments.length > 0 ? (
              <form action={saveAllGradesAction} className="p-6 space-y-4">
                <input type="hidden" name="classGroupId" value={selectedClassId} />
                <FormField 
                  name="title" 
                  label="Título da Avaliação" 
                  placeholder="Ex: Teste Unit 5"
                  required 
                />
                
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
                            Média: {average}
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
                  Guardar Notas
                </PrimaryButton>
              </form>
            ) : selectedClassId ? (
              <div className="p-6 text-center text-slate-500">
                Nenhum estudante encontrado nesta turma.
              </div>
            ) : (
              <div className="p-6 text-center text-slate-500">
                Selecione uma turma no painel ao lado.
              </div>
            )}
          </BentoCard>
        </div>
      </div>
    </DashboardLayout>
  );
}