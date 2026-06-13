# Estado do Projeto

Ultima atualizacao: 2026-06-12 11:05 SAST

## Resumo atual

O projeto Delson PS Academic está funcional, compilável e com feedback de utilizador aprimorado. Integrou-se um sistema realimentado de habilidades dinâmicas de conversação e escrita (**Speaking Skills** e **Writing Mastery**):
1. **Speaking Skills (Oratória)**: Calcula em tempo real o percentual baseado em avaliações de debates na Arena de Debates, com um fallback inteligente para avaliações académicas de expressão oral.
2. **Writing Mastery (Escrita & Gramática)**: Extrai notas reais de avaliações de escrita, testes e fichas a partir do histórico escolar do aluno para gerar a proficiência percentual.
3. **Visão Integradora do Administrador**: O **Radar de Talentos** unifica e exibe a performance Speaking/Writing individual e calcula o percentual de **Proficiência Geral** em tabelas responsivas.

## Estado por area

| Area | Estado | Observacoes |
| --- | --- | --- |
| Estrutura Next.js | ✅ Estavel | App Router compila com `npm run build` com sucesso. |
| Identidade Visual | ✅ Estavel | Navy + Crimson integrados nos popups com overlay e desfoque. |
| UI Responsiva | ✅ Operacional | Form de alunos, popups dinâmicos de credenciais, barras de habilidades dinâmicas. |
| Prisma/PostgreSQL | ✅ Schema estavel | Schema expandido com suporte para debateSessionId em Notifications. |
| Autenticacao | ✅ Estavel | Login case-insensitive, suporta email/codigo/staffNumber. |
| Super Admin | ✅ Operacional | Dashboard, gestão de staff e alunos usam popups para credenciais e erros. |
| Admin | ✅ Operacional | Registo e matrículas contínuas com popups, erros detalhados e sugestão inteligente. |
| Docente | ✅ Operacional | Lançamento de avaliações de debates e envio de feedback com popups. |
| Estudante | ✅ Operacional | Dashboard com progresso de oratória/escrita em tempo real e aba Notas atualizada. |
| Debate Arena | ✅ Funcional | Fluxo completo operante com designação, notificações formais e atalho direto. |
| Materiais | ✅ Operacional | Upload cria diretorio local se necessario; API v1 activa. |
| Calendário | ✅ Operacional | Gestão do Calendário Académico e feed na view de estudante implementados. |
| Docker | ✅ Estavel | Configurado com node:20-alpine para build/run local 100% offline. |
| Build/Lint/Testes | ✅ Validado | Typecheck (`tsc`) e build de produção executados com sucesso total (38 rotas). |
| Seguranca | ✅ Mantida | RBAC e guards preservados; credenciais temporárias exibidas de forma segura. |

## Ultima tarefa concluida

Sprint de Correções e Lançamento Vercel - 2026-06-12 14:00 SAST:
- **Infraestrutura**: Configurado `directUrl` no Prisma para migrações na Vercel e `SKIP_DB_CHECK` no entrypoint do Docker.
- **Recibos**: Resolvida a criação automática de `Receipt` na DB na transição de faturas para `PAID`.
- **Rastreabilidade**: Integradas as flags `isWriting`/`isSpeaking` no lançamento de notas do Docente e tags `[🗣️ Oratória]` e `[✍️ Escrita]` no histórico do Estudante.
- **Fórmulas Académicas**: Atualizada a média global para ponderada normalizada (base 20) e percentuais de competências com base nas flags de avaliação.
- **Upload Resiliente**: Integrado upload com Supabase Storage (produção) mantendo fallback local offline (desenvolvimento).
- **Melhorias Admin**: Erros de CSV detalhados exibidos no popup `ActionNotice` e datas de início/fim configuráveis para turmas.
- **Feedback Visual**: Implementado o componente `LoginSubmitButton` com spinner animado e estado de carregamento "A processar..." na página de login para dar feedback imediato ao usuário.

## Validacoes desta tarefa

- Testes Unitários: ✅ 8/8 testes passando (sucesso total).
- Typecheck e Linting: ✅ TypeScript compilando com sucesso completo (0 erros via `npx tsc --noEmit`) e lint limpo.
- Banco de Dados: ✅ Migrações Prisma de visibilidade de feedbacks e flags de competência aplicadas localmente e na base de dados Supabase na Irlanda (eu-west-1).

## Pendencias conhecidas

- **Configurar Variáveis na Vercel**: Guardar as variáveis de ambiente na Vercel com os valores corretos da região `eu-west-1` (Irlanda).
- Presenças automáticas por foto (Fase 7: Ideia Futura) no backlog.
- Sincronizacao financeira bidirecional com UNIEXE.
- Exportacao CSV/Excel e testes E2E Playwright no backlog.

## Proxima acao recomendada

1. Concluir a configuração das variáveis na Vercel e efetuar o redeploy.
2. Validar os fluxos em produção na URL pública da Vercel (turmas com datas, notas com checkboxes, verificação de tags e recibos em PDF).
