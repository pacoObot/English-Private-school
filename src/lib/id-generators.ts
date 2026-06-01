import { prisma } from "./prisma";

export async function generateStudentCode(): Promise<string> {
  const currentYear = new Date().getFullYear();
  
  // Find the last student code for the current year (matching both DPS- and DEL-)
  const lastStudent = await prisma.studentProfile.findFirst({
    where: {
      OR: [
        { studentCode: { startsWith: `DPS-${currentYear}-` } },
        { studentCode: { startsWith: `DEL-${currentYear}-` } }
      ]
    },
    orderBy: {
      studentCode: 'desc'
    }
  });

  let nextNumber = 1;
  if (lastStudent && lastStudent.studentCode) {
    const parts = lastStudent.studentCode.split('-');
    const lastNumber = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  // Format: DPS-YYYY-XXXX
  return `DPS-${currentYear}-${nextNumber.toString().padStart(4, '0')}`;
}

export async function generateStudentNumber(): Promise<string> {
  return generateStudentCode();
}

export async function generateReceiptNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();
  
  // Find the last receipt number for the current year
  const lastReceipt = await prisma.receipt.findFirst({
    where: {
      receiptNumber: {
        startsWith: `REC-${currentYear}-`
      }
    },
    orderBy: {
      receiptNumber: 'desc'
    }
  });

  let nextNumber = 1;
  if (lastReceipt && lastReceipt.receiptNumber) {
    const parts = lastReceipt.receiptNumber.split('-');
    const lastNumber = parseInt(parts[2], 10);
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  // Format: REC-YYYY-XXXX
  return `REC-${currentYear}-${nextNumber.toString().padStart(4, '0')}`;
}
