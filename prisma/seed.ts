import { AttendanceStatus, InvoiceStatus, PrismaClient, Role } from "../src/generated/prisma";
import { hashPassword } from "../src/features/auth/password";
import { readFileSync } from "fs";
import { resolve } from "path";

loadEnv();
const prisma = new PrismaClient();

function loadEnv() {
  const envPath = resolve(process.cwd(), ".env");

  try {
    const envFile = readFileSync(envPath, "utf8");
    for (const line of envFile.split("\n")) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (!match) continue;
      const [, key, rawValue] = match;
      process.env[key] ??= rawValue.trim().replace(/^"|"$/g, "");
    }
  } catch {
    // Seed can still run when DATABASE_URL is provided directly by the shell.
  }
}

async function main() {
  const passwordHash = hashPassword("Delson@2026");

  await prisma.auditLog.deleteMany();
  await prisma.debateEvaluation.deleteMany();
  await prisma.debateSession.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.studyMaterial.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.classGroup.deleteMany();
  await prisma.course.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.teacherProfile.deleteMany();
  await prisma.user.deleteMany();

  const superAdmin = await prisma.user.create({
    data: {
      name: "Teste Super Admin",
      email: "super.admin.teste@delsonps.local",
      passwordHash,
      role: Role.SUPER_ADMIN
    }
  });

  await prisma.user.create({
    data: {
      name: "Teste Admin Academico",
      email: "admin.teste@delsonps.local",
      passwordHash,
      role: Role.ADMIN
    }
  });

  const teacher = await prisma.user.create({
    data: {
      name: "Teste Prof. Nelson Manuel",
      email: "prof.nelson.teste@delsonps.local",
      passwordHash,
      role: Role.TEACHER,
      teacherProfile: {
        create: {
          staffNumber: "STAFF-TEST-001",
          specialty: "Business English"
        }
      }
    },
    include: { teacherProfile: true }
  });

  const student = await prisma.user.create({
    data: {
      name: "Teste Alipio Paco",
      email: "alipio.teste@delsonps.local",
      passwordHash,
      role: Role.STUDENT,
      studentProfile: {
        create: {
          studentNumber: "STU-TEST-442910",
          level: "B2 Upper Intermediate",
          guardianName: "Teste Encarregado"
        }
      }
    },
    include: { studentProfile: true }
  });

  const course = await prisma.course.create({
    data: {
      title: "Ingles para Negocios",
      level: "B2",
      description: "Curso ficticio para testes do Sprint 1.",
      duration: "12 semanas"
    }
  });

  const classGroup = await prisma.classGroup.create({
    data: {
      name: "Teste B2 Noite",
      room: "Sala 04",
      schedule: "Seg/Qua 19:30",
      courseId: course.id,
      teacherId: teacher.teacherProfile?.id
    }
  });

  if (!student.studentProfile) {
    throw new Error("Student profile seed failed.");
  }

  const enrollment = await prisma.enrollment.create({
    data: {
      studentId: student.studentProfile.id,
      courseId: course.id,
      classGroupId: classGroup.id
    }
  });

  await prisma.studyMaterial.createMany({
    data: [
      {
        title: "Teste - Negotiation Vocabulary",
        unit: "Unit 04",
        courseId: course.id,
        teacherId: teacher.teacherProfile?.id
      },
      {
        title: "Teste - Formal Email Patterns",
        unit: "Unit 05",
        courseId: course.id,
        teacherId: teacher.teacherProfile?.id
      }
    ]
  });

  await prisma.attendance.create({
    data: {
      studentId: student.studentProfile.id,
      classGroupId: classGroup.id,
      lessonDate: new Date("2026-04-29T17:30:00.000Z"),
      status: AttendanceStatus.PRESENT
    }
  });

  await prisma.grade.create({
    data: {
      studentId: student.studentProfile.id,
      classGroupId: classGroup.id,
      title: "Teste - Frequencia 1",
      score: 16.5
    }
  });

  await prisma.invoice.create({
    data: {
      studentId: student.studentProfile.id,
      enrollmentId: enrollment.id,
      reference: "INV-TEST-2026-0001",
      amountMt: 2500,
      status: InvoiceStatus.PENDING,
      dueDate: new Date("2026-05-10T00:00:00.000Z")
    }
  });

  const debate = await prisma.debateSession.create({
    data: {
      topic: "Teste - Impacto da IA na Educacao",
      startsAt: new Date("2026-05-02T17:30:00.000Z"),
      capacity: 15,
      location: "Sala 04"
    }
  });

  await prisma.debateEvaluation.create({
    data: {
      sessionId: debate.id,
      studentId: student.studentProfile.id,
      fluency: 8,
      argumentation: 7,
      posture: 9,
      feedback: "Dados ficticios de teste para avaliacao de fala."
    }
  });

  await prisma.auditLog.create({
    data: {
      actorId: superAdmin.id,
      action: "seed_test_data_created",
      entity: "system",
      metadata: {
        source: "prisma/seed.ts",
        safeTestData: true
      }
    }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
