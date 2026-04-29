# Checklist de Fim de Tarefa

Use esta checklist antes de encerrar qualquer tarefa.

## 1. Resultado

- [ ] O objetivo pedido pelo utilizador foi cumprido.
- [ ] Os ficheiros alterados pertencem ao escopo da tarefa.
- [ ] Nao foram revertidas alteracoes de outra pessoa/sessao.

## 2. Validacao

- [ ] `npm run lint` executado, quando aplicavel.
- [ ] `npm run build` executado, quando aplicavel.
- [ ] Testes especificos executados, quando existirem.
- [ ] Rotas/paginas verificadas manualmente, quando houver UI.
- [ ] Responsividade validada em mobile/tablet/desktop, quando houver UI.

## 3. Seguranca

- [ ] Sem segredos expostos.
- [ ] Sem dados reais sensiveis em seed, logs ou screenshots.
- [ ] Autorizacao por role considerada quando a tarefa toca rotas protegidas.
- [ ] Operacoes destrutivas exigem confirmacao ou protecao adequada.

## 4. Documentacao

- [ ] `README.md` atualizado se comandos, setup ou comportamento mudaram.
- [ ] `docs/project/PROJECT_OVERVIEW.md` atualizado se arquitetura/modulos mudaram.
- [ ] README da feature atualizado se a mudanca afeta um modulo especifico.

## 5. Continuidade obrigatoria

- [ ] `docs/project/PROJECT_STATUS.md` atualizado.
- [ ] `docs/project/TASK_LOG.md` recebeu nova entrada.
- [ ] Pendencias e proxima acao registradas.
- [ ] Validacoes executadas e nao executadas registradas.
