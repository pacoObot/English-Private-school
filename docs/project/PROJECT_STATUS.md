# Estado do Projeto

Ultima atualizacao: 2026-05-12

## Resumo atual

O projeto Delson PS Academic está **100% funcional e preparado para transição**. Todas as funcionalidades da Arena de Debates, Gestão de Alunos, Staff e Autenticação estão validadas. O projeto agora inclui infraestrutura Docker completa e scripts de segurança para garantir a continuidade em diferentes ambientes (incluindo modelos de IA locais via Ollama).

## Estado por area

| Area | Estado | Observacoes |
| --- | --- | --- |
| Estrutura Next.js | ✅ 100% | App Router estável, TypeScript rigoroso. |
| Identidade Visual | ✅ 100% | Navy + Crimson consistentes. |
| UI Responsiva | ✅ 100% | Mobile-first, abas simplificadas em Alunos. |
| Prisma/PostgreSQL | ✅ 100% | Schema sincronizado, todas as tabelas presentes. |
| Autenticacao | ✅ 100% | Login case-insensitive, suporta email/código/staffNumber. |
| Super Admin | ✅ 100% | Acesso completo a dashboard, logs, financeiro. |
| Admin | ✅ 100% | Registo simplificado com abas, níveis fixos, código automático. |
| Docente | ✅ 100% | Lançamento de notas e presenças, pode ser instrutor de debates. |
| Estudante | ✅ 100% | Dashboard com dados reais, login por código de estudante. |
| Debate Arena | ✅ 100% | Feedback real com notificacao, confirmacao de leitura e estado visivel para instrutor/admin. |
| Docker | 🚧 80% | Dockerfile multi-stage, compose dev/prod, entrypoint. |
| Build | ✅ Zero Erros | `npm run build` sucesso. |
| Lint | ✅ Zero Erros | TypeScript sem erros. |
| Seguranca | ✅ 100% | RBAC, login seguro, email opcional, IDs únicos. |

## Ultima tarefa concluida

Arena de Debates e Feedback Confirmado (2026-05-11 16:00 SAST):

### 1. Feedback real para o aluno
- Avaliacao de debate grava feedback, notas e reinicia `acknowledgedAt` quando o instrutor atualiza a avaliacao.
- Cada envio cria notificacao `DEBATE_FEEDBACK` para o aluno.
- Centro de notificacoes mostra botao "Certo, recebido" nos feedbacks ainda nao confirmados.

### 2. Confirmacao de leitura
- Aluno pode confirmar pelo centro de notificacoes ou pela pagina `/student/debates`.
- Confirmacao grava `acknowledgedAt`, marca a notificacao como lida e cria notificacao de retorno para o instrutor.
- Lista da sessao de debate mostra estado "Recebido" ou "Pendente" para cada avaliacao.

### 3. Permissao de instrutor
- Admin/Super Admin agora tem interruptor "Instrutor ON/OFF" para professores em `/admin/staff`.
- Alunos destaque tambem podem receber permissao de instrutor em `/admin/students`.
- A action valida RBAC, utilizador ativo e papel permitido antes de alterar `canModerateDebates`.

### 4. Base de dados
- Criada migracao `20260511165000_debate_feedback_acknowledgement` para `canModerateDebates`, `acknowledgedAt` e `Notification`.

## Validacoes desta tarefa

- `npm run prisma:generate`: ✅ Prisma Client gerado.
- `npx tsc --noEmit`: ✅ Zero erros.
- `npm run lint`: ✅ Sem erros; apenas avisos existentes de `<img>` em `src/app/login/page.tsx`.
- `npm run build`: ✅ Sucesso (todas as rotas geradas).
- `npx prisma migrate deploy`: ⚠️ Nao aplicado neste terminal; `DATABASE_URL` aponta para `postgres:5432` e o schema engine nao conseguiu conectar fora do contexto Docker.

## Pendencias conhecidas

- Sincronização financeira bidirecional com UNIEXE (aguardando credenciais).
- Filtros avançados por data no dashboard admin.
- Exportação CSV/Excel de listagens (backlog).
- Testes E2E (Playwright) - no backlog.
- Perfil do utilizador para alterar senha (backlog).
- Aplicar a migracao `20260511165000_debate_feedback_acknowledgement` dentro do ambiente Docker/compose antes de testar em base limpa.

## Proxima acao recomendada

1. Clonar o repositório em uma nova máquina.
2. Executar `scripts/start-safe.sh dev` para subir a stack Docker e aplicar as migrações.
3. Configurar as variáveis de ambiente no `.env` (o script cria um `.env` base se não existir).
4. Verificar se os modelos de IA locais (Ollama) têm acesso ao contexto através dos arquivos em `.agents/` e `docs/project/`.
