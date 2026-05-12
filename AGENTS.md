# Agentes do Projeto Delson PS Academic

Este ficheiro e o ponto de entrada para qualquer nova sessao Codex neste projeto. Antes de alterar codigo, leia este documento, depois consulte:

- `.agents/agents.md`: responsabilidades dos agentes essenciais.
- `docs/project/PROJECT_OVERVIEW.md`: explicacao detalhada do sistema.
- `docs/project/PROJECT_STATUS.md`: estado atual, ultima tarefa e proximos passos.
- `docs/project/TASK_LOG.md`: historico resumido das tarefas concluidas.
- `docs/project/TASK_COMPLETION_CHECKLIST.md`: checklist obrigatoria de fim de tarefa.

## Regra principal

No fim de cada tarefa, o agente Documentador de Estado deve atualizar `docs/project/PROJECT_STATUS.md` e `docs/project/TASK_LOG.md`. Assim, se uma sessao Codex cair, a proxima consegue retomar o trabalho sem depender da memoria da sessao anterior.

## Fluxo recomendado por tarefa

1. Planeador define o objetivo, escopo e riscos.
2. Sugestor aponta melhorias ou caminhos alternativos quando forem uteis.
3. Agente responsavel implementa a mudanca.
4. Tester valida build, lint, testes ou verificacoes manuais aplicaveis.
5. Seguranca revê dados sensiveis, permissoes, autenticacao e superficie de risco.
6. Frontend Responsive valida a experiencia em mobile, tablet e desktop quando houver UI.
7. Documentador atualiza documentacao tecnica quando a mudanca altera comportamento, arquitetura ou comandos.
8. Documentador de Estado registra o que mudou, o que foi validado, pendencias e proxima acao.

## Padrao de retomada

Ao iniciar uma nova sessao:

1. Ler `docs/project/PROJECT_STATUS.md`.
2. Confirmar a ultima entrada em `docs/project/TASK_LOG.md`.
3. Verificar `git status --short` dentro desta pasta.
4. Retomar a primeira pendencia marcada como prioridade.

## Arranque seguro do projeto

Quando o utilizador pedir para ligar o projeto, qualquer agente deve preferir:

```bash
scripts/start-safe.sh dev
```

Comandos auxiliares:

- `scripts/start-safe.sh status`: ver containers e migrations.
- `scripts/start-safe.sh logs`: acompanhar logs da aplicação.
- `scripts/start-safe.sh stop`: parar containers sem apagar volumes.

Nunca usar `docker compose down -v` ou `npx prisma migrate reset` sem confirmacao explicita do utilizador, porque estes comandos podem apagar dados.

## Convenções

- Manter documentos em portugues.
- Preferir alteracoes pequenas, verificaveis e alinhadas com a estrutura existente.
- Nunca apagar trabalho anterior sem confirmar que faz parte da tarefa atual.
- Quando uma verificacao nao puder ser executada, registrar o motivo em `PROJECT_STATUS.md`.
