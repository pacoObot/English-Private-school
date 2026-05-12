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
