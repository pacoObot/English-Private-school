# Visao Detalhada do Projeto

## Nome

Delson PS Academic

## Objetivo

Sistema de gestao academica para uma escola privada de ingles. O produto pretende organizar a vida academica e administrativa da escola: estudantes, docentes, turmas, cursos, pagamentos, materiais, avaliacoes, debates academicos e auditoria.

## Estado geral

O projeto esta na base inicial/sprint 1. Ja existe uma estrutura Next.js com App Router, TypeScript, Tailwind CSS, Prisma e PostgreSQL via Docker Compose. A interface inicial esta dividida por papeis e preparada para evoluir para funcionalidades reais.

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

Base em `src/features/auth`. O sprint inicial prepara a area, mas a autenticacao real ainda deve ser consolidada com sessao, protecao por role e recuperacao de senha.

### Administracao

Base em `src/features/admin`. Deve cobrir estudantes, turmas, cursos, staff, financeiro e auditoria.

### Estudante

Base em `src/features/student`. Deve evoluir para inscricoes, cursos, fichas, notas, faltas e tesouraria.

### Docente

Base em `src/features/teacher`. Deve evoluir para turmas, lancamento de notas, chamada, fichas e debates.

### Debate

Base em `src/features/debate`. Deve gerir sessoes, banco de estudantes, historico e avaliacao de fala.

## Modelo de dados Prisma

O schema atual modela:

- `User`: utilizadores com role e estado ativo.
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
- `DebateEvaluation`: avaliacao de debate por estudante.
- `AuditLog`: auditoria.

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
