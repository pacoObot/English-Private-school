# Guia de Teste Manual: Fluxo da Arena de Debates

Este guia detalha as credenciais padrão do projeto e o passo a passo para testar manualmente o ciclo completo da **Arena de Debates**, desde a criação de alunos até a recepção e confirmação de feedback pelo estudante.

---

## 🔑 Credenciais de Teste Padrão

Todas as contas abaixo possuem a mesma palavra-passe padrão: `Delson@2026`

| Nome | E-mail / Identificador | Função (Role) | Permissão de Moderação |
| :--- | :--- | :--- | :--- |
| **Direção Geral** | `super.admin@delsonps.local` | `SUPER_ADMIN` | Sim (Global) |
| **Secretaria Académica** | `secretaria@delsonps.local` | `ADMIN` | Sim (Global) |
| **Nelson Manuel** | `nelson.manuel@delsonps.local` | `TEACHER` | Sim (`canModerateDebates: true`) |
| **Marta Chissano** | `marta.chissano@delsonps.local` | `TEACHER` | Não |
| **Ester Mucavele** | `ester.mucavele@delsonps.local` | `STUDENT` | Sim (`canModerateDebates: true`) |
| **Anderson Nhantumbo** | `anderson.nhantumbo@delsonps.local` | `STUDENT` | Não |
| **Paulo Matavele** | `paulo.matavele@delsonps.local` | `STUDENT` | Não |
| **Maria Uamusse** | `maria.uamusse@delsonps.local` | `STUDENT` | Não |

---

## 🔄 Fluxo de Teste de Ponta a Ponta

Siga os passos abaixo para testar todo o fluxo da funcionalidade da Arena de Debates.

### Passo 1: Adicionar Estudantes de Teste Manualmente
1. Aceda a [http://localhost:3000/login](http://localhost:3000/login).
2. Inicie sessão como **Super Admin** (`super.admin@delsonps.local` / `Delson@2026`) ou **Admin** (`secretaria@delsonps.local`).
3. Vá para a página de Alunos clicando em **Estudantes** no menu lateral (ou aceda diretamente a `/admin/students`).
4. Clique no botão **Adicionar Aluno** (ou use a importação em lote por CSV).
5. Preencha o formulário com dados de um estudante real de teste (ex: *Carlos Tembe*, e-mail: `carlos.tembe@delsonps.local`). O código de estudante será gerado automaticamente.
6. Clique em **Guardar**.
7. *(Opcional)* Se quiser que este aluno de teste também possa ser designado como instrutor de debate mais tarde, ative o interruptor **Instrutor ON/OFF** na lista correspondente a este estudante.

### Passo 2: Criar Sessão de Debate e Designar um Instrutor
1. Ainda logado como Admin/Super Admin, aceda à página de Debates no menu lateral (ou vá para `/debate`).
2. Pode agendar uma nova sessão clicando em **Agendar Debate** no topo direito, ou ir à aba **Sugestões da Comunidade** e clicar em **Aprovar** numa ideia sugerida pelos estudantes.
3. No formulário de criação/aprovação:
   - Introduza o **Tema** do debate.
   - Defina a **Data/Hora**, **Capacidade** e **Local**.
   - No campo **Instrutor (Moderador)**, selecione qualquer utilizador que tenha permissão de moderação (ex: o professor `Nelson Manuel` ou a estudante destaque `Ester Mucavele`).
   - Se desejar, adicione uma data de expiração da permissão temporária (ex: 2 dias à frente) e uma **Nota para o Instrutor**.
4. Clique em **Agendar Sessão** (ou **Aprovar Sugestão**).
5. O debate estará agora no estado `SCHEDULED` (Agendado).

### Passo 3: Criar Grupo (Inscrição de Alunos no Debate)
Como gestor do debate, pode inscrever os alunos participantes:
1. Clique no debate criado na lista para abrir os detalhes (`/debate/[id]`).
2. Aceda ao bloco **Inscrição Rápida** na coluna esquerda.
3. Selecione os estudantes reais de teste criados anteriormente (ex: *Anderson Nhantumbo*, *Carlos Tembe*) a partir do menu suspenso de alunos disponíveis e clique em **Adicionar à Sessão**.
4. Os alunos aparecerão imediatamente na tabela **Alunos em Arena** (lado direito) como participantes inscritos.
5. *(Alternativo)* Os próprios estudantes podem iniciar sessão, aceder a `/debate/[id]` e clicar no botão **Participar do Debate** para se inscreverem autonomamente.

### Passo 4: Iniciar o Debate (Instrutor)
1. Termine a sessão do painel de Admin e inicie sessão com o **Instrutor designado** para o debate (ex: Professor Nelson Manuel: `nelson.manuel@delsonps.local` / `Delson@2026`).
2. Aceda a **Debate** no menu e clique no debate atribuído.
3. Como é o instrutor designado, terá botões de controlo. Clique em **Iniciar Debate**.
4. O estado do debate mudará para `ACTIVE` (Ativo), o que habilita as avaliações ao vivo.

### Passo 5: Avaliação ao Vivo e Envio de Feedback (Instrutor)
1. Na lista de **Alunos em Arena**, clique em **Avaliar Fala** no cartão do aluno correspondente.
2. O formulário/modal de avaliação abrirá. Insira as classificações de **1 a 10** nas três métricas obrigatórias:
   - **Fluência e Vocabulário**
   - **Poder de Argumentação**
   - **Postura e Linguagem Corporal**
3. Escreva um feedback construtivo no campo **Feedback Qualitativo** (ex: *"Excelente uso de transições e vocabulário técnico, no entanto deve tentar controlar o ritmo da respiração"*).
4. Clique em **Publicar Avaliação**.
5. O indicador ao lado do aluno mudará, mostrando um visto verde de avaliação e o rótulo **Pendente** (aguardando leitura do estudante). Repita o processo para os restantes oradores do grupo.

### Passo 6: Terminar a Sessão de Debate
1. Quando todos os estudantes participantes terminarem as suas apresentações e tiverem sido avaliados, clique em **Fechar Sessão** no cabeçalho do debate.
2. O debate passa a estar no estado `CLOSED` (Fechado).

### Passo 7: Conferir e Confirmar Feedback (Estudante)
1. Faça login com a conta de um dos estudantes avaliados (ex: `anderson.nhantumbo@delsonps.local` / `Delson@2026`).
2. No topo direito, o sininho de notificações mostrará um alerta: *"Nelson Manuel avaliou a tua participação..."*.
3. O estudante pode clicar no alerta de notificação ou aceder a **Debates** (no menu do estudante) para abrir o seu histórico (`/student/debates`).
4. Na página, as notas e o feedback qualitativo do instrutor estarão visíveis.
5. O estudante clica no botão **Certo, recebido** para assinalar que leu a avaliação.
6. A notificação desaparece do sininho (é marcada como lida) e o feedback é atualizado para o estado "Confirmado" / "Recebido".

### Passo 8: Verificação do Instrutor
1. Se voltar a iniciar sessão como o **Instrutor** (Nelson) e consultar a página do debate fechado, verá que o cartão do aluno avaliado que confirmou a leitura agora exibe um visto verde com a indicação **Recebido**, fechando o ciclo de comunicação com sucesso.
