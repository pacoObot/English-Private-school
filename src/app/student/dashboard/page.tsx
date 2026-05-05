import Link from "next/link";
import { BookOpen, Download, Eye, MessageCircle, Mic2, Wallet } from "lucide-react";
import { ActionNotice } from "@/components/ui/ActionNotice";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BentoCard } from "@/components/ui/BentoCard";
import { DataTable } from "@/components/ui/DataTable";
import { MetricCard } from "@/components/ui/MetricCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getCurrentSession } from "@/features/auth/current-user";
import { studentNav } from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage({ searchParams }: { searchParams?: { status?: string } }) {
  const session = await getCurrentSession();
  const student = session
    ? await prisma.studentProfile.findFirst({
        where: { userId: session.userId },
        include: {
          enrollments: { include: { course: true, classGroup: true } },
          invoices: { include: { receipt: true } },
          attendances: true,
          grades: true,
          debateEvaluations: true
        }
      })
    : null;
  const activeCourses = student?.enrollments.length ?? 0;
  const pendingAmount = student?.invoices.filter((invoice) => invoice.status === "PENDING").reduce((sum, invoice) => sum + invoice.amountMt, 0) ?? 0;
  const absences = student?.attendances.filter((attendance) => attendance.status === "ABSENT").length ?? 0;
  const gradeAverage = student?.grades.length ? student.grades.reduce((sum, grade) => sum + grade.score, 0) / student.grades.length : 0;
  
  const debateEvals = student?.debateEvaluations ?? [];
  const debateAvg = debateEvals.length > 0 ? debateEvals.reduce((sum, ev) => sum + ev.fluency + ev.argumentation + ev.posture, 0) / (debateEvals.length * 3) : 0;

  return (
    <DashboardLayout
      navItems={studentNav}
      title={`Olá, ${session?.name.split(" ")[0] ?? "Estudante"}!`}
      subtitle={`ID: ${student?.studentCode ?? "---"}`}
      context="Language Academy"
      sidebarFooter={<QuickSupport />}
      darkSidebar
    >
      <div className="space-y-6">
        <ActionNotice status={searchParams?.status} />
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          <BentoCard className="xl:col-span-8">
            <div className="flex items-center gap-3 mb-5">
              <StatusBadge tone="navy">Meta Semestral</StatusBadge>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{student?.studentCode}</span>
            </div>
            <h3 className="text-2xl font-black leading-tight tracking-tight text-slate-900 sm:text-4xl">
              Progresso Global de <span className="italic text-slate-700">Fluência Corporativa</span>
            </h3>
            <div className="mt-7 space-y-5">
              <Progress label="Speaking Skills" value="85%" tone="bg-navy" />
              <Progress label="Writing Mastery" value="62%" tone="bg-crimson" />
            </div>
            <div className="mt-8 grid gap-3 sm:flex">
              <Link href="#grades">
                <PrimaryButton tone="dark">
                  <Eye size={16} /> Ver Notas
                </PrimaryButton>
              </Link>
              <Link href="https://wa.me/258840000000" target="_blank">
                <PrimaryButton tone="light">
                  <Download size={16} /> Baixar Fichas
                </PrimaryButton>
              </Link>
            </div>
          </BentoCard>

          <BentoCard className="bg-gradient-to-br from-navy to-blue-500 text-white xl:col-span-4" dark>
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md">
                <Wallet size={22} />
              </div>
              <StatusBadge tone={pendingAmount > 0 ? "warning" : "success"}>{pendingAmount > 0 ? "Pendente" : "Pago"}</StatusBadge>
            </div>
            <p className="mt-12 text-[10px] font-black uppercase tracking-widest text-blue-100">Tesouraria</p>
            <h3 className="mt-2 text-3xl font-black">{pendingAmount} MT</h3>
            <p className="text-xs font-bold text-blue-100/60 mt-1 uppercase tracking-widest">{student?.studentCode}</p>
          </BentoCard>

          <MetricCard label="Cursos Ativos" value={String(activeCourses)} hint={student?.level ?? "Nível"} icon={BookOpen} tone="navy" />
          <MetricCard label="Debate Skills" value={`${debateAvg.toFixed(1)}/10`} hint={`${debateEvals.length} sessões`} icon={Mic2} tone="rose" />
          <MetricCard label="Faltas" value={String(absences)} hint={gradeAverage ? `${gradeAverage.toFixed(1)}/20` : "Sem notas"} icon={Eye} tone="light" />
          <MetricCard label="Suporte" value="Online" hint="Tutor" icon={MessageCircle} tone="dark" />

          {/* Debate Profile Enrichment */}
          <BentoCard className="xl:col-span-12 overflow-hidden p-0">
             <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Debate Profile</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Análise de Performance em Arena</p>
                </div>
                <div className="text-right">
                   <p className="text-2xl font-black text-rose-600">{debateAvg.toFixed(1)}<span className="text-xs text-slate-400">/10</span></p>
                   <p className="text-[9px] font-black text-slate-400 uppercase">Média Evolutiva</p>
                </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                <div className="p-8">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Histórico de Sessões</p>
                   <div className="space-y-4">
                      {debateEvals.length === 0 ? (
                        <p className="text-xs font-bold text-slate-400 italic">Nenhuma participação registrada.</p>
                      ) : (
                        debateEvals.map(ev => {
                          const avg = (ev.fluency + ev.argumentation + ev.posture) / 3;
                          return (
                            <div key={ev.id} className="flex justify-between items-center">
                               <div>
                                  <p className="text-xs font-black text-slate-700">{ev.evaluatedAt.toLocaleDateString("pt-PT")}</p>
                                  <p className="text-[9px] text-slate-400 font-bold uppercase">Avaliado</p>
                               </div>
                               <div className={`px-2 py-1 rounded-lg text-[10px] font-black ${avg >= 7 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                  {avg.toFixed(1)}
                               </div>
                            </div>
                          );
                        })
                      )}
                   </div>
                </div>

                <div className="p-8 col-span-2">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Skills Radar</p>
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                      <Progress label="Fluência" value={`${((debateEvals.reduce((s, e) => s + e.fluency, 0) / (debateEvals.length || 1)) * 10).toFixed(0)}%`} tone="bg-rose-500" />
                      <Progress label="Argumentação" value={`${((debateEvals.reduce((s, e) => s + e.argumentation, 0) / (debateEvals.length || 1)) * 10).toFixed(0)}%`} tone="bg-navy" />
                      <Progress label="Postura" value={`${((debateEvals.reduce((s, e) => s + e.posture, 0) / (debateEvals.length || 1)) * 10).toFixed(0)}%`} tone="bg-slate-900" />
                   </div>
                   <div className="mt-8 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Último Feedback</p>
                      <p className="text-xs font-bold text-slate-600 leading-relaxed italic">
                        &quot;{debateEvals[0]?.feedback || "Aguardando próxima sessão para feedback qualitativo..."}&quot;
                      </p>
                   </div>
                </div>
             </div>
          </BentoCard>

          <BentoCard className="p-0 xl:col-span-6">
            <div className="flex items-center justify-between p-6">
              <h3 className="font-black text-slate-800">Faturas & Recibos</h3>
              <StatusBadge tone={pendingAmount > 0 ? "warning" : "success"}>{`${pendingAmount} MT`}</StatusBadge>
            </div>
            <DataTable
              emptyMessage="Ainda não existem faturas."
              headers={["Referência", "Valor", "Estado", "Recibo"]}
              rows={(student?.invoices ?? []).map((invoice) => {
                const receiptId = (student?.invoices as any).find((inv: any) => inv.id === invoice.id)?.receipt?.id;
                return [
                  invoice.reference, 
                  `${invoice.amountMt} MT`, 
                  invoice.status,
                  invoice.status === "PAID" ? (
                    <Link href={`/admin/receipts/${receiptId || ""}`} className="text-rose-600 font-black text-[10px] uppercase underline flex items-center gap-1">
                      <Download size={10} /> Recibo
                    </Link>
                  ) : "-"
                ];
              })}
            />
          </BentoCard>

          <div id="grades">
            <BentoCard className="p-0 xl:col-span-6">
              <div className="flex items-center justify-between p-6">
                <h3 className="font-black text-slate-800">Minhas Notas</h3>
                <StatusBadge tone="navy">{`${student?.grades.length ?? 0} Avaliações`}</StatusBadge>
              </div>
              <DataTable
                emptyMessage="Ainda não existem notas lançadas."
                headers={["Atividade", "Nota", "Máximo", "Data"]}
                rows={(student?.grades ?? []).map((grade) => [
                  grade.title,
                  <span key={grade.id} className="font-black text-rose-600">{grade.score}</span>,
                  grade.maxScore,
                  grade.createdAt.toLocaleDateString("pt-PT")
                ])}
              />
            </BentoCard>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Progress({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
        <span>{label}</span>
        <span className="text-slate-700">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`${tone} h-full rounded-full`} style={{ width: value }} />
      </div>
    </div>
  );
}

function QuickSupport() {
  return (
    <div className="rounded-[1.5rem] bg-slate-900 p-4 text-white">
      <p className="text-xs font-black italic text-rose-400">Duvidas?</p>
      <p className="mt-1 text-[11px] font-medium text-slate-300">Fale diretamente com o tutor via WhatsApp.</p>
      <Link href="https://wa.me/258840000000" target="_blank" className="block mt-4">
        <PrimaryButton className="w-full min-h-10 py-2" tone="light">
          Suporte Rapido
        </PrimaryButton>
      </Link>
    </div>
  );
}
