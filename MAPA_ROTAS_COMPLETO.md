# Mapa Completo de Rotas - Delson PS Academic

## Rotas Públicas

```
GET  /                  → Redirect para /login
GET  /login             → AuthLayout + FormField + PrimaryButton
                           (src/app/login/page.tsx)
POST /api/logout        → Endpoint logout (src/app/logout/route.ts)
```

---

## Rotas Protegidas por RBAC

### Admin / Super Admin Routes (`/admin/*`)

**Middleware RBAC:** Requer `SUPER_ADMIN` ou `ADMIN`

```
GET  /admin/dashboard       → Painel de controlo master
                               4 MetricCards + 3 DataTables
                               (src/app/admin/dashboard/page.tsx)

GET  /admin/students        → CRUD alunos + matrículas
                               Formulário: nome, email, level, phone
                               Tabela: identidade, contacto, dados, ações
                               (src/app/admin/students/page.tsx)

GET  /admin/staff           → CRUD professores/admins
                               Formulário: nome, email, role
                               Tabela: nome, email, role, especialidade
                               (src/app/admin/staff/page.tsx)

GET  /admin/courses         → CRUD cursos
                               Formulário: título, nível, duração
                               Tabela: curso, nível, estado, ações
                               (src/app/admin/courses/page.tsx)

GET  /admin/classes         → CRUD turmas
                               Formulário: nome, horário, sala, docente
                               Tabela: turma, curso, docente, ações
                               (src/app/admin/classes/page.tsx)

GET  /admin/logs            → Auditoria / Logs
                               DataTable com histórico de ações
                               (src/app/admin/logs/page.tsx)

GET  /admin/receipts/[id]   → Visualização e impressão de recibos
                               Detalhe de fatura com PDF
                               (src/app/admin/receipts/[id]/page.tsx)
```

### Teacher Routes (`/teacher/*`)

**Middleware RBAC:** Requer `TEACHER` (ou `SUPER_ADMIN`, `ADMIN`)

```
GET  /teacher/dashboard     → Dashboard docente
                               Lançamento de notas (DataTable interativa)
                               Chamada rápida (presença por aluno)
                               Atividades diárias
                               Dark sidebar
                               (src/app/teacher/dashboard/page.tsx)
```

### Student Routes (`/student/*`)

**Middleware RBAC:** Requer `STUDENT` (ou `SUPER_ADMIN`, `ADMIN`)

```
GET  /student/dashboard     → Dashboard aluno
                               Progresso global (barras de progresso)
                               Tesouraria (saldo pendente)
                               Debate Profile (histórico + skills)
                               Tabelas: Faturas & Recibos + Notas
                               Dark sidebar
                               (src/app/student/dashboard/page.tsx)
```

### Debate Routes (`/debate/*`)

**Middleware RBAC:** Requer `TEACHER` (ou `SUPER_ADMIN`, `ADMIN`)

```
GET  /debate                → Listagem de sessões de debate
                               Próxima sessão em destaque (BentoCard dark)
                               Formulário agendar debate (Teacher only)
                               DataTable histórico com status
                               (src/app/debate/page.tsx)

GET  /debate/[id]           → Detalhe de sessão de debate
                               DebateParticipantList
                               EvaluationModal
                               Status: SCHEDULED, ACTIVE, CLOSED
                               (src/app/debate/[id]/page.tsx)
```

---

## API Routes (`/api/v1/*`)

### Authentication
```
POST /api/logout            → Logout endpoint
```

### Attendance
```
POST /api/v1/attendance     → Registar/atualizar presença de aluno
```

### Classes
```
GET  /api/v1/classes        → Listar turmas
POST /api/v1/classes        → Criar turma
```

### Courses
```
GET  /api/v1/courses        → Listar cursos
POST /api/v1/courses        → Criar curso
```

### Debates
```
GET  /api/v1/debates        → Listar sessões de debate
POST /api/v1/debates        → Criar sessão de debate
```

### Enrollments
```
POST /api/v1/enrollments    → Criar matrícula com faturação
```

### Grades
```
POST /api/v1/grades         → Lançar nota
```

### Invoices
```
GET  /api/v1/invoices       → Listar faturas
POST /api/v1/invoices       → Criar/atualizar fatura
```

### Students
```
GET  /api/v1/students       → Listar alunos
POST /api/v1/students       → Criar aluno
```

### Users
```
GET  /api/v1/users          → Listar utilizadores
POST /api/v1/users          → Criar utilizador
```

---

## Middleware de Rotas

**Ficheiro:** `src/middleware.ts`

**Matcher:**
```typescript
matcher: [
  "/login",
  "/admin/:path*",
  "/teacher/:path*",
  "/student/:path*",
  "/debate/:path*"
]
```

**Access Control Matrix:**
```
┌─────────────────┬──────────────────┬──────────────────┬──────────┐
│ Rota            │ SUPER_ADMIN      │ ADMIN            │ TEACHER  │
├─────────────────┼──────────────────┼──────────────────┼──────────┤
│ /admin/*        │ ✓ Full Access    │ ✓ Full Access    │ ✗        │
│ /teacher/*      │ ✓ Full Access    │ ✓ Full Access    │ ✓        │
│ /student/*      │ ✓ Full Access    │ ✓ Full Access    │ ✗        │
│ /debate/*       │ ✓ Full Access    │ ✓ Full Access    │ ✓        │
└─────────────────┴──────────────────┴──────────────────┴──────────┘

┌─────────────────┬──────────────────┐
│ Rota            │ STUDENT          │
├─────────────────┼──────────────────┤
│ /admin/*        │ ✗ Redirect       │
│ /teacher/*      │ ✗ Redirect       │
│ /student/*      │ ✓ Full Access    │
│ /debate/*       │ ✓ Limited (Own)  │
└─────────────────┴──────────────────┘
```

**Comportamentos:**
1. Utilizador não autenticado em rota protegida → Redirect `/login`
2. Utilizador em `/login` autenticado → Redirect para `routeForRole(role)`
3. Utilizador sem permissão → Redirect para `routeForRole(role)` default

---

## Routing por Role (Default Landing)

**Ficheiro:** `src/features/auth/session.ts`

```typescript
routeForRole(role) {
  SUPER_ADMIN  → /admin/dashboard
  ADMIN        → /admin/dashboard
  TEACHER      → /teacher/dashboard
  STUDENT      → /student/dashboard
}
```

---

## Estrutura de Pastas App Router

```
src/app/
├── layout.tsx                     (Root layout com metadata)
├── globals.css                    (Estilos globais)
├── page.tsx                       (Redirect /)
│
├── login/
│   └── page.tsx                   (Página de login)
│
├── logout/
│   └── route.ts                   (API route)
│
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
│
├── teacher/
│   └── dashboard/
│       └── page.tsx
│
├── student/
│   └── dashboard/
│       └── page.tsx
│
├── debate/
│   ├── page.tsx
│   └── [id]/
│       └── page.tsx
│
└── api/
    └── v1/
        ├── attendance/
        │   └── route.ts
        ├── classes/
        │   └── route.ts
        ├── courses/
        │   └── route.ts
        ├── debates/
        │   └── route.ts
        ├── enrollments/
        │   └── route.ts
        ├── grades/
        │   └── route.ts
        ├── invoices/
        │   └── route.ts
        ├── students/
        │   └── route.ts
        └── users/
            └── route.ts
```

---

## Server Actions por Rota

### Admin Dashboard
```
updateInvoiceStatusAction   → Update fatura de PENDING para PAID
```

### Admin Students
```
createStudentAction         → Criar novo aluno
updateStudentAction         → Editar dados aluno
setStudentActiveAction      → Ativar/desativar aluno
createEnrollmentAction      → Criar matrícula + gerar fatura
updateEnrollmentStatusAction → Update status matrícula
```

### Admin Staff
```
createStaffAction           → Criar professor/admin
updateStaffAction           → Editar dados staff
setStaffActiveAction        → Ativar/desativar staff
```

### Admin Courses
```
createCourseAction          → Criar curso
updateCourseAction          → Editar curso
setCourseActiveAction       → Ativar/desativar curso
```

### Admin Classes
```
createClassGroupAction      → Criar turma
updateClassGroupAction      → Editar turma
setClassGroupActiveAction   → Ativar/desativar turma
```

### Teacher Dashboard
```
saveGradeAction             → Lançar nota individual
saveAllGradesAction         → Lançar notas em massa
saveAttendanceAction        → Registar presença
```

### Debate
```
createDebateSessionAction           → Criar sessão
joinDebateSessionAction             → Aluno inscrever-se
evaluateDebateParticipantAction    → Avaliar (fluência, argumentação, postura)
updateDebateSessionStatusAction    → Mudar status (SCHEDULED → ACTIVE → CLOSED)
```

### Auth
```
loginAction                 → Autenticar utilizador
logoutAction                → Logout
```

---

## Query Parameters Suportados

### ActionNotice Status Flags

**Padrão:** `?status=<flag>`

```
Sucesso:
  created             → "Registo criado com sucesso."
  updated             → "Alterações guardadas."
  activated           → "Registo ativado."
  deactivated         → "Registo desativado."
  enrolled            → "Matrícula criada e fatura gerada."
  paid                → "Fatura marcada como paga."
  cancelled           → "Fatura cancelada."
  saved               → "Dados guardados."

Erro:
  error               → "Verifique os campos obrigatórios e tente novamente."
  duplicate_email     → "Este email já está em uso por outro utilizador."
  duplicate_student_number → "Este número de aluno já está registado."
  duplicate_staff_number   → "Este número de staff já está registado."
  duplicate_enrollment     → "Este aluno já está matriculado nesta turma."
  duplicate_attendance     → "Já existe um registo de presença..."
  duplicate_evaluation     → "Este aluno já foi avaliado nesta sessão."
```

---

## Estatísticas de Rotas

| Métrica | Quantidade |
|---------|-----------|
| Rotas Públicas | 2 |
| Rotas Protegidas Admin | 7 |
| Rotas Protegidas Teacher | 1 |
| Rotas Protegidas Student | 1 |
| Rotas Debate | 2 |
| API Endpoints | 9 |
| Server Actions | 24+ |
| **Total Rotas** | **22** |

---

## Padrão de Redirect

```
1. Utilizador não autenticado em rota protegida
   → Middleware redirect para /login

2. Utilizador autenticado em /login
   → Middleware redirect para routeForRole(role)

3. Utilizador sem permissão em rota
   → Middleware redirect para routeForRole(role) default

4. Auth failure
   → /login?error=true
   → ActionNotice: "Credenciais inválidas"
```

---

## Segurança por Rota

### JWT Session Token
- **Algoritmo:** HMAC-SHA256
- **TTL:** 8 horas
- **Cookie:** `delson_ps_session`
- **Validação:** Assinatura + Expiração

### RBAC Validation
- **Middleware:** Verifica role antes de dar acesso
- **Server Actions:** Valida RBAC novamente no backend
- **API Routes:** Require API token verification

### Auditoria
- Cada Server Action cria audit log (entity, action, userId, timestamp)
- Acessível em `/admin/logs`

---

**Documento Gerado:** 04 de Maio de 2026
**Status:** Pronto para Produção (Sprint Final)
