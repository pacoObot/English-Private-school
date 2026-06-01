# Guia de Validação e Tratamento de Erros Estruturados

Este documento descreve de forma estruturada como o sistema valida os dados do lado do servidor (Server Actions) e como esses erros são transmitidos e renderizados de forma reativa e amigável na interface pelo componente [ActionNotice](file:///home/paco/Trabalhos_UJAC/Delson_PS/src/components/ui/ActionNotice.tsx).

---

## 📌 Mecanismo de Fluxo de Erros

Quando ocorre uma falha na validação de campos obrigatórios ou conflito na base de dados durante uma operação nas Server Actions, o backend redireciona o utilizador de volta para a respetiva página injetando parâmetros descritivos na query string do URL:

```
/admin/students?status=validation_error&missing=name,level
```

O componente `ActionNotice` intercepta esses parâmetros e formata uma caixa de ajuda detalhada (`rose`), mapeando cada código técnico para explicações amigáveis e ações recomendadas de resolução.

---

## 🛠️ Casos de Validação Mapeados

### 1. Campos Obrigatórios em Falta (`missing`)
Quando campos obrigatórios do formulário não são fornecidos, eles são adicionados à query no parâmetro `missing`, separados por vírgula.

| Campo (`missing`) | Nome do Campo Visual | Causa Detalhada no Popup | Resolução Recomendada |
| :--- | :--- | :--- | :--- |
| `name` | Nome Completo | O nome completo da pessoa está em falta no formulário. | Preencha o campo 'Nome Completo' no topo com o nome oficial. |
| `level` | Nível Académico | O nível de ensino do aluno não foi selecionado. | Selecione um nível válido (ex: 1º Nível) na lista suspensa 'Nível'. |
| `role` | Cargo / Perfil de Acesso | Nenhum perfil de acesso (Role) foi atribuído para este funcionário. | Escolha uma das funções administrativas ou docentes (ex: Admin, Docente) no menu 'Função'. |
| `studentId` | Seleção do Estudante | Nenhum aluno foi selecionado para efetuar esta matrícula acadêmica. | Selecione o nome do aluno na lista suspensa (dropdown) 'Aluno' antes de clicar no botão. |
| `courseId` | Seleção do Curso | Nenhum curso foi selecionado para vincular à matrícula. | Escolha um dos cursos ativos na lista suspensa 'Curso'. |
| `classGroupId` | Seleção da Turma | Nenhuma turma foi selecionada para o estudante. | Escolha uma turma correspondente ao curso selecionado na lista suspensa 'Turma'. |
| `monthlyFeeMt` | Valor da Mensalidade | O valor da mensalidade está em falta, é negativo ou igual a zero. | Introduza um valor numérico positivo para a mensalidade no campo 'Mensalidade'. |

---

### 2. Formato de Dados Inválido (`invalid`)
Quando o dado possui um formato incorreto que viola regras de formatação (ex: expressões regulares de e-mail).

| Parâmetro (`invalid`) | Campo Visual | Causa Detalhada no Popup | Resolução Recomendada |
| :--- | :--- | :--- | :--- |
| `email` | Endereço de E-mail | O formato do e-mail introduzido é inválido. | Introduza um e-mail válido (ex: nome@dominio.com). Caso o e-mail seja opcional, pode deixá-lo vazio para evitar o conflito. |

---

### 3. Conflitos e Duplicidades na Base de Dados (`duplicate`)
Quando o Prisma interceta uma exceção de chave única (`P2002`) ao tentar guardar registos duplicados na base de dados PostgreSQL.

| Parâmetro (`duplicate`) | Campo Impactado | Causa Detalhada no Popup | Resolução Recomendada |
| :--- | :--- | :--- | :--- |
| `email` | Endereço de E-mail | Este endereço de e-mail já está associado a outro utilizador. | Forneça um e-mail exclusivo ou limpe o campo se o e-mail não for obrigatório (como em estudantes). |
| `studentNumber` | Número de Estudante | O número de estudante fornecido já está registado por outro aluno. | Insira um número de estudante exclusivo ou deixe em branco para que o sistema gere um de forma automática. |
| `studentCode` | Código de Estudante | O código gerado automaticamente já existe. | Tente novamente para que o sistema gere um novo código aleatório seguro. |
| `staffNumber` | Número de Staff | Este número de staff já está associado a outro registo. | Insira um número de staff exclusivo ou deixe vazio se o sistema autogerar. |
| `enrollment` | Matrícula no Curso | O estudante já está matriculado nesta turma específica. | Verifique a lista de matrículas ou selecione uma turma diferente para este aluno. |
| `attendance` | Registo de Presença | Já foi feito o registo de presença deste aluno para a data indicada. | Verifique se a data está correta ou se já submeteu a chamada desta turma hoje. |
| `evaluation` | Avaliação de Debate | Este participante já possui uma nota de debate lançada para esta sessão. | Aceda aos detalhes do debate para editar a nota do participante se necessário, em vez de criar uma nova. |

---

## 💻 Exemplo Prático de Erro Simulado
Se tentar registar um Estudante sem introduzir o **Nome Completo** e fornecendo um **E-mail Inválido**:
1. O backend redireciona para: `/admin/students?status=validation_error&missing=name&invalid=email`
2. O `ActionNotice` renderiza o modal vermelho com overlay desfocado contendo:
   - **Título**: Erro de Validação
   - **Campos Obrigatórios em Falta**: Nome Completo (Instrução: Preencher o campo 'Nome Completo' no topo).
   - **Campos com Erro de Formato**: Endereço de E-mail (Instrução: Introduza um e-mail válido).
3. O utilizador clica em "Fechar" para limpar os parâmetros do URL de forma reativa e corrigir os dados.
