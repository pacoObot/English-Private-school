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
