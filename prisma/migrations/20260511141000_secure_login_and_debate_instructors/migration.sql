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
