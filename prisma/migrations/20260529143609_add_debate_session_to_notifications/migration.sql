-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "debateSessionId" TEXT;

-- CreateIndex
CREATE INDEX "Notification_debateSessionId_idx" ON "Notification"("debateSessionId");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_debateSessionId_fkey" FOREIGN KEY ("debateSessionId") REFERENCES "DebateSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
