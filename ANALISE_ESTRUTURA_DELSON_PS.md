# Análise Estrutural Completa - Delson PS Academic

**Última atualização:** 04 de Maio de 2026
**Sprint Atual:** Sprint Final (All Buttons Working)

---

## 1. IDENTIDADE VISUAL E DESIGN SYSTEM

### 1.1 Configuração Tailwind (Design Tokens)

**Ficheiro:** `/home/paco/Trabalhos_UJAC/Delson_PS/tailwind.config.ts`

**Cores Principais:**
- **Navy (Primária):** `#1e3a8a` (azul escuro institucional)
  - Variante Deep: `#0f172a` (backgrounds escuros)
- **Crimson (Secundária):** `#e11d48` (vermelho ativo para CTA)

**Shadows Customizados:**
- `shadow-soft`: Sutil para cards gerais (`0 24px 80px -32px rgba(15, 23, 42, 0.28)`)
- `shadow-card`: Mais pronunciado para destaque (`0 16px 50px -30px rgba(15, 23, 42, 0.35)`)

**Border Radius Estendido:**
- `rounded-4xl`: 2rem
- `rounded-5xl`: 2.5rem
- `rounded-6xl`: 3rem

**Framework CSS:** Tailwind CSS 3.4.17 com PostCSS

### 1.2 Tema Tipográfico

- **Headlines:** `font-black` (900 weight) + `uppercase tracking-widest`
- **Body:** `font-bold` com `text-xs` a `text-sm`
- **Labels:** `text-[10px]` ou `text-[11px]` + `uppercase tracking-widest` + `text-slate-400`
- **Fonte Padrão:** System fonts (Tailwind default)

### 1.3 Design System Consistente

**Padrão de Componentes:**
- Componentes aplicam automaticamente `backdrop-blur-md` e sombras suaves
- Bordas em `border-slate-200` ou `border-slate-200/80`
- Backgrounds em `bg-white/80` ou `bg-slate-50/70` (glass morphism)
- Focus states com `ring-4 ring-blue-900/10` para acessibilidade

**Biblioteca de Ícones:** Lucide React 0.468.0

---

## 2. COMPONENTES UI REUTILIZÁVEIS

### 2.1 Localização e Exportação

**Directório Principal:** `/home/paco/Trabalhos_UJAC/Delson_PS/src/components/ui/`

**Ficheiro de Exportação:** `/home/paco/Trabalhos_UJAC/Delson_PS/src/components/ui/index.ts`

```typescript
export { ActionNotice } from "./ActionNotice";
export { BentoCard } from "./BentoCard";
export { DataTable } from "./DataTable";
export { EmptyState } from "./EmptyState";
export { FinanceCard } from "./FinanceCard";
export { FloatingActionButton } from "./FloatingActionButton";
export { FormField } from "./FormField";
export { MetricCard } from "./MetricCard";
export { Modal } from "./Modal";
export { PrimaryButton } from "./PrimaryButton";
export { ProgressCard } from "./ProgressCard";
export { SecondaryButton } from "./SecondaryButton";
export { SelectField } from "./SelectField";
export { StatusBadge } from "./StatusBadge";
```

### 2.2 Componentes de Botões

#### PrimaryButton
**Ficheiro:** `/home/paco/Trabalhos_UJAC/Delson_PS/src/components/ui/PrimaryButton.tsx`

**Props:**
- `tone?: "navy" | "rose" | "dark" | "light"` (default: "navy")
- `children: ReactNode`
- Suporta atributos HTML `<button>`

**Características:**
- Loading state automático via `useFormStatus` (react-dom)
- Spinner animado com "A processar..."
- Disabled state com `opacity-50` e `cursor-not-allowed`
- Min height: 48px (12 em Tailwind)
- Bordas arredondadas em 2xl (1.5rem)

**Tones Disponíveis:**
```typescript
const tones = {
  navy: "bg-navy text-white shadow-sm hover:bg-blue-950",
  rose: "bg-crimson text-white shadow-sm hover:bg-rose-700",
  dark: "bg-slate-900 text-white shadow-sm hover:bg-slate-800",
  light: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
};
```

#### SecondaryButton
**Ficheiro:** `/home/paco/Trabalhos_UJAC/Delson_PS/src/components/ui/SecondaryButton.tsx`

**Props:**
- `children: ReactNode`
- Atributos HTML `<button>`

**Estilo:** Border com background glass morphism (`bg-white/80 backdrop-blur-md`)

### 2.3 Componentes de Formulário

#### FormField (Input)
**Ficheiro:** `/home/paco/Trabalhos_UJAC/Delson_PS/src/components/ui/FormField.tsx`

**Props:**
- `label: string` (obrigatório)
- `icon?: ReactNode` (ícone à esquerda)
- `helperText?: string` (texto de ajuda)
- Atributos HTML `<input>`

**Features:**
- Min height: 56px (14 em Tailwind)
- Focus: ring azul navy + border crisp
- Ícone com posicionamento absoluto
- Label styled com `text-[10px]` uppercase

#### SelectField
**Ficheiro:** `/home/paco/Trabalhos_UJAC/Delson_PS/src/components/ui/SelectField.tsx`

**Props:**
- `label: string`
- `options: Array<{ label: string; value: string }>`
- `helperText?: string`
- Atributos HTML `<select>`

**Features:**
- ChevronDown icon customizado
- Mesmos estilos de FormField
- Appearance: none (custom styling)

### 2.4 Componentes de Cards

#### BentoCard
**Ficheiro:** `/home/paco/Trabalhos_UJAC/Delson_PS/src/components/ui/BentoCard.tsx`

**Props:**
- `children: ReactNode`
- `className?: string`
- `dark?: boolean` (default: false)
- `premium?: boolean` (default: false)

**Estilos:**
- Light: `bg-white/90 border-slate-200/80 shadow-sm`
- Dark: `bg-slate-900 text-white border-white/10 shadow-xl`
- Premium adiciona `shadow-xl`
- Border radius: `rounded-[2rem]` (desktop) até `rounded-[2.5rem]`

#### MetricCard
**Ficheiro:** `/home/paco/Trabalhos_UJAC/Delson_PS/src/components/ui/MetricCard.tsx`

**Props:**
- `label: string`
- `value: string`
- `hint?: string` (badge verde com percentual)
- `icon: LucideIcon` (obrigatório)
- `tone?: "navy" | "rose" | "dark" | "light"`

**Features:**
- Icon em fundo colorido (11x11)
- Hover transform: `-translate-y-1`
- Transição suave 300ms

#### ProgressCard
**Ficheiro:** `/home/paco/Trabalhos_UJAC/Delson_PS/src/components/ui/ProgressCard.tsx`

**Uso:** Exibição de progresso com barras coloridas

#### FinanceCard
**Ficheiro:** `/home/paco/Trabalhos_UJAC/Delson_PS/src/components/ui/FinanceCard.tsx`

**Uso:** Dados financeiros com status de pagamento

### 2.5 Componentes de Dados

#### DataTable
**Ficheiro:** `/home/paco/Trabalhos_UJAC/Delson_PS/src/components/ui/DataTable.tsx`

**Props:**
- `headers: string[]`
- `rows: ReactNode[][]`
- `emptyMessage?: string` (default: "Sem dados para apresentar.")

**Features:**
- Responsivo: Tabela em desktop (md:block), cards em mobile
- Hover effect em linhas
- Borders entre linhas
- Suporta componentes React em células

#### EmptyState
**Ficheiro:** `/home/paco/Trabalhos_UJAC/Delson_PS/src/components/ui/EmptyState.tsx`

**Props:**
- `icon: LucideIcon`
- `title: string`
- `description: string`

**Estilo:** Dashed border com background translúcido

### 2.6 Componentes de Feedback

#### StatusBadge
**Ficheiro:** `/home/paco/Trabalhos_UJAC/Delson_PS/src/components/ui/StatusBadge.tsx`

**Props:**
- `children: string`
- `tone?: "success" | "warning" | "danger" | "neutral" | "navy"`

**Tones:**
```typescript
const tones = {
  success: "bg-emerald-50 text-emerald-600",
  warning: "bg-amber-50 text-amber-600",
  danger: "bg-rose-50 text-crimson",
  neutral: "bg-slate-100 text-slate-500",
  navy: "bg-blue-50 text-navy"
};
```

#### ActionNotice
**Ficheiro:** `/home/paco/Trabalhos_UJAC/Delson_PS/src/components/ui/ActionNotice.tsx`

**Props:**
- `status?: string` (chave no dicionário de mensagens)

**Mensagens Disponíveis:**
- `created`, `updated`, `deactivated`, `activated`
- `enrolled`, `paid`, `cancelled`, `saved`
- `error`, `duplicate_email`, `duplicate_student_number`
- `duplicate_staff_number`, `duplicate_enrollment`
- `duplicate_attendance`, `duplicate_evaluation`

#### Modal
**Ficheiro:** `/home/paco/Trabalhos_UJAC/Delson_PS/src/components/ui/Modal.tsx`

**Props:**
- `open: boolean`
- `onClose: () => void`
- `title: string`
- `description?: string`
- `children: ReactNode`
- `footer?: ReactNode`

**Features:**
- Fixed positioning com z-50
- Backdrop com blur
- Responsivo: rounded-t em mobile, rounded em desktop
- Fechar com X button

#### FloatingActionButton
**Ficheiro:** `/home/paco/Trabalhos_UJAC/Delson_PS/src/components/ui/FloatingActionButton.tsx`

**Props:**
- `children?: ReactNode` (default: Plus icon)
- `tone?: "navy" | "rose" | "dark"`
- Atributos HTML `<button>`

**Posicionamento:** Fixed bottom-5/right-5 (md: bottom-8/right-8)

---

## 3. COMPONENTES DE LAYOUT

### 3.1 Localização e Exportação

**Directório:** `/home/paco/Trabalhos_UJAC/Delson_PS/src/components/layout/`

**Ficheiro de Exportação:** `/home/paco/Trabalhos_UJAC/Delson_PS/src/components/layout/index.ts`

```typescript
export { AppLogo } from "./AppLogo";
export { AppShell } from "./AppShell";
export { AuthLayout } from "./AuthLayout";
export { BrandMark } from "./BrandMark";
export { DashboardLayout } from "./DashboardLayout";
export { MobileDrawer } from "./MobileDrawer";
export { MobileHeader } from "./MobileHeader";
export { MobileShell } from "./MobileShell";
export { Sidebar } from "./Sidebar";
export { TopBar } from "./TopBar";
export type { NavItem } from "./Sidebar";
```

### 3.2 Componentes de Shell

#### AuthLayout
**Ficheiro:** `/home/paco/Trabalhos_UJAC/Delson_PS/src/components/layout/AuthLayout.tsx`

**Props:**
- `children: ReactNode`

**Features:**
- Full-height flexbox centered
- Ícones decorativos (Languages, MessageCircle, Quote)
- Cores: crimson/10 e navy/10 transparency

#### AppShell
**Ficheiro:** `/home/paco/Trabalhos_UJAC/Delson_PS/src/components/layout/AppShell.tsx`

**Props:**
- `children: ReactNode`
- `navItems: NavItem[]`
- `title: string`
- `subtitle?: string`
- `context: string`
- `darkSidebar?: boolean`
- `sidebarFooter?: ReactNode`
- `headerAction?: ReactNode`

**Features:**
- Sidebar + MobileShell layout
- Estado mobile drawer com useState
- Responsivo com breakpoint lg

#### DashboardLayout
**Ficheiro:** `/home/paco/Trabalhos_UJAC/Delson_PS/src/components/layout/DashboardLayout.tsx`

**Props:** Wrapper de AppShell com mesmas props

### 3.3 Componentes de Navegação

#### Sidebar
**Ficheiro:** `/home/paco/Trabalhos_UJAC/Delson_PS/src/components/layout/Sidebar.tsx`

**Props:**
- `items: NavItem[]`
- `context: string`
- `dark?: boolean`
- `open: boolean`
- `onClose: () => void`
- `footer?: React.ReactNode`

**NavItem Type:**
```typescript
type NavItem = {
  label: string;
  href: string;
  icon: NavIcon;
  active?: boolean;
};
```

**Icon Map Available:**
- `book`, `calendar`, `chart`, `dashboard`, `file`, `graduation`
- `history`, `message`, `mic`, `pen`, `shield`
- `userCheck`, `userPlus`, `users`, `wallet`

**Features:**
- Fixed mobile (w-72), static desktop (w-64)
- Smooth transitions (-translate-x-full)
- Backdrop overlay em mobile
- BrandMark no topo

#### MobileShell
**Ficheiro:** `/home/paco/Trabalhos_UJAC/Delson_PS/src/components/layout/MobileShell.tsx`

**Props:**
- `title: string`
- `subtitle?: string`
- `children: ReactNode`
- `onMenuClick: () => void`
- `action?: ReactNode`

#### MobileHeader
**Ficheiro:** `/home/paco/Trabalhos_UJAC/Delson_PS/src/components/layout/MobileHeader.tsx`

**Componente de cabeçalho mobile com hamburguer**

#### TopBar
**Ficheiro:** `/home/paco/Trabalhos_UJAC/Delson_PS/src/components/layout/TopBar.tsx`

**Barra de topo para desktop**

### 3.4 Componentes de Branding

#### BrandMark
**Ficheiro:** `/home/paco/Trabalhos_UJAC/Delson_PS/src/components/layout/BrandMark.tsx`

**Props:**
- `context: string` (ex: "Super Admin", "Portal Docente")
- `dark?: boolean`

**Features:** Logo com context label

#### AppLogo
**Ficheiro:** `/home/paco/Trabalhos_UJAC/Delson_PS/src/components/layout/AppLogo.tsx`

**Props:**
- `variant?: "auth" | "dashboard"`
- `className?: string`

---

## 4. ESTRUTURA DE ROTAS

### 4.1 Rotas Públicas

| Rota | Ficheiro | Descrição |
|------|----------|-----------|
| `/` | `src/app/page.tsx` | Redirect para `/login` |
| `/login` | `src/app/login/page.tsx` | Página de autenticação |
| `/logout` | `src/app/logout/route.ts` | Endpoint de logout |

### 4.2 Rotas Protegidas (Admin/Super Admin)

**Base:** `/admin/` - Requer roles: `SUPER_ADMIN` ou `ADMIN`

| Rota | Ficheiro | Descrição |
|------|----------|-----------|
| `/admin/dashboard` | `src/app/admin/dashboard/page.tsx` | Painel de controlo master |
| `/admin/students` | `src/app/admin/students/page.tsx` | CRUD alunos + matrículas |
| `/admin/staff` | `src/app/admin/staff/page.tsx` | CRUD professores/admins |
| `/admin/courses` | `src/app/admin/courses/page.tsx` | CRUD cursos |
| `/admin/classes` | `src/app/admin/classes/page.tsx` | CRUD turmas |
| `/admin/logs` | `src/app/admin/logs/page.tsx` | Auditoria/logs |
| `/admin/receipts/[id]` | `src/app/admin/receipts/[id]/page.tsx` | Visualização/impressão recibos |

### 4.3 Rotas Protegidas (Teacher)

**Base:** `/teacher/` - Requer roles: `SUPER_ADMIN`, `ADMIN`, ou `TEACHER`

| Rota | Ficheiro | Descrição |
|------|----------|-----------|
| `/teacher/dashboard` | `src/app/teacher/dashboard/page.tsx` | Dashboard docente (notas, presença) |

### 4.4 Rotas Protegidas (Student)

**Base:** `/student/` - Requer roles: `SUPER_ADMIN`, `ADMIN`, ou `STUDENT`

| Rota | Ficheiro | Descrição |
|------|----------|-----------|
| `/student/dashboard` | `src/app/student/dashboard/page.tsx` | Dashboard aluno (notas, fichas, tesouraria) |

### 4.5 Rotas de Debate (TEACHER/ADMIN)

**Base:** `/debate/` - Requer roles: `SUPER_ADMIN`, `ADMIN`, ou `TEACHER`

| Rota | Ficheiro | Descrição |
|------|----------|-----------|
| `/debate` | `src/app/debate/page.tsx` | Listagem de sessões de debate |
| `/debate/[id]` | `src/app/debate/[id]/page.tsx` | Detalhe de sessão e avaliação |

### 4.6 Estrutura Arquivo

```
src/app/
├── layout.tsx (root layout com metadata)
├── globals.css (estilos globais)
├── page.tsx (redirect /login)
├── login/
│   └── page.tsx
├── logout/
│   └── route.ts
├── admin/
│   ├── dashboard/
│   │   └── page.tsx
│   ├── students/
│   │   └── page.tsx
│   ├── staff/
│   │   └── page.tsx
│   ├── courses/
│   │   └── page.tsx
│   ├── classes/
│   │   └── page.tsx
│   ├── logs/
│   │   └── page.tsx
│   └── receipts/
│       └── [id]/
│           └── page.tsx
├── teacher/
│   └── dashboard/
│       └── page.tsx
├── student/
│   └── dashboard/
│       └── page.tsx
├── debate/
│   ├── page.tsx
│   └── [id]/
│       └── page.tsx
└── api/
    └── v1/
        ├── attendance/
        ├── classes/
        ├── courses/
        ├── debates/
        ├── enrollments/
        ├── grades/
        ├── invoices/
        ├── students/
        └── users/
```

---

## 5. PÁGINAS POR ROLE

### 5.1 Super Admin / Admin Dashboard

**Ficheiro:** `/home/paco/Trabalhos_UJAC/Delson_PS/src/app/admin/dashboard/page.tsx`

**Componentes Principais:**
- MetricCard: Média Global (navy), Taxa Presença (navy), Média Debate (rose), Receita Paga (dark)
- 4 PrimaryButtons: Gerir Alunos, Gerir Staff, Gerir Cursos, Gerir Turmas
- BentoCard: Últimas Matrículas (DataTable)
- BentoCard: Faturas Recentes com UpdateInvoiceStatus actions
- BentoCard: Auditoria com AdminLine components

**Data Fetched:**
- `studentCount`, `courseCount`, `classCount`, `staffCount`
- `paidAggregate`, `pendingAggregate`
- `latestEnrollments`, `invoices`, `auditLogs`
- `allGrades`, `allDebates`, `allAttendances`

**NavItems:** Via `adminNavigation("/admin/dashboard")`

### 5.2 Super Admin / Admin Students

**Ficheiro:** `/home/paco/Trabalhos_UJAC/Delson_PS/src/app/admin/students/page.tsx`

**Formulários:**
1. "Novo Aluno" - name, email, studentNumber, level, phone, guardianName
2. "Nova Matrícula" - studentId, courseId, classGroupId, status, monthlyFeeMt, dueDate
3. "Histórico" - ListaDataTable com últimas matrículas

**Tabela Principal:**
- Headers: Identidade, Contacto, Dados Académicos, Ações
- Inline editing com UpdateStudentAction
- Toggle Ativar/Desativar

### 5.3 Super Admin / Admin Staff

**Ficheiro:** `/home/paco/Trabalhos_UJAC/Delson_PS/src/app/admin/staff/page.tsx`

**Formulário:**
- name, email, staffNumber, specialty, role (Admin/Teacher)

**Tabela:**
- Headers: Nome, Email, Role, Especialidade, Ações

### 5.4 Super Admin / Admin Courses

**Ficheiro:** `/home/paco/Trabalhos_UJAC/Delson_PS/src/app/admin/courses/page.tsx`

**Formulário:**
- title, level, duration, description

**Tabela:**
- Headers: Curso, Nível, Estado, Ações

### 5.5 Super Admin / Admin Classes

**Ficheiro:** `/home/paco/Trabalhos_UJAC/Delson_PS/src/app/admin/classes/page.tsx`

**Formulário:**
- name, schedule, room, courseId, teacherId

**Tabela:**
- Headers: Turma, Curso, Docente, Sala, Horário, Ações

### 5.6 Teacher Dashboard

**Ficheiro:** `/home/paco/Trabalhos_UJAC/Delson_PS/src/app/teacher/dashboard/page.tsx`

**Seções:**
1. **Lançamento de Notas** - DataTable com Estudante, Média Atual, Faltas, Nota (input 0-20)
2. **Chamada Rápida** - Repetição de forms com status PRESENT/ABSENT/LATE/EXCUSED
3. **Atividades** - 3 Activity cards com icon, title, detail

**Componentes:**
- ActionNotice (status feedback)
- PrimaryButton com Save icon
- Activity helper component

**NavItems:** Via `teacherNav` (mock-data)

**Data:** Via `getCurrentSession()` + `prisma.teacherProfile`

### 5.7 Student Dashboard

**Ficheiro:** `/home/paco/Trabalhos_UJAC/Delson_PS/src/app/student/dashboard/page.tsx`

**Seções Principais:**
1. **Progresso Global** - BentoCard grande com Speaking Skills e Writing Mastery progress bars
2. **Tesouraria** - Gradient card (navy to blue) com saldo pendente
3. **Métricas** - 4 MetricCards: Cursos Ativos, Debate Skills, Faltas, Suporte

**Debate Profile Enrichment:**
- Histórico de Sessões (data, média)
- Skills Radar (Fluência, Argumentação, Postura percentuais)
- Último Feedback (citação)

**Tabelas:**
- Faturas & Recibos (reference, valor, estado, recibo link)
- Minhas Notas (atividade, nota, máximo, data)

**NavItems:** Via `studentNav` (mock-data)

**Dark Sidebar:** Sim

### 5.8 Debate Arena

**Ficheiro:** `/home/paco/Trabalhos_UJAC/Delson_PS/src/app/debate/page.tsx`

**Features:**
1. **Next Session Card** - BentoCard dark com tema, data/hora, inscritos/capacidade
2. **Schedule Debate Form** (Teacher/Admin only) - topic, startsAt, capacity, location, moderatorId
3. **Session History** - DataTable: Tema, Data, Moderador, Estado, Ver/Avaliar button

**Access Control:**
- Teachers/Admins: Todas as sessões
- Students: Apenas sessões onde participam ou moderadas

**NavItems:** Via `debateNav` (mock-data)

**Debate Session Detail:**
**Ficheiro:** `/home/paco/Trabalhos_UJAC/Delson_PS/src/app/debate/[id]/page.tsx`

- DebateParticipantList component
- EvaluationModal component
- Session status: SCHEDULED, ACTIVE, CLOSED

### 5.9 Login

**Ficheiro:** `/home/paco/Trabalhos_UJAC/Delson_PS/src/app/login/page.tsx`

**Layout:** AuthLayout com decorative icons

**Formulário:**
- Email (placeholder: super.admin.teste@delsonps.local)
- Password (masked)
- Esqueci-me link (não funcional)
- Error message conditional

**CTA:** PrimaryButton "Entrar no Portal" (tone="dark", full width)

**Footer:** Info text "Sprint 1 · Acesso mockado · PT-PT / EN-US preparado"

---

## 6. MIDDLEWARE E AUTENTICAÇÃO

### 6.1 Middleware de Roteamento

**Ficheiro:** `/home/paco/Trabalhos_UJAC/Delson_PS/src/middleware.ts`

**Função:** Proteger rotas por role

```typescript
const access = {
  "/admin": ["SUPER_ADMIN", "ADMIN"],
  "/teacher": ["SUPER_ADMIN", "ADMIN", "TEACHER"],
  "/student": ["SUPER_ADMIN", "ADMIN", "STUDENT"],
  "/debate": ["SUPER_ADMIN", "ADMIN", "TEACHER"]
}
```

**Comportamento:**
1. Se em `/login` e autenticado → redirect para `routeForRole(role)`
2. Se em rota protegida sem sessão → redirect para `/login`
3. Se em rota sem permissão → redirect para `routeForRole(role)`

**Matcher Config:**
```typescript
matcher: ["/login", "/admin/:path*", "/teacher/:path*", "/student/:path*", "/debate/:path*"]
```

### 6.2 Session Management

**Ficheiro:** `/home/paco/Trabalhos_UJAC/Delson_PS/src/features/auth/session.ts`

**SessionPayload Type:**
```typescript
type SessionPayload = {
  userId: string;
  name: string;
  email: string;
  role: Role; // SUPER_ADMIN | ADMIN | TEACHER | STUDENT
  exp: number;
}
```

**Funções:**
- `createSessionToken(payload)` - Gera JWT com HMAC-SHA256
- `verifySessionToken(token)` - Valida assinatura e expiração
- `routeForRole(role)` - Retorna rota default por role

**Cookie:** `delson_ps_session`

**TTL:** 8 horas

**Secret:** `process.env.AUTH_SECRET ?? "dev-only-delson-ps-change-me"`

### 6.3 Features de Autenticação

**Directório:** `/home/paco/Trabalhos_UJAC/Delson_PS/src/features/auth/`

**Ficheiros:**
- `actions.ts` - Server actions: `loginAction`
- `current-user.ts` - `getCurrentSession()` helper
- `password.ts` - Hashing/validation
- `session.ts` - Token management

---

## 7. NAVEGAÇÃO POR ROLE

### 7.1 Admin Navigation

**Ficheiro:** `/home/paco/Trabalhos_UJAC/Delson_PS/src/lib/mock-data.ts`

```typescript
export const adminNav: NavItem[] = [
  { label: "Dashboard Central", href: "/admin/dashboard", icon: "dashboard", active: true },
  { label: "Registo de Alunos", href: "/admin/students", icon: "userPlus" },
  { label: "Gestao de Turmas", href: "/admin/classes", icon: "users" },
  { label: "Gestao de Staff", href: "/admin/staff", icon: "shield" },
  { label: "Cursos", href: "/admin/courses", icon: "book" },
  { label: "Financeiro MT", href: "/admin/dashboard", icon: "wallet" },
  { label: "Logs de Auditoria", href: "/admin/dashboard", icon: "history" }
];
```

**Activação:** Via `adminNavigation(activeHref)` em `/home/paco/Trabalhos_UJAC/Delson_PS/src/features/admin/nav.ts`

### 7.2 Teacher Navigation

```typescript
export const teacherNav: NavItem[] = [
  { label: "Minhas Turmas", href: "/teacher/dashboard", icon: "users", active: true },
  { label: "Lancar Notas", href: "/teacher/dashboard", icon: "pen" },
  { label: "Chamada Rapida", href: "/teacher/dashboard", icon: "userCheck" },
  { label: "Enviar Fichas", href: "/teacher/dashboard", icon: "file" },
  { label: "Debates", href: "/debate", icon: "mic" }
];
```

### 7.3 Student Navigation

```typescript
export const studentNav: NavItem[] = [
  { label: "Dashboard", href: "/student/dashboard", icon: "dashboard", active: true },
  { label: "Inscricoes", href: "/student/dashboard", icon: "userPlus" },
  { label: "Cursos", href: "/student/dashboard", icon: "graduation" },
  { label: "Fichas de Estudo", href: "/student/dashboard", icon: "file" },
  { label: "Notas e Faltas", href: "/student/dashboard", icon: "chart" },
  { label: "Tesouraria", href: "/student/dashboard", icon: "wallet" }
];
```

### 7.4 Debate Navigation

```typescript
export const debateNav: NavItem[] = [
  { label: "Sessoes de Debate", href: "/debate", icon: "calendar", active: true },
  { label: "Banco de Alunos", href: "/debate", icon: "graduation" },
  { label: "Historico", href: "/debate", icon: "history" },
  { label: "Feedback", href: "/teacher/dashboard", icon: "message" }
];
```

---

## 8. UTILITÁRIOS E HELPERS

### 8.1 Classificação de Nomes (cn)

**Ficheiro:** `/home/paco/Trabalhos_UJAC/Delson_PS/src/lib/cn.ts`

```typescript
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
```

Uso: Merge condicional de classes Tailwind

### 8.2 Prisma Client

**Ficheiro:** `/home/paco/Trabalhos_UJAC/Delson_PS/src/lib/prisma.ts`

Singleton para conexão com PostgreSQL

### 8.3 API Response Helper

**Ficheiro:** `/home/paco/Trabalhos_UJAC/Delson_PS/src/lib/api-response.ts`

Formatação de respostas API v1

### 8.4 API Auth

**Ficheiro:** `/home/paco/Trabalhos_UJAC/Delson_PS/src/lib/api-auth.ts`

Verificação de token para endpoints API

---

## 9. ESTRUTURA DE FEATURES/ACTIONS

### 9.1 Admin Actions

**Ficheiro:** `/home/paco/Trabalhos_UJAC/Delson_PS/src/features/admin/actions.ts`

**Server Actions Disponíveis:**
- `createStudentAction`
- `updateStudentAction`
- `setStudentActiveAction`
- `createEnrollmentAction`
- `updateEnrollmentStatusAction`
- `createStaffAction`
- `updateStaffAction`
- `setStaffActiveAction`
- `createCourseAction`
- `updateCourseAction`
- `setCourseActiveAction`
- `createClassGroupAction`
- `updateClassGroupAction`
- `setClassGroupActiveAction`
- `updateInvoiceStatusAction`

**Padrão:** Validação RBAC + Auditoria automática

### 9.2 Teacher Actions

**Ficheiro:** `/home/paco/Trabalhos_UJAC/Delson_PS/src/features/teacher/actions.ts`

- `saveGradeAction`
- `saveAllGradesAction`
- `saveAttendanceAction`

### 9.3 Debate Actions

**Ficheiro:** `/home/paco/Trabalhos_UJAC/Delson_PS/src/features/debate/actions.ts`

- `createDebateSessionAction`
- `joinDebateSessionAction`
- `evaluateDebateParticipantAction`
- `updateDebateSessionStatusAction`

### 9.4 Auth Actions

**Ficheiro:** `/home/paco/Trabalhos_UJAC/Delson_PS/src/features/auth/actions.ts`

- `loginAction`
- `logoutAction`

---

## 10. API ENDPOINTS (v1)

**Base:** `/api/v1/`

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/attendance` | POST | Criar/atualizar presença |
| `/classes` | GET/POST | CRUD turmas |
| `/courses` | GET/POST | CRUD cursos |
| `/debates` | GET/POST | CRUD sessões debate |
| `/enrollments` | POST | Criar matrícula |
| `/grades` | POST | Lançar nota |
| `/invoices` | GET/POST | CRUD faturas |
| `/students` | GET/POST | CRUD alunos |
| `/users` | GET/POST | CRUD utilizadores |

---

## 11. PADRÕES E CONVENÇÕES

### 11.1 Nomes de Componentes

- **UI:** PascalCase, ex: `PrimaryButton`, `FormField`, `StatusBadge`
- **Páginas:** `page.tsx` em app router
- **Layout:** `*Layout.tsx` ou `*Shell.tsx`
- **Server Actions:** `*Action` suffix (camelCase)

### 11.2 Propriedades Tailwind Customizadas

```
Colors:
- navy (primary)
- crimson (secondary)
- slate (neutrals)
- emerald (success)
- amber (warning)
- rose (danger)

Shadows:
- shadow-soft
- shadow-card

Border Radius:
- rounded-2xl (default buttons/cards)
- rounded-[1.5rem] (inputs/modals)
- rounded-[2rem] ou rounded-[2.5rem] (BentoCards)
- rounded-[3rem] (premium elements)
```

### 11.3 Font Sizes

- `text-[10px]` - Labels
- `text-[11px]` - Helper text
- `text-xs` - Small body
- `text-sm` - Normal body
- `text-lg` - Subtitles
- `text-xl` - Page titles
- `text-2xl` - Large values
- `text-4xl` - Hero sizes

### 11.4 Espaçamento

- `gap-2` - Tight (form elements)
- `gap-3` - Normal (card content)
- `gap-4` - Comfortable (sections)
- `gap-5` ou `gap-6` - Large (page sections)
- `p-4` / `p-5` / `p-6` - Padding interno cards
- `p-8` - Desktop desktop large cards

---

## 12. DEPENDÊNCIAS CRÍTICAS

| Pacote | Versão | Propósito |
|--------|--------|----------|
| next | 14.2.23 | Framework (App Router) |
| react | 18.3.1 | UI Framework |
| react-dom | 18.3.1 | DOM rendering |
| @prisma/client | 5.22.0 | Database ORM |
| tailwindcss | 3.4.17 | Utility CSS |
| lucide-react | 0.468.0 | Icon library |

---

## 13. ESTRUTURA DE FICHEIROS RESUMIDA

```
src/
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── page.tsx
│   ├── login/page.tsx
│   ├── logout/route.ts
│   ├── admin/
│   ├── teacher/
│   ├── student/
│   ├── debate/
│   └── api/v1/
├── components/
│   ├── ui/ (14 componentes reutilizáveis)
│   └── layout/ (10 componentes de layout)
├── features/
│   ├── admin/
│   ├── auth/
│   ├── debate/
│   └── teacher/
├── lib/
│   ├── cn.ts
│   ├── prisma.ts
│   ├── mock-data.ts
│   ├── api-auth.ts
│   └── api-response.ts
├── middleware.ts
└── i18n/config.ts
```

---

## 14. DIAGRAMA DE FLUXO DE ACESSO

```
Utilizador
    ↓
[/] redirect
    ↓
[/login] (AuthLayout + FormField + PrimaryButton)
    ↓
loginAction (authenticate)
    ↓
createSessionToken
    ↓
Middleware verifica role
    ↓
┌─────────────────────────────────────────────────────────┐
│ Routing por Role                                        │
├──────────────────┬──────────────────┬──────────────────┤
│ SUPER_ADMIN/ADMIN│ TEACHER          │ STUDENT          │
│ /admin/dashboard │ /teacher/...     │ /student/...     │
│ (DashboardLayout)│ (DashboardLayout)│ (DashboardLayout)│
│                  │ + dark sidebar   │ + dark sidebar   │
│ - AdminNav       │ - TeacherNav     │ - StudentNav     │
│ - 7 page routes  │ - 1 page route   │ - 1 page route   │
│ - CRUD controls  │ - Grades/Attend. │ - Grades/Finan.  │
│ - Finance        │ - Debate access  │ - Debate access  │
│ - Audit logs     │                  │                  │
└──────────────────┴──────────────────┴──────────────────┘
```

---

## 15. NOTAS FINAIS

### Status Sprint Final
- **Todas as rotas funcionais e protegidas**
- **Componentes UI com loading states nativos**
- **Design system consistente (Navy + Crimson)**
- **Responsividade testada (mobile, tablet, desktop)**
- **RBAC rigoroso em middleware e server actions**
- **Auditoria automática de todas as ações críticas**

### Próximas Prioridades
1. Sincronização bidireccional UNIEXE (pendente credenciais)
2. Filtros avançados dashboard (por data, por turma, etc)
3. Testes E2E com Cypress/Playwright
4. Deploy em produção

---

**Análise Concluída: 04 de Maio de 2026**
**Agente Responsável: Analisador de Estrutura**
