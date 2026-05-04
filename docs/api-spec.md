# Especificação da API REST (v1)

## Base URL
`/api/v1`

## Respostas Padrão
Todas as respostas seguem o formato JSON:

### Sucesso (2xx)
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

### Erro (4xx, 5xx)
```json
{
  "success": false,
  "error": {
    "message": "Mensagem de erro",
    "code": "BAD_REQUEST"
  }
}
```

---

## Endpoints

### 1. Utilizadores (Users)
- **`GET /api/v1/users`**
  - **Permissões:** `SUPER_ADMIN`, `ADMIN`
  - **Descrição:** Lista todos os utilizadores registados.
  - **Query:** `?page=1&limit=20`

### 2. Alunos (Students)
- **`GET /api/v1/students`**
  - **Permissões:** `SUPER_ADMIN`, `ADMIN`
  - **Descrição:** Lista perfis de alunos com os respetivos utilizadores base.
- **`POST /api/v1/students`**
  - **Permissões:** `SUPER_ADMIN`, `ADMIN`
  - **Body:** `{ name, email, studentNumber, level, phone, guardianName }`
  - **Descrição:** Cria um utilizador base e um perfil de aluno.

### 3. Cursos (Courses)
- **`GET /api/v1/courses`**
  - **Permissões:** `SUPER_ADMIN`, `ADMIN`
  - **Descrição:** Lista cursos ativos.
- **`POST /api/v1/courses`**
  - **Permissões:** `SUPER_ADMIN`, `ADMIN`
  - **Body:** `{ title, level, description, duration }`

### 4. Turmas (Classes)
- **`GET /api/v1/classes`**
  - **Permissões:** `SUPER_ADMIN`, `ADMIN`
  - **Descrição:** Lista turmas incluindo curso e professor responsável.
- **`POST /api/v1/classes`**
  - **Permissões:** `SUPER_ADMIN`, `ADMIN`
  - **Body:** `{ name, room, schedule, courseId, teacherId }`

### 5. Matrículas (Enrollments)
- **`GET /api/v1/enrollments`**
  - **Permissões:** `SUPER_ADMIN`, `ADMIN`
  - **Descrição:** Histórico de matrículas.
- **`POST /api/v1/enrollments`**
  - **Permissões:** `SUPER_ADMIN`, `ADMIN`
  - **Body:** `{ studentId, courseId, classGroupId, status }`

### 6. Faturas (Invoices)
- **`GET /api/v1/invoices`**
  - **Permissões:** `SUPER_ADMIN`, `ADMIN`
  - **Descrição:** Lista faturas emitidas e o estado de pagamento.

### 7. Notas (Grades)
- **`GET /api/v1/grades`**
  - **Permissões:** `SUPER_ADMIN`, `ADMIN`, `TEACHER`
  - **Descrição:** Exporta histórico de avaliações.

### 8. Frequências (Attendance)
- **`GET /api/v1/attendance`**
  - **Permissões:** `SUPER_ADMIN`, `ADMIN`, `TEACHER`
  - **Descrição:** Exporta assiduidade dos alunos.

### 9. Sessões de Debate (Debates)
- **`GET /api/v1/debates`**
  - **Permissões:** `SUPER_ADMIN`, `ADMIN`, `TEACHER`
  - **Descrição:** Lista sessões de debate e contagem de participantes/avaliações.
