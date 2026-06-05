const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const outputFile = path.join(__dirname, '../prisma/supabase_seed.sql');

const ITERATIONS = 210000;
const KEY_LENGTH = 32;
const DIGEST = "sha256";

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("base64url");
  const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString("base64url");
  return `pbkdf2:${ITERATIONS}:${salt}:${hash}`;
}

function sqlVal(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'boolean') return val ? 'true' : 'false';
  if (val instanceof Date) return `'${val.toISOString()}'`;
  if (typeof val === 'number') return String(val);
  // escape single quotes
  return `'${String(val).replace(/'/g, "''")}'`;
}

async function run() {
  const passwordHash = hashPassword("Delson@2026");
  
  let sql = `-- Delson PS Academic - Seed Data Setup\n`;
  sql += `-- Generated on ${new Date().toISOString()}\n\n`;
  
  sql += `BEGIN;\n\n`;

  // Clean old seed data if necessary
  sql += `-- Clean existing data\n`;
  sql += `TRUNCATE TABLE "Notification", "DebateProposalReaction", "AuditLog", "DebateEvaluation", "DebateParticipant", "DebateSession", "DebateProposal", "Receipt", "Invoice", "Grade", "Attendance", "StudyMaterial", "Enrollment", "ClassGroup", "Course", "StudentProfile", "TeacherProfile", "User" CASCADE;\n\n`;

  // 1. Users & Profiles
  const superAdminId = crypto.randomUUID();
  sql += `-- Create Super Admin\n`;
  sql += `INSERT INTO "User" ("id", "name", "email", "passwordHash", "role", "isActive", "createdAt", "updatedAt") VALUES (\n`;
  sql += `  '${superAdminId}', 'Direcao Geral', 'super.admin@delsonps.local', '${passwordHash}', 'SUPER_ADMIN', true, now(), now()\n`;
  sql += `);\n\n`;

  const adminId = crypto.randomUUID();
  sql += `-- Create Admin\n`;
  sql += `INSERT INTO "User" ("id", "name", "email", "passwordHash", "role", "isActive", "createdAt", "updatedAt") VALUES (\n`;
  sql += `  '${adminId}', 'Secretaria Academica', 'secretaria@delsonps.local', '${passwordHash}', 'ADMIN', true, now(), now()\n`;
  sql += `);\n\n`;

  // Teachers
  const teacher1UserId = crypto.randomUUID();
  const teacher1ProfileId = crypto.randomUUID();
  sql += `-- Create Teacher Nelson Manuel\n`;
  sql += `INSERT INTO "User" ("id", "name", "email", "passwordHash", "role", "canModerateDebates", "isActive", "createdAt", "updatedAt") VALUES (\n`;
  sql += `  '${teacher1UserId}', 'Nelson Manuel', 'nelson.manuel@delsonps.local', '${passwordHash}', 'TEACHER', true, true, now(), now()\n`;
  sql += `);\n`;
  sql += `INSERT INTO "TeacherProfile" ("id", "userId", "staffNumber", "specialty", "phone", "createdAt", "updatedAt") VALUES (\n`;
  sql += `  '${teacher1ProfileId}', '${teacher1UserId}', 'DSP-INS-001', 'Business English e Debate', NULL, now(), now()\n`;
  sql += `);\n\n`;

  const teacher2UserId = crypto.randomUUID();
  const teacher2ProfileId = crypto.randomUUID();
  sql += `-- Create Teacher Marta Chissano\n`;
  sql += `INSERT INTO "User" ("id", "name", "email", "passwordHash", "role", "canModerateDebates", "isActive", "createdAt", "updatedAt") VALUES (\n`;
  sql += `  '${teacher2UserId}', 'Marta Chissano', 'marta.chissano@delsonps.local', '${passwordHash}', 'TEACHER', false, true, now(), now()\n`;
  sql += `);\n`;
  sql += `INSERT INTO "TeacherProfile" ("id", "userId", "staffNumber", "specialty", "phone", "createdAt", "updatedAt") VALUES (\n`;
  sql += `  '${teacher2ProfileId}', '${teacher2UserId}', 'DSP-INS-002', 'General English', NULL, now(), now()\n`;
  sql += `);\n\n`;

  // Students
  const studentSeeds = [
    ["Ester Mucavele", "ester.mucavele@delsonps.local", "DSP-2026-001", "B2 Upper Intermediate", true],
    ["Anderson Nhantumbo", "anderson.nhantumbo@delsonps.local", "DSP-2026-002", "B2 Upper Intermediate", false],
    ["Paulo Matavele", "paulo.matavele@delsonps.local", "DSP-2026-003", "B1 Intermediate", false],
    ["Maria Uamusse", "maria.uamusse@delsonps.local", "DSP-2026-004", "B1 Intermediate", false],
    ["Delson Simango", "delson.simango@delsonps.local", "DSP-2026-005", "A2 Elementary", false],
    ["Alfredo Cossa", "alfredo.cossa@delsonps.local", "DSP-2026-006", "A2 Elementary", false],
    ["Ana Muthemba", "ana.muthemba@delsonps.local", "DSP-2026-007", "C1 Advanced", false]
  ];

  const students = []; // array of { userId, profileId, name, code, email, level }
  
  sql += `-- Create Students and profiles\n`;
  for (const [name, email, code, level, canModerate] of studentSeeds) {
    const userId = crypto.randomUUID();
    const profileId = crypto.randomUUID();
    students.push({ userId, profileId, name, code, email, level });

    sql += `INSERT INTO "User" ("id", "name", "email", "passwordHash", "role", "canModerateDebates", "isActive", "createdAt", "updatedAt") VALUES (\n`;
    sql += `  '${userId}', ${sqlVal(name)}, ${sqlVal(email)}, '${passwordHash}', 'STUDENT', ${sqlVal(canModerate)}, true, now(), now()\n`;
    sql += `);\n`;
    sql += `INSERT INTO "StudentProfile" ("id", "userId", "studentNumber", "studentCode", "level", "phone", "guardianName", "createdAt", "updatedAt") VALUES (\n`;
    sql += `  '${profileId}', '${userId}', '${code}', '${code}', ${sqlVal(level)}, '+258 84 000 0000', NULL, now(), now()\n`;
    sql += `);\n`;
  }
  sql += `\n`;

  // 2. Courses
  const businessCourseId = crypto.randomUUID();
  sql += `-- Create Courses\n`;
  sql += `INSERT INTO "Course" ("id", "title", "level", "description", "duration", "isActive", "createdAt", "updatedAt") VALUES (\n`;
  sql += `  '${businessCourseId}', 'Ingles para Negocios', 'B2', 'Vocabulário profissional, escrita formal, reuniões e apresentações.', '12 semanas', true, now(), now()\n`;
  sql += `);\n`;

  const generalCourseId = crypto.randomUUID();
  sql += `INSERT INTO "Course" ("id", "title", "level", "description", "duration", "isActive", "createdAt", "updatedAt") VALUES (\n`;
  sql += `  '${generalCourseId}', 'Ingles Geral', 'B1', 'Gramática prática, conversação e compreensão oral para uso diário.', '10 semanas', true, now(), now()\n`;
  sql += `);\n\n`;

  // 3. ClassGroups
  const class1Id = crypto.randomUUID();
  sql += `-- Create Class Groups\n`;
  sql += `INSERT INTO "ClassGroup" ("id", "name", "room", "schedule", "courseId", "teacherId", "startsAt", "endsAt", "createdAt", "updatedAt") VALUES (\n`;
  sql += `  '${class1Id}', 'B2 Noite', 'Sala 04', 'Seg/Qua 19:30', '${businessCourseId}', '${teacher1ProfileId}', '2026-05-04T17:30:00.000Z', '2026-07-29T19:00:00.000Z', now(), now()\n`;
  sql += `);\n`;

  const class2Id = crypto.randomUUID();
  sql += `INSERT INTO "ClassGroup" ("id", "name", "room", "schedule", "courseId", "teacherId", "startsAt", "endsAt", "createdAt", "updatedAt") VALUES (\n`;
  sql += `  '${class2Id}', 'B1 Manha', 'Sala 02', 'Ter/Qui 08:30', '${generalCourseId}', '${teacher2ProfileId}', '2026-05-05T06:30:00.000Z', '2026-07-16T08:00:00.000Z', now(), now()\n`;
  sql += `);\n\n`;

  // 4. Enrollments
  const enrollments = []; // { id, studentId, courseId, classGroupId }
  sql += `-- Create Enrollments\n`;
  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    const isBusiness = i < 3 || i === 6;
    const courseId = isBusiness ? businessCourseId : generalCourseId;
    const classGroupId = isBusiness ? class1Id : class2Id;
    const enrollId = crypto.randomUUID();
    enrollments.push({ id: enrollId, studentId: student.profileId, courseId, classGroupId });

    sql += `INSERT INTO "Enrollment" ("id", "studentId", "courseId", "classGroupId", "status", "enrolledAt", "createdAt", "updatedAt") VALUES (\n`;
    sql += `  '${enrollId}', '${student.profileId}', '${courseId}', '${classGroupId}', 'ACTIVE', now(), now(), now()\n`;
    sql += `);\n`;
  }
  sql += `\n`;

  // 5. StudyMaterials
  sql += `-- Create Study Materials\n`;
  sql += `INSERT INTO "StudyMaterial" ("id", "title", "unit", "description", "fileUrl", "courseId", "teacherId", "createdAt", "updatedAt") VALUES\n`;
  sql += `  ('${crypto.randomUUID()}', 'Negotiation Vocabulary', 'Unit 04', 'Expressões para propostas, contrapropostas e encerramento de acordos.', NULL, '${businessCourseId}', '${teacher1ProfileId}', now(), now()),\n`;
  sql += `  ('${crypto.randomUUID()}', 'Formal Email Patterns', 'Unit 05', 'Modelos de email profissional com pedidos, anexos e seguimento.', NULL, '${businessCourseId}', '${teacher1ProfileId}', now(), now()),\n`;
  sql += `  ('${crypto.randomUUID()}', 'Daily Conversation Review', 'Unit 02', 'Perguntas frequentes, respostas curtas e vocabulário de rotina.', NULL, '${generalCourseId}', '${teacher2ProfileId}', now(), now());\n\n`;

  // 6. Attendance, Grades
  sql += `-- Create Attendance and Grades\n`;
  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    const classGroupId = i < 3 || i === 6 ? class1Id : class2Id;
    
    // Attendance 1
    const attStatus1 = i === 4 ? 'LATE' : 'PRESENT';
    sql += `INSERT INTO "Attendance" ("id", "studentId", "classGroupId", "lessonDate", "status", "notes", "createdAt", "updatedAt") VALUES (\n`;
    sql += `  '${crypto.randomUUID()}', '${student.profileId}', '${classGroupId}', '2026-05-06T00:00:00.000Z', '${attStatus1}', NULL, now(), now()\n`;
    sql += `);\n`;

    // Attendance 2
    const attStatus2 = i === 5 ? 'ABSENT' : 'PRESENT';
    sql += `INSERT INTO "Attendance" ("id", "studentId", "classGroupId", "lessonDate", "status", "notes", "createdAt", "updatedAt") VALUES (\n`;
    sql += `  '${crypto.randomUUID()}', '${student.profileId}', '${classGroupId}', '2026-05-08T00:00:00.000Z', '${attStatus2}', NULL, now(), now()\n`;
    sql += `);\n`;

    // Grade
    const score = 13 + (i % 5);
    sql += `INSERT INTO "Grade" ("id", "studentId", "classGroupId", "title", "score", "maxScore", "weight", "gradedAt", "createdAt", "updatedAt") VALUES (\n`;
    sql += `  '${crypto.randomUUID()}', '${student.profileId}', '${classGroupId}', 'Speaking Checkpoint', ${score}, 20, 1, now(), now(), now()\n`;
    sql += `);\n`;
  }
  sql += `\n`;

  // 7. Invoices & Receipts
  sql += `-- Create Invoices & Receipts\n`;
  for (let i = 0; i < enrollments.length; i++) {
    const enroll = enrollments[i];
    const isPaid = i % 3 === 0;
    const status = isPaid ? 'PAID' : 'PENDING';
    const amount = (i < 3 || i === 6) ? 3200 : 2500;
    const invoiceId = crypto.randomUUID();
    const reference = `INV-2026-05-${String(i + 1).padStart(3, "0")}`;
    const paidAt = isPaid ? new Date("2026-05-10T09:00:00.000Z") : null;

    sql += `INSERT INTO "Invoice" ("id", "studentId", "enrollmentId", "reference", "amountMt", "status", "dueDate", "paidAt", "createdAt", "updatedAt") VALUES (\n`;
    sql += `  '${invoiceId}', '${enroll.studentId}', '${enroll.id}', '${reference}', ${amount}, '${status}', '2026-05-25T00:00:00.000Z', ${sqlVal(paidAt)}, now(), now()\n`;
    sql += `);\n`;

    if (isPaid) {
      const receiptId = crypto.randomUUID();
      const receiptNumber = `REC-2026-05-${String(i + 1).padStart(3, "0")}`;
      sql += `INSERT INTO "Receipt" ("id", "invoiceId", "studentId", "amountMt", "issuedAt", "issuedBy", "receiptNumber", "createdAt", "updatedAt") VALUES (\n`;
      sql += `  '${receiptId}', '${invoiceId}', '${enroll.studentId}', ${amount}, '2026-05-10T09:00:00.000Z', 'Secretaria Academica', '${receiptNumber}', now(), now()\n`;
      sql += `);\n`;
    }
  }
  sql += `\n`;

  // 8. DebateSessions
  const scheduledDebateId = crypto.randomUUID();
  sql += `-- Create Debate Sessions\n`;
  sql += `INSERT INTO "DebateSession" ("id", "topic", "startsAt", "capacity", "location", "status", "moderatorId", "createdAt", "updatedAt") VALUES (\n`;
  sql += `  '${scheduledDebateId}', 'Should English clubs be mandatory for intermediate students?', '2026-05-22T17:30:00.000Z', 12, 'Sala 04', 'SCHEDULED', '${students[0].userId}', now(), now()\n`;
  sql += `);\n`;

  const activeDebateId = crypto.randomUUID();
  sql += `INSERT INTO "DebateSession" ("id", "topic", "startsAt", "capacity", "location", "status", "moderatorId", "createdAt", "updatedAt") VALUES (\n`;
  sql += `  '${activeDebateId}', 'Remote work improves productivity', '2026-05-15T17:30:00.000Z', 10, 'Sala 04', 'ACTIVE', '${teacher1UserId}', now(), now()\n`;
  sql += `);\n`;

  const unassignedDebateId = crypto.randomUUID();
  sql += `INSERT INTO "DebateSession" ("id", "topic", "startsAt", "capacity", "location", "status", "moderatorId", "createdAt", "updatedAt") VALUES (\n`;
  sql += `  '${unassignedDebateId}', 'Public speaking should be taught from level A2', '2026-05-29T17:30:00.000Z', 15, 'Sala 02', 'SCHEDULED', NULL, now(), now()\n`;
  sql += `);\n\n`;

  // 9. DebateProposals
  const proposalId1 = crypto.randomUUID();
  sql += `-- Create Debate Proposals\n`;
  sql += `INSERT INTO "DebateProposal" ("id", "studentId", "proposerId", "topic", "reason", "status", "approvedById", "approvedAt", "convertedSessionId", "classGroupId", "createdAt", "updatedAt") VALUES (\n`;
  sql += `  '${proposalId1}', '${students[1].profileId}', '${students[1].userId}', 'Remote work improves productivity', 'Tema frequente nas entrevistas e apresentações dos alunos.', 'APPROVED', '${teacher1UserId}', '2026-05-14T12:00:00.000Z', '${activeDebateId}', NULL, now(), now()\n`;
  sql += `);\n`;

  // Update activeDebate to link to approvedProposal
  sql += `UPDATE "DebateSession" SET "sourceProposalId" = '${proposalId1}', "moderatorAssignedById" = '${teacher1UserId}', "moderatorAssignedAt" = '2026-05-14T12:05:00.000Z', "moderatorExpiresAt" = '2026-05-30T21:00:00.000Z', "moderatorNote" = 'Avaliar fluência, argumentação e postura com feedback curto e acionável.' WHERE "id" = '${activeDebateId}';\n\n`;

  const pendingProposalId = crypto.randomUUID();
  sql += `INSERT INTO "DebateProposal" ("id", "studentId", "proposerId", "topic", "reason", "status", "approvedById", "approvedAt", "convertedSessionId", "classGroupId", "createdAt", "updatedAt") VALUES (\n`;
  sql += `  '${pendingProposalId}', '${students[3].profileId}', '${students[3].userId}', 'Should students use AI tools for homework?', 'Ajuda a discutir responsabilidade, aprendizagem real e uso ético de tecnologia.', 'PENDING', NULL, NULL, NULL, NULL, now(), now()\n`;
  sql += `);\n`;

  const proposalId3 = crypto.randomUUID();
  sql += `INSERT INTO "DebateProposal" ("id", "studentId", "proposerId", "topic", "reason", "status", "approvedById", "approvedAt", "convertedSessionId", "classGroupId", "createdAt", "updatedAt") VALUES (\n`;
  sql += `  '${proposalId3}', NULL, '${teacher2UserId}', 'Is public speaking more important than grammar?', 'Tema útil para conectar confiança oral com precisão linguística.', 'PENDING', NULL, NULL, NULL, NULL, now(), now()\n`;
  sql += `);\n\n`;

  // 10. DebateProposalReactions
  sql += `-- Create Reactions\n`;
  sql += `INSERT INTO "DebateProposalReaction" ("id", "proposalId", "userId", "type", "createdAt", "updatedAt") VALUES\n`;
  sql += `  ('${crypto.randomUUID()}', '${pendingProposalId}', '${students[0].userId}', 'SUPPORT', now(), now()),\n`;
  sql += `  ('${crypto.randomUUID()}', '${pendingProposalId}', '${students[2].userId}', 'SUPPORT', now(), now()),\n`;
  sql += `  ('${crypto.randomUUID()}', '${pendingProposalId}', '${teacher1UserId}', 'SUPPORT', now(), now());\n\n`;

  // 11. DebateParticipants (slice 1 to 5)
  sql += `-- Create Debate Participants\n`;
  const debateIds = [scheduledDebateId, activeDebateId, unassignedDebateId];
  for (const dId of debateIds) {
    for (let i = 1; i <= 4; i++) {
      const student = students[i];
      sql += `INSERT INTO "DebateParticipant" ("id", "sessionId", "studentId", "joinedAt") VALUES (\n`;
      sql += `  '${crypto.randomUUID()}', '${dId}', '${student.profileId}', now()\n`;
      sql += `);\n`;
    }
  }
  sql += `\n`;

  // 12. DebateEvaluations
  const evalId1 = crypto.randomUUID();
  sql += `-- Create Debate Evaluations\n`;
  sql += `INSERT INTO "DebateEvaluation" ("id", "sessionId", "studentId", "evaluatorId", "fluency", "argumentation", "posture", "feedback", "evaluatedAt", "createdAt", "updatedAt") VALUES (\n`;
  sql += `  '${evalId1}', '${activeDebateId}', '${students[1].profileId}', '${teacher1UserId}', 8, 7, 9, 'Boa clareza nas ideias. Para a próxima sessão, tenta sustentar cada argumento com um exemplo específico.', now(), now(), now()\n`;
  sql += `);\n`;

  const evalId2 = crypto.randomUUID();
  sql += `INSERT INTO "DebateEvaluation" ("id", "sessionId", "studentId", "evaluatorId", "fluency", "argumentation", "posture", "feedback", "evaluatedAt", "createdAt", "updatedAt") VALUES (\n`;
  sql += `  '${evalId2}', '${activeDebateId}', '${students[2].profileId}', '${teacher1UserId}', 7, 8, 7, 'A estrutura dos argumentos melhorou. Trabalha a velocidade da fala para dar mais tempo ao público.', now(), now(), now()\n`;
  sql += `);\n\n`;

  // 13. Notifications
  sql += `-- Create Notifications\n`;
  sql += `INSERT INTO "Notification" ("id", "userId", "title", "message", "type", "isRead", "evaluationId", "debateSessionId", "createdAt", "updatedAt") VALUES\n`;
  sql += `  ('${crypto.randomUUID()}', '${students[1].userId}', 'Novo feedback de debate', 'Nelson Manuel avaliou a tua participação em "Remote work improves productivity". Abre o histórico para confirmar a leitura.', 'DEBATE_FEEDBACK', false, '${evalId1}', NULL, now(), now()),\n`;
  sql += `  ('${crypto.randomUUID()}', '${students[2].userId}', 'Novo feedback de debate', 'Nelson Manuel avaliou a tua participação in "Remote work improves productivity". Abre o histórico para confirmar a leitura.', 'DEBATE_FEEDBACK', false, '${evalId2}', NULL, now(), now());\n\n`;

  // 14. AuditLog
  sql += `-- Create Audit Log\n`;
  sql += `INSERT INTO "AuditLog" ("id", "actorId", "action", "entity", "entityId", "metadata", "createdAt", "updatedAt") VALUES (\n`;
  sql += `  '${crypto.randomUUID()}', '${superAdminId}', 'demo_data_seeded', 'system', NULL, '{"source": "prisma/seed.ts", "safeDemoData": true}'::jsonb, now(), now()\n`;
  sql += `);\n\n`;

  sql += `COMMIT;\n`;

  fs.writeFileSync(outputFile, sql, 'utf8');
  console.log(`Successfully generated SQL seed data script into ${outputFile}`);
}

run().catch(console.error);
