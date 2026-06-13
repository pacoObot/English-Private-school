"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { DebateSessionStatus, Role } from "@/generated/prisma";
import { getCurrentSession } from "@/features/auth/current-user";
import { routeForRole } from "@/features/auth/session";
import { prisma } from "@/lib/prisma";
import { createSystemNotification, createSystemNotifications } from "@/lib/push";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

type ActionStatus = "created" | "updated" | "deleted" | "error" | "evaluated" | "participant_added" | "participant_removed" | "forbidden";

function isRedirectError(error: any): error is Error & { digest: string } {
  return error && (
    (typeof error.digest === "string" && error.digest.startsWith("NEXT_REDIRECT")) ||
    error.message === "NEXT_REDIRECT"
  );
}

function redirectBack(path: string, result: ActionStatus): never {
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

async function requireDebateApprover() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  const allowedRoles: Role[] = [Role.SUPER_ADMIN, Role.ADMIN, Role.TEACHER];

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
    select: { moderatorId: true, moderatorExpiresAt: true }
  });

  const activeDelegation = debate?.moderatorId === session.userId && (!debate.moderatorExpiresAt || debate.moderatorExpiresAt >= new Date());

  if (!debate || (!activeDelegation && !user?.canModerateDebates)) {
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
  const moderatorExpiresAtValue = text(formData, "moderatorExpiresAt");
  const moderatorNote = text(formData, "moderatorNote");
  const classGroupId = text(formData, "classGroupId");

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
      moderatorAssignedById: instructorId ? session.userId : null,
      moderatorAssignedAt: instructorId ? new Date() : null,
      moderatorExpiresAt: moderatorExpiresAtValue ? new Date(moderatorExpiresAtValue) : null,
      moderatorNote: moderatorNote || null,
      classGroupId: classGroupId || null,
      status: DebateSessionStatus.SCHEDULED
    }
  });

  if (instructorId) {
    await createSystemNotification({
      userId: instructorId,
      title: "Designação de Moderador do Debate",
      message: `Você foi designado como instrutor no debate "${debate.topic}". Aceda à sala para pré-personalizar os detalhes, gerir os participantes e avaliar a sessão.`,
      type: "DEBATE_DESIGNATION",
      debateSessionId: debate.id,
      url: `/debate/${debate.id}`
    });
  }

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

export async function updateDebateSessionDetailsAction(formData: FormData) {
  const id = text(formData, "id");
  const topic = text(formData, "topic");
  const startsAtValue = text(formData, "startsAt");
  const capacity = parseInt(text(formData, "capacity") || "0", 10);
  const location = text(formData, "location");

  if (!id || !topic || !startsAtValue || !Number.isFinite(capacity) || capacity < 1) {
    redirectBack(`/debate/${id}`, "error");
  }

  const session = await requireDebateManager(id);

  const debate = await prisma.debateSession.update({
    where: { id },
    data: {
      topic,
      startsAt: new Date(startsAtValue),
      capacity,
      location: location || null
    }
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: "debate_session_details_updated",
      entity: "DebateSession",
      entityId: id,
      metadata: { topic: debate.topic }
    }
  });

  revalidatePath("/debate");
  revalidatePath(`/debate/${id}`);
  redirectBack(`/debate/${id}`, "updated");
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
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return redirectBack(`/debate/${sessionId}`, "error");
  }

  redirectBack(`/debate/${sessionId}`, "participant_added");
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
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return redirectBack(`/debate/${sessionId}`, "error");
  }

  redirectBack(`/debate/${sessionId}`, "participant_removed");
}

export async function saveDebateEvaluationAction(formData: FormData) {
  const sessionId = text(formData, "sessionId");
  const studentId = text(formData, "studentId");
  const fluency = parseInt(text(formData, "fluency"), 10);
  const argumentation = parseInt(text(formData, "argumentation"), 10);
  const posture = parseInt(text(formData, "posture"), 10);
  const feedback = text(formData, "feedback");
  const isPrivate = formData.get("isPrivate") === "true";

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

  if (!debate || debate.participants.length === 0) {
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
      isPrivate,
      acknowledgedAt: null
    },
    update: {
      evaluatorId: session.userId,
      fluency,
      argumentation,
      posture,
      feedback: feedback || null,
      isPrivate,
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
      const feedbackMessage = isPrivate 
        ? `Sem comentário adicional (feedback privado).` 
        : `Feedback: "${feedback || "Sem comentário adicional."}"`;

      await createSystemNotification({
        userId: studentProfile.userId,
        title: "Novo feedback de debate",
        message: `${teacher?.name ?? "O instrutor"} avaliou a tua participação em "${debate.topic}". Fluência: ${fluency}/10 · Argumentação: ${argumentation}/10 · Postura: ${posture}/10. ${feedbackMessage}`,
        type: "DEBATE_FEEDBACK",
        evaluationId: evaluation.id,
        url: "/student/debates"
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
  if (!session) {
    return { success: false, message: "Faça login para sugerir um debate." };
  }

  const topic = text(formData, "topic");
  const reason = text(formData, "reason");
  const classGroupId = text(formData, "classGroupId");

  if (!topic) return { success: false, message: "O tópico é obrigatório." };

  const student = await prisma.studentProfile.findFirst({
    where: { userId: session.userId }
  });

  const proposal = await prisma.debateProposal.create({
    data: {
      studentId: student?.id,
      proposerId: session.userId,
      topic,
      reason,
      classGroupId: classGroupId || null,
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

  const approvers = await prisma.user.findMany({
    where: { isActive: true, role: { in: [Role.SUPER_ADMIN, Role.ADMIN, Role.TEACHER] } },
    select: { id: true }
  });

  if (approvers.length > 0) {
    await createSystemNotifications(
      approvers
        .filter((user) => user.id !== session.userId)
        .map((user) => ({
          userId: user.id,
          title: "Nova sugestão de debate",
          message: `${session.name} sugeriu "${proposal.topic}" para a Arena de Debates.`,
          type: "INFO",
          url: "/debate"
        }))
    );
  }

  revalidatePath("/debate");
  revalidatePath("/student/dashboard");
  return { success: true };
}

export async function createDebateProposalAction(formData: FormData) {
  const result = await proposeDebateTopic(formData);
  redirectBack("/debate", result.success ? "created" : "error");
}

export async function toggleDebateProposalSupportAction(formData: FormData) {
  const session = await getCurrentSession();
  const proposalId = text(formData, "proposalId");

  if (!session || !proposalId) {
    redirectBack("/debate", "error");
  }

  const proposal = await prisma.debateProposal.findUnique({
    where: { id: proposalId },
    select: { id: true, status: true, proposerId: true, topic: true }
  });

  if (!proposal || proposal.status !== "PENDING") {
    redirectBack("/debate", "error");
  }

  const existing = await prisma.debateProposalReaction.findUnique({
    where: { proposalId_userId: { proposalId, userId: session.userId } }
  });

  if (existing) {
    await prisma.debateProposalReaction.delete({ where: { id: existing.id } });
  } else {
    await prisma.debateProposalReaction.create({
      data: {
        proposalId,
        userId: session.userId,
        type: "SUPPORT"
      }
    });

    if (proposal.proposerId !== session.userId) {
      await createSystemNotification({
        userId: proposal.proposerId,
        title: "Apoio à tua sugestão",
        message: `${session.name} apoiou a sugestão "${proposal.topic}".`,
        type: "SUCCESS",
        url: "/student/debates"
      });
    }
  }

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: existing ? "debate_proposal_support_removed" : "debate_proposal_supported",
      entity: "DebateProposal",
      entityId: proposalId
    }
  });

  revalidatePath("/debate");
  redirectBack("/debate", "updated");
}

export async function approveDebateProposalAction(formData: FormData) {
  const session = await requireDebateApprover();
  const proposalId = text(formData, "proposalId");
  const startsAtValue = text(formData, "startsAt");
  const capacity = parseInt(text(formData, "capacity") || "15", 10);
  const location = text(formData, "location");
  const instructorId = text(formData, "moderatorId");
  const moderatorExpiresAtValue = text(formData, "moderatorExpiresAt");
  const moderatorNote = text(formData, "moderatorNote");
  const classGroupId = text(formData, "classGroupId");

  if (!proposalId || !startsAtValue || !Number.isFinite(capacity) || capacity < 1) {
    redirectBack("/debate", "error");
  }

  const proposal = await prisma.debateProposal.findUnique({
    where: { id: proposalId },
    include: {
      proposer: true,
      reactions: { select: { userId: true } }
    }
  });

  if (!proposal || proposal.status !== "PENDING") {
    redirectBack("/debate", "error");
  }

  if (instructorId) {
    const instructor = await prisma.user.findUnique({
      where: { id: instructorId },
      select: { id: true, isActive: true }
    });

    if (!instructor?.isActive) {
      redirectBack("/debate", "forbidden");
    }
  }

  const debate = await prisma.$transaction(async (tx) => {
    const created = await tx.debateSession.create({
      data: {
        topic: proposal.topic,
        startsAt: new Date(startsAtValue),
        capacity,
        location: location || null,
        status: DebateSessionStatus.SCHEDULED,
        moderatorId: instructorId || null,
        sourceProposalId: proposal.id,
        moderatorAssignedById: instructorId ? session.userId : null,
        moderatorAssignedAt: instructorId ? new Date() : null,
        moderatorExpiresAt: moderatorExpiresAtValue ? new Date(moderatorExpiresAtValue) : null,
        moderatorNote: moderatorNote || null,
        classGroupId: classGroupId || proposal.classGroupId || null
      }
    });

    await tx.debateProposal.update({
      where: { id: proposal.id },
      data: {
        status: "APPROVED",
        approvedById: session.userId,
        approvedAt: new Date(),
        convertedSessionId: created.id
      }
    });

    await tx.auditLog.create({
      data: {
        actorId: session.userId,
        action: "debate_proposal_approved",
        entity: "DebateProposal",
        entityId: proposal.id,
        metadata: { sessionId: created.id, instructorId: instructorId || null }
      }
    });

    return created;
  });

  const notifyUserIds = new Set<string>([proposal.proposerId, ...proposal.reactions.map((reaction) => reaction.userId)]);
  notifyUserIds.delete(session.userId);
  if (instructorId) {
    notifyUserIds.delete(instructorId);
  }

  if (notifyUserIds.size > 0) {
    await createSystemNotifications(
      Array.from(notifyUserIds).map((userId) => ({
        userId,
        title: "Sugestão de debate aprovada",
        message: `A sugestão "${debate.topic}" foi aprovada e virou uma sessão da Arena de Debates.`,
        type: "SUCCESS",
        url: "/student/debates"
      }))
    );
  }

  if (instructorId) {
    await createSystemNotification({
      userId: instructorId,
      title: "Designação de Moderador do Debate",
      message: `Você foi designado como instrutor no debate "${debate.topic}". Aceda à sala para pré-personalizar os detalhes, gerir os participantes e avaliar a sessão.`,
      type: "DEBATE_DESIGNATION",
      debateSessionId: debate.id,
      url: `/debate/${debate.id}`
    });
  }

  revalidatePath("/debate");
  revalidatePath(`/debate/${debate.id}`);
  redirectBack("/debate", "created");
}

export async function rejectDebateProposalAction(formData: FormData) {
  const session = await requireDebateApprover();
  const proposalId = text(formData, "proposalId");

  if (!proposalId) {
    redirectBack("/debate", "error");
  }

  const proposal = await prisma.debateProposal.update({
    where: { id: proposalId },
    data: {
      status: "REJECTED",
      approvedById: session.userId,
      approvedAt: new Date()
    }
  });

  if (proposal.proposerId !== session.userId) {
    await createSystemNotification({
      userId: proposal.proposerId,
      title: "Sugestão de debate revista",
      message: `A sugestão "${proposal.topic}" foi revista e não será agendada neste momento.`,
      type: "WARNING",
      url: "/student/debates"
    });
  }

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: "debate_proposal_rejected",
      entity: "DebateProposal",
      entityId: proposalId
    }
  });

  revalidatePath("/debate");
  redirectBack("/debate", "updated");
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

export async function assignDebateInstructorAction(formData: FormData) {
  const id = text(formData, "id");
  const instructorId = text(formData, "moderatorId");
  const returnTo = text(formData, "returnTo") || `/debate/${id}`;

  if (!id) {
    redirectBack(returnTo, "error");
  }

  const session = await requireAdmin();

  if (instructorId) {
    const instructor = await prisma.user.findUnique({
      where: { id: instructorId },
      select: { id: true, role: true, isActive: true }
    });

    if (!instructor || !instructor.isActive || !([Role.TEACHER, Role.STUDENT] as Role[]).includes(instructor.role)) {
      redirectBack(returnTo, "forbidden");
    }
  }

  const debate = await prisma.debateSession.update({
    where: { id },
    data: {
      moderatorId: instructorId || null,
      moderatorAssignedById: instructorId ? session.userId : null,
      moderatorAssignedAt: instructorId ? new Date() : null
    }
  });

  if (instructorId) {
    await createSystemNotification({
      userId: instructorId,
      title: "Designação de Moderador do Debate",
      message: `Você foi designado como instrutor no debate "${debate.topic}". Aceda à sala para pré-personalizar os detalhes, gerir os participantes e avaliar a sessão.`,
      type: "DEBATE_DESIGNATION",
      debateSessionId: debate.id,
      url: `/debate/${debate.id}`
    });
  }

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: "debate_instructor_assigned",
      entity: "DebateSession",
      entityId: id,
      metadata: { instructorId: instructorId || null }
    }
  });

  revalidatePath("/debate");
  revalidatePath(`/debate/${id}`);
  redirectBack(returnTo, "updated");
}

export async function submitStudentConcernAction(formData: FormData) {
  const session = await getCurrentSession();
  if (!session || session.role !== Role.STUDENT) {
    redirect("/login");
  }

  const category = text(formData, "category");
  const message = text(formData, "message");

  if (!category || !message) {
    redirectBack("/student/debates", "error");
  }

  // 1. Criar o AuditLog
  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: "student_feedback_submitted",
      entity: "StudentProfile",
      metadata: { category, message }
    }
  });

  // 2. Mapear categorias para titulos e tipos de notificacao
  const categoryMap: Record<string, { label: string; notificationType: string }> = {
    SYSTEM_DOUBT: { label: "Duvida sobre o Sistema", notificationType: "INFO" },
    DEBATE_QUESTION: { label: "Questao sobre um Debate", notificationType: "INFO" },
    PERSONAL_CONCERN: { label: "Preocupacao Pessoal", notificationType: "WARNING" },
    PRAISE_SUGGESTION: { label: "Elogio ou Sugestao", notificationType: "SUCCESS" }
  };
  const catInfo = categoryMap[category] || { label: "Feedback", notificationType: "INFO" };

  // 3. Notificar todos os admins e super-admins
  const admins = await prisma.user.findMany({
    where: { role: { in: [Role.SUPER_ADMIN, Role.ADMIN] }, isActive: true },
    select: { id: true }
  });

  if (admins.length > 0) {
    await createSystemNotifications(
      admins.map((admin) => ({
        userId: admin.id,
        title: `Feedback de Estudante: ${catInfo.label}`,
        message: `${session.name} enviou um feedback (${catInfo.label}): "${message}"`,
        type: catInfo.notificationType,
        url: "/admin/logs"
      }))
    );
  }

  revalidatePath("/student/debates");
  redirectBack("/student/debates", "created");
}

