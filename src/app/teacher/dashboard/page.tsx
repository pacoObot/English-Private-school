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
import { DebateArena } from "@/components/ui/DebateArena";
import { teacherNav } from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";

type TeacherDashboardPageProps = {
  searchParams?: { status?: string };
};

export const dynamic = "force-dynamic";

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
  
  // Get all students for the Arena simulation (requested test names)
  const allStudents = await prisma.studentProfile.findMany({
    include: { user: true }
  });

  const activeDebate = await prisma.debateSession.findFirst({
    where: { status: "SCHEDULED" },
    orderBy: { startsAt: "asc" }
  });

  const roster = currentClass?.enrollments.map((enrollment) => {
    const grades = enrollment.student.grades.filter((grade) => grade.classGroupId === currentClass.id);
    const average = grades.length ? grades.reduce((sum, grade) => sum + grade.score, 0) / grades.length : 0;
    const absences = enrollment.student.attendances.filter((attendance) => attendance.classGroupId === currentClass.id && attendance.status === "ABSENT").length;
    return {
      id: enrollment.student.id,
      name: enrollment.student.user.name,
      average: average ? average.toFixed(1) : "-",
      absences: String(absences).padStart(2, "0")
    };
  }) ?? [];

  return (
    <DashboardLayout
      navItems={teacherNav}
      title={`Olá, ${session?.name.split(" ")[0] ?? "Docente"}`}
      subtitle="Foco em Avaliação e Arena de Debates."
      context="Portal Docente"
      sidebarFooter={<NextClass />}
    >
      <div className="space-y-6">
        <ActionNotice status={searchParams?.status} />
        
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Main Evaluation Card */}
          <div className="lg:col-span-7">
            <form id="grades-form" action={saveAllGradesAction}>
              <input type="hidden" name="classGroupId" value={currentClass?.id} />
              <BentoCard className="overflow-hidden p-0 h-full border-slate-200">
                <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/60 p-6 sm:flex-row sm:items-center sm:justify-between lg:p-8">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Lançamento de Notas</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                      Turma: {currentClass?.name ?? "Sem turma"}
                    </p>
                  </div>
                  <PrimaryButton tone="rose" type="submit">
                    <Save size={15} /> Salvar Notas
                  </PrimaryButton>
                </div>
                
                <div className="p-2">
                  <DataTable
                    headers={["Estudante", "Média", "Nota (0-20)"]}
                    rows={roster.map((student) => [
                      <div key={student.name} className="flex items-center gap-3">
                        <input type="hidden" name="studentId" value={student.id} />
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[10px] font-black text-navy uppercase">
                          {student.name.slice(0, 2)}
                        </span>
                        <span className="font-bold text-slate-700">{student.name}</span>
                      </div>,
                      <span key={`${student.name}-avg`} className="text-xs font-black text-slate-400 uppercase">{student.average} MT</span>,
                      <div key={`${student.name}-grade`} className="flex justify-end pr-2">
                        <input name="score" className="w-20 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center font-black outline-none focus:border-crimson focus:ring-4 focus:ring-rose-100 transition-all" placeholder="00" type="number" min={0} max={20} step="0.1" />
                      </div>
                    ])}
                  />
                </div>
              </BentoCard>
            </form>
          </div>

          {/* Debate Arena Section */}
          <div className="lg:col-span-5 h-[600px] lg:h-auto">
            <DebateArena 
              students={allStudents.map(s => ({ id: s.id, name: s.user.name }))} 
              sessionId={activeDebate?.id} 
            />
          </div>
        </div>

        {/* Quick Actions Footer */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <BentoCard>
            <div className="mb-7 flex items-center justify-between">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-800">Próximas Atividades</h3>
              <StatusBadge tone="danger">Hoje</StatusBadge>
            </div>
            <div className="grid gap-3">
              <Activity icon={<Mic size={18} />} title="Debate em curso" detail={activeDebate?.topic ?? "Nenhum debate agendado"} />
              <Activity icon={<FileUp size={18} />} title="Envio de fichas" detail="Unit 05 · Formal Email Patterns" />
            </div>
          </BentoCard>
          
          <BentoCard className="lg:col-span-2 bg-gradient-to-br from-navy to-blue-900 text-white" dark>
             <div className="flex flex-col h-full justify-between">
                <div>
                   <h3 className="text-xl font-black">Área de Staff</h3>
                   <p className="text-blue-100/60 text-[10px] font-black uppercase tracking-widest mt-1">Recursos Docentes</p>
                </div>
                <div className="mt-8 flex gap-3">
                   <PrimaryButton tone="light" className="flex-1">Manual do Professor</PrimaryButton>
                   <PrimaryButton tone="light" className="flex-1">Pedir Suporte</PrimaryButton>
                </div>
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
