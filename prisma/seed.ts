import { AttendanceStatus, DebateSessionStatus, InvoiceStatus, Prisma, PrismaClient, Role } from "../src/generated/prisma";
import { hashPassword } from "../src/features/auth/password";
import { readFileSync } from "fs";
import { resolve } from "path";

loadEnv();
const prisma = new PrismaClient();

type SeedStudent = Prisma.UserGetPayload<{ include: { studentProfile: true } }>;

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

  if (process.env.SEED_ONLY_SUPER_ADMIN === "true") {
    const existingSuper = await prisma.user.findFirst({
      where: { role: Role.SUPER_ADMIN }
    });
    if (existingSuper) {
      console.log("Super Admin already exists. Skipping seeding.");
      return;
    }
    await prisma.user.create({
      data: {
        name: "Direcao Geral",
        email: "super.admin@delsonps.local",
        passwordHash,
        role: Role.SUPER_ADMIN
      }
    });
    console.log("Seeding completed: Created ONLY the Super Admin (production/empty state).");
    return;
  }

  await prisma.notification.deleteMany();
  await prisma.debateProposalReaction.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.debateEvaluation.deleteMany();
  await prisma.debateParticipant.deleteMany();
  await prisma.debateSession.deleteMany();
  await prisma.debateProposal.deleteMany();
  await prisma.receipt.deleteMany();
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
      name: "Direcao Geral",
      email: "super.admin@delsonps.local",
      passwordHash,
      role: Role.SUPER_ADMIN
    }
  });

  const admin = await prisma.user.create({
    data: {
      name: "Secretaria Academica",
      email: "secretaria@delsonps.local",
      passwordHash,
      role: Role.ADMIN
    }
  });

  const teachers = await Promise.all([
    prisma.user.create({
      data: {
        name: "Nelson Manuel",
        email: "nelson.manuel@delsonps.local",
        passwordHash,
        role: Role.TEACHER,
        canModerateDebates: true,
        teacherProfile: {
          create: {
            staffNumber: "DSP-INS-001",
            specialty: "Business English e Debate"
          }
        }
      },
      include: { teacherProfile: true }
    }),
    prisma.user.create({
      data: {
        name: "Marta Chissano",
        email: "marta.chissano@delsonps.local",
        passwordHash,
        role: Role.TEACHER,
        teacherProfile: {
          create: {
            staffNumber: "DSP-INS-002",
            specialty: "General English"
          }
        }
      },
      include: { teacherProfile: true }
    })
  ]);

  const studentSeeds = [
    ["Ester Mucavele", "ester.mucavele@delsonps.local", "DSP-2026-001", "B2 Upper Intermediate", true],
    ["Anderson Nhantumbo", "anderson.nhantumbo@delsonps.local", "DSP-2026-002", "B2 Upper Intermediate", false],
    ["Paulo Matavele", "paulo.matavele@delsonps.local", "DSP-2026-003", "B1 Intermediate", false],
    ["Maria Uamusse", "maria.uamusse@delsonps.local", "DSP-2026-004", "B1 Intermediate", false],
    ["Delson Simango", "delson.simango@delsonps.local", "DSP-2026-005", "A2 Elementary", false],
    ["Alfredo Cossa", "alfredo.cossa@delsonps.local", "DSP-2026-006", "A2 Elementary", false],
    ["Ana Muthemba", "ana.muthemba@delsonps.local", "DSP-2026-007", "C1 Advanced", false]
  ] as const;

  const students: SeedStudent[] = [];
  for (const [name, email, code, level, canModerateDebates] of studentSeeds) {
    students.push(await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: Role.STUDENT,
        canModerateDebates,
        studentProfile: {
          create: {
            studentNumber: code,
            studentCode: code,
            level,
            phone: "+258 84 000 0000"
          }
        }
      },
      include: { studentProfile: true }
    }));
  }

  const businessCourse = await prisma.course.create({
    data: {
      title: "Ingles para Negocios",
      level: "B2",
      description: "Vocabulário profissional, escrita formal, reuniões e apresentações.",
      duration: "12 semanas"
    }
  });

  const generalCourse = await prisma.course.create({
    data: {
      title: "Ingles Geral",
      level: "B1",
      description: "Gramática prática, conversação e compreensão oral para uso diário.",
      duration: "10 semanas"
    }
  });

  const classes = await Promise.all([
    prisma.classGroup.create({
      data: {
        name: "B2 Noite",
        room: "Sala 04",
        schedule: "Seg/Qua 19:30",
        courseId: businessCourse.id,
        teacherId: teachers[0].teacherProfile?.id,
        startsAt: new Date("2026-05-04T17:30:00.000Z"),
        endsAt: new Date("2026-07-29T19:00:00.000Z")
      }
    }),
    prisma.classGroup.create({
      data: {
        name: "B1 Manha",
        room: "Sala 02",
        schedule: "Ter/Qui 08:30",
        courseId: generalCourse.id,
        teacherId: teachers[1].teacherProfile?.id,
        startsAt: new Date("2026-05-05T06:30:00.000Z"),
        endsAt: new Date("2026-07-16T08:00:00.000Z")
      }
    })
  ]);

  const enrollments = [];
  for (let index = 0; index < students.length; index += 1) {
    const user = students[index];
    if (!user.studentProfile) throw new Error(`Perfil de estudante não criado para ${user.name}.`);
    const course = index < 3 || index === 6 ? businessCourse : generalCourse;
    const classGroup = index < 3 || index === 6 ? classes[0] : classes[1];
    enrollments.push(await prisma.enrollment.create({
      data: {
        studentId: user.studentProfile.id,
        courseId: course.id,
        classGroupId: classGroup.id
      }
    }));
  }

  await prisma.studyMaterial.createMany({
    data: [
      {
        title: "Negotiation Vocabulary",
        unit: "Unit 04",
        description: "Expressões para propostas, contrapropostas e encerramento de acordos.",
        courseId: businessCourse.id,
        teacherId: teachers[0].teacherProfile?.id
      },
      {
        title: "Formal Email Patterns",
        unit: "Unit 05",
        description: "Modelos de email profissional com pedidos, anexos e seguimento.",
        courseId: businessCourse.id,
        teacherId: teachers[0].teacherProfile?.id
      },
      {
        title: "Daily Conversation Review",
        unit: "Unit 02",
        description: "Perguntas frequentes, respostas curtas e vocabulário de rotina.",
        courseId: generalCourse.id,
        teacherId: teachers[1].teacherProfile?.id
      }
    ]
  });

  for (let index = 0; index < students.length; index += 1) {
    const user = students[index];
    if (!user.studentProfile) continue;
    const classGroup = index < 3 || index === 6 ? classes[0] : classes[1];
    await prisma.attendance.createMany({
      data: [
        {
          studentId: user.studentProfile.id,
          classGroupId: classGroup.id,
          lessonDate: new Date("2026-05-06T00:00:00.000Z"),
          status: index === 4 ? AttendanceStatus.LATE : AttendanceStatus.PRESENT
        },
        {
          studentId: user.studentProfile.id,
          classGroupId: classGroup.id,
          lessonDate: new Date("2026-05-08T00:00:00.000Z"),
          status: index === 5 ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT
        }
      ]
    });

    await prisma.grade.create({
      data: {
        studentId: user.studentProfile.id,
        classGroupId: classGroup.id,
        title: "Speaking Checkpoint",
        score: 13 + (index % 5),
        maxScore: 20
      }
    });
  }

  for (let index = 0; index < enrollments.length; index += 1) {
    const enrollment = enrollments[index];
    const status = index % 3 === 0 ? InvoiceStatus.PAID : InvoiceStatus.PENDING;
    const invoice = await prisma.invoice.create({
      data: {
        studentId: enrollment.studentId,
        enrollmentId: enrollment.id,
        reference: `INV-2026-05-${String(index + 1).padStart(3, "0")}`,
        amountMt: index < 3 || index === 6 ? 3200 : 2500,
        status,
        dueDate: new Date("2026-05-25T00:00:00.000Z"),
        paidAt: status === InvoiceStatus.PAID ? new Date("2026-05-10T09:00:00.000Z") : null
      }
    });

    if (status === InvoiceStatus.PAID) {
      await prisma.receipt.create({
        data: {
          invoiceId: invoice.id,
          studentId: enrollment.studentId,
          amountMt: invoice.amountMt,
          issuedBy: admin.name,
          receiptNumber: `REC-2026-05-${String(index + 1).padStart(3, "0")}`
        }
      });
    }
  }

  const scheduledDebate = await prisma.debateSession.create({
    data: {
      topic: "Should English clubs be mandatory for intermediate students?",
      startsAt: new Date("2026-05-22T17:30:00.000Z"),
      capacity: 12,
      location: "Sala 04",
      status: DebateSessionStatus.SCHEDULED,
      moderatorId: students[0].id
    }
  });

  const activeDebate = await prisma.debateSession.create({
    data: {
      topic: "Remote work improves productivity",
      startsAt: new Date("2026-05-15T17:30:00.000Z"),
      capacity: 10,
      location: "Sala 04",
      status: DebateSessionStatus.ACTIVE,
      moderatorId: teachers[0].id
    }
  });

  const unassignedDebate = await prisma.debateSession.create({
    data: {
      topic: "Public speaking should be taught from level A2",
      startsAt: new Date("2026-05-29T17:30:00.000Z"),
      capacity: 15,
      location: "Sala 02",
      status: DebateSessionStatus.SCHEDULED
    }
  });

  const approvedProposal = await prisma.debateProposal.create({
    data: {
      proposerId: students[1].id,
      studentId: students[1].studentProfile?.id,
      topic: activeDebate.topic,
      reason: "Tema frequente nas entrevistas e apresentações dos alunos.",
      status: "APPROVED",
      approvedById: teachers[0].id,
      approvedAt: new Date("2026-05-14T12:00:00.000Z")
    }
  });

  await prisma.debateSession.update({
    where: { id: activeDebate.id },
    data: {
      sourceProposalId: approvedProposal.id,
      moderatorAssignedById: teachers[0].id,
      moderatorAssignedAt: new Date("2026-05-14T12:05:00.000Z"),
      moderatorExpiresAt: new Date("2026-05-30T21:00:00.000Z"),
      moderatorNote: "Avaliar fluência, argumentação e postura com feedback curto e acionável."
    }
  });

  await prisma.debateProposal.update({
    where: { id: approvedProposal.id },
    data: { convertedSessionId: activeDebate.id }
  });

  const pendingProposal = await prisma.debateProposal.create({
    data: {
      proposerId: students[3].id,
      studentId: students[3].studentProfile?.id,
      topic: "Should students use AI tools for homework?",
      reason: "Ajuda a discutir responsabilidade, aprendizagem real e uso ético de tecnologia."
    }
  });

  await prisma.debateProposal.create({
    data: {
      proposerId: teachers[1].id,
      topic: "Is public speaking more important than grammar?",
      reason: "Tema útil para conectar confiança oral com precisão linguística."
    }
  });

  await prisma.debateProposalReaction.createMany({
    data: [
      { proposalId: pendingProposal.id, userId: students[0].id },
      { proposalId: pendingProposal.id, userId: students[2].id },
      { proposalId: pendingProposal.id, userId: teachers[0].id }
    ]
  });

  for (const debate of [scheduledDebate, activeDebate, unassignedDebate]) {
    for (const user of students.slice(1, 5)) {
      if (!user.studentProfile) continue;
      await prisma.debateParticipant.create({
        data: {
          sessionId: debate.id,
          studentId: user.studentProfile.id
        }
      });
    }
  }

  const evaluations = await Promise.all([
    prisma.debateEvaluation.create({
      data: {
        sessionId: activeDebate.id,
        studentId: students[1].studentProfile!.id,
        evaluatorId: teachers[0].id,
        fluency: 8,
        argumentation: 7,
        posture: 9,
        feedback: "Boa clareza nas ideias. Para a próxima sessão, tenta sustentar cada argumento com um exemplo específico."
      }
    }),
    prisma.debateEvaluation.create({
      data: {
        sessionId: activeDebate.id,
        studentId: students[2].studentProfile!.id,
        evaluatorId: teachers[0].id,
        fluency: 7,
        argumentation: 8,
        posture: 7,
        feedback: "A estrutura dos argumentos melhorou. Trabalha a velocidade da fala para dar mais tempo ao público."
      }
    })
  ]);

  await prisma.notification.createMany({
    data: evaluations.map((evaluation, index) => ({
      userId: students[index + 1].id,
      title: "Novo feedback de debate",
      message: `${teachers[0].name} avaliou a tua participação em "${activeDebate.topic}". Abre o histórico para confirmar a leitura.`,
      type: "DEBATE_FEEDBACK",
      evaluationId: evaluation.id
    }))
  });

  await prisma.auditLog.create({
    data: {
      actorId: superAdmin.id,
      action: "demo_data_seeded",
      entity: "system",
      metadata: {
        source: "prisma/seed.ts",
        safeDemoData: true
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
