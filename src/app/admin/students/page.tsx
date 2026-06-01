import { UserPlus, GraduationCap, CheckCircle, Users, AlertTriangle, TrendingUp, KeyRound, ArrowRight, Hash, Phone } from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { ActionNotice, BentoCard, DataTable, FormField, PrimaryButton, SelectField, StatusBadge } from "@/components/ui";
import { createEnrollmentAction, createStudentAction, setDebateModerationPermissionAction, setStudentActiveAction } from "@/features/admin/actions";
import { adminNavigation } from "@/features/admin/nav";
import { EnrollmentStatus } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { generateStudentCode } from "@/lib/id-generators";

export const dynamic = "force-dynamic";

const STUDENT_LEVELS = [
  { label: "1º Nível", value: "1 Nível" },
  { label: "2º Nível", value: "2 Nível" },
  { label: "3º Nível", value: "3 Nível" },
  { label: "4º Nível", value: "4 Nível" },
  { label: "5º Nível", value: "5 Nível" },
];

const DEFAULT_PASSWORD = "Delson@2026";

type StudentsPageProps = {
  searchParams?: {
    status?: string;
    tab?: string;
    newCode?: string;
    newName?: string;
    studentId?: string;
    importStatus?: string;
    errorCount?: string;
    missing?: string;
    invalid?: string;
    duplicate?: string;
  };
};

export default async function StudentsPage({ searchParams }: StudentsPageProps) {
  const [students, courses, classes, talentStats, nextStudentCode] = await Promise.all([
    prisma.studentProfile.findMany({
      include: {
        user: true,
        enrollments: { include: { classGroup: true, course: true } },
        debateEvaluations: { select: { fluency: true, argumentation: true, posture: true } },
        grades: true
      },
      orderBy: { user: { name: "asc" } },
    }),
    prisma.course.findMany({ where: { isActive: true }, orderBy: { title: "asc" } }),
    prisma.classGroup.findMany({ include: { course: true }, orderBy: { name: "asc" } }),
    prisma.debateEvaluation.groupBy({
      by: ['studentId'],
      _avg: { fluency: true, argumentation: true, posture: true },
      _count: { studentId: true }
    }),
    generateStudentCode(), // pré-visualização do próximo código
  ]);

  const activeTab = searchParams?.tab || "registar";
  const newCode = searchParams?.newCode;
  const newName = searchParams?.newName;
  const justCreated = searchParams?.status === "created" && newCode;

  const studentTalents = students.map(s => {
    const stats = talentStats.find(ts => ts.studentId === s.id);
    const avgFluency = stats?._avg.fluency || 0;
    const avgArgumentation = stats?._avg.argumentation || 0;
    const avgPosture = stats?._avg.posture || 0;
    const debateAvg = (avgFluency + avgArgumentation + avgPosture) / 3;

    // Speaking percentage calculation
    let speakingPercentage = 0;
    if (s.debateEvaluations.length > 0) {
      speakingPercentage = debateAvg * 10;
    } else {
      const speakingGrades = s.grades.filter(g => 
        /speaking|oral|speech|apresenta|debate|conversac/i.test(g.title)
      );
      if (speakingGrades.length > 0) {
        speakingPercentage = (speakingGrades.reduce((sum, g) => sum + (g.score / g.maxScore), 0) / speakingGrades.length) * 100;
      }
    }

    // Writing percentage calculation
    const writingGrades = s.grades.filter(g => 
      /writing|write|redaç|redac|composition|essay|escrit|gramat|grammar|dictation|ditado/i.test(g.title)
    );
    let writingPercentage = 0;
    if (writingGrades.length > 0) {
      writingPercentage = (writingGrades.reduce((sum, g) => sum + (g.score / g.maxScore), 0) / writingGrades.length) * 100;
    } else if (s.grades.length > 0) {
      const academicGrades = s.grades.filter(g => 
        !/speaking|oral|speech|apresenta|debate|conversac/i.test(g.title)
      );
      const gradesToUse = academicGrades.length > 0 ? academicGrades : s.grades;
      writingPercentage = (gradesToUse.reduce((sum, g) => sum + (g.score / g.maxScore), 0) / gradesToUse.length) * 100;
    }

    const overallSkill = (speakingPercentage + writingPercentage) / 2;

    return {
      ...s,
      stats: {
        fluency: avgFluency,
        argumentation: avgArgumentation,
        posture: avgPosture,
        debateAvg: debateAvg,
        speaking: speakingPercentage,
        writing: writingPercentage,
        overall: overallSkill,
        debateCount: stats?._count.studentId || 0
      }
    };
  }).sort((a, b) => b.stats.overall - a.stats.overall);

  const unenrolledStudents = students.filter((s) => s.enrollments.length === 0 && s.user.isActive);
  const enrolledStudents = students.filter((s) => s.enrollments.length > 0 && s.user.isActive);

  return (
    <DashboardLayout
      navItems={adminNavigation("/admin/students")}
      title="Gestão de Alunos"
      subtitle="Registo e matrículas"
      context="Admin"
      darkSidebar
    >
      <div className="space-y-5">
        <ActionNotice 
          status={searchParams?.status} 
          newCode={searchParams?.newCode}
          newName={searchParams?.newName}
          studentId={searchParams?.studentId}
          importStatus={searchParams?.importStatus}
          errorCount={searchParams?.errorCount ? parseInt(searchParams.errorCount, 10) : undefined}
          missing={searchParams?.missing}
          invalid={searchParams?.invalid}
          duplicate={searchParams?.duplicate}
        />

        {/* ══ Abas ══ */}
        <div className="flex flex-wrap gap-2">
          <a
            href="/admin/students?tab=registar"
            className={`flex items-center gap-2 rounded-full px-6 py-3 text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === "registar"
                ? "bg-navy text-white shadow-lg shadow-navy/20"
                : "bg-white text-slate-500 border border-slate-200 hover:border-navy hover:text-navy"
            }`}
          >
            <UserPlus size={14} /> Registar Aluno
          </a>
          <a
            href="/admin/students?tab=matricular"
            className={`flex items-center gap-2 rounded-full px-6 py-3 text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === "matricular"
                ? "bg-navy text-white shadow-lg shadow-navy/20"
                : "bg-white text-slate-500 border border-slate-200 hover:border-navy hover:text-navy"
            }`}
          >
            <GraduationCap size={14} /> Matricular Aluno
            {unenrolledStudents.length > 0 ? (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-crimson text-[9px] font-black text-white">
                {unenrolledStudents.length}
              </span>
            ) : null}
          </a>
          <a
            href="/admin/students?tab=talentos"
            className={`flex items-center gap-2 rounded-full px-6 py-3 text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === "talentos"
                ? "bg-navy text-white shadow-lg shadow-navy/20"
                : "bg-white text-slate-500 border border-slate-200 hover:border-navy hover:text-navy"
            }`}
          >
            <TrendingUp size={14} /> Radar de Talentos
          </a>
        </div>

        {/* ══ Aba: Registar Novo Aluno ══ */}
        {activeTab === "registar" ? (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            <BentoCard className="lg:col-span-5">
              <div className="mb-6">
                <h3 className="text-lg font-black text-slate-900">Novo Aluno</h3>
                <p className="mt-1 text-xs text-slate-400 font-semibold">
                  O código de estudante e a senha são gerados automaticamente.
                </p>
              </div>

              {/* Pré-visualização do próximo código */}
              <div className="mb-5 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 py-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Próximo código a ser gerado</p>
                <div className="flex items-center gap-3">
                  <p className="text-xl font-black text-navy tracking-widest">{nextStudentCode}</p>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-emerald-700">Auto</span>
                </div>
                <p className="mt-1 text-[10px] text-slate-400 font-semibold">Este será o código de login do próximo aluno registado.</p>
              </div>

              <form action={createStudentAction} className="space-y-5">
                <div className="space-y-4">
                  <FormField name="name" label="Nome Completo" placeholder="Ex: Celso Manuel" required />
                  <SelectField name="level" label="Nível" options={STUDENT_LEVELS} required />
                </div>

                {/* Secção Dedicada de Contactos */}
                <div className="rounded-[1.8rem] border border-slate-100 bg-slate-50/50 p-5 space-y-4 mt-6">
                  <div className="flex items-center gap-2 border-b border-slate-100/80 pb-3 mb-1">
                    <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-white shadow-sm text-navy">
                      <Phone size={14} className="text-navy" />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-700">Contactos e Encarregado</h4>
                      <p className="text-[9px] text-slate-400 font-bold">Informação opcional de contacto e tutoria</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField name="phone" label="Telefone" placeholder="+258 84 000 0000" />
                    <FormField name="email" label="Email (opcional)" placeholder="aluno@exemplo.com" type="email" />
                  </div>

                  <FormField name="guardianName" label="Encarregado (opcional)" placeholder="Nome do encarregado" />
                </div>

                <PrimaryButton className="w-full mt-2" tone="rose" type="submit">
                  <UserPlus size={16} /> Criar Aluno
                </PrimaryButton>
              </form>
            </BentoCard>

            {/* Lista de alunos com código sempre visível */}
            <BentoCard className="p-0 lg:col-span-7">
              <div className="flex items-center justify-between p-6">
                <h3 className="font-black text-slate-900">Alunos Registados</h3>
                <StatusBadge tone="navy">{`${students.length} Total`}</StatusBadge>
              </div>
              <DataTable
                emptyMessage="Ainda não existem alunos."
                headers={["Código DPS", "Nome / Email", "Nível", "Instrutor", "Estado"]}
                rows={students.map((student) => [
                  <div key={`${student.id}-code`} className="space-y-0.5">
                    <p className="text-xs font-black text-crimson uppercase tracking-wider">{student.studentCode}</p>
                    <p className="text-[9px] text-slate-400 font-bold">Login ID</p>
                  </div>,
                  <div key={`${student.id}-name`}>
                    <p className="text-sm font-bold text-slate-800">{student.user.name}</p>
                    <p className="text-[10px] text-slate-400">{student.user.email ?? <span className="italic text-amber-500">Sem email</span>}</p>
                  </div>,
                  <span key={`${student.id}-level`} className="text-xs font-bold text-slate-600">{student.level}</span>,
                  <form key={`${student.id}-debate`} action={setDebateModerationPermissionAction} className="flex justify-end">
                    <input type="hidden" name="userId" value={student.userId} />
                    <input type="hidden" name="canModerateDebates" value={student.user.canModerateDebates ? "false" : "true"} />
                    <input type="hidden" name="returnTo" value="/admin/students?tab=registar" />
                    <PrimaryButton
                      tone={student.user.canModerateDebates ? "rose" : "light"}
                      className="px-3 min-h-8 py-1.5 text-[10px]"
                      type="submit"
                      disabled={!student.user.isActive}
                    >
                      {student.user.canModerateDebates ? "Instrutor ON" : "Instrutor OFF"}
                    </PrimaryButton>
                  </form>,
                  <form key={`${student.id}-active`} action={setStudentActiveAction} className="flex justify-end">
                    <input type="hidden" name="id" value={student.id} />
                    <input type="hidden" name="userId" value={student.userId} />
                    <input type="hidden" name="isActive" value={student.user.isActive ? "false" : "true"} />
                    <PrimaryButton
                      tone={student.user.isActive ? "light" : "rose"}
                      className="px-3 min-h-8 py-1.5 text-[10px]"
                      type="submit"
                    >
                      {student.user.isActive ? "Desativar" : "Ativar"}
                    </PrimaryButton>
                  </form>,
                ])}
              />
            </BentoCard>
          </div>
        ) : null}

        {/* ══ Aba: Matricular Aluno ══ */}
        {activeTab === "matricular" ? (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            <BentoCard className="lg:col-span-4">
              <div className="mb-6">
                <h3 className="text-lg font-black text-slate-900">Nova Matrícula</h3>
                <p className="mt-1 text-xs text-slate-400 font-semibold">
                  Selecione o aluno, curso e turma.
                </p>
              </div>
              {unenrolledStudents.length === 0 && students.length > 0 ? (
                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-center">
                  <AlertTriangle size={20} className="mx-auto mb-2 text-amber-500" />
                  <p className="text-xs font-bold text-amber-700">Todos os alunos já estão matriculados.</p>
                </div>
              ) : null}
              {students.length === 0 ? (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center">
                  <Users size={20} className="mx-auto mb-2 text-slate-400" />
                  <p className="text-xs font-bold text-slate-500">Registe um aluno primeiro na aba &quot;Registar Aluno&quot;.</p>
                </div>
              ) : null}
              {students.length > 0 ? (
                <form action={createEnrollmentAction} className="space-y-4">
                  <SelectField
                    name="studentId"
                    label="Aluno"
                    required
                    defaultValue={searchParams?.studentId}
                    options={[
                      { label: "— Selecionar aluno —", value: "" },
                      ...students
                        .filter((s) => s.user.isActive)
                        .map((s) => ({
                          label: `${s.user.name} · ${s.studentCode}`,
                          value: s.id,
                        })),
                    ]}
                  />
                  <SelectField
                    name="courseId"
                    label="Curso"
                    required
                    options={[
                      { label: "— Selecionar curso —", value: "" },
                      ...courses.map((c) => ({ label: `${c.title} · ${c.level}`, value: c.id })),
                    ]}
                  />
                  <SelectField
                    name="classGroupId"
                    label="Turma"
                    required
                    options={[
                      { label: "— Selecionar turma —", value: "" },
                      ...classes.map((cl) => ({
                        label: `${cl.name} · ${cl.course.title}`,
                        value: cl.id,
                      })),
                    ]}
                  />
                  <input type="hidden" name="status" value={EnrollmentStatus.ACTIVE} />
                  <FormField name="monthlyFeeMt" label="Mensalidade (MT)" placeholder="2500" type="number" min={1} required />
                  <FormField name="dueDate" label="Vencimento da Fatura" type="date" required />
                  <PrimaryButton className="w-full" tone="navy" type="submit">
                    <GraduationCap size={16} /> Matricular e Faturar
                  </PrimaryButton>
                </form>
              ) : null}
            </BentoCard>

            {/* Alunos sem matrícula */}
            <BentoCard className="p-0 lg:col-span-8">
              <div className="flex items-center justify-between p-6">
                <h3 className="font-black text-slate-900">Alunos Sem Matrícula</h3>
                <StatusBadge tone={unenrolledStudents.length > 0 ? "danger" : "navy"}>
                  {`${unenrolledStudents.length} Pendentes`}
                </StatusBadge>
              </div>
              <DataTable
                emptyMessage="Todos os alunos estão matriculados."
                headers={["Código DPS", "Nome", "Nível", "Telefone", "Ação"]}
                rows={unenrolledStudents.map((student) => [
                  <div key={`${student.id}-code`} className="space-y-0.5">
                    <p className="text-xs font-black text-crimson uppercase tracking-wider">{student.studentCode}</p>
                  </div>,
                  <div key={`${student.id}-name`}>
                    <p className="text-sm font-bold text-slate-800">{student.user.name}</p>
                    <p className="text-[10px] text-slate-400">{student.user.email ?? "Sem email"}</p>
                  </div>,
                  <span key={`${student.id}-level`} className="text-xs font-bold text-slate-600">{student.level}</span>,
                  <span key={`${student.id}-phone`} className="text-xs text-slate-500">{student.phone ?? "—"}</span>,
                  <a
                    key={`${student.id}-enroll`}
                    href={`/admin/students?tab=matricular&studentId=${student.id}`}
                    className="inline-flex items-center gap-1 rounded-full bg-navy/10 hover:bg-navy text-navy hover:text-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    <GraduationCap size={11} /> Matricular
                  </a>,
                ])}
              />

              <div className="flex items-center justify-between p-6 border-t border-slate-100">
                <h3 className="font-black text-slate-900">Alunos Matriculados (Transferências)</h3>
                <StatusBadge tone="success">{`${enrolledStudents.length} Matriculados`}</StatusBadge>
              </div>
              <DataTable
                emptyMessage="Não existem alunos matriculados."
                headers={["Código DPS", "Nome", "Curso · Turma", "Transferir para"]}
                rows={enrolledStudents.map((student) => {
                  const enrollment = student.enrollments[0];
                  return [
                    <div key={`${student.id}-code-e`} className="space-y-0.5">
                      <p className="text-xs font-black text-crimson uppercase tracking-wider">{student.studentCode}</p>
                    </div>,
                    <p key={`${student.id}-name-e`} className="text-sm font-bold text-slate-800">{student.user.name}</p>,
                    <p key={`${student.id}-class`} className="text-xs font-bold text-slate-600">{enrollment.course.title} · {enrollment.classGroup.name}</p>,
                    <form key={`${student.id}-transfer`} action={async (formData) => {
                      "use server";
                      const { changeEnrollmentClassAction } = await import("@/features/admin/actions");
                      await changeEnrollmentClassAction(formData);
                    }} className="flex gap-2 min-w-48">
                      <input type="hidden" name="enrollmentId" value={enrollment.id} />
                      <select name="classGroupId" defaultValue={enrollment.classGroupId} className="flex-1 rounded-xl border border-slate-200 px-3 text-xs font-bold outline-none focus:border-navy">
                        {classes.filter(c => c.courseId === enrollment.courseId).map((cl) => (
                          <option key={cl.id} value={cl.id}>{cl.name}</option>
                        ))}
                      </select>
                      <PrimaryButton tone="navy" className="min-h-9 px-3 py-1.5 text-[10px]" type="submit">Mover</PrimaryButton>
                    </form>
                  ];
                })}
              />
            </BentoCard>
          </div>
        ) : null}

        {/* ══ Aba: Radar de Talentos ══ */}
        {activeTab === "talentos" ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <div className="rounded-[2rem] bg-navy p-6 text-white shadow-xl shadow-navy/20">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Participação</p>
                <h4 className="mt-2 text-3xl font-black">{talentStats.reduce((acc, t) => acc + t._count.studentId, 0)}</h4>
                <p className="mt-1 text-xs font-bold text-slate-400">Feedbacks enviados na Arena</p>
              </div>
              <div className="rounded-[2rem] bg-crimson p-6 text-white shadow-xl shadow-crimson/20">
                <p className="text-[10px] font-black uppercase tracking-widest text-rose-300">Top Aluno (Global)</p>
                <h4 className="mt-2 text-3xl font-black">{studentTalents[0]?.user.name.split(' ')[0] || "—"}</h4>
                <p className="mt-1 text-xs font-bold text-rose-300">Proficiência: {studentTalents[0]?.stats.overall.toFixed(0) || "0"}%</p>
              </div>
              <div className="rounded-[2rem] bg-slate-900 p-6 text-white shadow-xl shadow-slate-900/20">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total de Alunos</p>
                <h4 className="mt-2 text-3xl font-black">{students.length}</h4>
                <p className="mt-1 text-xs font-bold text-slate-400">{unenrolledStudents.length} sem matrícula</p>
              </div>
            </div>

            <BentoCard className="p-0 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-black text-slate-900">Ranking de Performance em Debates</h3>
              </div>
              <DataTable
                headers={["Pos", "Código / Aluno", "Speaking (Oratória)", "Writing (Escrita)", "Proficiência Geral"]}
                rows={studentTalents.map((s, i) => [
                  <div key={s.id} className="flex h-8 w-8 items-center justify-center rounded-xl font-black text-xs bg-slate-50 text-slate-400">
                    {i + 1}º
                  </div>,
                  <div key={`${s.id}-name`}>
                    <p className="text-[9px] font-black text-crimson uppercase tracking-widest">{s.studentCode}</p>
                    <p className="text-sm font-bold text-slate-800">{s.user.name}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">
                      {s.stats.debateCount} debates · {s.grades.length} notas
                    </p>
                  </div>,
                  <div key={`${s.id}-speaking`} className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full bg-navy transition-all duration-500" style={{ width: `${s.stats.speaking}%` }} />
                    </div>
                    <span className="text-xs font-black text-navy">{s.stats.speaking.toFixed(0)}%</span>
                  </div>,
                  <div key={`${s.id}-writing`} className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full bg-rose-600 transition-all duration-500" style={{ width: `${s.stats.writing}%` }} />
                    </div>
                    <span className="text-xs font-black text-rose-600">{s.stats.writing.toFixed(0)}%</span>
                  </div>,
                  <div key={`${s.id}-total`} className="flex items-center gap-2">
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full bg-slate-900 transition-all duration-500" style={{ width: `${s.stats.overall}%` }} />
                    </div>
                    <span className="text-xs font-black text-slate-900">{s.stats.overall.toFixed(0)}%</span>
                  </div>
                ])}
              />
            </BentoCard>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
