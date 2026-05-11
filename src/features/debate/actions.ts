"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { DebateSessionStatus, Role } from "@/generated/prisma";
import { getCurrentSession } from "@/features/auth/current-user";
import { routeForRole } from "@/features/auth/session";
import { prisma } from "@/lib/prisma";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

type ActionStatus = "created" | "updated" | "deleted" | "error" | "evaluated" | "participant_added" | "participant_removed" | "forbidden";

function redirectBack(path: string, result: ActionStatus) {
  redirect(`${path}?status=${result}`);
}

async function requireAdmin() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  const allowedRoles: Role[] = [Role.SUPER_ADMIN, Role.ADMIN];

  if (!allowedRoles.includes(session.role)) {
    redirect(routeForRole(session.role));
  }

  return session;
}

async function requireDebateManager(sessionId: string) {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  const isAdmin = ([Role.SUPER_ADMIN, Role.ADMIN] as Role[]).includes(session.role);
  if (isAdmin) {
    return session;
  }

  // Check if user has debate moderation permission
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { canModerateDebates: true }
  });

  const debate = await prisma.debateSession.findUnique({
    where: { id: sessionId },
    select: { moderatorId: true }
  });

  if (!debate || (debate.moderatorId !== session.userId && !user?.canModerateDebates)) {
    redirectBack(`/debate/${sessionId}`, "forbidden");
  }

  return session;
}

export async function createDebateSessionAction(formData: FormData) {
  const session = await requireAdmin();
  const topic = text(formData, "topic");
  const startsAtValue = text(formData, "startsAt");
  const capacity = parseInt(text(formData, "capacity") || "15", 10);
  const location = text(formData, "location");
  const instructorId = text(formData, "moderatorId");

  if (!topic || !startsAtValue || isNaN(capacity)) {
    redirectBack("/debate", "error");
  }

  if (instructorId) {
    const instructor = await prisma.user.findUnique({
      where: { id: instructorId },
      select: { id: true, role: true, isActive: true }
    });

    if (!instructor || !instructor.isActive || !([Role.TEACHER, Role.STUDENT] as Role[]).includes(instructor.role)) {
      redirectBack("/debate", "forbidden");
    }
  }

  const debate = await prisma.debateSession.create({
    data: {
      topic,
      startsAt: new Date(startsAtValue),
      capacity,
      location: location || null,
      moderatorId: instructorId || null,
      status: DebateSessionStatus.SCHEDULED
    }
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: "debate_session_created",
      entity: "DebateSession",
      entityId: debate.id
    }
  });

  revalidatePath("/debate");
  redirectBack("/debate", "created");
}

export async function addDebateParticipantAction(formData: FormData) {
  const sessionId = text(formData, "sessionId");
  const studentId = text(formData, "studentId");

  if (!sessionId || !studentId) {
    redirectBack(`/debate/${sessionId}`, "error");
  }

  const currentSession = await getCurrentSession();
  if (!currentSession) redirect("/login");

  const isSelfStudentJoin = currentSession.role === Role.STUDENT
    && await prisma.studentProfile.findFirst({ where: { id: studentId, userId: currentSession.userId }, select: { id: true } });

  const session = isSelfStudentJoin ? currentSession : await requireDebateManager(sessionId);

  const debate = await prisma.debateSession.findUnique({
    where: { id: sessionId },
    select: { capacity: true, status: true, moderatorId: true, _count: { select: { participants: true } } }
  });

  if (!debate || debate.status === DebateSessionStatus.CLOSED || debate._count.participants >= debate.capacity) {
    redirectBack(`/debate/${sessionId}`, "error");
  }

  try {
    await prisma.debateParticipant.create({
      data: {
        sessionId,
        studentId
      }
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.userId,
        action: "debate_participant_added",
        entity: "DebateParticipant",
        entityId: sessionId,
        metadata: { studentId }
      }
    });

    revalidatePath(`/debate/${sessionId}`);
    redirectBack(`/debate/${sessionId}`, "participant_added");
  } catch {
    return redirectBack(`/debate/${sessionId}`, "error");
  }
}

export async function removeDebateParticipantAction(formData: FormData) {
  const sessionId = text(formData, "sessionId");
  const studentId = text(formData, "studentId");

  if (!sessionId || !studentId) {
    redirectBack(`/debate/${sessionId}`, "error");
  }

  const session = await requireDebateManager(sessionId);

  try {
    await prisma.debateParticipant.delete({
      where: {
        sessionId_studentId: {
          sessionId,
          studentId
        }
      }
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.userId,
        action: "debate_participant_removed",
        entity: "DebateParticipant",
        entityId: sessionId,
        metadata: { studentId }
      }
    });

    revalidatePath(`/debate/${sessionId}`);
    redirectBack(`/debate/${sessionId}`, "participant_removed");
  } catch {
    return redirectBack(`/debate/${sessionId}`, "error");
  }
}

export async function saveDebateEvaluationAction(formData: FormData) {
  const sessionId = text(formData, "sessionId");
  const studentId = text(formData, "studentId");
  const fluency = parseInt(text(formData, "fluency"), 10);
  const argumentation = parseInt(text(formData, "argumentation"), 10);
  const posture = parseInt(text(formData, "posture"), 10);
  const feedback = text(formData, "feedback");

  if (!sessionId || !studentId || isNaN(fluency) || isNaN(argumentation) || isNaN(posture)) {
    return { success: false };
  }

  if ([fluency, argumentation, posture].some((score) => score < 1 || score > 10)) {
    return { success: false, error: "As notas devem ficar entre 1 e 10." };
  }

  const session = await requireDebateManager(sessionId);

  // Verify if user still exists in DB (after reseed)
  const userExists = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true }
  });

  if (!userExists) {
    return { success: false, error: "Sessão expirada ou utilizador inexistente. Por favor, faça login novamente." };
  }

  const debate = await prisma.debateSession.findUnique({
    where: { id: sessionId },
    select: {
      moderatorId: true,
      topic: true,
      status: true,
      participants: { where: { studentId }, select: { id: true } }
    }
  });

  if (!debate || debate.status === DebateSessionStatus.CLOSED || debate.participants.length === 0) {
    return { success: false };
  }

  if (debate.moderatorId === session.userId && await prisma.studentProfile.findFirst({ where: { id: studentId, userId: session.userId }, select: { id: true } })) {
    return { success: false, error: "O instrutor não pode avaliar a própria participação." };
  }

  const evaluation = await prisma.debateEvaluation.upsert({
    where: {
      sessionId_studentId: {
        sessionId,
        studentId
      }
    },
    create: {
      sessionId,
      studentId,
      evaluatorId: session.userId,
      fluency,
      argumentation,
      posture,
      feedback: feedback || null,
      acknowledgedAt: null
    },
    update: {
      evaluatorId: session.userId,
      fluency,
      argumentation,
      posture,
      feedback: feedback || null,
      acknowledgedAt: null,
      evaluatedAt: new Date()
    }
  });

  // Safe audit log - don't crash the whole action if audit fails
  try {
    await prisma.auditLog.create({
      data: {
        actorId: session.userId,
        action: "debate_evaluation_submitted_live",
        entity: "DebateEvaluation",
        metadata: { sessionId, studentId }
      }
    });
  } catch (e) {
    console.error("Audit log failed", e);
  }

  // Enviar notificação para o estudante com link à avaliação
  try {
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      select: { userId: true, user: { select: { name: true } } }
    });

    const teacher = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { name: true }
    });

    if (studentProfile && evaluation) {
      await prisma.notification.create({
        data: {
          userId: studentProfile.userId,
          title: "Novo feedback de debate",
          message: `${teacher?.name ?? "O instrutor"} avaliou a tua participação em "${debate.topic}". Fluência: ${fluency}/10 · Argumentação: ${argumentation}/10 · Postura: ${posture}/10. Feedback: "${feedback || "Sem comentário adicional."}"`,
          type: "DEBATE_FEEDBACK",
          evaluationId: evaluation.id
        }
      });
    }
  } catch (e) {
    console.error("Failed to send notification", e);
  }

  revalidatePath(`/debate/${sessionId}`);
  revalidatePath(`/student/dashboard`);
  revalidatePath(`/student/debates`);
  return { success: true };
}

// Alias for backward compatibility with existing components
export const evaluateDebateParticipantAction = saveDebateEvaluationAction;

export async function acknowledgeDebateFeedbackAction(formData: FormData) {
  const evaluationId = text(formData, "evaluationId");
  const notificationId = text(formData, "notificationId");
  const session = await getCurrentSession();

  if (!session || !evaluationId) {
    return { success: false };
  }

  const evaluation = await prisma.debateEvaluation.findFirst({
    where: {
      id: evaluationId,
      student: { userId: session.userId }
    },
    include: {
      session: { select: { topic: true } },
      student: { include: { user: { select: { name: true } } } },
      evaluator: { select: { id: true } }
    }
  });

  if (!evaluation) {
    return { success: false };
  }

  const acknowledgedAt = evaluation.acknowledgedAt ?? new Date();

  await prisma.$transaction(async (tx) => {
    await tx.debateEvaluation.update({
      where: { id: evaluation.id },
      data: { acknowledgedAt }
    });

    if (notificationId) {
      await tx.notification.updateMany({
        where: { id: notificationId, userId: session.userId },
        data: { isRead: true }
      });
    }

    if (evaluation.evaluator?.id && !evaluation.acknowledgedAt) {
      await tx.notification.create({
        data: {
          userId: evaluation.evaluator.id,
          title: "Feedback confirmado",
          message: `${evaluation.student.user.name} confirmou a leitura do feedback em "${evaluation.session.topic}".`,
          type: "SUCCESS",
          evaluationId: evaluation.id
        }
      });
    }

    await tx.auditLog.create({
      data: {
        actorId: session.userId,
        action: "debate_feedback_acknowledged",
        entity: "DebateEvaluation",
        entityId: evaluation.id
      }
    });
  });

  revalidatePath("/student/debates");
  revalidatePath("/student/dashboard");
  revalidatePath(`/debate/${evaluation.sessionId}`);
  return { success: true };
}

export async function updateDebateSessionStatusAction(formData: FormData) {
  const id = text(formData, "id");
  const status = text(formData, "status") as DebateSessionStatus;

  if (!id || !Object.values(DebateSessionStatus).includes(status)) {
    redirectBack(`/debate/${id}`, "error");
  }

  const session = await requireDebateManager(id);

  const debate = await prisma.debateSession.update({
    where: { id },
    data: { status }
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: "debate_status_updated",
      entity: "DebateSession",
      entityId: id,
      metadata: { status }
    }
  });

  revalidatePath("/debate");
  revalidatePath(`/debate/${id}`);
  redirectBack(`/debate/${id}`, "updated");
}

export async function proposeDebateTopic(formData: FormData) {
  const session = await getCurrentSession();
  if (!session || session.role !== "STUDENT") {
    return { success: false, message: "Apenas estudantes podem propor temas." };
  }

  const topic = formData.get("topic") as string;
  const reason = formData.get("reason") as string;

  if (!topic) return { success: false, message: "O tópico é obrigatório." };

  const student = await prisma.studentProfile.findFirst({
    where: { userId: session.userId }
  });

  if (!student) return { success: false, message: "Perfil não encontrado." };

  await prisma.debateProposal.create({
    data: {
      studentId: student.id,
      topic,
      reason,
      status: "PENDING"
    }
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: "debate_topic_proposed",
      entity: "DebateProposal",
      metadata: { topic }
    }
  });

  revalidatePath("/student/dashboard");
  return { success: true };
}

// ── Confirmação de leitura pelo estudante ──
export async function acknowledgeEvaluationAction(formData: FormData) {
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  const evaluationId = String(formData.get("evaluationId") ?? "").trim();
  if (!evaluationId) return { success: false };

  const evaluation = await prisma.debateEvaluation.findUnique({
    where: { id: evaluationId },
    select: { id: true, studentId: true, student: { select: { userId: true } }, acknowledgedAt: true }
  });

  if (!evaluation || evaluation.student.userId !== session.userId) {
    return { success: false, error: "Avaliação não encontrada ou sem permissão." };
  }

  if (evaluation.acknowledgedAt) {
    return { success: true }; // Já confirmado
  }

  await prisma.debateEvaluation.update({
    where: { id: evaluationId },
    data: { acknowledgedAt: new Date() }
  });

  // Marcar a notificação associada como lida
  await prisma.notification.updateMany({
    where: { evaluationId, userId: session.userId },
    data: { isRead: true }
  });

  revalidatePath("/student/debates");
  revalidatePath("/student/dashboard");
  return { success: true };
}

// ── Toggle permissão de moderação (Super Admin only) ──
export async function toggleDebateModeratorAction(formData: FormData) {
  const session = await getCurrentSession();
  if (!session || session.role !== Role.SUPER_ADMIN) {
    redirect("/login");
  }

  const userId = String(formData.get("userId") ?? "").trim();
  if (!userId) redirectBack("/admin/staff", "error");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { canModerateDebates: true }
  });

  if (!user) redirectBack("/admin/staff", "error");

  await prisma.user.update({
    where: { id: userId },
    data: { canModerateDebates: !user!.canModerateDebates }
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: user!.canModerateDebates ? "debate_moderator_revoked" : "debate_moderator_granted",
      entity: "User",
      entityId: userId
    }
  });

  revalidatePath("/admin/staff");
  revalidatePath("/debate");
  redirectBack("/admin/staff", "updated");
}
