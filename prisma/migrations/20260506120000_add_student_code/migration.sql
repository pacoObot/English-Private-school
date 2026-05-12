-- AlterTable
ALTER TABLE "StudentProfile" ADD COLUMN "studentCode" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_studentCode_key" ON "StudentProfile"("studentCode");
