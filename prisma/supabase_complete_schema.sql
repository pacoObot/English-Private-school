-- Delson PS Academic - Complete Supabase Schema Setup
-- Generated on 2026-06-05T10:58:50.721Z

-- Create _prisma_migrations table
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" VARCHAR(36) PRIMARY KEY NOT NULL,
    "checksum" VARCHAR(64) NOT NULL,
    "finished_at" TIMESTAMPTZ,
    "migration_name" VARCHAR(255) NOT NULL,
    "logs" TEXT,
    "rolled_back_at" TIMESTAMPTZ,
    "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0
);


-- =========================================================================
-- MIGRATION: 20260429083622_init
-- =========================================================================

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('ACTIVE', 'PENDING', 'COMPLETED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "avatarUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "studentNumber" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "phone" TEXT,
    "guardianName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "staffNumber" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "description" TEXT,
    "duration" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "room" TEXT,
    "schedule" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "teacherId" TEXT,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enrollment" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "classGroupId" TEXT NOT NULL,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "classGroupId" TEXT NOT NULL,
    "lessonDate" TIMESTAMP(3) NOT NULL,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Grade" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "classGroupId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "maxScore" DOUBLE PRECISION NOT NULL DEFAULT 20,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "gradedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Grade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyMaterial" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "unit" TEXT,
    "fileUrl" TEXT,
    "courseId" TEXT NOT NULL,
    "teacherId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "enrollmentId" TEXT,
    "reference" TEXT NOT NULL,
    "amountMt" INTEGER NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DebateSession" (
    "id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "capacity" INTEGER NOT NULL,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DebateSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DebateEvaluation" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "fluency" INTEGER NOT NULL,
    "argumentation" INTEGER NOT NULL,
    "posture" INTEGER NOT NULL,
    "feedback" TEXT,
    "evaluatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DebateEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "StudentProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_studentNumber_key" ON "StudentProfile"("studentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherProfile_userId_key" ON "TeacherProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherProfile_staffNumber_key" ON "TeacherProfile"("staffNumber");

-- CreateIndex
CREATE INDEX "ClassGroup_courseId_idx" ON "ClassGroup"("courseId");

-- CreateIndex
CREATE INDEX "ClassGroup_teacherId_idx" ON "ClassGroup"("teacherId");

-- CreateIndex
CREATE INDEX "Enrollment_courseId_idx" ON "Enrollment"("courseId");

-- CreateIndex
CREATE INDEX "Enrollment_classGroupId_idx" ON "Enrollment"("classGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_studentId_classGroupId_key" ON "Enrollment"("studentId", "classGroupId");

-- CreateIndex
CREATE INDEX "Attendance_classGroupId_idx" ON "Attendance"("classGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_studentId_classGroupId_lessonDate_key" ON "Attendance"("studentId", "classGroupId", "lessonDate");

-- CreateIndex
CREATE INDEX "Grade_studentId_idx" ON "Grade"("studentId");

-- CreateIndex
CREATE INDEX "Grade_classGroupId_idx" ON "Grade"("classGroupId");

-- CreateIndex
CREATE INDEX "StudyMaterial_courseId_idx" ON "StudyMaterial"("courseId");

-- CreateIndex
CREATE INDEX "StudyMaterial_teacherId_idx" ON "StudyMaterial"("teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_reference_key" ON "Invoice"("reference");

-- CreateIndex
CREATE INDEX "Invoice_studentId_idx" ON "Invoice"("studentId");

-- CreateIndex
CREATE INDEX "Invoice_enrollmentId_idx" ON "Invoice"("enrollmentId");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");

-- CreateIndex
CREATE INDEX "DebateEvaluation_studentId_idx" ON "DebateEvaluation"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "DebateEvaluation_sessionId_studentId_key" ON "DebateEvaluation"("sessionId", "studentId");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");

-- CreateIndex
CREATE INDEX "AuditLog_entity_idx" ON "AuditLog"("entity");

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherProfile" ADD CONSTRAINT "TeacherProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassGroup" ADD CONSTRAINT "ClassGroup_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassGroup" ADD CONSTRAINT "ClassGroup_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "TeacherProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_classGroupId_fkey" FOREIGN KEY ("classGroupId") REFERENCES "ClassGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_classGroupId_fkey" FOREIGN KEY ("classGroupId") REFERENCES "ClassGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_classGroupId_fkey" FOREIGN KEY ("classGroupId") REFERENCES "ClassGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyMaterial" ADD CONSTRAINT "StudyMaterial_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyMaterial" ADD CONSTRAINT "StudyMaterial_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "TeacherProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebateEvaluation" ADD CONSTRAINT "DebateEvaluation_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "DebateSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebateEvaluation" ADD CONSTRAINT "DebateEvaluation_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "_prisma_migrations" (
  "id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count"
) VALUES (
  '120cfc68-7011-4381-9240-a1d8ba400abe',
  '66dc70834ef4568e96f64b1c6c0d42950f66c45931cddc6cb95fc99252af5c3b',
  now(),
  '20260429083622_init',
  NULL,
  NULL,
  now(),
  1
) ON CONFLICT ("id") DO NOTHING;


-- =========================================================================
-- MIGRATION: 20260504105446_sprint4_debate
-- =========================================================================

-- CreateEnum
CREATE TYPE "DebateSessionStatus" AS ENUM ('SCHEDULED', 'ACTIVE', 'CLOSED');

-- AlterTable
ALTER TABLE "DebateEvaluation" ADD COLUMN     "evaluatorId" TEXT;

-- AlterTable
ALTER TABLE "DebateSession" ADD COLUMN     "moderatorId" TEXT,
ADD COLUMN     "status" "DebateSessionStatus" NOT NULL DEFAULT 'SCHEDULED';

-- CreateTable
CREATE TABLE "DebateParticipant" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DebateParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DebateParticipant_studentId_idx" ON "DebateParticipant"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "DebateParticipant_sessionId_studentId_key" ON "DebateParticipant"("sessionId", "studentId");

-- AddForeignKey
ALTER TABLE "DebateSession" ADD CONSTRAINT "DebateSession_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "StudentProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebateParticipant" ADD CONSTRAINT "DebateParticipant_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "DebateSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebateParticipant" ADD CONSTRAINT "DebateParticipant_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "_prisma_migrations" (
  "id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count"
) VALUES (
  'abf57ce4-eba8-4919-b3b7-86b4cd5ec579',
  '117e744883d7a4f3eac80fd2c3a2217fdf3fa96d8898a01b5deebb8113f6272a',
  now(),
  '20260504105446_sprint4_debate',
  NULL,
  NULL,
  now(),
  1
) ON CONFLICT ("id") DO NOTHING;


-- =========================================================================
-- MIGRATION: 20260506120000_add_student_code
-- =========================================================================

-- AlterTable
ALTER TABLE "StudentProfile" ADD COLUMN "studentCode" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_studentCode_key" ON "StudentProfile"("studentCode");

INSERT INTO "_prisma_migrations" (
  "id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count"
) VALUES (
  'd1918855-7468-4f02-9d20-2df31a48ec5e',
  '6e657e64758c5a7bf32cb3fd83c2b1696ed8c9be1d2e0213b3b579fe98e078b8',
  now(),
  '20260506120000_add_student_code',
  NULL,
  NULL,
  now(),
  1
) ON CONFLICT ("id") DO NOTHING;


-- =========================================================================
-- MIGRATION: 20260507104256_fix_missing_receipt_table
-- =========================================================================

-- AlterTable
ALTER TABLE "StudentProfile" ALTER COLUMN "studentCode" DROP DEFAULT;

-- CreateTable
CREATE TABLE "Receipt" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "amountMt" DOUBLE PRECISION NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "issuedBy" TEXT NOT NULL,
    "receiptNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Receipt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Receipt_invoiceId_key" ON "Receipt"("invoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "Receipt_receiptNumber_key" ON "Receipt"("receiptNumber");

-- CreateIndex
CREATE INDEX "Receipt_studentId_idx" ON "Receipt"("studentId");

-- CreateIndex
CREATE INDEX "Receipt_receiptNumber_idx" ON "Receipt"("receiptNumber");

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "_prisma_migrations" (
  "id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count"
) VALUES (
  '940c6262-e462-4e6b-adc9-9234b75cae79',
  '36bd73d394fac3755de49684e3556f3753001fe1cacd79c252051fd68faa66b5',
  now(),
  '20260507104256_fix_missing_receipt_table',
  NULL,
  NULL,
  now(),
  1
) ON CONFLICT ("id") DO NOTHING;


-- =========================================================================
-- MIGRATION: 20260511141000_secure_login_and_debate_instructors
-- =========================================================================

-- Allow student accounts without email. PostgreSQL unique indexes allow multiple NULL values.
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;

-- Existing debate moderators were stored as StudentProfile ids. Convert them to User ids
-- before changing the foreign key target, so existing sessions remain assigned.
ALTER TABLE "DebateSession" DROP CONSTRAINT IF EXISTS "DebateSession_moderatorId_fkey";

UPDATE "DebateSession" AS ds
SET "moderatorId" = sp."userId"
FROM "StudentProfile" AS sp
WHERE ds."moderatorId" = sp."id";

ALTER TABLE "DebateSession"
ADD CONSTRAINT "DebateSession_moderatorId_fkey"
FOREIGN KEY ("moderatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Tie each debate evaluation to the real user who submitted it.
ALTER TABLE "DebateEvaluation" DROP CONSTRAINT IF EXISTS "DebateEvaluation_evaluatorId_fkey";

ALTER TABLE "DebateEvaluation"
ADD CONSTRAINT "DebateEvaluation_evaluatorId_fkey"
FOREIGN KEY ("evaluatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "_prisma_migrations" (
  "id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count"
) VALUES (
  'aed8e008-5c70-484c-9719-3d4d29a19ac9',
  '5dcc9a3cf1d96ea3c1197f8386ad39737ae4dc24132c4382910604d92ad58e39',
  now(),
  '20260511141000_secure_login_and_debate_instructors',
  NULL,
  NULL,
  now(),
  1
) ON CONFLICT ("id") DO NOTHING;


-- =========================================================================
-- MIGRATION: 20260511165000_debate_feedback_acknowledgement
-- =========================================================================

-- Debate feedback acknowledgement and live notifications.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "canModerateDebates" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "DebateEvaluation" ADD COLUMN IF NOT EXISTS "acknowledgedAt" TIMESTAMP(3);

CREATE TABLE IF NOT EXISTS "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'INFO',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "evaluationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Notification_userId_idx" ON "Notification"("userId");
CREATE INDEX IF NOT EXISTS "Notification_isRead_idx" ON "Notification"("isRead");
CREATE INDEX IF NOT EXISTS "Notification_evaluationId_idx" ON "Notification"("evaluationId");

ALTER TABLE "Notification" DROP CONSTRAINT IF EXISTS "Notification_userId_fkey";
ALTER TABLE "Notification"
ADD CONSTRAINT "Notification_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Notification" DROP CONSTRAINT IF EXISTS "Notification_evaluationId_fkey";
ALTER TABLE "Notification"
ADD CONSTRAINT "Notification_evaluationId_fkey"
FOREIGN KEY ("evaluationId") REFERENCES "DebateEvaluation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "_prisma_migrations" (
  "id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count"
) VALUES (
  'ffbc5585-9a06-4d61-a698-4ca4f8946f73',
  '4f4cc2af924198400f89e76494018fca202939ea88d4cc66d46705f97f4c0943',
  now(),
  '20260511165000_debate_feedback_acknowledgement',
  NULL,
  NULL,
  now(),
  1
) ON CONFLICT ("id") DO NOTHING;


-- =========================================================================
-- MIGRATION: 20260519123200_link_debates_to_classesdocker
-- =========================================================================

/*
  Warnings:

  - A unique constraint covering the columns `[sourceProposalId]` on the table `DebateSession` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "DebateSession" ADD COLUMN     "classGroupId" TEXT,
ADD COLUMN     "moderatorAssignedAt" TIMESTAMP(3),
ADD COLUMN     "moderatorAssignedById" TEXT,
ADD COLUMN     "moderatorExpiresAt" TIMESTAMP(3),
ADD COLUMN     "moderatorNote" TEXT,
ADD COLUMN     "sourceProposalId" TEXT;

-- CreateTable
CREATE TABLE "DebateProposal" (
    "id" TEXT NOT NULL,
    "studentId" TEXT,
    "proposerId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "convertedSessionId" TEXT,
    "classGroupId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DebateProposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DebateProposalReaction" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'SUPPORT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DebateProposalReaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DebateProposal_studentId_idx" ON "DebateProposal"("studentId");

-- CreateIndex
CREATE INDEX "DebateProposal_proposerId_idx" ON "DebateProposal"("proposerId");

-- CreateIndex
CREATE INDEX "DebateProposal_classGroupId_idx" ON "DebateProposal"("classGroupId");

-- CreateIndex
CREATE INDEX "DebateProposal_status_idx" ON "DebateProposal"("status");

-- CreateIndex
CREATE INDEX "DebateProposal_approvedById_idx" ON "DebateProposal"("approvedById");

-- CreateIndex
CREATE INDEX "DebateProposalReaction_proposalId_idx" ON "DebateProposalReaction"("proposalId");

-- CreateIndex
CREATE INDEX "DebateProposalReaction_userId_idx" ON "DebateProposalReaction"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DebateProposalReaction_proposalId_userId_key" ON "DebateProposalReaction"("proposalId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "DebateSession_sourceProposalId_key" ON "DebateSession"("sourceProposalId");

-- CreateIndex
CREATE INDEX "DebateSession_moderatorId_idx" ON "DebateSession"("moderatorId");

-- CreateIndex
CREATE INDEX "DebateSession_classGroupId_idx" ON "DebateSession"("classGroupId");

-- CreateIndex
CREATE INDEX "DebateSession_moderatorExpiresAt_idx" ON "DebateSession"("moderatorExpiresAt");

-- AddForeignKey
ALTER TABLE "DebateSession" ADD CONSTRAINT "DebateSession_moderatorAssignedById_fkey" FOREIGN KEY ("moderatorAssignedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebateSession" ADD CONSTRAINT "DebateSession_sourceProposalId_fkey" FOREIGN KEY ("sourceProposalId") REFERENCES "DebateProposal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebateSession" ADD CONSTRAINT "DebateSession_classGroupId_fkey" FOREIGN KEY ("classGroupId") REFERENCES "ClassGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebateProposal" ADD CONSTRAINT "DebateProposal_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebateProposal" ADD CONSTRAINT "DebateProposal_proposerId_fkey" FOREIGN KEY ("proposerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebateProposal" ADD CONSTRAINT "DebateProposal_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebateProposal" ADD CONSTRAINT "DebateProposal_classGroupId_fkey" FOREIGN KEY ("classGroupId") REFERENCES "ClassGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebateProposalReaction" ADD CONSTRAINT "DebateProposalReaction_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "DebateProposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebateProposalReaction" ADD CONSTRAINT "DebateProposalReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "_prisma_migrations" (
  "id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count"
) VALUES (
  'ca7a036d-859e-43f3-bf63-5aa92b306b9d',
  '6ae0d3c55c66b4a42e4fb43873de7decccc860606a074db97847f69470a6de14',
  now(),
  '20260519123200_link_debates_to_classesdocker',
  NULL,
  NULL,
  now(),
  1
) ON CONFLICT ("id") DO NOTHING;


-- =========================================================================
-- MIGRATION: 20260519123340_sync_debate_models
-- =========================================================================

-- This is an empty migration.
INSERT INTO "_prisma_migrations" (
  "id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count"
) VALUES (
  '18a75798-1b7c-4616-b7ca-0e90a253a384',
  '122d743a0403e77ad7e0ed9447f5b8826f2fbdbc55612d936eff004dd13c2eec',
  now(),
  '20260519123340_sync_debate_models',
  NULL,
  NULL,
  now(),
  1
) ON CONFLICT ("id") DO NOTHING;


-- =========================================================================
-- MIGRATION: 20260529143609_add_debate_session_to_notifications
-- =========================================================================

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "debateSessionId" TEXT;

-- CreateIndex
CREATE INDEX "Notification_debateSessionId_idx" ON "Notification"("debateSessionId");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_debateSessionId_fkey" FOREIGN KEY ("debateSessionId") REFERENCES "DebateSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "_prisma_migrations" (
  "id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count"
) VALUES (
  '8525cf24-cc4d-4e1b-bc92-716e904fbaf5',
  '2c9cd20caf5b943bc04f97324767d06c0a71e4c31bee655640205543b3bc7bd1',
  now(),
  '20260529143609_add_debate_session_to_notifications',
  NULL,
  NULL,
  now(),
  1
) ON CONFLICT ("id") DO NOTHING;


-- =========================================================================
-- MIGRATION: 20260601072317_add_calendar_events
-- =========================================================================

-- CreateTable
CREATE TABLE "CalendarEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "type" TEXT NOT NULL DEFAULT 'INFO',
    "location" TEXT,
    "isImportant" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalendarEvent_pkey" PRIMARY KEY ("id")
);

INSERT INTO "_prisma_migrations" (
  "id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count"
) VALUES (
  'd6ea8fe5-410d-4af8-bf9c-257e5bd15727',
  '3eddf755edd6c7f21031b1c3e61c17689f5672bf59fb3d10ec96fda2880d8874',
  now(),
  '20260601072317_add_calendar_events',
  NULL,
  NULL,
  now(),
  1
) ON CONFLICT ("id") DO NOTHING;

