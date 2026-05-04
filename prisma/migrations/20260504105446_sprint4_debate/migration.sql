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
