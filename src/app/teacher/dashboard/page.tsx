import type { ReactNode } from "react";
import { FileUp, Mic, Save, Users } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BentoCard } from "@/components/ui/BentoCard";
import { DataTable } from "@/components/ui/DataTable";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ActionNotice } from "@/components/ui/ActionNotice";
import { getCurrentSession } from "@/features/auth/current-user";
import { saveAttendanceAction, saveGradeAction, saveAllGradesAction, saveAllAttendanceAction } from "@/features/teacher/actions";
import { teacherNav } from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type TeacherDashboardPageProps = {
  searchParams?: { status?: string };
};

export default async function TeacherDashboardPage({ searchParams }: TeacherDashboardPageProps) {
  const session = await getCurrentSession();
  const teacher = session
    ? await prisma.teacherProfile.findFirst({
        where: { userId: session.userId },
        include: {
          classGroups: {
            include: {
              enrollments: { include: { student: { include: { user: true, grades: true, attendances: true } } } }
            }
          }
        }
      })
    : null;
  const currentClass = teacher?.classGroups[0];
  const today = new Date().toISOString().slice(0, 10);
  const roster =
    currentClass?.enrollments.map((enrollment) => {
      const grades = enrollment.student.grades.filter((grade) => grade.classGroupId === currentClass.id);
      const average = grades.length ? grades.reduce((sum, grade) => sum + grade.score, 0) / grades.length : 0;
      const absences = enrollment.student.attendances.filter((attendance) => attendance.classGroupId === currentClass.id && attendance.status === "ABSENT").length;
      return {
        id: enrollment.student.id,
        classGroupId: currentClass.id,
        name: enrollment.student.user.name,
        average: average ? average.toFixed(1) : "-",
        absences: String(absences).padStart(2, "0")
      };
    }) ?? [];

  return (
    <DashboardLayout
      navItems={teacherNav}
      title={`Ola, ${session?.name.split(" ")[0] ?? "Docente"}`}
      subtitle="Bem-vindo a sua area de trabalho."
      context="Portal Docente"
      headerAction={<PrimaryButton form="grades-form" className="hidden sm:inline-flex" tone="rose" type="submit"><Save size={15} /> Salvar</PrimaryButton>}
      sidebarFooter={<NextClass />}
    >
      <div className="space-y-6">
        <ActionNotice status={searchParams?.status} />
        <form id="grades-form" action={saveAllGradesAction}>
          <input type="hidden" name="classGroupId" value={currentClass?.id} />
          <BentoCard className="overflow-hidden p-0">
            <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/60 p-6 sm:flex-row sm:items-center sm:justify-between lg:p-8">
              <div>
                <h3 className="text-xl font-black text-slate-800">Lancamento de Notas</h3>
                <div className="mt-2 flex items-center gap-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Turma: {currentClass?.name ?? "Sem turma atribuida"}
                  </p>
                  <input name="title" className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-black uppercase outline-none focus:border-crimson" placeholder="Título da Avaliação" defaultValue="Teste de Unidade" required />
                </div>
              </div>
              <PrimaryButton tone="rose" type="submit">
                <Save size={15} /> Salvar Tudo
              </PrimaryButton>
            </div>
            <DataTable
              headers={["Estudante", "Media Atual", "Faltas", "Nota (0-20)"]}
              rows={roster.map((student) => [
                <div key={student.name} className="flex items-center gap-3">
                  <input type="hidden" name="studentId" value={student.id} />
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[10px] font-black text-navy">
                    {student.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                  {student.name}
                </div>,
                student.average,
                <span key={`${student.name}-absences`} className="text-crimson">{student.absences}</span>,
                <div key={`${student.name}-grade`} className="flex justify-end">
                   <input name="score" className="w-20 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center font-black outline-none focus:border-crimson focus:ring-4 focus:ring-rose-100" placeholder="00" type="number" min={0} max={20} step="0.1" />
                </div>
              ])}
            />
          </BentoCard>
        </form>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <BentoCard dark>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black">Chamada Rapida</h3>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Sala 04 · Aula em curso</p>
              </div>
              <Users className="text-rose-400" />
            </div>
            <div className="space-y-3">
              {roster.length ? (
                <form action={saveAllAttendanceAction} className="space-y-3">
                  <input type="hidden" name="classGroupId" value={currentClass?.id} />
                  <div className="flex items-center justify-between p-2 mb-4">
                     <p className="text-[10px] font-black uppercase text-slate-400">Data da Aula</p>
                     <input name="lessonDate" className="w-36 rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-xs font-bold text-white outline-none focus:border-rose-500" type="date" defaultValue={today} required />
                  </div>
                  
                  {roster.map((student) => (
                    <div key={student.id} className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                      <input type="hidden" name="studentId" value={student.id} />
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-bold">{student.name}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {["PRESENT", "ABSENT", "LATE", "EXCUSED"].map((status) => (
                          <label key={status} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-[10px] font-black uppercase text-slate-200 cursor-pointer hover:bg-slate-700 transition-all">
                            <input name={`status_${student.id}`} type="radio" value={status} defaultChecked={status === "PRESENT"} />
                            {status}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  <PrimaryButton tone="rose" className="w-full mt-4" type="submit">Guardar Chamada</PrimaryButton>
                </form>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-bold text-slate-300">Sem alunos atribuídos.</div>
              )}
            </div>
          </BentoCard>

          <BentoCard>
            <div className="mb-7 flex items-center justify-between">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-800">Atividades</h3>
              <StatusBadge tone="danger">Hoje</StatusBadge>
            </div>
            <div className="grid gap-3">
              <Activity icon={<Mic size={18} />} title="Debate academico" detail="Impacto da IA na Educacao · 19:30" />
              <Activity icon={<FileUp size={18} />} title="Envio de fichas" detail="Unit 05 · Formal Email Patterns" />
              <Activity icon={<Users size={18} />} title="Minhas turmas" detail="3 turmas ativas esta semana" />
            </div>
          </BentoCard>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Activity({ icon, title, detail }: { icon: ReactNode; title: string; detail: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-crimson shadow-sm">{icon}</div>
      <div>
        <p className="text-sm font-black text-slate-800">{title}</p>
        <p className="text-xs font-bold text-slate-400">{detail}</p>
      </div>
    </div>
  );
}

function NextClass() {
  return (
    <div className="rounded-[1.5rem] bg-slate-900 p-4 text-white">
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Proxima Aula</p>
      <p className="mt-2 text-xs font-bold">Ingles Avancado - B2</p>
      <p className="mt-1 text-[10px] font-bold text-rose-400">Em 15 minutos</p>
    </div>
  );
}
