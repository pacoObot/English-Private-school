import type { NavItem } from "@/components/layout";

export const studentNav: NavItem[] = [
  { label: "Dashboard", href: "/student/dashboard", icon: "dashboard", active: true },
  { label: "Inscricoes", href: "/student/dashboard", icon: "userPlus" },
  { label: "Cursos", href: "/student/dashboard", icon: "graduation" },
  { label: "Fichas de Estudo", href: "/student/dashboard", icon: "file" },
  { label: "Notas e Faltas", href: "/student/dashboard", icon: "chart" },
  { label: "Tesouraria", href: "/student/dashboard", icon: "wallet" }
];

export const teacherNav: NavItem[] = [
  { label: "Minhas Turmas", href: "/teacher/dashboard", icon: "users", active: true },
  { label: "Lancar Notas", href: "/teacher/dashboard", icon: "pen" },
  { label: "Chamada Rapida", href: "/teacher/dashboard", icon: "userCheck" },
  { label: "Enviar Fichas", href: "/teacher/dashboard", icon: "file" },
  { label: "Debates", href: "/debate", icon: "mic" }
];

export const adminNav: NavItem[] = [
  { label: "Dashboard Central", href: "/admin/dashboard", icon: "dashboard", active: true },
  { label: "Registo de Alunos", href: "/admin/students", icon: "userPlus" },
  { label: "Gestao de Turmas", href: "/admin/classes", icon: "users" },
  { label: "Gestao de Staff", href: "/admin/staff", icon: "shield" },
  { label: "Cursos", href: "/admin/courses", icon: "book" },
  { label: "Financeiro MT", href: "/admin/dashboard", icon: "wallet" },
  { label: "Logs de Auditoria", href: "/admin/dashboard", icon: "history" }
];

export const debateNav: NavItem[] = [
  { label: "Sessoes de Debate", href: "/debate", icon: "calendar", active: true },
  { label: "Banco de Alunos", href: "/debate", icon: "graduation" },
  { label: "Historico", href: "/debate", icon: "history" },
  { label: "Feedback", href: "/teacher/dashboard", icon: "message" }
];

export const students = [
  { name: "Antonio Manuel", level: "B2", average: "14.5", absences: "02", status: "Ativo" },
  { name: "Beatriz Costa", level: "C1", average: "18.0", absences: "00", status: "Ativo" },
  { name: "Carlos Alberto", level: "B1", average: "13.2", absences: "04", status: "Alerta" }
];

export const debateStudents = [
  { name: "Alipio Paco", fluency: 8, argument: 7, posture: 9 },
  { name: "Daniela Santos", fluency: 7, argument: 8, posture: 8 },
  { name: "Bruno Chale", fluency: 6, argument: 7, posture: 7 }
];
