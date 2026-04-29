# Delson PS Academic

Sistema inicial de gestao academica para uma escola privada de ingles. O Sprint 1 entrega a base visual e tecnica para evolucao modular, com foco mobile-first e preparacao para integracao futura com UNIEXE.

## Stack

- Next.js 14 com App Router
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL via Docker Compose
- Fonte Plus Jakarta Sans
- i18n preparado para `pt-PT` e `en-US`

## Estrutura modular

- `src/app`: rotas App Router
- `src/components`: layouts e UI reutilizavel
- `src/features`: modulos funcionais por dominio
- `src/lib`: helpers e dados mockados
- `prisma`: schema e seed
- `docker`: configuracoes futuras de containers
- `messages`: mensagens base PT-PT e EN-US
- `.agents`: responsabilidades dos agentes essenciais do projeto
- `docs/project`: documentacao detalhada, estado atual e historico de tarefas

## Continuidade com agentes

O projeto tem um fluxo de agentes documentado para manter o trabalho organizado entre sessoes Codex:

- `AGENTS.md`: ponto de entrada para qualquer nova sessao.
- `.agents/agents.md`: papeis dos agentes Planeador, Tester, Seguranca, Frontend Responsive, Sugestor, Documentador e Documentador de Estado.
- `docs/project/PROJECT_OVERVIEW.md`: explicacao detalhada do sistema.
- `docs/project/PROJECT_STATUS.md`: estado atual do projeto e proxima acao recomendada.
- `docs/project/TASK_LOG.md`: historico das tarefas concluidas.

Regra obrigatoria: ao fim de cada tarefa, atualizar `docs/project/PROJECT_STATUS.md` e `docs/project/TASK_LOG.md` para permitir retomar o trabalho mesmo que a sessao Codex caia.

## Como executar

1. Instalar dependencias:

```bash
npm install
```

2. Criar o ficheiro `.env` a partir de `.env.example`.

3. Subir PostgreSQL:

```bash
docker compose up -d
```

4. Preparar Prisma:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

5. Iniciar a aplicacao:

```bash
npm run dev
```

A aplicacao fica disponivel em `http://localhost:3000`.

## Rotas do Sprint 1

- `/login`
- `/student/dashboard`
- `/teacher/dashboard`
- `/admin/dashboard`
- `/debate`

## Decisoes tecnicas

- A identidade visual dos prototipos foi consolidada em componentes reutilizaveis com glassmorphism leve, bento grid, `backdrop-blur-md`, sombras suaves e cantos grandes.
- O Prisma foi modelado em torno de utilizadores, perfis por papel, cursos, turmas, matriculas, fichas, pagamentos em meticais, avaliacoes de debate e logs de auditoria.
- A integracao UNIEXE fica isolada como preocupacao futura; o Sprint 1 deixa a arquitetura pronta sem acoplar contratos externos ainda.
- O seed usa dados ficticios com nomes e emails marcados como teste, sem dados reais sensiveis.

## Responsividade

Validar manualmente em:

- 360px
- 390px
- 430px
- tablet
- desktop

As paginas usam sidebar off-canvas no mobile, header compacto e grids que expandem organicamente em ecras maiores.

## Proximos passos

- Implementar autenticacao real e protecao por papel.
- Criar CRUDs dos modulos iniciais.
- Definir contrato UNIEXE e camada de sincronizacao.
- Adicionar testes de componentes e fluxos criticos.
- Evoluir i18n para rotas/locales completos.

# English-Private-school
