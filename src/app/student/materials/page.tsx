import { getCurrentSession } from "@/features/auth/current-user";
import { studentNav } from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";
import { getLocale, getDictionary } from "@/i18n/locale";
import { Download, FileText, Search } from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { BentoCard, PrimaryButton } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function StudentMaterialsPage() {
  const session = await getCurrentSession();
  const locale = await getLocale();
  const dict = await getDictionary();
  const student = session
    ? await prisma.studentProfile.findFirst({
        where: { userId: session.userId },
        include: {
          enrollments: { include: { course: true } }
        }
      })
    : null;

  const courseIds = student?.enrollments.map(e => e.courseId) ?? [];
  const materials = await prisma.studyMaterial.findMany({
    where: { courseId: { in: courseIds } },
    include: { course: true, teacher: { include: { user: true } } },
    orderBy: { createdAt: "desc" }
  });

  return (
    <DashboardLayout
      navItems={studentNav.map(item => ({ ...item, active: item.label === "Fichas de Estudo" }))}
      title={dict.studyMaterialsTitle}
      subtitle={dict.studyMaterialsSub}
      context="Student Portal"
      darkSidebar
    >
      <div className="space-y-6">
        <div className="relative">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
           <input 
             type="text" 
             placeholder={locale === "en-US" ? "Search by title or unit..." : "Pesquisar por título ou unidade..."} 
             className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-slate-100 focus:outline-none focus:ring-2 focus:ring-navy/5 transition-all text-sm font-bold text-slate-700 shadow-sm"
           />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.length === 0 ? (
            <BentoCard className="sm:col-span-2 lg:col-span-3 text-center py-20">
              <FileText size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-black text-slate-900">
                {locale === "en-US" ? "No materials available" : "Sem fichas disponíveis"}
              </h3>
              <p className="text-slate-500 max-w-xs mx-auto mt-2">
                {locale === "en-US" 
                  ? "No study materials have been shared for your courses so far." 
                  : "Nenhum material de estudo foi compartilhado para os seus cursos até ao momento."}
              </p>
            </BentoCard>
          ) : (
            materials.map((mat) => (
              <BentoCard key={mat.id} className="group hover:border-navy/20 transition-all duration-300">
                <div className="flex justify-between items-start mb-6">
                   <div className="h-12 w-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-all duration-500">
                      <FileText size={22} />
                   </div>
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-md">
                      {mat.unit || "Extra"}
                   </span>
                </div>

                <h3 className="text-lg font-black text-slate-900 mb-1 line-clamp-1">{mat.title}</h3>
                <p className="text-xs font-bold text-slate-500 mb-6">{mat.course.title}</p>
                
                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                   <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-slate-200" />
                      <span className="text-[10px] font-black text-slate-600 truncate max-w-[80px]">
                         {mat.teacher?.user.name || "Sistema"}
                      </span>
                   </div>
                   {mat.fileUrl ? (
                     <a href={mat.fileUrl} target="_blank" rel="noreferrer">
                       <PrimaryButton tone="dark" type="button" className="h-9 py-0 px-4 text-[10px]">
                          <Download size={14} /> {locale === "en-US" ? "Download" : "Baixar"}
                       </PrimaryButton>
                     </a>
                   ) : (
                     <PrimaryButton tone="dark" className="h-9 py-0 px-4 text-[10px] opacity-50 cursor-not-allowed" disabled>
                        <Download size={14} /> {locale === "en-US" ? "Unavailable" : "Indisponível"}
                     </PrimaryButton>
                   )}
                </div>
              </BentoCard>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
