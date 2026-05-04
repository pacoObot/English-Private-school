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

type ActionStatus = "created" | "updated" | "deleted" | "error" | "evaluated" | "participant_added" | "participant_removed";

function redirectBack(path: string, result: ActionStatus) {
  redirect(`${path}?status=${result}`);
}

async function requireTeacherOrAdmin() {
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

export async function createDebateSessionAction(formData: FormData) {
  const session = await requireTeacherOrAdmin();
  const topic = text(formData, "topic");
  const startsAtValue = text(formData, "startsAt");
  const capacity = parseInt(text(formData, "capacity") || "15", 10);
  const location = text(formData, "location");
  const moderatorId = text(formData, "moderatorId");

  if (!topic || !startsAtValue || isNaN(capacity)) {
    redirectBack("/debate", "error");
  }

  const debate = await prisma.debateSession.create({
    data: {
      topic,
      startsAt: new Date(startsAtValue),
      capacity,
      location: location || null,
      moderatorId: moderatorId || null,
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
  const session = await requireTeacherOrAdmin();
  const sessionId = text(formData, "sessionId");
  const studentId = text(formData, "studentId");

  if (!sessionId || !studentId) {
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
  const session = await requireTeacherOrAdmin();
  const sessionId = text(formData, "sessionId");
  const studentId = text(formData, "studentId");

  if (!sessionId || !studentId) {
    redirectBack(`/debate/${sessionId}`, "error");
  }

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

export async function evaluateDebateParticipantAction(formData: FormData) {
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  const sessionId = text(formData, "sessionId");
  const studentId = text(formData, "studentId");
  const fluency = parseInt(text(formData, "fluency"), 10);
  const argumentation = parseInt(text(formData, "argumentation"), 10);
  const posture = parseInt(text(formData, "posture"), 10);
  const feedback = text(formData, "feedback");

  if (!sessionId || !studentId || isNaN(fluency) || isNaN(argumentation) || isNaN(posture)) {
    redirectBack(`/debate/${sessionId}`, "error");
  }

  // Validate RBAC (Teacher/Admin or Moderator)
  const allowedRoles: Role[] = [Role.SUPER_ADMIN, Role.ADMIN, Role.TEACHER];
  let isAuthorized = allowedRoles.includes(session.role);

  if (!isAuthorized) {
    // Check if the current user is the moderator
    const debateSession = await prisma.debateSession.findUnique({
      where: { id: sessionId },
      select: { moderatorId: true }
    });

    if (debateSession?.moderatorId) {
      const studentProfile = await prisma.studentProfile.findUnique({
        where: { userId: session.userId },
        select: { id: true }
      });
      
      if (studentProfile && studentProfile.id === debateSession.moderatorId && studentProfile.id !== studentId) {
        isAuthorized = true;
      }
    }
  }

  if (!isAuthorized) {
    redirectBack(`/debate/${sessionId}`, "error");
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
      feedback: feedback || null
    },
    update: {
      evaluatorId: session.userId,
      fluency,
      argumentation,
      posture,
      feedback: feedback || null,
      evaluatedAt: new Date()
    }
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: "debate_evaluation_submitted",
      entity: "DebateEvaluation",
      entityId: evaluation.id,
      metadata: { sessionId, studentId }
    }
  });

  revalidatePath(`/debate/${sessionId}`);
  redirectBack(`/debate/${sessionId}`, "evaluated");
}
