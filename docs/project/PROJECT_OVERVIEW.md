# Visao Detalhada do Projeto

## Nome

Delson PS Academic

## Objetivo

Sistema de gestao academica para uma escola privada de ingles. O produto pretende organizar a vida academica e administrativa da escola: estudantes, docentes, turmas, cursos, pagamentos, materiais, avaliacoes, debates academicos e auditoria.

## Estado geral

O projeto esta em entrega parcial validada do Sprint 3. Ja existe uma estrutura Next.js com App Router, TypeScript, Tailwind CSS, Prisma e PostgreSQL via Docker Compose. As areas admin, docente e estudante ja usam dados reais em parte dos fluxos academicos, com CRUDs administrativos, matriculas, faturas, notas e presencas operacionais.

## Publico-alvo

- Super admin e administradores da escola.
- Docentes/instrutores.
- Estudantes.
- Equipa financeira/secretaria.

## Stack tecnica

- Next.js 14 com App Router.
- React 18.
- TypeScript.
- Tailwind CSS.
- Prisma ORM.
- PostgreSQL em Docker Compose.
- i18n preparado com mensagens `pt-PT` e `en-US`.
- Componentes UI reutilizaveis em `src/components`.

## Rotas atuais

- `/`: entrada da aplicacao.
- `/login`: pagina de login.
- `/student/dashboard`: dashboard do estudante.
- `/teacher/dashboard`: dashboard do docente.
- `/admin/dashboard`: dashboard administrativo.
- `/admin/students`: gestao de estudantes.
- `/admin/classes`: gestao de turmas.
- `/admin/courses`: gestao de cursos.
- `/admin/staff`: gestao de equipa.
- `/debate`: modulo de debate/instrutor.

## Modulos funcionais

### Autenticacao

Base em `src/features/auth`. O login real, cookie de sessao e middleware por role ja existem. Alunos podem entrar com email, `studentCode` ou `studentNumber`; email e opcional para contas de aluno.

### Administracao

Base em `src/features/admin`. Ja cobre CRUD operacional de estudantes, turmas, cursos e staff, matriculas com fatura inicial, resumo financeiro e auditoria em acoes criticas. O registo de aluno gera automaticamente o codigo unico de estudante.

### Estudante

Base em `src/features/student`. O dashboard ja mostra matriculas, faturas, notas e faltas reais do estudante autenticado.

### Docente

Base em `src/features/teacher`. O dashboard ja permite ao docente ver turma atribuida, lancar notas e marcar presencas/faltas.

### Debate

Base em `src/features/debate`. Gere sessoes, participantes, historico e avaliacao de fala. Admin/Super Admin designa professor ou aluno como instrutor por sessao; o instrutor designado pode liderar e avaliar a sessao, e cada feedback gera notificacao e historico para o aluno.

O ciclo de feedback de debates e fechado: quando o instrutor publica a avaliacao, o aluno recebe notificacao real no centro de notificacoes e pode clicar em "Certo, recebido". Esta confirmacao grava `acknowledgedAt`, marca a notificacao como lida, avisa o instrutor e aparece no estado da avaliacao.

## Modelo de dados Prisma

O schema atual modela:

- `User`: utilizadores com role, estado ativo e permissao opcional para moderar debates.
- `StudentProfile`: perfil academico do estudante.
- `TeacherProfile`: perfil docente.
- `Course`: cursos e niveis.
- `ClassGroup`: turmas e horarios.
- `Enrollment`: matriculas.
- `Attendance`: presencas.
- `Grade`: notas.
- `StudyMaterial`: materiais.
- `Invoice`: pagamentos em meticais.
- `DebateSession`: sessoes de debate.
- `DebateEvaluation`: avaliacao de debate por estudante, incluindo confirmacao de leitura do feedback.
- `Notification`: comunicados e notificacoes reais do sistema.
- `AuditLog`: auditoria.

## QA responsivo

O projeto inclui o comando `npm run qa:responsive`, que usa Chrome headless via DevTools Protocol para autenticar perfis seed por cookie de sessao, visitar rotas protegidas e capturar screenshots em `qa/screenshots`.

Viewports validados:

- 360px.
- 390px.
- 430px.
- Tablet.
- Desktop.

Roles atuais:

- `SUPER_ADMIN`
- `ADMIN`
- `TEACHER`
- `STUDENT`

## Estrutura do repositorio

- `src/app`: paginas e rotas Next.js.
- `src/components/layout`: layouts, shell, sidebar, topbar e cabecalho mobile.
- `src/components/ui`: componentes visuais reutilizaveis.
- `src/features`: documentacao e logica por dominio.
- `src/lib`: helpers, Prisma e dados mockados.
- `prisma`: schema, migrations e seed.
- `messages`: mensagens base para i18n.
- `docker`: documentacao/configuracao de infraestrutura.
- `.agents`: responsabilidades dos agentes.
- `docs/project`: documentacao viva e estado do projeto.

## Decisoes importantes

- O produto deve ser mobile-first.
- A identidade visual inicial usa cards, grid responsivo e glassmorphism leve.
- Os dados de seed devem ser ficticios, sem informacao real sensivel.
- A integracao com UNIEXE ainda e futura e deve ficar desacoplada.
- A continuidade entre sessoes Codex depende de `PROJECT_STATUS.md` e `TASK_LOG.md`.

## Regras de continuidade

Qualquer agente que conclua uma tarefa deve deixar o projeto retomavel:

- registrar o que mudou;
- registrar o que foi testado;
- registrar o que ficou pendente;
- registrar a proxima acao recomendada;
- atualizar a documentacao quando comportamento ou arquitetura mudarem.
