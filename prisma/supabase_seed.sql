-- Delson PS Academic - Seed Data Setup
-- Generated on 2026-06-05T10:59:33.643Z

BEGIN;

-- Clean existing data
TRUNCATE TABLE "Notification", "DebateProposalReaction", "AuditLog", "DebateEvaluation", "DebateParticipant", "DebateSession", "DebateProposal", "Receipt", "Invoice", "Grade", "Attendance", "StudyMaterial", "Enrollment", "ClassGroup", "Course", "StudentProfile", "TeacherProfile", "User" CASCADE;

-- Create Super Admin
INSERT INTO "User" ("id", "name", "email", "passwordHash", "role", "isActive", "createdAt", "updatedAt") VALUES (
  '3df0333b-0a79-4250-8778-174387d8d4f7', 'Direcao Geral', 'super.admin@delsonps.local', 'pbkdf2:210000:oEl2ku_G-KDOMytTIp_cwg:tjtbNZ-nj6dm6qoQvSJP3Zc0KZzG5EsrdgTfj2Ap7DM', 'SUPER_ADMIN', true, now(), now()
);

-- Create Admin
INSERT INTO "User" ("id", "name", "email", "passwordHash", "role", "isActive", "createdAt", "updatedAt") VALUES (
  '6ea724dc-ab1c-4a93-bee0-aa220505d652', 'Secretaria Academica', 'secretaria@delsonps.local', 'pbkdf2:210000:oEl2ku_G-KDOMytTIp_cwg:tjtbNZ-nj6dm6qoQvSJP3Zc0KZzG5EsrdgTfj2Ap7DM', 'ADMIN', true, now(), now()
);

-- Create Teacher Nelson Manuel
INSERT INTO "User" ("id", "name", "email", "passwordHash", "role", "canModerateDebates", "isActive", "createdAt", "updatedAt") VALUES (
  'a5ef5549-1bfe-4df9-b87f-b44ac9975aa8', 'Nelson Manuel', 'nelson.manuel@delsonps.local', 'pbkdf2:210000:oEl2ku_G-KDOMytTIp_cwg:tjtbNZ-nj6dm6qoQvSJP3Zc0KZzG5EsrdgTfj2Ap7DM', 'TEACHER', true, true, now(), now()
);
INSERT INTO "TeacherProfile" ("id", "userId", "staffNumber", "specialty", "phone", "createdAt", "updatedAt") VALUES (
  '6bd17be6-69e1-4f3a-b1e5-7aaf194cf3ab', 'a5ef5549-1bfe-4df9-b87f-b44ac9975aa8', 'DSP-INS-001', 'Business English e Debate', NULL, now(), now()
);

-- Create Teacher Marta Chissano
INSERT INTO "User" ("id", "name", "email", "passwordHash", "role", "canModerateDebates", "isActive", "createdAt", "updatedAt") VALUES (
  'd42ec2ed-48d3-49df-a131-f4cce9168462', 'Marta Chissano', 'marta.chissano@delsonps.local', 'pbkdf2:210000:oEl2ku_G-KDOMytTIp_cwg:tjtbNZ-nj6dm6qoQvSJP3Zc0KZzG5EsrdgTfj2Ap7DM', 'TEACHER', false, true, now(), now()
);
INSERT INTO "TeacherProfile" ("id", "userId", "staffNumber", "specialty", "phone", "createdAt", "updatedAt") VALUES (
  '1418ef88-aa10-4d3e-8a9f-bcc623e57f42', 'd42ec2ed-48d3-49df-a131-f4cce9168462', 'DSP-INS-002', 'General English', NULL, now(), now()
);

-- Create Students and profiles
INSERT INTO "User" ("id", "name", "email", "passwordHash", "role", "canModerateDebates", "isActive", "createdAt", "updatedAt") VALUES (
  '2de1ae24-a069-47fd-9d5e-f8243df50b89', 'Ester Mucavele', 'ester.mucavele@delsonps.local', 'pbkdf2:210000:oEl2ku_G-KDOMytTIp_cwg:tjtbNZ-nj6dm6qoQvSJP3Zc0KZzG5EsrdgTfj2Ap7DM', 'STUDENT', true, true, now(), now()
);
INSERT INTO "StudentProfile" ("id", "userId", "studentNumber", "studentCode", "level", "phone", "guardianName", "createdAt", "updatedAt") VALUES (
  '61a8f9c6-0497-41ba-8269-a2145ed2d969', '2de1ae24-a069-47fd-9d5e-f8243df50b89', 'DSP-2026-001', 'DSP-2026-001', 'B2 Upper Intermediate', '+258 84 000 0000', NULL, now(), now()
);
INSERT INTO "User" ("id", "name", "email", "passwordHash", "role", "canModerateDebates", "isActive", "createdAt", "updatedAt") VALUES (
  'b2bf792e-b1fe-42e1-a64c-264d0f4077cd', 'Anderson Nhantumbo', 'anderson.nhantumbo@delsonps.local', 'pbkdf2:210000:oEl2ku_G-KDOMytTIp_cwg:tjtbNZ-nj6dm6qoQvSJP3Zc0KZzG5EsrdgTfj2Ap7DM', 'STUDENT', false, true, now(), now()
);
INSERT INTO "StudentProfile" ("id", "userId", "studentNumber", "studentCode", "level", "phone", "guardianName", "createdAt", "updatedAt") VALUES (
  'ead71bfd-f273-495e-85fc-fb022511b85f', 'b2bf792e-b1fe-42e1-a64c-264d0f4077cd', 'DSP-2026-002', 'DSP-2026-002', 'B2 Upper Intermediate', '+258 84 000 0000', NULL, now(), now()
);
INSERT INTO "User" ("id", "name", "email", "passwordHash", "role", "canModerateDebates", "isActive", "createdAt", "updatedAt") VALUES (
  '629567ca-db19-4766-bf35-b9f0c5bdbade', 'Paulo Matavele', 'paulo.matavele@delsonps.local', 'pbkdf2:210000:oEl2ku_G-KDOMytTIp_cwg:tjtbNZ-nj6dm6qoQvSJP3Zc0KZzG5EsrdgTfj2Ap7DM', 'STUDENT', false, true, now(), now()
);
INSERT INTO "StudentProfile" ("id", "userId", "studentNumber", "studentCode", "level", "phone", "guardianName", "createdAt", "updatedAt") VALUES (
  '3b8ce959-94cf-4ec4-90f0-34cc16cd1fc6', '629567ca-db19-4766-bf35-b9f0c5bdbade', 'DSP-2026-003', 'DSP-2026-003', 'B1 Intermediate', '+258 84 000 0000', NULL, now(), now()
);
INSERT INTO "User" ("id", "name", "email", "passwordHash", "role", "canModerateDebates", "isActive", "createdAt", "updatedAt") VALUES (
  '0bbc7f71-9ed5-4750-8163-01a960cadca9', 'Maria Uamusse', 'maria.uamusse@delsonps.local', 'pbkdf2:210000:oEl2ku_G-KDOMytTIp_cwg:tjtbNZ-nj6dm6qoQvSJP3Zc0KZzG5EsrdgTfj2Ap7DM', 'STUDENT', false, true, now(), now()
);
INSERT INTO "StudentProfile" ("id", "userId", "studentNumber", "studentCode", "level", "phone", "guardianName", "createdAt", "updatedAt") VALUES (
  '2ee1b218-61a0-4d8c-a78c-9235c341ca5e', '0bbc7f71-9ed5-4750-8163-01a960cadca9', 'DSP-2026-004', 'DSP-2026-004', 'B1 Intermediate', '+258 84 000 0000', NULL, now(), now()
);
INSERT INTO "User" ("id", "name", "email", "passwordHash", "role", "canModerateDebates", "isActive", "createdAt", "updatedAt") VALUES (
  '4ce84d6a-7a51-499e-89eb-a55b35ade0b0', 'Delson Simango', 'delson.simango@delsonps.local', 'pbkdf2:210000:oEl2ku_G-KDOMytTIp_cwg:tjtbNZ-nj6dm6qoQvSJP3Zc0KZzG5EsrdgTfj2Ap7DM', 'STUDENT', false, true, now(), now()
);
INSERT INTO "StudentProfile" ("id", "userId", "studentNumber", "studentCode", "level", "phone", "guardianName", "createdAt", "updatedAt") VALUES (
  '3d49c2ce-be63-47cf-87f0-ee2a94507778', '4ce84d6a-7a51-499e-89eb-a55b35ade0b0', 'DSP-2026-005', 'DSP-2026-005', 'A2 Elementary', '+258 84 000 0000', NULL, now(), now()
);
INSERT INTO "User" ("id", "name", "email", "passwordHash", "role", "canModerateDebates", "isActive", "createdAt", "updatedAt") VALUES (
  '2726c2b1-fc4b-4e99-8518-9765c8cbe81a', 'Alfredo Cossa', 'alfredo.cossa@delsonps.local', 'pbkdf2:210000:oEl2ku_G-KDOMytTIp_cwg:tjtbNZ-nj6dm6qoQvSJP3Zc0KZzG5EsrdgTfj2Ap7DM', 'STUDENT', false, true, now(), now()
);
INSERT INTO "StudentProfile" ("id", "userId", "studentNumber", "studentCode", "level", "phone", "guardianName", "createdAt", "updatedAt") VALUES (
  '41e75cdb-9fe2-4365-bfbe-61bd1530cf00', '2726c2b1-fc4b-4e99-8518-9765c8cbe81a', 'DSP-2026-006', 'DSP-2026-006', 'A2 Elementary', '+258 84 000 0000', NULL, now(), now()
);
INSERT INTO "User" ("id", "name", "email", "passwordHash", "role", "canModerateDebates", "isActive", "createdAt", "updatedAt") VALUES (
  '324f6d51-82fa-4d4f-aff2-5f88f55a9ae6', 'Ana Muthemba', 'ana.muthemba@delsonps.local', 'pbkdf2:210000:oEl2ku_G-KDOMytTIp_cwg:tjtbNZ-nj6dm6qoQvSJP3Zc0KZzG5EsrdgTfj2Ap7DM', 'STUDENT', false, true, now(), now()
);
INSERT INTO "StudentProfile" ("id", "userId", "studentNumber", "studentCode", "level", "phone", "guardianName", "createdAt", "updatedAt") VALUES (
  '9b3cbe4c-9d83-47c0-8448-8ebbd609f5ed', '324f6d51-82fa-4d4f-aff2-5f88f55a9ae6', 'DSP-2026-007', 'DSP-2026-007', 'C1 Advanced', '+258 84 000 0000', NULL, now(), now()
);

-- Create Courses
INSERT INTO "Course" ("id", "title", "level", "description", "duration", "isActive", "createdAt", "updatedAt") VALUES (
  '84c665ee-133f-4c0a-9b2f-fd234b53d334', 'Ingles para Negocios', 'B2', 'Vocabulário profissional, escrita formal, reuniões e apresentações.', '12 semanas', true, now(), now()
);
INSERT INTO "Course" ("id", "title", "level", "description", "duration", "isActive", "createdAt", "updatedAt") VALUES (
  '48c30020-9c81-43ed-9a38-e5e4b1d45d92', 'Ingles Geral', 'B1', 'Gramática prática, conversação e compreensão oral para uso diário.', '10 semanas', true, now(), now()
);

-- Create Class Groups
INSERT INTO "ClassGroup" ("id", "name", "room", "schedule", "courseId", "teacherId", "startsAt", "endsAt", "createdAt", "updatedAt") VALUES (
  '77718391-a4a8-42e6-ac23-2bdf58c03dd9', 'B2 Noite', 'Sala 04', 'Seg/Qua 19:30', '84c665ee-133f-4c0a-9b2f-fd234b53d334', '6bd17be6-69e1-4f3a-b1e5-7aaf194cf3ab', '2026-05-04T17:30:00.000Z', '2026-07-29T19:00:00.000Z', now(), now()
);
INSERT INTO "ClassGroup" ("id", "name", "room", "schedule", "courseId", "teacherId", "startsAt", "endsAt", "createdAt", "updatedAt") VALUES (
  'fe693194-336f-4c1e-888e-619b45ccfd5c', 'B1 Manha', 'Sala 02', 'Ter/Qui 08:30', '48c30020-9c81-43ed-9a38-e5e4b1d45d92', '1418ef88-aa10-4d3e-8a9f-bcc623e57f42', '2026-05-05T06:30:00.000Z', '2026-07-16T08:00:00.000Z', now(), now()
);

-- Create Enrollments
INSERT INTO "Enrollment" ("id", "studentId", "courseId", "classGroupId", "status", "enrolledAt", "createdAt", "updatedAt") VALUES (
  '49d7362e-3488-40ed-be52-9c9284042275', '61a8f9c6-0497-41ba-8269-a2145ed2d969', '84c665ee-133f-4c0a-9b2f-fd234b53d334', '77718391-a4a8-42e6-ac23-2bdf58c03dd9', 'ACTIVE', now(), now(), now()
);
INSERT INTO "Enrollment" ("id", "studentId", "courseId", "classGroupId", "status", "enrolledAt", "createdAt", "updatedAt") VALUES (
  '5d3ccc08-0ded-4177-9795-fcd7027dc4ad', 'ead71bfd-f273-495e-85fc-fb022511b85f', '84c665ee-133f-4c0a-9b2f-fd234b53d334', '77718391-a4a8-42e6-ac23-2bdf58c03dd9', 'ACTIVE', now(), now(), now()
);
INSERT INTO "Enrollment" ("id", "studentId", "courseId", "classGroupId", "status", "enrolledAt", "createdAt", "updatedAt") VALUES (
  '59a65094-94d9-4db4-9d85-2972066c2b0b', '3b8ce959-94cf-4ec4-90f0-34cc16cd1fc6', '84c665ee-133f-4c0a-9b2f-fd234b53d334', '77718391-a4a8-42e6-ac23-2bdf58c03dd9', 'ACTIVE', now(), now(), now()
);
INSERT INTO "Enrollment" ("id", "studentId", "courseId", "classGroupId", "status", "enrolledAt", "createdAt", "updatedAt") VALUES (
  'f5b11dfd-f1f5-470b-8b02-074cf8ecfaf2', '2ee1b218-61a0-4d8c-a78c-9235c341ca5e', '48c30020-9c81-43ed-9a38-e5e4b1d45d92', 'fe693194-336f-4c1e-888e-619b45ccfd5c', 'ACTIVE', now(), now(), now()
);
INSERT INTO "Enrollment" ("id", "studentId", "courseId", "classGroupId", "status", "enrolledAt", "createdAt", "updatedAt") VALUES (
  'fc56a08d-aa2b-4ee5-ae24-41827ce60363', '3d49c2ce-be63-47cf-87f0-ee2a94507778', '48c30020-9c81-43ed-9a38-e5e4b1d45d92', 'fe693194-336f-4c1e-888e-619b45ccfd5c', 'ACTIVE', now(), now(), now()
);
INSERT INTO "Enrollment" ("id", "studentId", "courseId", "classGroupId", "status", "enrolledAt", "createdAt", "updatedAt") VALUES (
  '85cd7c1d-adcd-44b3-b1c3-e9b44129a6d8', '41e75cdb-9fe2-4365-bfbe-61bd1530cf00', '48c30020-9c81-43ed-9a38-e5e4b1d45d92', 'fe693194-336f-4c1e-888e-619b45ccfd5c', 'ACTIVE', now(), now(), now()
);
INSERT INTO "Enrollment" ("id", "studentId", "courseId", "classGroupId", "status", "enrolledAt", "createdAt", "updatedAt") VALUES (
  '7eae6c0b-be02-48af-9bdd-f042546c7e38', '9b3cbe4c-9d83-47c0-8448-8ebbd609f5ed', '84c665ee-133f-4c0a-9b2f-fd234b53d334', '77718391-a4a8-42e6-ac23-2bdf58c03dd9', 'ACTIVE', now(), now(), now()
);

-- Create Study Materials
INSERT INTO "StudyMaterial" ("id", "title", "unit", "description", "fileUrl", "courseId", "teacherId", "createdAt", "updatedAt") VALUES
  ('e3ec0282-8c67-4985-b312-c7eae17c2f31', 'Negotiation Vocabulary', 'Unit 04', 'Expressões para propostas, contrapropostas e encerramento de acordos.', NULL, '84c665ee-133f-4c0a-9b2f-fd234b53d334', '6bd17be6-69e1-4f3a-b1e5-7aaf194cf3ab', now(), now()),
  ('e9970683-a180-4770-a06e-fdb16c65e515', 'Formal Email Patterns', 'Unit 05', 'Modelos de email profissional com pedidos, anexos e seguimento.', NULL, '84c665ee-133f-4c0a-9b2f-fd234b53d334', '6bd17be6-69e1-4f3a-b1e5-7aaf194cf3ab', now(), now()),
  ('5690a96b-8939-45ba-975c-2ad187383899', 'Daily Conversation Review', 'Unit 02', 'Perguntas frequentes, respostas curtas e vocabulário de rotina.', NULL, '48c30020-9c81-43ed-9a38-e5e4b1d45d92', '1418ef88-aa10-4d3e-8a9f-bcc623e57f42', now(), now());

-- Create Attendance and Grades
INSERT INTO "Attendance" ("id", "studentId", "classGroupId", "lessonDate", "status", "notes", "createdAt", "updatedAt") VALUES (
  '13a47e3a-95dc-4f5a-bed9-2df879209639', '61a8f9c6-0497-41ba-8269-a2145ed2d969', '77718391-a4a8-42e6-ac23-2bdf58c03dd9', '2026-05-06T00:00:00.000Z', 'PRESENT', NULL, now(), now()
);
INSERT INTO "Attendance" ("id", "studentId", "classGroupId", "lessonDate", "status", "notes", "createdAt", "updatedAt") VALUES (
  '81e8ad0b-fe04-46d8-970c-18e7e7244b44', '61a8f9c6-0497-41ba-8269-a2145ed2d969', '77718391-a4a8-42e6-ac23-2bdf58c03dd9', '2026-05-08T00:00:00.000Z', 'PRESENT', NULL, now(), now()
);
INSERT INTO "Grade" ("id", "studentId", "classGroupId", "title", "score", "maxScore", "weight", "gradedAt", "createdAt", "updatedAt") VALUES (
  '2148fe24-a917-41ea-8e54-c39980282ee7', '61a8f9c6-0497-41ba-8269-a2145ed2d969', '77718391-a4a8-42e6-ac23-2bdf58c03dd9', 'Speaking Checkpoint', 13, 20, 1, now(), now(), now()
);
INSERT INTO "Attendance" ("id", "studentId", "classGroupId", "lessonDate", "status", "notes", "createdAt", "updatedAt") VALUES (
  '7efa050b-68db-42d6-b851-af977d0ac811', 'ead71bfd-f273-495e-85fc-fb022511b85f', '77718391-a4a8-42e6-ac23-2bdf58c03dd9', '2026-05-06T00:00:00.000Z', 'PRESENT', NULL, now(), now()
);
INSERT INTO "Attendance" ("id", "studentId", "classGroupId", "lessonDate", "status", "notes", "createdAt", "updatedAt") VALUES (
  'a48a5ef2-9dd8-4c2d-821a-b1d54da5eccc', 'ead71bfd-f273-495e-85fc-fb022511b85f', '77718391-a4a8-42e6-ac23-2bdf58c03dd9', '2026-05-08T00:00:00.000Z', 'PRESENT', NULL, now(), now()
);
INSERT INTO "Grade" ("id", "studentId", "classGroupId", "title", "score", "maxScore", "weight", "gradedAt", "createdAt", "updatedAt") VALUES (
  'a4e7f8bf-399c-4455-9544-9843fe9ed43e', 'ead71bfd-f273-495e-85fc-fb022511b85f', '77718391-a4a8-42e6-ac23-2bdf58c03dd9', 'Speaking Checkpoint', 14, 20, 1, now(), now(), now()
);
INSERT INTO "Attendance" ("id", "studentId", "classGroupId", "lessonDate", "status", "notes", "createdAt", "updatedAt") VALUES (
  'f5b466de-5907-4c3c-a76e-e40b6039dcc5', '3b8ce959-94cf-4ec4-90f0-34cc16cd1fc6', '77718391-a4a8-42e6-ac23-2bdf58c03dd9', '2026-05-06T00:00:00.000Z', 'PRESENT', NULL, now(), now()
);
INSERT INTO "Attendance" ("id", "studentId", "classGroupId", "lessonDate", "status", "notes", "createdAt", "updatedAt") VALUES (
  'fd9bd41c-91e1-4720-b643-566631b1ceec', '3b8ce959-94cf-4ec4-90f0-34cc16cd1fc6', '77718391-a4a8-42e6-ac23-2bdf58c03dd9', '2026-05-08T00:00:00.000Z', 'PRESENT', NULL, now(), now()
);
INSERT INTO "Grade" ("id", "studentId", "classGroupId", "title", "score", "maxScore", "weight", "gradedAt", "createdAt", "updatedAt") VALUES (
  '21f73298-363b-4e5f-bee2-d1f878233dc0', '3b8ce959-94cf-4ec4-90f0-34cc16cd1fc6', '77718391-a4a8-42e6-ac23-2bdf58c03dd9', 'Speaking Checkpoint', 15, 20, 1, now(), now(), now()
);
INSERT INTO "Attendance" ("id", "studentId", "classGroupId", "lessonDate", "status", "notes", "createdAt", "updatedAt") VALUES (
  '91511d75-3916-4bbd-9bcc-1ca06924c0d0', '2ee1b218-61a0-4d8c-a78c-9235c341ca5e', 'fe693194-336f-4c1e-888e-619b45ccfd5c', '2026-05-06T00:00:00.000Z', 'PRESENT', NULL, now(), now()
);
INSERT INTO "Attendance" ("id", "studentId", "classGroupId", "lessonDate", "status", "notes", "createdAt", "updatedAt") VALUES (
  '4f0e5050-ef5b-4555-8970-b225e259d7dd', '2ee1b218-61a0-4d8c-a78c-9235c341ca5e', 'fe693194-336f-4c1e-888e-619b45ccfd5c', '2026-05-08T00:00:00.000Z', 'PRESENT', NULL, now(), now()
);
INSERT INTO "Grade" ("id", "studentId", "classGroupId", "title", "score", "maxScore", "weight", "gradedAt", "createdAt", "updatedAt") VALUES (
  'b383d1ff-4eea-4dc3-b7bb-362984e16108', '2ee1b218-61a0-4d8c-a78c-9235c341ca5e', 'fe693194-336f-4c1e-888e-619b45ccfd5c', 'Speaking Checkpoint', 16, 20, 1, now(), now(), now()
);
INSERT INTO "Attendance" ("id", "studentId", "classGroupId", "lessonDate", "status", "notes", "createdAt", "updatedAt") VALUES (
  'abf3900b-4349-4c67-bdab-25ee935b9de1', '3d49c2ce-be63-47cf-87f0-ee2a94507778', 'fe693194-336f-4c1e-888e-619b45ccfd5c', '2026-05-06T00:00:00.000Z', 'LATE', NULL, now(), now()
);
INSERT INTO "Attendance" ("id", "studentId", "classGroupId", "lessonDate", "status", "notes", "createdAt", "updatedAt") VALUES (
  'fa89ebec-dbc6-4ee4-95eb-4cb3159ccc55', '3d49c2ce-be63-47cf-87f0-ee2a94507778', 'fe693194-336f-4c1e-888e-619b45ccfd5c', '2026-05-08T00:00:00.000Z', 'PRESENT', NULL, now(), now()
);
INSERT INTO "Grade" ("id", "studentId", "classGroupId", "title", "score", "maxScore", "weight", "gradedAt", "createdAt", "updatedAt") VALUES (
  '43d9b96a-5be0-4f85-93c5-7b1f715fb739', '3d49c2ce-be63-47cf-87f0-ee2a94507778', 'fe693194-336f-4c1e-888e-619b45ccfd5c', 'Speaking Checkpoint', 17, 20, 1, now(), now(), now()
);
INSERT INTO "Attendance" ("id", "studentId", "classGroupId", "lessonDate", "status", "notes", "createdAt", "updatedAt") VALUES (
  '4351b34e-ab6a-4aad-81b3-148ccf5d9752', '41e75cdb-9fe2-4365-bfbe-61bd1530cf00', 'fe693194-336f-4c1e-888e-619b45ccfd5c', '2026-05-06T00:00:00.000Z', 'PRESENT', NULL, now(), now()
);
INSERT INTO "Attendance" ("id", "studentId", "classGroupId", "lessonDate", "status", "notes", "createdAt", "updatedAt") VALUES (
  '1f15ecc5-da13-4b84-887b-2caabec76545', '41e75cdb-9fe2-4365-bfbe-61bd1530cf00', 'fe693194-336f-4c1e-888e-619b45ccfd5c', '2026-05-08T00:00:00.000Z', 'ABSENT', NULL, now(), now()
);
INSERT INTO "Grade" ("id", "studentId", "classGroupId", "title", "score", "maxScore", "weight", "gradedAt", "createdAt", "updatedAt") VALUES (
  '39461763-e8c4-4c81-afa1-0d525e324479', '41e75cdb-9fe2-4365-bfbe-61bd1530cf00', 'fe693194-336f-4c1e-888e-619b45ccfd5c', 'Speaking Checkpoint', 13, 20, 1, now(), now(), now()
);
INSERT INTO "Attendance" ("id", "studentId", "classGroupId", "lessonDate", "status", "notes", "createdAt", "updatedAt") VALUES (
  '0653d65a-ddde-446d-943e-16469695a101', '9b3cbe4c-9d83-47c0-8448-8ebbd609f5ed', '77718391-a4a8-42e6-ac23-2bdf58c03dd9', '2026-05-06T00:00:00.000Z', 'PRESENT', NULL, now(), now()
);
INSERT INTO "Attendance" ("id", "studentId", "classGroupId", "lessonDate", "status", "notes", "createdAt", "updatedAt") VALUES (
  '33325875-93fb-4112-954a-9fa4f41f6d31', '9b3cbe4c-9d83-47c0-8448-8ebbd609f5ed', '77718391-a4a8-42e6-ac23-2bdf58c03dd9', '2026-05-08T00:00:00.000Z', 'PRESENT', NULL, now(), now()
);
INSERT INTO "Grade" ("id", "studentId", "classGroupId", "title", "score", "maxScore", "weight", "gradedAt", "createdAt", "updatedAt") VALUES (
  '56d9ae8d-61b3-40ed-8691-ae757a72b35b', '9b3cbe4c-9d83-47c0-8448-8ebbd609f5ed', '77718391-a4a8-42e6-ac23-2bdf58c03dd9', 'Speaking Checkpoint', 14, 20, 1, now(), now(), now()
);

-- Create Invoices & Receipts
INSERT INTO "Invoice" ("id", "studentId", "enrollmentId", "reference", "amountMt", "status", "dueDate", "paidAt", "createdAt", "updatedAt") VALUES (
  '67a589cc-3a81-4d1b-81bb-eb6d79bbc155', '61a8f9c6-0497-41ba-8269-a2145ed2d969', '49d7362e-3488-40ed-be52-9c9284042275', 'INV-2026-05-001', 3200, 'PAID', '2026-05-25T00:00:00.000Z', '2026-05-10T09:00:00.000Z', now(), now()
);
INSERT INTO "Receipt" ("id", "invoiceId", "studentId", "amountMt", "issuedAt", "issuedBy", "receiptNumber", "createdAt", "updatedAt") VALUES (
  '2c712a5d-5097-4a15-9abb-047cecf8fd0b', '67a589cc-3a81-4d1b-81bb-eb6d79bbc155', '61a8f9c6-0497-41ba-8269-a2145ed2d969', 3200, '2026-05-10T09:00:00.000Z', 'Secretaria Academica', 'REC-2026-05-001', now(), now()
);
INSERT INTO "Invoice" ("id", "studentId", "enrollmentId", "reference", "amountMt", "status", "dueDate", "paidAt", "createdAt", "updatedAt") VALUES (
  'cef1c7c8-9eca-40f7-abc2-c4a8e02b73eb', 'ead71bfd-f273-495e-85fc-fb022511b85f', '5d3ccc08-0ded-4177-9795-fcd7027dc4ad', 'INV-2026-05-002', 3200, 'PENDING', '2026-05-25T00:00:00.000Z', NULL, now(), now()
);
INSERT INTO "Invoice" ("id", "studentId", "enrollmentId", "reference", "amountMt", "status", "dueDate", "paidAt", "createdAt", "updatedAt") VALUES (
  'f428b9c6-6607-4fee-84ff-0cc1934f0b6c', '3b8ce959-94cf-4ec4-90f0-34cc16cd1fc6', '59a65094-94d9-4db4-9d85-2972066c2b0b', 'INV-2026-05-003', 3200, 'PENDING', '2026-05-25T00:00:00.000Z', NULL, now(), now()
);
INSERT INTO "Invoice" ("id", "studentId", "enrollmentId", "reference", "amountMt", "status", "dueDate", "paidAt", "createdAt", "updatedAt") VALUES (
  '123eae0e-50ee-468d-9579-1e566bc0f3b5', '2ee1b218-61a0-4d8c-a78c-9235c341ca5e', 'f5b11dfd-f1f5-470b-8b02-074cf8ecfaf2', 'INV-2026-05-004', 2500, 'PAID', '2026-05-25T00:00:00.000Z', '2026-05-10T09:00:00.000Z', now(), now()
);
INSERT INTO "Receipt" ("id", "invoiceId", "studentId", "amountMt", "issuedAt", "issuedBy", "receiptNumber", "createdAt", "updatedAt") VALUES (
  '0f4d4a3d-8afd-40d4-b4f4-0ce84c86037c', '123eae0e-50ee-468d-9579-1e566bc0f3b5', '2ee1b218-61a0-4d8c-a78c-9235c341ca5e', 2500, '2026-05-10T09:00:00.000Z', 'Secretaria Academica', 'REC-2026-05-004', now(), now()
);
INSERT INTO "Invoice" ("id", "studentId", "enrollmentId", "reference", "amountMt", "status", "dueDate", "paidAt", "createdAt", "updatedAt") VALUES (
  '4e569126-d268-4c99-90a2-76f8eac6ed71', '3d49c2ce-be63-47cf-87f0-ee2a94507778', 'fc56a08d-aa2b-4ee5-ae24-41827ce60363', 'INV-2026-05-005', 2500, 'PENDING', '2026-05-25T00:00:00.000Z', NULL, now(), now()
);
INSERT INTO "Invoice" ("id", "studentId", "enrollmentId", "reference", "amountMt", "status", "dueDate", "paidAt", "createdAt", "updatedAt") VALUES (
  'd5a6678c-0735-4d29-9599-2a1415103b1c', '41e75cdb-9fe2-4365-bfbe-61bd1530cf00', '85cd7c1d-adcd-44b3-b1c3-e9b44129a6d8', 'INV-2026-05-006', 2500, 'PENDING', '2026-05-25T00:00:00.000Z', NULL, now(), now()
);
INSERT INTO "Invoice" ("id", "studentId", "enrollmentId", "reference", "amountMt", "status", "dueDate", "paidAt", "createdAt", "updatedAt") VALUES (
  '744a1538-5a23-495d-8d27-fb2d9bc49c7b', '9b3cbe4c-9d83-47c0-8448-8ebbd609f5ed', '7eae6c0b-be02-48af-9bdd-f042546c7e38', 'INV-2026-05-007', 3200, 'PAID', '2026-05-25T00:00:00.000Z', '2026-05-10T09:00:00.000Z', now(), now()
);
INSERT INTO "Receipt" ("id", "invoiceId", "studentId", "amountMt", "issuedAt", "issuedBy", "receiptNumber", "createdAt", "updatedAt") VALUES (
  'a00a03f9-31ff-4d30-aca9-0a1110e89a4a', '744a1538-5a23-495d-8d27-fb2d9bc49c7b', '9b3cbe4c-9d83-47c0-8448-8ebbd609f5ed', 3200, '2026-05-10T09:00:00.000Z', 'Secretaria Academica', 'REC-2026-05-007', now(), now()
);

-- Create Debate Sessions
INSERT INTO "DebateSession" ("id", "topic", "startsAt", "capacity", "location", "status", "moderatorId", "createdAt", "updatedAt") VALUES (
  '6f62f8e6-3c66-44f2-9f43-6faecdaece62', 'Should English clubs be mandatory for intermediate students?', '2026-05-22T17:30:00.000Z', 12, 'Sala 04', 'SCHEDULED', '2de1ae24-a069-47fd-9d5e-f8243df50b89', now(), now()
);
INSERT INTO "DebateSession" ("id", "topic", "startsAt", "capacity", "location", "status", "moderatorId", "createdAt", "updatedAt") VALUES (
  '52084943-adf7-406c-bdba-bb25fde0e0f1', 'Remote work improves productivity', '2026-05-15T17:30:00.000Z', 10, 'Sala 04', 'ACTIVE', 'a5ef5549-1bfe-4df9-b87f-b44ac9975aa8', now(), now()
);
INSERT INTO "DebateSession" ("id", "topic", "startsAt", "capacity", "location", "status", "moderatorId", "createdAt", "updatedAt") VALUES (
  'a4db99bb-3294-448b-8bbc-76df10c6c9c3', 'Public speaking should be taught from level A2', '2026-05-29T17:30:00.000Z', 15, 'Sala 02', 'SCHEDULED', NULL, now(), now()
);

-- Create Debate Proposals
INSERT INTO "DebateProposal" ("id", "studentId", "proposerId", "topic", "reason", "status", "approvedById", "approvedAt", "convertedSessionId", "classGroupId", "createdAt", "updatedAt") VALUES (
  '43bf920a-11fb-45d8-9d91-c8f7bc5ac5ee', 'ead71bfd-f273-495e-85fc-fb022511b85f', 'b2bf792e-b1fe-42e1-a64c-264d0f4077cd', 'Remote work improves productivity', 'Tema frequente nas entrevistas e apresentações dos alunos.', 'APPROVED', 'a5ef5549-1bfe-4df9-b87f-b44ac9975aa8', '2026-05-14T12:00:00.000Z', '52084943-adf7-406c-bdba-bb25fde0e0f1', NULL, now(), now()
);
UPDATE "DebateSession" SET "sourceProposalId" = '43bf920a-11fb-45d8-9d91-c8f7bc5ac5ee', "moderatorAssignedById" = 'a5ef5549-1bfe-4df9-b87f-b44ac9975aa8', "moderatorAssignedAt" = '2026-05-14T12:05:00.000Z', "moderatorExpiresAt" = '2026-05-30T21:00:00.000Z', "moderatorNote" = 'Avaliar fluência, argumentação e postura com feedback curto e acionável.' WHERE "id" = '52084943-adf7-406c-bdba-bb25fde0e0f1';

INSERT INTO "DebateProposal" ("id", "studentId", "proposerId", "topic", "reason", "status", "approvedById", "approvedAt", "convertedSessionId", "classGroupId", "createdAt", "updatedAt") VALUES (
  'bfabc467-8d8e-4b81-b814-217522171668', '2ee1b218-61a0-4d8c-a78c-9235c341ca5e', '0bbc7f71-9ed5-4750-8163-01a960cadca9', 'Should students use AI tools for homework?', 'Ajuda a discutir responsabilidade, aprendizagem real e uso ético de tecnologia.', 'PENDING', NULL, NULL, NULL, NULL, now(), now()
);
INSERT INTO "DebateProposal" ("id", "studentId", "proposerId", "topic", "reason", "status", "approvedById", "approvedAt", "convertedSessionId", "classGroupId", "createdAt", "updatedAt") VALUES (
  '3ee6128a-2218-4b22-a868-da5c1f12049d', NULL, 'd42ec2ed-48d3-49df-a131-f4cce9168462', 'Is public speaking more important than grammar?', 'Tema útil para conectar confiança oral com precisão linguística.', 'PENDING', NULL, NULL, NULL, NULL, now(), now()
);

-- Create Reactions
INSERT INTO "DebateProposalReaction" ("id", "proposalId", "userId", "type", "createdAt", "updatedAt") VALUES
  ('dd59f243-2d8c-4569-9dfb-0de7c669ab5e', 'bfabc467-8d8e-4b81-b814-217522171668', '2de1ae24-a069-47fd-9d5e-f8243df50b89', 'SUPPORT', now(), now()),
  ('8795cb6e-f34f-4fab-861d-ac6afd7a3626', 'bfabc467-8d8e-4b81-b814-217522171668', '629567ca-db19-4766-bf35-b9f0c5bdbade', 'SUPPORT', now(), now()),
  ('cf86b19d-ebe0-4810-bcd9-28758b16c24a', 'bfabc467-8d8e-4b81-b814-217522171668', 'a5ef5549-1bfe-4df9-b87f-b44ac9975aa8', 'SUPPORT', now(), now());

-- Create Debate Participants
INSERT INTO "DebateParticipant" ("id", "sessionId", "studentId", "joinedAt") VALUES (
  'e028aff0-4ce9-4a61-9b04-52169e8ca7d6', '6f62f8e6-3c66-44f2-9f43-6faecdaece62', 'ead71bfd-f273-495e-85fc-fb022511b85f', now()
);
INSERT INTO "DebateParticipant" ("id", "sessionId", "studentId", "joinedAt") VALUES (
  '58cbe656-1a96-448f-901a-517cc0b2e74a', '6f62f8e6-3c66-44f2-9f43-6faecdaece62', '3b8ce959-94cf-4ec4-90f0-34cc16cd1fc6', now()
);
INSERT INTO "DebateParticipant" ("id", "sessionId", "studentId", "joinedAt") VALUES (
  '1f588aa9-c65d-4469-baf6-c96da38b2bd4', '6f62f8e6-3c66-44f2-9f43-6faecdaece62', '2ee1b218-61a0-4d8c-a78c-9235c341ca5e', now()
);
INSERT INTO "DebateParticipant" ("id", "sessionId", "studentId", "joinedAt") VALUES (
  '272ee641-edfb-4e35-9c09-d5b25f2eb895', '6f62f8e6-3c66-44f2-9f43-6faecdaece62', '3d49c2ce-be63-47cf-87f0-ee2a94507778', now()
);
INSERT INTO "DebateParticipant" ("id", "sessionId", "studentId", "joinedAt") VALUES (
  'e2754684-5cf9-4a43-9559-7d626c25a37f', '52084943-adf7-406c-bdba-bb25fde0e0f1', 'ead71bfd-f273-495e-85fc-fb022511b85f', now()
);
INSERT INTO "DebateParticipant" ("id", "sessionId", "studentId", "joinedAt") VALUES (
  '81e7e61a-56b7-4a66-af16-bf0a4e3dc410', '52084943-adf7-406c-bdba-bb25fde0e0f1', '3b8ce959-94cf-4ec4-90f0-34cc16cd1fc6', now()
);
INSERT INTO "DebateParticipant" ("id", "sessionId", "studentId", "joinedAt") VALUES (
  '60c81efc-17e1-40ac-a2a9-8bb186ec26cf', '52084943-adf7-406c-bdba-bb25fde0e0f1', '2ee1b218-61a0-4d8c-a78c-9235c341ca5e', now()
);
INSERT INTO "DebateParticipant" ("id", "sessionId", "studentId", "joinedAt") VALUES (
  'a2eee04d-1983-4577-bc0a-2b331da3d6cc', '52084943-adf7-406c-bdba-bb25fde0e0f1', '3d49c2ce-be63-47cf-87f0-ee2a94507778', now()
);
INSERT INTO "DebateParticipant" ("id", "sessionId", "studentId", "joinedAt") VALUES (
  '4798d211-7b97-4d81-96c4-09bba6f7ca44', 'a4db99bb-3294-448b-8bbc-76df10c6c9c3', 'ead71bfd-f273-495e-85fc-fb022511b85f', now()
);
INSERT INTO "DebateParticipant" ("id", "sessionId", "studentId", "joinedAt") VALUES (
  'f846a4a3-a79e-4211-acc9-0ff7bc4511c7', 'a4db99bb-3294-448b-8bbc-76df10c6c9c3', '3b8ce959-94cf-4ec4-90f0-34cc16cd1fc6', now()
);
INSERT INTO "DebateParticipant" ("id", "sessionId", "studentId", "joinedAt") VALUES (
  'a9653415-b898-4092-a1ea-c600f1387804', 'a4db99bb-3294-448b-8bbc-76df10c6c9c3', '2ee1b218-61a0-4d8c-a78c-9235c341ca5e', now()
);
INSERT INTO "DebateParticipant" ("id", "sessionId", "studentId", "joinedAt") VALUES (
  'de546f81-d87e-47ed-aaa3-8ac0f30f6918', 'a4db99bb-3294-448b-8bbc-76df10c6c9c3', '3d49c2ce-be63-47cf-87f0-ee2a94507778', now()
);

-- Create Debate Evaluations
INSERT INTO "DebateEvaluation" ("id", "sessionId", "studentId", "evaluatorId", "fluency", "argumentation", "posture", "feedback", "evaluatedAt", "createdAt", "updatedAt") VALUES (
  '58fe3bab-4026-4eba-bc12-1314b98ae1c1', '52084943-adf7-406c-bdba-bb25fde0e0f1', 'ead71bfd-f273-495e-85fc-fb022511b85f', 'a5ef5549-1bfe-4df9-b87f-b44ac9975aa8', 8, 7, 9, 'Boa clareza nas ideias. Para a próxima sessão, tenta sustentar cada argumento com um exemplo específico.', now(), now(), now()
);
INSERT INTO "DebateEvaluation" ("id", "sessionId", "studentId", "evaluatorId", "fluency", "argumentation", "posture", "feedback", "evaluatedAt", "createdAt", "updatedAt") VALUES (
  'b0953f29-9000-4cb8-b34d-d85ca7f4a009', '52084943-adf7-406c-bdba-bb25fde0e0f1', '3b8ce959-94cf-4ec4-90f0-34cc16cd1fc6', 'a5ef5549-1bfe-4df9-b87f-b44ac9975aa8', 7, 8, 7, 'A estrutura dos argumentos melhorou. Trabalha a velocidade da fala para dar mais tempo ao público.', now(), now(), now()
);

-- Create Notifications
INSERT INTO "Notification" ("id", "userId", "title", "message", "type", "isRead", "evaluationId", "debateSessionId", "createdAt", "updatedAt") VALUES
  ('165c058c-adb3-430f-b7c7-8fd4eab6dd59', 'b2bf792e-b1fe-42e1-a64c-264d0f4077cd', 'Novo feedback de debate', 'Nelson Manuel avaliou a tua participação em "Remote work improves productivity". Abre o histórico para confirmar a leitura.', 'DEBATE_FEEDBACK', false, '58fe3bab-4026-4eba-bc12-1314b98ae1c1', NULL, now(), now()),
  ('52f12a8b-3652-4e31-93f1-64cb4c0b7279', '629567ca-db19-4766-bf35-b9f0c5bdbade', 'Novo feedback de debate', 'Nelson Manuel avaliou a tua participação in "Remote work improves productivity". Abre o histórico para confirmar a leitura.', 'DEBATE_FEEDBACK', false, 'b0953f29-9000-4cb8-b34d-d85ca7f4a009', NULL, now(), now());

-- Create Audit Log
INSERT INTO "AuditLog" ("id", "actorId", "action", "entity", "entityId", "metadata", "createdAt", "updatedAt") VALUES (
  '2d50c2bc-6fc4-4c29-b9a8-2c2a4752dfd7', '3df0333b-0a79-4250-8778-174387d8d4f7', 'demo_data_seeded', 'system', NULL, '{"source": "prisma/seed.ts", "safeDemoData": true}'::jsonb, now(), now()
);

COMMIT;
