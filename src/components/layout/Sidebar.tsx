"use client";

import Link from "next/link";
import {
  BookOpen,
  CalendarCheck,
  ChartLine,
  FileText,
  GraduationCap,
  History,
  LayoutDashboard,
  MessageCircle,
  Mic,
  PenLine,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
  Wallet,
  X
} from "lucide-react";
import { cn } from "@/lib/cn";
import { BrandMark } from "./BrandMark";

import { useState, useEffect } from "react";
import { dictionaries, type Locale } from "@/i18n/config";

const iconMap = {
  book: BookOpen,
  calendar: CalendarCheck,
  chart: ChartLine,
  dashboard: LayoutDashboard,
  file: FileText,
  graduation: GraduationCap,
  history: History,
  message: MessageCircle,
  mic: Mic,
  pen: PenLine,
  shield: ShieldCheck,
  userCheck: UserCheck,
  userPlus: UserPlus,
  users: Users,
  wallet: Wallet
};

export type NavIcon = keyof typeof iconMap;

export type NavItem = {
  label: string;
  href: string;
  icon: NavIcon;
  active?: boolean;
};

type SidebarProps = {
  items: NavItem[];
  context: string;
  dark?: boolean;
  open: boolean;
  onClose: () => void;
  footer?: React.ReactNode;
};

const navLabelKeys: Record<string, string> = {
  "Dashboard": "navDashboard",
  "Inscrições": "navEnrollments",
  "Cursos": "navCourses",
  "Fichas de Estudo": "navStudyMaterials",
  "Notas e Faltas": "navGradesAndAbsences",
  "Tesouraria": "navTreasury",
  "Debates": "navDebates",
  "Calendário": "navCalendar",
  
  "Minhas Turmas": "navMyClasses",
  "Lançar Notas": "navPostGrades",
  "Enviar Fichas": "navSendMaterials",
  "Arena de Debates": "navArenaOfDebates",
  "Relatórios": "navReports",
  
  "Dashboard Central": "navCentralDashboard",
  "Registo de Alunos": "navRegisterStudents",
  "Gestao de Turmas": "navManageClasses",
  "Gestao de Staff": "navManageStaff",
  "Calendário Académico": "navAcademicCalendar",
  "Financeiro MT": "navFinanceMt",
  "Logs de Auditoria": "navAuditLogs",

  "Sessoes de Debate": "navDebateSessions",
  "Banco de Alunos": "navStudentBank",
  "Historico": "navHistory",
  "Feedback": "navFeedback",
};

const contextKeys: Record<string, string> = {
  "Student Portal": "Portal do Estudante",
  "Teacher Portal": "Portal do Professor",
  "Admin Portal": "Portal do Administrador"
};

const contextKeysEn: Record<string, string> = {
  "Student Portal": "Student Portal",
  "Teacher Portal": "Teacher Portal",
  "Admin Portal": "Admin Portal"
};

export function Sidebar({ items, context, dark = false, open, onClose, footer }: SidebarProps) {
  const [locale, setLocale] = useState<Locale>("pt-PT");

  useEffect(() => {
    const match = document.cookie.match(/locale=([^;]+)/);
    if (match && (match[1] === "en-US" || match[1] === "pt-PT")) {
      setLocale(match[1] as Locale);
    }
  }, []);

  const dict = dictionaries[locale];
  const translatedContext = locale === "en-US" 
    ? (contextKeysEn[context] || context) 
    : (contextKeys[context] || context);

  return (
    <>
      <button
        aria-label="Fechar menu"
        className={cn("fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm lg:hidden", open ? "block" : "hidden")}
        onClick={onClose}
        type="button"
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r transition-transform duration-300 lg:static lg:w-64 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
          dark ? "border-slate-800 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-900"
        )}
      >
        <div className="flex items-center justify-between p-6">
          <BrandMark context={translatedContext} dark={dark} />
          <button className="rounded-xl p-2 text-slate-400 lg:hidden" onClick={onClose} aria-label="Fechar menu" type="button">
            <X size={21} />
          </button>
        </div>
        <nav className="flex-1 space-y-2 overflow-y-auto px-4 pb-6">
          {items.map((item) => {
            const Icon = iconMap[item.icon];
            const translationKey = navLabelKeys[item.label];
            const translatedLabel = translationKey && dict[translationKey] ? dict[translationKey] : item.label;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex min-h-12 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all",
                  item.active
                    ? dark
                      ? "bg-navy text-white shadow-lg shadow-blue-950/30"
                      : "bg-navy text-white shadow-lg shadow-blue-900/20"
                    : dark
                      ? "text-slate-400 hover:bg-white/5 hover:text-white"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
                onClick={onClose}
              >
                <Icon size={18} />
                {translatedLabel}
              </Link>
            );
          })}
        </nav>
        {footer ? <div className={cn("border-t p-4", dark ? "border-slate-800" : "border-slate-100")}>{footer}</div> : null}
      </aside>
    </>
  );
}
