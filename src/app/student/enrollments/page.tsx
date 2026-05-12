import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BentoCard } from "@/components/ui/BentoCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getCurrentSession } from "@/features/auth/current-user";
import { studentNav } from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";
import { Calendar, CheckCircle2, UserPlus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentEnrollmentsPage() {
  const session = await getCurrentSession();
  const student = session
    ? await prisma.studentProfile.findFirst({
        where: { userId: session.userId },
        include: {
          enrollments: { include: { course: true, classGroup: true } }
        }
      })
    : null;

  const enrollments = student?.enrollments ?? [];

  return (
    <DashboardLayout
      navItems={studentNav.map(item => ({ ...item, active: item.label === "Inscrições" }))}
      title="Minhas Inscrições"
      subtitle="Histórico de matrículas e status"
      context="Student Portal"
      darkSidebar
    >
      <div className="space-y-6">
        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-4 text-center md:text-left">
              <div className="h-16 w-16 rounded-3xl bg-navy/5 text-navy flex items-center justify-center">
                 <UserPlus size={32} />
              </div>
              <div>
                 <h2 className="text-2xl font-black text-slate-900">Período de Inscrição Ativo</h2>
                 <p className="text-slate-500 font-bold text-sm">Semestre 2026.1 - Matrículas abertas até 30 de Maio</p>
              </div>
           </div>
           <PrimaryButton tone="dark" className="px-8 py-4 h-auto rounded-2xl">
              Nova Inscrição
           </PrimaryButton>
        </div>

        <div className="grid grid-cols-1 gap-6">
           <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">Histórico Recente</h3>
           {enrollments.map((enr) => (
             <BentoCard key={enr.id} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                   <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <CheckCircle2 size={24} className={enr.status === "ACTIVE" ? "text-emerald-500" : ""} />
                   </div>
                   <div>
                      <h4 className="font-black text-slate-800 text-lg leading-none">{enr.course.title}</h4>
                      <p className="text-xs font-bold text-slate-400 mt-2 flex items-center gap-2">
                         <Calendar size={12} /> Inscrito em {enr.enrolledAt.toLocaleDateString("pt-PT")}
                      </p>
                   </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                   <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                      {enr.classGroup.name}
                   </div>
                   <StatusBadge tone={enr.status === "ACTIVE" ? "success" : "warning"}>
                      {enr.status}
                   </StatusBadge>
                   <PrimaryButton tone="light" className="h-10 py-0 px-4 text-[10px] ml-auto md:ml-0">
                      Detalhes
                   </PrimaryButton>
                </div>
             </BentoCard>
           ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
