# Estado do Projeto

Ultima atualizacao: 2026-06-05 13:00 SAST

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

Execução de Scripts SQL e Resolução de Conectividade Vercel - 2026-06-05 13:10 SAST:
- **Estrutura e Seed Criados**: Tabelas e dados de teste povoados com sucesso diretamente no editor SQL do Supabase.
- **Falha de Conexão na Vercel**: Identificado que o ambiente serverless da Vercel não consegue ligar via porta 5432 direta (retornando `?error=db`).

## Validacoes desta tarefa

- Estrutura e dados no Supabase: ✅ Sucesso total.
- Deploy Vercel: ⚠️ Ativo, mas com conexão ao banco pendente de ajuste para a porta 6543.

## Pendencias conhecidas

- **Ajustar Variáveis na Vercel**: Alterar a variável `DATABASE_URL` no painel da Vercel para a URI do Transaction Pooler (porta 6543) com `pgbouncer=true` e `connection_limit=1`.
- Presenças automáticas por foto (Fase 7: Ideia Futura) está no backlog para futura implementação.
- Sincronizacao financeira bidirecional com UNIEXE continua aguardando credenciais de produção.
- Exportacao CSV/Excel e testes E2E Playwright continuam no backlog.

## Proxima acao recomendada

1. Aceder ao painel da Vercel e alterar a variável `DATABASE_URL` para a URL do Pooler com o formato correto.
2. Efetuar o redeploy do projeto na Vercel para recarregar as variáveis.
3. Testar o login novamente na URL pública com as credenciais do Super Admin.
