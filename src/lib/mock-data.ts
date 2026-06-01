import type { NavItem } from "@/components/layout";

export const studentNav: NavItem[] = [
  { label: "Dashboard", href: "/student/dashboard", icon: "dashboard", active: true },
  { label: "Inscrições", href: "/student/enrollments", icon: "userPlus" },
  { label: "Cursos", href: "/student/courses", icon: "graduation" },
  { label: "Fichas de Estudo", href: "/student/materials", icon: "file" },
  { label: "Notas e Faltas", href: "/student/grades", icon: "chart" },
  { label: "Tesouraria", href: "/student/treasury", icon: "wallet" },
  { label: "Debates", href: "/student/debates", icon: "mic" },
  { label: "Calendário", href: "/student/calendar", icon: "calendar" }
];

export const teacherNav: NavItem[] = [
  { label: "Dashboard", href: "/teacher/dashboard", icon: "dashboard", active: true },
  { label: "Minhas Turmas", href: "/teacher/dashboard", icon: "users" },
  { label: "Lançar Notas", href: "/teacher/grades", icon: "pen" },
  { label: "Enviar Fichas", href: "/teacher/materials", icon: "file" },
  { label: "Arena de Debates", href: "/debate", icon: "mic" },
  { label: "Relatórios", href: "/teacher/reports", icon: "chart" }
];

export const adminNav: NavItem[] = [
  { label: "Dashboard Central", href: "/admin/dashboard", icon: "dashboard", active: true },
  { label: "Registo de Alunos", href: "/admin/students", icon: "userPlus" },
  { label: "Gestao de Turmas", href: "/admin/classes", icon: "users" },
  { label: "Gestao de Staff", href: "/admin/staff", icon: "shield" },
  { label: "Cursos", href: "/admin/courses", icon: "book" },
  { label: "Arena de Debates", href: "/debate", icon: "mic" },
  { label: "Calendário Académico", href: "/admin/calendar", icon: "calendar" },
  { label: "Financeiro MT", href: "/admin/dashboard", icon: "wallet" },
  { label: "Logs de Auditoria", href: "/admin/dashboard", icon: "history" }
];

export const debateNav: NavItem[] = [
  { label: "Sessoes de Debate", href: "/debate", icon: "calendar", active: true },
  { label: "Banco de Alunos", href: "/debate", icon: "graduation" },
  { label: "Historico", href: "/debate", icon: "history" },
  { label: "Feedback", href: "/teacher/dashboard", icon: "message" }
];
