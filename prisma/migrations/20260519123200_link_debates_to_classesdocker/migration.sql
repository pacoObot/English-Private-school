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
