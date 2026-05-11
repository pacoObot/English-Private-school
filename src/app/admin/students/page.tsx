import { UserPlus, GraduationCap, CheckCircle, Copy, Users, AlertTriangle } from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { ActionNotice, BentoCard, DataTable, FormField, PrimaryButton, SelectField, StatusBadge } from "@/components/ui";
import { createEnrollmentAction, createStudentAction, setDebateModerationPermissionAction, setStudentActiveAction } from "@/features/admin/actions";
import { adminNavigation } from "@/features/admin/nav";
import { EnrollmentStatus } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

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
  };
};

  const [students, courses, classes, talentStats] = await Promise.all([
    prisma.studentProfile.findMany({
      include: { 
        user: true, 
        enrollments: { select: { id: true } },
        debateEvaluations: { select: { fluency: true, argumentation: true, posture: true } }
      },
      orderBy: { user: { name: "asc" } },
    }),
    prisma.course.findMany({ where: { isActive: true }, orderBy: { title: "asc" } }),
    prisma.classGroup.findMany({ include: { course: true }, orderBy: { name: "asc" } }),
    prisma.debateEvaluation.groupBy({
      by: ['studentId'],
      _avg: { fluency: true, argumentation: true, posture: true },
      _count: { studentId: true }
    })
  ]);

  const activeTab = searchParams?.tab || "registar";
  const newCode = searchParams?.newCode;
  const newName = searchParams?.newName;
  const showCredentials = searchParams?.status === "created" && newCode;

  // Calculo de médias para talentos
  const studentTalents = students.map(s => {
    const stats = talentStats.find(ts => ts.studentId === s.id);
    const avgFluency = stats?._avg.fluency || 0;
    const avgArgumentation = stats?._avg.argumentation || 0;
    const avgPosture = stats?._avg.posture || 0;
    const globalAvg = (avgFluency + avgArgumentation + avgPosture) / 3;

    return {
      ...s,
      stats: {
        fluency: avgFluency,
        argumentation: avgArgumentation,
        posture: avgPosture,
        global: globalAvg,
        count: stats?._count.studentId || 0
      }
    };
  }).sort((a, b) => b.stats.global - a.stats.global);

  const unenrolledStudents = students.filter((s) => s.enrollments.length === 0 && s.user.isActive);

  return (
    <DashboardLayout
      navItems={adminNavigation("/admin/students")}
      title="Gestão de Alunos"
      subtitle="Registo e matrículas"
      context="Admin"
      darkSidebar
    >
      <div className="space-y-5">
        <ActionNotice status={searchParams?.status} />

        {/* ── Credenciais do novo aluno ── */}
        {showCredentials ? (
          <div className="rounded-3xl border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-6 shadow-lg animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white">
                <CheckCircle size={24} />
              </div>
              <div className="flex-1 space-y-3">
                <h3 className="text-lg font-black text-emerald-900">
                  Aluno criado com sucesso!
                </h3>
                <p className="text-sm font-bold text-emerald-700">
                  {newName} foi registado. Partilhe as credenciais iniciais:
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-2xl border border-emerald-200 bg-white px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Código de Acesso</p>
                    <p className="mt-1 text-lg font-black text-navy tracking-wide">{newCode}</p>
                  </div>
                  <div className="rounded-2xl border border-emerald-200 bg-white px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Senha Inicial</p>
                    <p className="mt-1 text-lg font-black text-navy tracking-wide">{DEFAULT_PASSWORD}</p>
                  </div>
                </div>
                <p className="text-xs text-emerald-600 font-semibold">
                  O aluno pode alterar a senha no seu perfil após o primeiro acesso.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {/* ── Abas ── */}
        <div className="flex gap-2">
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

        {/* ── Aba: Registar Novo Aluno ── */}
        {activeTab === "registar" ? (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            <BentoCard className="lg:col-span-5">
              <div className="mb-6">
                <h3 className="text-lg font-black text-slate-900">Novo Aluno</h3>
                <p className="mt-1 text-xs text-slate-400 font-semibold">
                  O código de estudante e a senha são gerados automaticamente.
                </p>
              </div>
              <form action={createStudentAction} className="space-y-4">
                <FormField name="name" label="Nome Completo" placeholder="Ex: Celso Manuel" required />
                <SelectField name="level" label="Nível" options={STUDENT_LEVELS} required />
                <FormField name="phone" label="Telefone" placeholder="+258 84 000 0000" />
                <FormField name="email" label="Email (opcional)" placeholder="aluno@exemplo.com" type="email" />
                <FormField name="guardianName" label="Encarregado (opcional)" placeholder="Nome do encarregado" />
                <PrimaryButton className="w-full" tone="rose" type="submit">
                  <UserPlus size={16} /> Criar Aluno
                </PrimaryButton>
              </form>
            </BentoCard>

            {/* Lista de alunos */}
            <BentoCard className="p-0 lg:col-span-7">
              <div className="flex items-center justify-between p-6">
                <h3 className="font-black text-slate-900">Alunos Registados</h3>
                <StatusBadge tone="navy">{`${students.length} Total`}</StatusBadge>
              </div>
              <DataTable
                emptyMessage="Ainda não existem alunos."
                headers={["Código", "Nome", "Nível", "Debates", "Estado"]}
                rows={students.map((student) => [
                  <span key={`${student.id}-code`} className="text-[10px] font-black text-rose-600 uppercase tracking-widest">
                    {student.studentCode}
                  </span>,
                  <div key={`${student.id}-name`}>
                    <p className="text-sm font-bold text-slate-800">{student.user.name}</p>
                    <p className="text-[10px] text-slate-400">{student.user.email ?? "Sem email"}</p>
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

        {/* ── Aba: Matricular Aluno ── */}
        {activeTab === "matricular" ? (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            <BentoCard className="lg:col-span-5">
              <div className="mb-6">
                <h3 className="text-lg font-black text-slate-900">Nova Matrícula</h3>
                <p className="mt-1 text-xs text-slate-400 font-semibold">
                  Selecione o aluno, curso e turma para matricular.
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
            <BentoCard className="p-0 lg:col-span-7">
              <div className="flex items-center justify-between p-6">
                <h3 className="font-black text-slate-900">Alunos Sem Matrícula</h3>
                <StatusBadge tone={unenrolledStudents.length > 0 ? "danger" : "navy"}>
                  {`${unenrolledStudents.length} Pendentes`}
                </StatusBadge>
              </div>
              <DataTable
                emptyMessage="Todos os alunos estão matriculados. 🎉"
                headers={["Código", "Nome", "Nível", "Telefone"]}
                rows={unenrolledStudents.map((student) => [
                  <span key={`${student.id}-code`} className="text-[10px] font-black text-rose-600 uppercase tracking-widest">
                    {student.studentCode}
                  </span>,
                  <p key={`${student.id}-name`} className="text-sm font-bold text-slate-800">{student.user.name}</p>,
                  <span key={`${student.id}-level`} className="text-xs font-bold text-slate-600">{student.level}</span>,
                  <span key={`${student.id}-phone`} className="text-xs text-slate-500">{student.phone ?? "—"}</span>,
                ])}
              />
            </BentoCard>
          </div>
        ) : null}
        {/* ── Aba: Radar de Talentos ── */}
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
                <p className="mt-1 text-xs font-bold text-rose-300">Média: {studentTalents[0]?.stats.global.toFixed(1) || "0.0"}/10</p>
              </div>
              <div className="rounded-[2rem] bg-slate-900 p-6 text-white shadow-xl shadow-slate-900/20">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Habilidade em Destaque</p>
                <h4 className="mt-2 text-3xl font-black">Fluência</h4>
                <p className="mt-1 text-xs font-bold text-slate-400">Média geral da escola: 7.8</p>
              </div>
            </div>

            <BentoCard className="p-0 overflow-hidden">
               <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-black text-slate-900">Ranking de Performance em Debates</h3>
               </div>
               <DataTable
                 headers={["Posição", "Aluno", "Fluência", "Argumentação", "Postura", "Geral"]}
                 rows={studentTalents.map((s, i) => [
                   <div key={s.id} className="flex h-8 w-8 items-center justify-center rounded-xl font-black text-xs bg-slate-50 text-slate-400">
                     {i + 1}º
                   </div>,
                   <div key={`${s.id}-name`}>
                     <p className="text-sm font-bold text-slate-800">{s.user.name}</p>
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.stats.count} debates avaliados</p>
                   </div>,
                   <span key={`${s.id}-fluency`} className="text-sm font-black text-navy">{s.stats.fluency.toFixed(1)}</span>,
                   <span key={`${s.id}-arg`} className="text-sm font-black text-crimson">{s.stats.argumentation.toFixed(1)}</span>,
                   <span key={`${s.id}-posture`} className="text-sm font-black text-slate-600">{s.stats.posture.toFixed(1)}</span>,
                   <div key={`${s.id}-total`} className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                         <div className="h-full bg-navy transition-all" style={{ width: `${s.stats.global * 10}%` }} />
                      </div>
                      <span className="text-xs font-black text-navy">{s.stats.global.toFixed(1)}</span>
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
