"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { AttendanceStatus, Role } from "@/generated/prisma";
import { getCurrentSession } from "@/features/auth/current-user";
import { routeForRole } from "@/features/auth/session";
import { prisma } from "@/lib/prisma";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function redirectBack(result: "saved" | "error") {
  redirect(`/teacher/dashboard?status=${result}`);
}

async function requireTeacherOrAdmin(classGroupId: string) {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  const staffRoles: Role[] = [Role.SUPER_ADMIN, Role.ADMIN];

  if (staffRoles.includes(session.role)) {
    return session;
  }

  if (session.role !== Role.TEACHER) {
    redirect(routeForRole(session.role));
  }

  const ownsClass = await prisma.teacherProfile.findFirst({
    where: {
      userId: session.userId,
      classGroups: { some: { id: classGroupId } }
    },
    select: { id: true }
  });

  if (!ownsClass) {
    redirect(routeForRole(session.role));
  }

  return session;
}

export async function saveGradeAction(formData: FormData) {
  const studentId = text(formData, "studentId");
  const classGroupId = text(formData, "classGroupId");
  const title = text(formData, "title") || "Avaliacao";
  const score = Number.parseFloat(text(formData, "score"));
  const maxScore = Number.parseFloat(text(formData, "maxScore") || "20");

  if (!studentId || !classGroupId || !Number.isFinite(score) || score < 0 || !Number.isFinite(maxScore) || maxScore <= 0 || score > maxScore) {
    redirectBack("error");
  }

  const session = await requireTeacherOrAdmin(classGroupId);
  const grade = await prisma.grade.create({
    data: {
      studentId,
      classGroupId,
      title,
      score,
      maxScore
    }
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: "grade_created",
      entity: "Grade",
      entityId: grade.id,
      metadata: { studentId, classGroupId, score, maxScore }
    }
  });

  revalidatePath("/teacher/dashboard");
  revalidatePath("/student/dashboard");
  redirectBack("saved");
}

export async function saveAttendanceAction(formData: FormData) {
  const studentId = text(formData, "studentId");
  const classGroupId = text(formData, "classGroupId");
  const lessonDateValue = text(formData, "lessonDate");
  const status = text(formData, "status") as AttendanceStatus;
  const notes = text(formData, "notes");

  if (!studentId || !classGroupId || !lessonDateValue || !Object.values(AttendanceStatus).includes(status)) {
    redirectBack("error");
  }

  const session = await requireTeacherOrAdmin(classGroupId);
  const lessonDate = new Date(`${lessonDateValue}T00:00:00.000Z`);
  const attendance = await prisma.attendance.upsert({
    where: {
      studentId_classGroupId_lessonDate: {
        studentId,
        classGroupId,
        lessonDate
      }
    },
    create: {
      studentId,
      classGroupId,
      lessonDate,
      status,
      notes: notes || null
    },
    update: {
      status,
      notes: notes || null
    }
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: "attendance_saved",
      entity: "Attendance",
      entityId: attendance.id,
      metadata: { studentId, classGroupId, status, lessonDate: lessonDateValue }
    }
  });

  revalidatePath("/teacher/dashboard");
  revalidatePath("/student/dashboard");
  redirectBack("saved");
}
