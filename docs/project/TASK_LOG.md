# Historico de Tarefas

## 2026-04-30 14:14 SAST - QA responsivo autenticado do Sprint 3

Resumo:
- Criado `scripts/qa-responsive.mjs` para executar QA autenticado via Chrome headless e DevTools Protocol sem novas dependencias.
- Adicionado `npm run qa:responsive` em `package.json`.
- Executado QA nas rotas `/admin/dashboard`, `/admin/students`, `/admin/staff`, `/admin/courses`, `/admin/classes`, `/teacher/dashboard` e `/student/dashboard`.
- Capturadas screenshots autenticadas em 360px, 390px, 430px, tablet e desktop dentro de `qa/screenshots`.
- Corrigido artefacto local de migration vazia removendo `prisma/migrations/20260429120000_sprint3_academic_ops`, que impedia `npx prisma migrate deploy`.
- Atualizado `docs/project/PROJECT_OVERVIEW.md` para refletir o estado real do Sprint 3.

Validacoes:
- `npm run prisma:generate`
- `npx prisma migrate deploy`
- `npm run prisma:seed`
- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`
- `npm run qa:responsive` retornou `checked: 35` e `overflowResults: []`

Pendencias:
- Criar testes automatizados especificos para Server Actions academicas.
- Refinar mensagens de erro de unicidade do Prisma nos formularios admin.
- Melhorar UX de formularios inline em listas longas.
- Atualizar READMEs de features conforme os modulos estabilizarem.

Proxima acao:
- Implementar testes automatizados para Server Actions academicas e cobrir fluxos de matricula, faturacao, notas e presencas.

## 2026-04-29 11:43 SAST - Sprint 3 academico operacional parcial

Resumo:
- Implementado CRUD operacional para alunos, staff, cursos e turmas nas paginas admin.
- Adicionadas Server Actions com validacao basica, RBAC no servidor e `AuditLog` para acoes criticas.
- Implementada matricula ligando aluno, curso e turma, com criacao automatica de fatura `PENDING`.
- Adicionadas acoes de fatura para `PENDING`, `PAID`, `OVERDUE` e `CANCELLED` no dashboard admin.
- Atualizado dashboard admin com resumo financeiro e faturas recentes.
- Atualizado portal docente para lancar notas e marcar presencas/faltas por turma atribuida.
- Atualizado portal estudante para mostrar notas, presencas, matriculas e faturas reais.
- Ajustado `DataTable` para adaptar tabelas em cards no mobile.
- Criado `docs/uniexe-integration-contract.md` com entidades exportaveis: `User`, `StudentProfile`, `Course`, `ClassGroup`, `Enrollment`, `Grade`, `Attendance` e `DebateEvaluation`.

Validacoes:
- `npm run prisma:generate`
- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`
- Servidor dev iniciado em `http://localhost:3000`
- `curl -I http://127.0.0.1:3000/login` retornou `200 OK`
- `curl -I http://127.0.0.1:3000/admin/dashboard` retornou `307 Temporary Redirect` para `/login`

Pendencias:
- QA visual autenticado em 360px, 390px, 430px, tablet e desktop.
- Screenshots autenticados ainda nao capturados.
- Testes automatizados especificos para Server Actions ainda nao criados.
- Mensalidade da matricula fica refletida em `Invoice.amountMt`; campo proprio em `Enrollment` deve ser adicionado numa migracao futura quando o ambiente de DB/client for alinhado.
- UX de edicao inline pode ser refinada em etapa posterior.

Proxima acao:
- Rodar QA mobile autenticado e corrigir qualquer overflow horizontal, drawer/sidebar ou card responsivo antes do veredito GO completo.

## 2026-04-29 - Criacao dos agentes essenciais e estado persistente

Resumo:
- Criado `AGENTS.md` como ponto de entrada para novas sessoes Codex.
- Criado `.agents/agents.md` com responsabilidades dos agentes: Planeador, Tester, Seguranca, Frontend Responsive, Sugestor, Documentador e Documentador de Estado.
- Criado `docs/project/PROJECT_OVERVIEW.md` com explicacao detalhada do sistema.
- Criado `docs/project/PROJECT_STATUS.md` com estado atual e proximos passos.
- Criado `docs/project/TASK_COMPLETION_CHECKLIST.md` para padronizar fim de tarefa.
- Atualizado `README.md` para apontar para os documentos de agentes e continuidade.

Validacoes:
- Leitura de documentos e estrutura existente.
- Sem build/lint, porque nao houve alteracao de codigo runtime.

Pendencias:
- Aplicar o fluxo de agentes nas proximas tarefas.
- Atualizar este historico sempre ao concluir uma tarefa.
