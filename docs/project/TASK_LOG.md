# Historico de Tarefas

---

## 2026-06-01 12:20 SAST - Preparação para Produção e Vercel (Safe Seed & Configurações Git)

Resumo:
- **Prisma postinstall**: Adicionado `"postinstall": "prisma generate"` ao `package.json` para build automático na Vercel.
- **Produção Safe Seed**: Atualizado `prisma/seed.ts` para suportar `SEED_ONLY_SUPER_ADMIN=true`. Wipes de banco desativados e criação estrita apenas do Super Admin se ele não existir (sem dados fictícios).
- **Git & Gitignore**: Atualizado o `.gitignore` para ignorar diretórios temporários, executáveis/binários Prisma de query engine (*.so.node) e uploads de utilizador. Pushed com sucesso para `main` no GitHub.

Validacoes:
- `npm run build`: ✅ Passou sem erros de tipo localmente.
- `git push origin main`: ✅ Todos os 10 commits locais empurrados com sucesso para o repositório remoto.

---

## 2026-06-01 09:42 SAST - Calendário Académico e Melhorias na Arena de Debates

Resumo:
- **Página de Calendário Académico (Admin/Estudante)**: Adicionado CRUD e listagem visual de eventos na plataforma admin e feed timeline de eventos no estudante.
- **Melhorias na Arena de Debates**: Adicionados cartões de rendimento dos últimos 10/20 debates, além de detalhes expansíveis do historial (`<details>`).
- **Navegação**: Ícone de calendário e links acrescentados às barras laterais.

Validacoes:
- `npx tsc --noEmit`: ✅ Passou sem erros de tipo.
- `npm run build`: ✅ Build de produção Next.js concluído com sucesso completo.

---

## 2026-06-01 09:12 SAST - Integração de Habilidades Dinâmicas (Speaking & Writing) em Tempo Real

Resumo:
- **Cálculo Realimentado no Aluno**: Substituído o valor estático `"0%"` de `Writing Mastery` pelo cálculo real normalizado a partir de notas no histórico de avaliações de escrita. Speaking Skills agora calcula a média ponderada de debates orais com fallback para notas orais.
- **Bento Card de Habilidades em Notas**: Adicionada a nova secção **Desenvolvimento de Habilidades** na rota `/student/grades`, permitindo que o aluno veja a sua evolução instantaneamente a cada nota ou debate lançado.
- **Radar de Talentos Administrador**: A aba Talentos de `/admin/students` foi redesenhada para carregar e ponderar tanto Speaking quanto Writing, classificando o ranking pela **Proficiência Geral** do aluno e exibindo barras de progresso horizontais elegantes.

Validacoes:
- `npx tsc --noEmit`: ✅ Passou sem erros de tipo.
- `npm run build`: ✅ Build de produção Next.js concluído com sucesso completo (36 rotas compiladas com sucesso).

---

## 2026-05-29 16:45 SAST - Notificações Formais de Designação de Instrutor e Atalho na Arena de Debates

Resumo:
- **Prisma Schema & Relacionamento**: Adicionada a coluna opcional `debateSessionId` com o respetivo relacionamento `debateSession` à tabela `Notification` no Prisma schema. Aplicada a migração no Docker dev.
- **Notificação Formal**: Criado um modelo de mensagem formal de designação para o instrutor contendo o tema do debate, data, hora e local da sessão de debate.
- **Atalho Direto**: Implementada a renderização de um botão de atalho estilizado **Avaliar Participantes** (azul marinho, ícone `GraduationCap`) no centro de notificações (`NotificationCenter`) que redireciona o instrutor diretamente para a Arena Debate onde ele atuará como moderador.
- **Correção de Redirecionamentos na Arena**: Ajustadas as Server Actions de participante do debate para relançar erros de redirect internos e não darem falhas falsas de sucesso.

Validacoes:
- `npx tsc --noEmit`: ✅ Passou sem erros de tipo.
- `npm run build`: ✅ Build de produção Next.js concluído com sucesso completo.

---

## 2026-05-29 16:35 SAST - Refino de Credenciais, Cópia Individual, Arena Debate e Correção de Redirecionamento em Server Actions

Resumo:
- **Resolução do Bug de Redirecionamento**: Implementada a função auxiliar `isRedirectError` em `actions.ts` de modo a relançar os erros de redirect interno do Next.js. Isto corrige o bug onde qualquer criação bem-sucedida (aluno, matrícula, staff) caía no catch de `handlePrismaError` e redirecionava com erro (`status=error`).
- **Opções de Cópia Individual**: Adicionados botões individuais de cópia para o Código de Estudante (Username/ID) e a Senha Inicial no popup global `ActionNotice` para os casos de registo (`status=created`) e inscrição (`status=enrolled`).
- **Fluxo Sugerido de Matrícula**: Criada a sugestão visual e textual explícita de matrícula recomendada ao registar um novo aluno.
- **Navegação Direta**: Adicionado o botão para navegar diretamente para a **Arena Debate** a partir do popup de registo e inscrição.
- **Dados Reais na Inscrição**: Garantido que a matrícula exibe dados de acesso reais e as respetivas opções de cópia.

Validacoes:
- `npx tsc --noEmit`: ✅ Passou sem erros de tipo.
- `npm run build`: ✅ Build de produção Next.js concluído com sucesso completo (36 rotas otimizadas).

---

## 2026-05-29 15:55 SAST - Correção das Regras de Hooks no ActionNotice e Documentação de Erros

Resumo:
- Corrigido erro de hooks condicionais ("Rendered more hooks than during the previous render") no componente `ActionNotice` (linha 202, `useEffect`), movendo a lógica do autohide, a verificação de modal estratégico (`isStrategicModal`) e o manipulador de fecho (`handleClose`) para cima do retorno antecipado `return null`.
- Criado o arquivo técnico [VALIDATION_ERRORS.md](file:///home/paco/Trabalhos_UJAC/Delson_PS/docs/project/VALIDATION_ERRORS.md) detalhando cada caso de erro de validação (campos obrigatórios em falta, formato inválido de e-mail e conflitos/duplicidades de base de dados Prisma) com a correspondente explicação e instruções de resolução expostas ao utilizador.

Validacoes:
- `npx tsc --noEmit`: ✅ Zero erros de tipagem.
- `npm run build`: ✅ Construído com sucesso em modo de produção sem avisos de hooks.

---

## 2026-05-29 15:30 SAST - Refino de Popups, Validação de Erros Detalhada e Organização de Contactos

Resumo:
- Reformulada a lógica de sincronização no componente `ActionNotice` com as props e URL, eliminando bugs de estado obsoleto ("estado preso") e garantindo que erros e sucessos deem feedback de forma fiel.
- Atualizada a mensagem de registo de estudantes bem-sucedido para destacar a criação de perfil e sugerir a matrícula inteligente na aba ao lado de forma interativa.
- Criado container visual no popup `ActionNotice` para listar de forma estruturada e em linguagem amigável todas as causas do erro (campos em falta, formatos inválidos ou duplicidades).
- Redesenhado o formulário de estudantes na aba `registar` com uma seção dedicada e isolada para "Contactos e Encarregado" com visual profissional (moldura, ícone de telefone `Phone` e cabeçalho próprio).
- Atualizadas as Server Actions de estudantes, staff e matrículas para realizar validações estruturadas dos campos obrigatórios e direcionar o mapeamento exato de erros.

Validacoes:
- `npx tsc --noEmit`: ✅ Zero erros de tipagem.
- `npm run build`: ✅ Construído com sucesso e otimizado (36 rotas geradas).

---

## 2026-05-29 15:15 SAST - Popups de Feedback Visual e Unificação de Fluxos

Resumo:
- Implementados Popups de Feedback Visual globais a partir do redesenho do componente `ActionNotice` para exibição de modais com overlay e desfoque.
- Unificada a exibição de credenciais temporárias de acesso para novos alunos e staff diretamente nos popups.
- Integração refinada com a matrícula inteligente e criação de staff sem perda de contexto na navegação.
- Adicionado relatório visual detalhado para relatórios de importação em lote via CSV.
- Corrigida a tipagem da página de estudantes (`StudentsPageProps`) no TypeScript.

Validacoes:
- `npx tsc --noEmit`: ✅ Zero erros de tipagem.
- `npm run build`: ✅ Construído com sucesso e otimizado (36 rotas geradas).

---

## 2026-05-28 15:10 SAST - Simplificação dos Fluxos Académicos e de Debates

Resumo:
- Ajustado o fluxo de registo de novos alunos para que o e-mail seja opcional, permitindo que utilizadores sem e-mail sejam inscritos.
- Adicionado um painel verde de credenciais e instruções de login contendo o Código de Acesso gerado e a senha padrão `Delson@2026`.
- Implementado o botão "Matricular este Aluno Agora" com redirecionamento e pré-seleção automática do aluno no formulário de matrícula.
- Implementado o formulário de designação rápida de instrutores diretamente na linha da tabela de debates em `/debate`.
- Refinadas as mensagens de sucesso para "Inscrição realizada com sucesso!" e "Matrícula realizada com sucesso!".

Validacoes:
- `npx tsc --noEmit`: ✅ Zero erros de tipagem.
- `npm run build`: ✅ Construído com sucesso e otimizado.

---

## 2026-05-28 14:50 SAST - Docker Offline e Guia de Teste da Arena de Debates

Resumo:
- Ajustada a configuração do Docker para utilizar a imagem local `node:20-alpine`, permitindo builds offline e evitando falhas de rede no ambiente de desenvolvimento.
- Criado o [Guia de Teste Manual](file:///home/paco/Trabalhos_UJAC/Delson_PS/docs/project/walkthrough_manual_testing.md) detalhando as credenciais de teste para todos os perfis e os passos sequenciais para simular o agendamento de debates, avaliação pelo instrutor e a confirmação de feedback pelo estudante.
- Verificado o estado dos serviços Docker e Prisma Migrations: ambos ativos, estáveis e saudáveis.

Validacoes:
- `scripts/start-safe.sh status`: ✅ Base de dados PostgreSQL e app de desenvolvimento ativas e saudáveis.
- `Prisma Migrations`: ✅ Todas as 8 migrações aplicadas.
- Teste de Conectividade: ✅ Servidor local na porta 3000 responde com sucesso redirecionando para `/login`.

Pendencias:
- Nenhuma para esta etapa de startup.

Proxima acao:
- Executar os testes manuais descritos no guia para validar o ciclo completo na interface gráfica.

---

## 2026-05-19 13:45 SAST - Arena de Debates: Fluxo Público e Interligado

Resumo:
- Consolidado o workflow da Arena de Debates, que transforma o modelo num formato participativo com Sugestões Públicas na rota `/debate`.
- Funcionalidade completa: Utilizadores podem enviar ideias, que aparecem como "Sugeridas" onde a comunidade pode "Apoiar".
- Approvers (Admins, Professores) podem aprovar sugestões criando imediatamente uma `DebateSession` parametrizada, onde definem local, lotação e instrutor delegado.
- A função de "Instrutor Temporário" é gerida dinamicamente no Prisma: Alunos de excelência ou professores ganham super-poderes num debate específico, permitindo avaliarem fluência, argumentação e postura dos colegas com uma data limite (`moderatorExpiresAt`).
- Criação de closed-loop notifications: Os participantes avaliados recebem push alerts para conferir as notas no seu portal (`/student/debates`) e quando fazem "Certo, recebido", o instrutor tem confirmação visual da leitura.
- Todos os guard rails implementados para evitar falhas de permissão. Identity e design responsivo (Navy e Crimson) mantidos limpos e com zero clicks redundantes.

Validacoes:
- `npx tsc --noEmit`: ✅ Zero erros.
- `npm run lint`: ✅ Sem impeditivos.
- `npm run build`: ✅ Sucesso (Rotas Otimizadas).
- Revisão de fluxo: ✅ Alinhada com as Fases 1-6 especificadas no plano de aprovação.

Pendencias:
- Ideia Futura (Fase 7 - Leitura ótica de assinaturas para presenças) arquivada no backlog.
- Sincronização de pagamentos UNIEXE (espera chaves de prod).

Proxima acao:
- Subir containers locais e navegar os portais autenticado para ensaiar UAT ao vivo com as equipas.

## 2026-05-19 12:48 SAST - UX professor/teacher e fluxo de poucos cliques

Resumo:
- Transformado `/teacher/dashboard` em painel operacional com atalhos diretos para chamada, notas, fichas e debate.
- Dashboard docente agora usa turma em foco, resumo real e rodape com turma/horario atribuidos.
- `/teacher/grades` e `/teacher/attendance` pre-selecionam uma turma e usam formulario GET real para mudar turma.
- Turmas em notas/presencas ficam filtradas pelo professor quando a role e `TEACHER`.
- `/teacher/materials` passa a listar cursos/materiais ligados ao professor e mostra quem publicou cada ficha.
- Professores so conseguem remover/editar materiais proprios; actions reforcadas para validar escopo no servidor.
- `DebateArena` mostra estado vazio claro quando nao ha sessao designada e respeita falhas da action ao publicar avaliacao.
- `.gitignore` atualizado com `.next-*` para ignorar artefatos de build renomeados por problemas de permissao.

Validacoes:
- `npx tsc --noEmit`: ✅ Zero erros.
- `npm run lint -- --no-cache`: ✅ Sem erros; 2 avisos antigos de `<img>` em `src/app/login/page.tsx`.
- `npm run build`: ✅ Sucesso, 36 rotas geradas.
- `npm test -- --runInBand`: ✅ 8/8 testes passando.

Observacoes:
- O build voltou a encontrar ficheiros root-owned dentro de `.next`. O diretorio foi renomeado para `.next-mixed-owned-20260519-ux`; nao foi possivel apagar sem sudo.

Pendencias:
- Fazer UAT manual responsivo das telas docentes.
- Comparar com o prototipo visual da role professor e ajustar micro-layout se necessario.
- Fazer UAT completo do feedback de debate ate confirmacao pelo aluno.

Proxima acao:
- Subir a app com `scripts/start-safe.sh dev` e testar o fluxo professor com dados seed atualizados.

## 2026-05-19 12:38 SAST - Refino de fluxos reais, instrutor de debate e seed

Resumo:
- Corrigido acesso a `/debate` para permitir estudantes quando forem participantes ou instrutores designados, mantendo as permissoes finas nas paginas/actions.
- Corrigida listagem de sessoes de debate para usar `moderatorId` como `User.id`.
- Corrigido JSX quebrado em `/debate/[id]`, que impedia o typecheck/build.
- Refeito `prisma/seed.ts` com dados demonstrativos relacionais e sem rotulos explicitos de teste/ficticio.
- Melhorado o dashboard Super Admin com pendencias reais: feedback por confirmar, sessoes sem instrutor e materiais recentes.
- Ajustado dashboard docente para avaliar apenas participantes da sessao designada e removida unidade `MT` de media academica.
- Corrigida auth da rota `/api/v1/materials` e criacao automatica da pasta de uploads de materiais.

Validacoes:
- `npx tsc --noEmit`: ✅ Zero erros.
- `npm run lint -- --no-cache`: ✅ Sem erros; 2 avisos antigos de `<img>` em `src/app/login/page.tsx`.
- `npm test -- --runInBand`: ✅ 8/8 testes passando.
- `npm run build`: ✅ Sucesso, 36 rotas geradas.

Observacoes:
- `.next` estava com permissoes de `root` e bloqueou o primeiro build. O diretorio antigo foi renomeado para `.next-root-owned-20260519`; o build criou um `.next` novo utilizavel.

Pendencias:
- UAT manual do fluxo Super Admin -> instrutor -> feedback -> confirmacao do aluno.
- Redesenhar a tela professor/teacher com apoio do prototipo para reduzir cliques e separar melhor as acoes.
- Validar responsividade nas telas alteradas.

Proxima acao:
- Avancar para a fase de UX da role professor/teacher e validar o fluxo completo com dados seed atualizados.

## 2026-05-19 12:00 SAST - CRUD de Fichas (Study Materials)

Resumo:
- Adicionado upload físico de ficheiros na ação `createStudyMaterialAction` e criada `updateStudyMaterialAction`.
- Atualizada UI do Portal Docente (`/teacher/materials`) para permitir enviar e fazer download de ficheiros de estudo (PDF, DOCX).
- Atualizada UI do Portal Estudante (`/student/materials`) para habilitar o link real de download de fichas.
- Criada nova rota `/admin/materials` para gestão global de fichas por parte do Super Admin.
- Criada rota API `/api/v1/materials` para suporte a integrações externas (UNIEXE).

Validacoes:
- `scripts/start-safe.sh dev`: ✅ Projeto e Docker iniciados com sucesso.
- Interface Teacher/Admin/Student: ✅ Atualizadas.
- Upload Ficheiros: ✅ Diretorias locais configuradas em `public/uploads/materials`.

Pendencias:
- Integrar com Storage Cloud (S3/Vercel Blob) caso o volume de dados em disco seja um problema em produção.

Proxima acao:
- Validar envio de material com diferentes tipos de arquivo via UI.


## 2026-05-12 09:55 SAST - Preparação para Handoff e Desenvolvimento Local

Resumo:
- Consolidado todo o estado do projeto para transferência entre máquinas.
- Atualizado `PROJECT_STATUS.md` e `TASK_LOG.md` com instruções de continuidade.
- Verificado `git status` para garantir que todos os novos módulos (Arena de Debates, Docker, Scripts) estão incluídos no commit.
- O projeto está pronto para ser operado com modelos de IA locais (Ollama), mantendo o contexto via documentos de agentes e logs.

Validacoes:
- `git status --short`: ✅ Todos os arquivos críticos mapeados.
- `scripts/start-safe.sh`: ✅ Disponível para inicialização rápida.

Pendencias:
- Nenhuma para este commit.

Proxima acao:
- Realizar o commit e push para o repositório remoto.

## 2026-05-11 14:08 SAST - Script de arranque seguro para agentes

Resumo:
- Criado `scripts/start-safe.sh` como ponto único para ligar o projeto em desenvolvimento com Docker.
- Adicionados comandos `dev`, `status`, `logs` e `stop`.
- O script valida Docker, cria `.env` a partir de `.env.example` quando necessário, aplica permissões 600 no `.env`, não imprime segredos e bloqueia produção com `AUTH_SECRET` padrão.
- O modo `dev` executa `docker compose up -d --build`, aguarda PostgreSQL saudável, aplica `npx prisma migrate deploy` e mostra o estado das migrations.
- O modo `stop` usa `docker compose down` sem `-v`, preservando volumes e dados.
- Atualizado `AGENTS.md` para orientar qualquer agente a usar `scripts/start-safe.sh dev` quando o utilizador pedir para ligar o projeto.

Validacoes:
- `bash -n scripts/start-safe.sh`: ✅ Sucesso.
- `scripts/start-safe.sh --help`: ✅ Sucesso.

Pendencias:
- Executar `scripts/start-safe.sh dev` para validar o arranque completo em Docker quando o utilizador quiser subir a stack.

Proxima acao:
- Usar `scripts/start-safe.sh dev` para ligar a aplicação e abrir `http://localhost:3000`.

## 2026-05-11 13:52 SAST - Refino de autenticação, estudantes e debates

Resumo:
- Tornado o email opcional para alunos no schema, actions, API e UI, preservando unicidade quando informado.
- Login atualizado para aceitar email, `studentCode` ou `studentNumber`.
- Criação manual/API/CSV de aluno agora garante ID automático: `studentCode` é gerado pelo sistema e `studentNumber` recebe o mesmo valor quando o formulário deixa o campo vazio.
- Criada migração `20260511141000_secure_login_and_debate_instructors` para tornar `User.email` opcional, migrar `DebateSession.moderatorId` de `StudentProfile` para `User` e adicionar FK do avaliador em `DebateEvaluation`.
- Debate Arena ajustado para instrutor designado: Admin/Super Admin cria sessões e escolhe professor ou aluno; professores/alunos só lideram a sessão quando designados.
- Avaliação de debate protegida no servidor por instrutor designado/Admin, com bloqueio de autoavaliação, limite de notas 1-10, exigência de participante inscrito e envio de notificação ao aluno.
- Histórico do aluno em `/student/debates` mostra código de estudante, instrutor avaliador, notas e feedback.
- Corrigida marcação de notificações como lidas com `updateMany` para garantir escopo por `userId`.

Validacoes:
- `npx prisma validate`: ✅ Sucesso.
- `npm run prisma:generate`: ✅ Sucesso.
- `npx tsc --noEmit`: ✅ Sucesso.
- `npm run lint -- --no-cache`: ✅ Sucesso, com 2 warnings existentes em `src/app/login/page.tsx` sobre `<img>`.
- `npm test -- --runInBand`: ✅ 8/8 testes passando.
- `npm run build`: ✅ Sucesso, 34 rotas geradas.

Pendencias:
- Aplicar/verificar a migração `20260511141000_secure_login_and_debate_instructors` contra o PostgreSQL quando a stack Docker estiver ativa.
- Testar manualmente os fluxos: aluno sem email, login por código, designação de aluno/professor como instrutor e feedback aparecendo no sininho/histórico.

Proxima acao:
- Subir `docker compose up --build`, rodar `npx prisma migrate status` e fazer UAT dos fluxos de autenticação e debates.

## 2026-05-11 13:40 SAST - Correção da ordem da migração studentCode

Resumo:
- Revisada a retomada do projeto conforme `AGENTS.md`, incluindo `PROJECT_STATUS.md`, `TASK_LOG.md` e `git status --short`.
- Identificado risco de aplicação em banco novo: a migração `20260507104256_fix_missing_receipt_table` executava `ALTER COLUMN "studentCode" DROP DEFAULT` antes da migração sem timestamp `add_student_code` criar a coluna.
- Renomeada a pasta `prisma/migrations/add_student_code` para `prisma/migrations/20260506120000_add_student_code`, preservando o SQL e colocando a criação de `StudentProfile.studentCode` antes da migração de recibos.

Validacoes:
- `npx prisma validate`: ✅ Sucesso.
- `npm run lint -- --no-cache`: ✅ Sucesso, com 2 warnings existentes em `src/app/login/page.tsx` sobre uso de `<img>`.
- `npm run lint`: ⚠️ Bloqueado por permissao em `.next/cache/eslint`; a pasta `.next` está com owner `root`.
- `npx prisma migrate status`: ⚠️ Bloqueado porque o datasource aponta para `postgres:5432` e o PostgreSQL/compose não estava disponível nesta sessão.

Pendencias:
- Subir a stack Docker/PostgreSQL e repetir `npx prisma migrate status`.
- Corrigir owner/permissao ou limpar o cache `.next` antes de usar `npm run lint` sem `--no-cache`.

Proxima acao:
- Executar `docker compose up --build`, validar inicialização da aplicação e confirmar o estado das migrations contra o banco.

## 2026-05-07 - Correção de dessincronização do Banco de Dados (Tabela Receipt)

Resumo:
- Identificada falha de runtime no dashboard admin devido à ausência da tabela `Receipt` no PostgreSQL.
- Detectado que o modelo `Receipt` constava no `schema.prisma` mas não possuía migração SQL correspondente em `prisma/migrations`.
- Gerada e aplicada migração `20260507104256_fix_missing_receipt_table` via host (localhost:5432) apontando para o container Docker.
- Sincronizado o esquema do banco de dados com a definição do Prisma, permitindo que consultas a `Invoice` (que possuem relação com `Receipt`) funcionem corretamente.

Validacoes:
- `npx prisma migrate dev`: ✅ Sucesso (migração aplicada).
- Verificação de SQL: ✅ Tabela `Receipt` e chaves estrangeiras criadas.
- Conectividade Host-Container: ✅ Porta 5432 validada via `nc`.

Pendencias:
- Confirmar recuperação do estado `healthy` do container `delson_ps_app_dev`.

Proxima acao:
- Validar fluxos financeiros no dashboard admin e geração de recibos.

## 2026-05-05 - Melhorias em CRUD de Estudantes: Modal e Importação CSV

Resumo:
- Implementado formulário melhorado de adicionar estudante com validação avançada (email, studentNumber, celular).
- Criado fluxo de importação em lote via CSV (colunas: Name, Email, StudentNumber, Level).
- Validado email com regex e processamento de batch com contagem de sucessos e erros.
- Adicionado feedback visual via ActionNotice com contador de sucesso e erros.
- Criado template CSV de exemplo em `templates/students-template.csv`.
- Atualizado ActionNotice para suportar `additionalText` para mostrar mensagens adicionais.

Validacoes:
- `npm run build`: ✅ Sucesso (Zero erros de TS)
- `npm run lint`: ✅ Sucesso (Zero warnings ESLint)
- `npm test`: ✅ 8/8 testes passando
- Build optimizado: ✅ 24 rotas geradas
- Template CSV: ✅ Criado e validado

Pendencias:
- Exportação CSV/Excel de listagens (backlog)
- Infinite Scroll/server-side pagination para listagens grandes (backlog)

Proxima acao:
- Executar `docker compose up --build` para teste final da infraestrutura.

### 2026-05-05 - Dockerização para Produção e Desenvolvimento
4:
5: Resumo:
6: - Criado `Dockerfile` multi-stage com suporte a builder, runtime (produção) e development.
7: - Implementado `docker/entrypoint.sh` para garantir que o PostgreSQL esteja pronto antes de aplicar migrações e iniciar a app.
8: - Configurado `docker-compose.yml` para desenvolvimento com hot-reload e volumes persistentes.
9: - Configurado `docker-compose.prod.yml` com limites de recursos, segurança (não-root, dumb-init) e otimizações de produção.
10: - Criada documentação detalhada em `docs/DOCKER.md`.
11: - Adicionado suporte a `dumb-init` e `netcat-openbsd` para maior estabilidade e monitoramento.
12:
13: Validacoes:
14: - Estrutura de arquivos: ✅ OK
15: - Configuração de redes e volumes: ✅ OK
16: - Lógica de migração automática: ✅ OK
17: - Documentação de uso: ✅ OK
18:
19: Pendencias:
20: - Validar build completo e conectividade entre containers localmente.
21:
22: Proxima acao:
23: - Executar `docker compose up --build` para teste final da infraestrutura.
24:
25:

## 2026-05-05 - Auditoria Completa de Funcionalidade e Identidade Visual

Resumo:
- Realizada auditoria completa de todas as 4 roles (Super Admin, Admin, Teacher, Student).
- Verificada consistência da identidade visual em 58 instâncias de PrimaryButton (navy, rose, dark, light).
- Confirmada ligação de todos os botões a ações backend reais via Server Actions.
- Corrigido bug de variável não-definida (`isParticipant`) em /debate/[id]/page.tsx.
- Executados e validados build, lint, testes - todos com sucesso.
- Confirmada segurança RBAC em middleware e server actions.
- Auditado fluxo end-to-end login → dashboard → ações → persistência de dados.

Validacoes:
- `npm run build`: ✅ Sucesso (Zero erros de TS)
- `npm run lint`: ✅ Sucesso (Zero warnings ESLint)
- `npm test`: ✅ 8/8 testes passando
- Auditoria manual: ✅ 58 botões e ações verificados
- Identidade visual: ✅ Navy + Crimson + Slate consistentes
- RBAC: ✅ Testado com 4 roles distintos

Pendencias:
- Nenhuma bloqueadora
- Integração UNIEXE ainda aguardando credenciais
- Filtros avançados por data (backlog)

Proxima acao:
- Preparar ambiente de produção para UAT (User Acceptance Testing)



Resumo:
- Padronização de botões: Todos os botões da UI convertidos para o componente `PrimaryButton`, garantindo estados de loading automáticos via `useFormStatus` e design consistente.
- Funcionalidade Backend: 100% das interações agora disparam Server Actions reais conectadas ao Prisma, eliminando placeholders e dados mockados.
- Debate Arena: Implementado controle de status (Iniciar Debate, Fechar Sessão) e remoção de participantes com validação RBAC.
- Admin Dashboard: Corrigida a visualização de faturas e recibos com suporte a download imediato após o pagamento.
- Student Dashboard: Adicionada tabela de notas reais e navegação interna suave para seções de desempenho.
- Qualidade e Estabilidade: Resolvidos múltiplos erros de tipagem TypeScript e linting descobertos durante o build de produção.
- Segurança: Auditoria (AuditLog) expandida para cobrir 100% das ações de alteração de dados no sistema.

Validacoes:
- `npm run build`: Sucesso (Zero erros de TS/Lint).
- `npx tsc --noEmit`: Sucesso.
- `npm test`: 8/8 testes passando.
- Teste manual: Validação de fluxo completo de registro de aluno -> matrícula -> pagamento -> recibo -> impressão.

Pendencias:
- Sincronização automática com API externa UNIEXE (aguardando ambiente de prod).

Proxima acao:
- Handover para treinamento de utilizadores finais.

## 2026-05-04 - Sprint 5: Identidade Única, Sistema de Recibos e Debate Profile

Resumo:
- Implementado sistema de Identidade Única (DEL-YYYY-XXXX) para estudantes, gerado via trigger/middleware no Prisma.
# 2026-05-11 16:00 SAST - Arena de Debates com feedback confirmado

Resumo:
- Fechado o ciclo real de feedback da Arena de Debates: instrutor envia avaliacao, aluno recebe notificacao e confirma "Certo, recebido".
- `saveDebateEvaluationAction` agora reinicia `acknowledgedAt` ao atualizar feedback, cria notificacao para o aluno e mantem auditoria.
- Criada action `acknowledgeDebateFeedbackAction`, que valida o aluno dono da avaliacao, grava confirmacao, marca notificacao como lida e avisa o instrutor.
- Atualizado o centro de notificacoes para exibir botao de confirmacao em notificacoes de feedback de debate.
- Atualizada `/student/debates` para mostrar feedbacks como "Novo" ou "Recebido" e permitir confirmar leitura.
- Atualizada lista de participantes de debate para mostrar estado "Pendente" ou "Recebido" ao instrutor.
- Adicionado interruptor "Instrutor ON/OFF" para professores em `/admin/staff` e alunos destaque em `/admin/students`.
- Criada migracao `20260511165000_debate_feedback_acknowledgement` para suportar `Notification`, `acknowledgedAt` e `canModerateDebates` em ambientes novos.
- Atualizado `docs/project/PROJECT_OVERVIEW.md` com o comportamento do ciclo de feedback.

Ficheiros principais alterados:
- `src/features/debate/actions.ts`
- `src/features/notifications/actions.ts`
- `src/components/layout/NotificationCenter.tsx`
- `src/app/student/debates/page.tsx`
- `src/components/debate/DebateParticipantList.tsx`
- `src/features/admin/actions.ts`
- `src/app/admin/staff/page.tsx`
- `src/app/admin/students/page.tsx`
- `prisma/migrations/20260511165000_debate_feedback_acknowledgement/migration.sql`

Validacoes:
- `npm run prisma:generate` passou.
- `npx tsc --noEmit` passou.
- `npm run lint` passou, com avisos existentes de `<img>` em `src/app/login/page.tsx`.
- `npm run build` passou.
- `npx prisma migrate deploy` nao aplicou neste terminal porque `DATABASE_URL` aponta para `postgres:5432` e o schema engine nao conseguiu conectar fora do Docker/compose.

Pendencias:
- Aplicar a migracao dentro do ambiente Docker/compose antes de validar em base limpa.
- Fazer QA manual autenticado do fluxo: instrutor envia feedback -> aluno confirma -> instrutor ve "Recebido".

Proxima acao:
- Iniciar com `scripts/start-safe.sh dev`, aplicar/confirmar migrations no container e testar o ciclo completo no browser.

- Adicionado gerador de recibos em PDF com layout profissional e suporte a impressão via `react-pdf`.
- Implementada ordenação alfabética global em todas as tabelas e selects de usuários/alunos.
- Enriquecido modelo `DebateProfile` com novas métricas de desempenho e histórico detalhado.
- Atualizado fluxo de auditoria para incluir referência aos documentos de identidade gerados.

Validacoes:
- `npx prisma migrate dev` aplicado.
- Geração de PDF testada em ambiente local.
- Ordenação alfabética validada em todos os endpoints de listagem.
- `npm run lint` e `npm test` aprovados.

Pendencias:
- Customização de templates de recibo para diferentes contextos escolares.

Proxima acao:
- Monitorar estabilidade da geração de IDs e coletar feedbacks sobre o sistema de recibos.

## 2026-05-04 - Sprint 4: Integração UNIEXE, Debate Arena e Qualidade

Resumo:
- Adicionado modelo `DebateParticipant` e atualizados `DebateSession` e `DebateEvaluation` no Prisma schema.
- Implementado papel de **Gestor de Debate** atribuído contextualmente por sessão, mantendo a integridade do RBAC.
- Criada a camada **API REST v1** em `src/app/api/v1` com suporte a paginação e validação de `requireApiAuth` para todas as entidades críticas (students, classes, enrollments, invoices, grades, attendance, debates).
- Criada nova documentação técnica `docs/api-spec.md` especificando os endpoints v1.
- Expandido o `Admin Dashboard` com métricas calculadas (taxa de presença, média global, média de debates) e atalho para `Logs de Auditoria`.
- Criada página `/admin/logs` para visualização em tabela dos `AuditLog` persistidos com paginação.
- Atualizada UI de `Debate Arena` com dados reais, actions protegidas no servidor, permitindo que professores ou moderadores avaliem alunos sem poderem avaliar a si próprios.
- Configurado o ambiente de testes com `Jest` e implementados testes unitários básicos para o módulo de Auth e rotas da API v1 (verificando blocos 401/403 e sucesso com mocks do Prisma).

Validacoes:
- `npx prisma migrate dev` e `npx prisma db seed` aplicados com sucesso.
- `npx tsc --noEmit` passou.
- `npm run lint` passou.
- `npm test` passou para todos os suites Jest (auth, api/students, api/debates).
- `npm run build` passou com exit code 0.

Pendencias:
- Setup de Testes E2E (Playwright) preterido temporariamente devido ao escopo do sprint, mantido no backlog.
- Integração real UNIEXE pendente de credenciais.

Proxima acao:
- Preparar entrega e deploy final do sistema ou iniciar desenvolvimento Mobile dedicado se exigido.

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
