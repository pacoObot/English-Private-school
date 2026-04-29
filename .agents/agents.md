# Agentes Essenciais

Este projeto trabalha com agentes por responsabilidade. Eles nao precisam ser processos separados; sao papeis que qualquer sessao Codex deve assumir de forma disciplinada.

## 1. Planeador

Responsavel por transformar pedidos em plano executavel.

Atua quando:
- uma tarefa tem varias etapas;
- ha risco de quebrar fluxo existente;
- e necessario decidir prioridade entre funcionalidades.

Entregas:
- objetivo claro;
- escopo incluido e excluido;
- ordem das acoes;
- riscos e dependencias.

## 2. Tester

Responsavel por validar que a mudanca funciona.

Atua quando:
- codigo, schema, rotas, componentes ou configuracoes mudam;
- existe risco de regressao;
- uma tarefa termina.

Verificacoes preferenciais:
- `npm run lint`
- `npm run build`
- testes especificos quando forem criados;
- validacao manual das rotas alteradas.

Entregas:
- comandos executados;
- resultado;
- falhas encontradas;
- verificacoes que ficaram pendentes.

## 3. Seguranca

Responsavel por reduzir riscos de autenticacao, autorizacao, dados sensiveis e configuracao.

Atua quando:
- mexer em login, sessao, roles, middleware ou Prisma;
- criar endpoints, actions ou integracoes;
- alterar `.env`, Docker ou dados de seed.

Checklist:
- nao expor segredos;
- validar autorizacao por papel;
- evitar dados reais em seed, screenshots ou logs;
- registrar acoes importantes em auditoria quando aplicavel;
- proteger operacoes destrutivas.

## 4. Frontend Responsive

Responsavel pela experiencia visual e responsividade.

Atua quando:
- uma pagina, layout ou componente visual muda;
- existem prototipos HTML a consolidar;
- a mudanca afeta mobile.

Breakpoints minimos:
- 360px;
- 390px;
- 430px;
- tablet;
- desktop.

Entregas:
- rotas verificadas;
- problemas de overflow ou sobreposicao;
- screenshots quando aplicavel;
- ajustes recomendados.

## 5. Sugestor

Responsavel por propor melhorias sem desviar a tarefa principal.

Atua quando:
- ha oportunidade de simplificar UX, codigo ou arquitetura;
- existem pendencias que devem ir para backlog;
- o pedido do utilizador pode beneficiar de alternativas.

Entregas:
- sugestoes curtas e acionaveis;
- impacto esperado;
- prioridade sugerida.

## 6. Documentador

Responsavel pela documentacao tecnica e funcional.

Atua quando:
- novas funcionalidades, comandos, rotas, modelos ou decisoes surgem;
- o README fica desatualizado;
- uma feature muda comportamento.

Documentos principais:
- `README.md`;
- `docs/project/PROJECT_OVERVIEW.md`;
- READMEs em `src/features/*/README.md`.

## 7. Documentador de Estado

Responsavel por registrar sempre o estado do projeto no fim de cada tarefa.

Este e o agente mais importante para continuidade entre sessoes.

Obrigatorio ao finalizar qualquer tarefa:
- atualizar `docs/project/PROJECT_STATUS.md`;
- adicionar uma entrada em `docs/project/TASK_LOG.md`;
- marcar comandos de validacao executados;
- listar pendencias e proxima acao recomendada;
- mencionar ficheiros alterados.

Formato minimo:
- data e hora;
- resumo da tarefa;
- estado atual;
- validacoes;
- pendencias;
- proxima acao.

## Ordem pratica de atuacao

Para tarefas pequenas:

Planeador -> Implementacao -> Tester -> Documentador de Estado.

Para tarefas com UI:

Planeador -> Frontend Responsive -> Tester -> Documentador -> Documentador de Estado.

Para tarefas de auth/dados:

Planeador -> Seguranca -> Tester -> Documentador -> Documentador de Estado.

Para tarefas grandes:

Planeador -> Sugestor -> Implementacao -> Tester -> Seguranca -> Frontend Responsive -> Documentador -> Documentador de Estado.
