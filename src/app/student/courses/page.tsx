import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BentoCard } from "@/components/ui/BentoCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getCurrentSession } from "@/features/auth/current-user";
import { studentNav } from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";
import { Book, Clock, MapPin, User } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentCoursesPage() {
  const session = await getCurrentSession();
  const student = session
    ? await prisma.studentProfile.findFirst({
        where: { userId: session.userId },
        include: {
          enrollments: {
            include: {
              course: true,
              classGroup: { include: { teacher: { include: { user: true } } } }
            }
          }
        }
      })
    : null;

  const enrollments = student?.enrollments ?? [];

  return (
    <DashboardLayout
      navItems={studentNav.map(item => ({ ...item, active: item.label === "Cursos" }))}
      title="Meus Cursos"
      subtitle="Sua jornada académica"
      context="Student Portal"
      darkSidebar
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {enrollments.length === 0 ? (
          <BentoCard className="md:col-span-2 text-center py-20">
            <Book size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-black text-slate-900">Nenhum curso ativo</h3>
            <p className="text-slate-500 max-w-xs mx-auto mt-2">Você ainda não está matriculado em nenhum curso este semestre.</p>
          </BentoCard>
        ) : (
          enrollments.map((enr) => (
            <BentoCard key={enr.id} className="relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-6">
                  <StatusBadge tone="success">{enr.status}</StatusBadge>
               </div>
               
               <div className="flex items-center gap-4 mb-8">
                  <div className="h-14 w-14 rounded-2xl bg-navy/5 flex items-center justify-center text-navy group-hover:bg-navy group-hover:text-white transition-all duration-500">
                     <Book size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 leading-tight">{enr.course.title}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Nível {enr.course.level}</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  <CourseDetail icon={User} label="Professor" value={enr.classGroup.teacher?.user.name || "A definir"} />
                  <CourseDetail icon={MapPin} label="Sala / Turma" value={enr.classGroup.name || enr.classGroup.room || "Remoto"} />
                  <CourseDetail icon={Clock} label="Horário" value={enr.classGroup.schedule} />
                  <CourseDetail icon={Book} label="Duração" value={enr.course.duration || "N/A"} />
               </div>
            </BentoCard>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}

function CourseDetail({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
       <div className="text-slate-400">
          <Icon size={16} />
       </div>
       <div>
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-1">{label}</p>
          <p className="text-xs font-bold text-slate-700 truncate max-w-[120px]">{value}</p>
       </div>
    </div>
  );
}
