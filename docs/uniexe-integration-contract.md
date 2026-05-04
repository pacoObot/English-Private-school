# Contrato Inicial de Integracao UNIEXE

Ultima atualizacao: 2026-04-29

## Objetivo

Definir o primeiro contrato de dados exportaveis do Delson PS Academic para uma futura integracao com a UNIEXE, sem acoplar o sistema atual a uma API externa nesta fase.

## Principios

- A exportacao deve usar dados persistidos no Prisma.
- O ponto principal de extração de dados para a UNIEXE é a **API REST v1** (`/api/v1/...`).
- Nenhum segredo, hash de palavra-passe ou dado interno de sessao deve ser exportado.
- Cada exportacao deve registrar `AuditLog`.
- Operacoes de envio para a UNIEXE devem ser idempotentes sempre que possivel.
- A especificação completa da API pode ser encontrada em `docs/api-spec.md`.
- Campos sensiveis devem passar por revisao antes de qualquer ambiente de producao.

## Entidades exportaveis

### User

Campos iniciais:
- `id`
- `name`
- `email`
- `role`
- `isActive`
- `createdAt`
- `updatedAt`

Excluido:
- `passwordHash`
- tokens ou dados de sessao

### StudentProfile

Campos iniciais:
- `id`
- `userId`
- `studentNumber`
- `level`
- `phone`
- `guardianName`
- `createdAt`
- `updatedAt`

### Course

Campos iniciais:
- `id`
- `title`
- `level`
- `description`
- `duration`
- `isActive`
- `createdAt`
- `updatedAt`

### ClassGroup

Campos iniciais:
- `id`
- `name`
- `room`
- `schedule`
- `courseId`
- `teacherId`
- `startsAt`
- `endsAt`
- `createdAt`
- `updatedAt`

### Enrollment

Campos iniciais:
- `id`
- `studentId`
- `courseId`
- `classGroupId`
- `status`
- `enrolledAt`
- `createdAt`
- `updatedAt`

Observacao:
- A mensalidade operacional do Sprint 3 fica materializada na fatura (`Invoice.amountMt`) gerada no ato da matricula.

### Grade

Campos iniciais:
- `id`
- `studentId`
- `classGroupId`
- `title`
- `score`
- `maxScore`
- `weight`
- `gradedAt`
- `createdAt`
- `updatedAt`

### Attendance

Campos iniciais:
- `id`
- `studentId`
- `classGroupId`
- `lessonDate`
- `status`
- `notes`
- `createdAt`
- `updatedAt`

### DebateEvaluation

Campos iniciais:
- `id`
- `sessionId`
- `studentId`
- `fluency`
- `argumentation`
- `posture`
- `feedback`
- `evaluatedAt`
- `createdAt`
- `updatedAt`

## Estados e enumeracoes

- `Role`: `SUPER_ADMIN`, `ADMIN`, `TEACHER`, `STUDENT`
- `EnrollmentStatus`: `ACTIVE`, `PENDING`, `COMPLETED`, `SUSPENDED`
- `AttendanceStatus`: `PRESENT`, `ABSENT`, `LATE`, `EXCUSED`
- `InvoiceStatus`: `PENDING`, `PAID`, `OVERDUE`, `CANCELLED`

## Formato recomendado

JSON UTF-8, com datas em ISO 8601.

Exemplo:

```json
{
  "entity": "Enrollment",
  "version": "2026-04-29",
  "exportedAt": "2026-04-29T00:00:00.000Z",
  "items": []
}
```

## Pendencias antes de implementar a integracao

- Confirmar endpoint, autenticacao e ambiente de testes da UNIEXE.
- Definir paginacao e limites por entidade.
- Definir mapeamento oficial de cursos, turmas e estados.
- Definir regras de consentimento e minimizacao de dados pessoais.
- Criar job ou Server Action de exportacao com RBAC e `AuditLog`.
