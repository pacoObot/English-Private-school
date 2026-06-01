import type { ReactNode } from "react";
import Link from "next/link";
import { BookOpenCheck, CalendarCheck, ClipboardList, FileUp, Mic, Save, Users } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BentoCard } from "@/components/ui/BentoCard";
import { DataTable } from "@/components/ui/DataTable";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ActionNotice } from "@/components/ui/ActionNotice";
import { getCurrentSession } from "@/features/auth/current-user";
import { saveAllGradesAction } from "@/features/teacher/actions";
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
            orderBy: { name: "asc" },
            include: {
              enrollments: { include: { student: { include: { user: true, grades: true, attendances: true } } } }
            }
          }
        }
      })
    : null;

  const currentClass = teacher?.classGroups[0];
  
  const activeDebate = await prisma.debateSession.findFirst({
    where: {
      status: { in: ["ACTIVE", "SCHEDULED"] },
      moderatorId: session?.userId
    },
    include: {
      participants: { include: { student: { include: { user: true } } } },
      evaluations: true
    },
    orderBy: [{ status: "asc" }, { startsAt: "asc" }]
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

  const classCount = teacher?.classGroups.length ?? 0;
  const studentCount = currentClass?.enrollments.length ?? 0;
  const pendingDebateEvaluations = activeDebate
    ? activeDebate.participants.length - activeDebate.evaluations.length
    : 0;

  return (
    <DashboardLayout
      navItems={teacherNav}
      title={`Olá, ${session?.name.split(" ")[0] ?? "Docente"}`}
      subtitle="Turmas, avaliação, presença, materiais e feedback."
      context="Portal Docente"
      sidebarFooter={<NextClass className={currentClass?.name} schedule={currentClass?.schedule} />}
    >
      <div className="space-y-6">
        <ActionNotice status={searchParams?.status} />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <QuickAction href={currentClass ? `/teacher/attendance?classGroupId=${currentClass.id}` : "/teacher/attendance"} icon={<CalendarCheck size={18} />} title="Chamada" detail={currentClass?.name ?? "Selecionar turma"} tone="rose" />
          <QuickAction href={currentClass ? `/teacher/grades?classGroupId=${currentClass.id}` : "/teacher/grades"} icon={<ClipboardList size={18} />} title="Notas" detail={`${studentCount} alunos`} tone="navy" />
          <QuickAction href="/teacher/materials" icon={<FileUp size={18} />} title="Fichas" detail="Enviar material" tone="dark" />
          <QuickAction href={activeDebate ? `/debate/${activeDebate.id}` : "/debate"} icon={<Mic size={18} />} title="Debate" detail={activeDebate ? `${Math.max(pendingDebateEvaluations, 0)} por avaliar` : "Sem sessão"} tone="light" />
        </div>
        
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
                  <PrimaryButton tone="rose" type="submit" disabled={!currentClass || roster.length === 0}>
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
                      <span key={`${student.name}-avg`} className="text-xs font-black text-slate-400 uppercase">{student.average}/20</span>,
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
              students={activeDebate?.participants.map((participant) => ({ id: participant.student.id, name: participant.student.user.name })) ?? []} 
              sessionId={activeDebate?.id} 
            />
          </div>
        </div>

        {/* Quick Actions Footer */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <BentoCard>
            <div className="mb-7 flex items-center justify-between">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-800">Resumo da Turma</h3>
              <StatusBadge tone="navy">{classCount} turmas</StatusBadge>
            </div>
            <div className="grid gap-3">
              <Activity icon={<Users size={18} />} title="Turma em foco" detail={currentClass?.name ?? "Nenhuma turma atribuída"} />
              <Activity icon={<BookOpenCheck size={18} />} title="Curso" detail={currentClass?.courseId ? "Material e avaliação alinhados à turma" : "Aguardando atribuição"} />
              <Activity icon={<Mic size={18} />} title="Debate designado" detail={activeDebate?.topic ?? "Nenhum debate agendado"} />
            </div>
          </BentoCard>
          
          <BentoCard className="lg:col-span-2 bg-slate-900 text-white" dark>
             <div className="flex flex-col h-full justify-between">
                <div>
                   <h3 className="text-xl font-black">Fluxo rápido do professor</h3>
                   <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Escolha a ação, conclua e volte ao painel</p>
                </div>
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                   <Link href={currentClass ? `/teacher/attendance?classGroupId=${currentClass.id}` : "/teacher/attendance"}><PrimaryButton tone="light" className="w-full">Presença</PrimaryButton></Link>
                   <Link href={currentClass ? `/teacher/grades?classGroupId=${currentClass.id}` : "/teacher/grades"}><PrimaryButton tone="light" className="w-full">Notas</PrimaryButton></Link>
                   <Link href="/teacher/materials"><PrimaryButton tone="light" className="w-full">Fichas</PrimaryButton></Link>
                </div>
             </div>
          </BentoCard>
        </div>
      </div>
    </DashboardLayout>
  );
}

function QuickAction({ href, icon, title, detail, tone }: { href: string; icon: ReactNode; title: string; detail: string; tone: "rose" | "navy" | "dark" | "light" }) {
  const color = {
    rose: "border-rose-100 bg-rose-50 text-crimson",
    navy: "border-blue-100 bg-blue-50 text-navy",
    dark: "border-slate-200 bg-slate-900 text-white",
    light: "border-slate-200 bg-white text-slate-700"
  }[tone];

  return (
    <Link href={href} className={`flex min-h-24 items-center gap-4 rounded-3xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md ${color}`}>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/80 text-current shadow-sm">{icon}</div>
      <div className="min-w-0">
        <p className="text-sm font-black">{title}</p>
        <p className="truncate text-[11px] font-bold opacity-70">{detail}</p>
      </div>
    </Link>
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

function NextClass({ className, schedule }: { className?: string; schedule?: string }) {
  return (
    <div className="rounded-[1.5rem] bg-slate-900 p-4 text-white">
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Turma em foco</p>
      <p className="mt-2 text-xs font-bold">{className ?? "Nenhuma turma atribuída"}</p>
      <p className="mt-1 text-[10px] font-bold text-rose-400">{schedule ?? "Aguardando horário"}</p>
    </div>
  );
}
