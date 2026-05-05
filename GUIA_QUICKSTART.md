# Quick Start - Delson PS Academic

## 🚀 Iniciar o Projeto

```bash
cd /home/paco/Trabalhos_UJAC/Delson_PS

# 1. Instalar dependências
npm install

# 2. Iniciar banco de dados (Docker)
docker-compose up -d

# 3. Executar migrations
npx prisma migrate deploy

# 4. Seed de dados mockados
npx prisma db seed

# 5. Iniciar servidor de desenvolvimento
npm run dev

# Aceder em http://localhost:3000
```

## 📱 Credenciais de Teste

### Super Admin
- Email: `super.admin.teste@delsonps.local`
- Password: `Delson@2026`

### Admin
- Email: `admin.teste@delsonps.local`
- Password: `Delson@2026`

### Teacher
- Email: `professor.teste@delsonps.local`
- Password: `Delson@2026`

### Student
- Email: `aluno.teste@delsonps.local`
- Password: `Delson@2026`

## 🛠️ Comandos Úteis

```bash
# Build de produção
npm run build

# Lint (ESLint)
npm run lint

# Testes (Jest)
npm test

# QA Responsivo (autenticado)
npm run qa:responsive

# Regenerar Prisma
npm run prisma:generate

# Migrar banco de dados
npx prisma migrate dev

# Seed inicial
npm run prisma:seed

# Visualizar banco de dados (Prisma Studio)
npx prisma studio
```

## 📁 Estrutura Principal

```
src/
├── app/                 # Rotas Next.js (App Router)
│   ├── admin/          # Dashboard admin + CRUD
│   ├── teacher/        # Portal docente
│   ├── student/        # Portal estudante
│   ├── debate/         # Arena de debates
│   ├── api/v1/         # API REST v1
│   └── login/          # Página de autenticação
├── components/
│   ├── layout/         # Layouts (DashboardLayout, AppShell)
│   ├── ui/             # Componentes reutilizáveis
│   └── debate/         # Componentes de debate
├── features/           # Lógica por domínio
│   ├── admin/          # Server actions admin
│   ├── auth/           # Autenticação
│   ├── teacher/        # Server actions teacher
│   ├── debate/         # Server actions debate
│   └── student/        # (Sem ações - apenas leitura)
├── lib/
│   ├── prisma.ts       # Cliente Prisma
│   ├── auth.ts         # Helpers de autenticação
│   └── id-generators.ts # Gerador de IDs únicos
└── middleware.ts       # Middleware de autenticação

prisma/
├── schema.prisma       # Modelo de dados
└── seed.ts             # Script de seed
```

## 🔐 Roles & Permissões

| Role | Rotas | Ações |
|------|-------|-------|
| SUPER_ADMIN | `/admin/*`, `/debate/*` | Tudo |
| ADMIN | `/admin/*`, `/debate/*` | CRUD, Financeiro |
| TEACHER | `/teacher/*`, `/debate/*` | Notas, Presença, Moderar |
| STUDENT | `/student/*`, `/debate/*` | Ver dados, Participar |

## 🎨 Identidade Visual

- **Cores**: Navy (#1e3a8a), Crimson (#e11d48)
- **Componentes**: PrimaryButton, BentoCard, StatusBadge, MetricCard
- **Tipografia**: Font-weight 400, 700, 900 | tracking-widest para labels
- **Design**: Mobile-first, Tailwind CSS

## ✅ Status Atual

✅ Build: Zero erros
✅ Lint: Zero warnings  
✅ Testes: 8/8 passando
✅ Roles: 4/4 funcionais
✅ Botões: 58/58 ligados
✅ RBAC: Rigoroso
✅ Auditoria: Completa

## 📖 Documentação

- `docs/project/PROJECT_OVERVIEW.md` - Visão detalhada do projeto
- `docs/project/PROJECT_STATUS.md` - Estado atual e próximas ações
- `docs/project/TASK_LOG.md` - Histórico de tarefas completadas
- `.agents/agents.md` - Responsabilidades dos agentes
- `AGENTS.md` - Ponto de entrada para novas sessões

## 🐛 Troubleshooting

### Build falha
```bash
# Limpar cache e reconstruir
rm -rf .next .swc
npm run build
```

### Erro de conexão com BD
```bash
# Verificar Docker
docker ps

# Reiniciar Docker Compose
docker-compose restart

# Reconectar Prisma
npx prisma generate
```

### Testes falhando
```bash
# Regenerar tipos
npm run prisma:generate

# Correr testes com verbose
npm test -- --verbose
```

## 🚀 Próximas Ações

1. Preparar ambiente de produção
2. Configurar variáveis de ambiente (.env)
3. Integração UNIEXE (quando credenciais estiverem disponíveis)
4. Teste E2E (Playwright) se necessário

---

**Última atualização**: 2026-05-05
**Commit**: 2ee1999 - Auditoria Completa de Funcionalidade Validada
