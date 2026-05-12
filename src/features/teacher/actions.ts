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

function redirectBackTo(path: string, result: "saved" | "created" | "deleted" | "error") {
  redirect(`${path}?status=${result}`);
}

async function requireTeacherOrAdmin(classGroupId?: string) {
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

  if (classGroupId) {
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

export async function saveAllGradesAction(formData: FormData) {
  const classGroupId = text(formData, "classGroupId");
  const title = text(formData, "title") || "Avaliacao Geral";
  const studentIds = formData.getAll("studentId") as string[];
  const scores = formData.getAll("score") as string[];

  if (!classGroupId || studentIds.length === 0 || studentIds.length !== scores.length) {
    redirectBack("error");
  }

  const session = await requireTeacherOrAdmin(classGroupId);

  await prisma.$transaction(
    studentIds.map((studentId, index) => {
      const score = Number.parseFloat(scores[index]);
      if (!Number.isFinite(score) || score < 0) {
        return prisma.auditLog.create({ 
          data: { 
            actorId: session.userId, 
            action: "grade_skip", 
            entity: "Grade", 
            metadata: { studentId, reason: "invalid_score" } 
          } 
        });
      }

      return prisma.grade.create({
        data: {
          studentId,
          classGroupId,
          title,
          score,
          maxScore: 20
        }
      });
    })
  );

  revalidatePath("/teacher/dashboard");
  revalidatePath("/student/dashboard");
  redirectBack("saved");
}

export async function saveAllAttendanceAction(formData: FormData) {
  const classGroupId = text(formData, "classGroupId");
  const lessonDateValue = text(formData, "lessonDate");
  const studentIds = formData.getAll("studentId") as string[];
  
  if (!classGroupId || !lessonDateValue || studentIds.length === 0) {
    redirectBack("error");
  }

  const session = await requireTeacherOrAdmin(classGroupId);
  const lessonDate = new Date(`${lessonDateValue}T00:00:00.000Z`);

  await prisma.$transaction(
    studentIds.map((studentId) => {
      const status = formData.get(`status_${studentId}`) as AttendanceStatus;
      if (!status) return prisma.auditLog.create({ data: { actorId: session.userId, action: "attendance_skip", entity: "Attendance", metadata: { studentId } } });

      return prisma.attendance.upsert({
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
          status
        },
        update: {
          status
        }
      });
    })
  );

  revalidatePath("/teacher/dashboard");
  revalidatePath("/student/dashboard");
  redirectBack("saved");
}

export async function createStudyMaterialAction(formData: FormData) {
  const session = await requireTeacherOrAdmin();

  if (session.role === Role.TEACHER) {
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.userId }
    });
    if (!teacherProfile) {
      redirectBackTo("/teacher/materials", "error");
    }
  }

  const title = text(formData, "title");
  const description = text(formData, "description");
  const unit = text(formData, "unit");
  const courseId = text(formData, "courseId");

  if (!title || !courseId) {
    redirectBackTo("/teacher/materials", "error");
  }

  const teacherId = session.role === Role.TEACHER 
    ? (await prisma.teacherProfile.findUnique({ where: { userId: session.userId } }))?.id
    : undefined;

  const material = await prisma.studyMaterial.create({
    data: {
      title,
      description: description || null,
      unit: unit || null,
      courseId,
      teacherId: teacherId || null
    }
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: "study_material_created",
      entity: "StudyMaterial",
      entityId: material.id,
      metadata: { title, courseId }
    }
  });

  revalidatePath("/teacher/materials");
  revalidatePath("/student/dashboard");
  redirectBackTo("/teacher/materials", "created");
}

export async function deleteStudyMaterialAction(formData: FormData) {
  const session = await requireTeacherOrAdmin();

  if (session.role === Role.TEACHER) {
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.userId }
    });
    if (!teacherProfile) {
      redirectBackTo("/teacher/materials", "error");
    }
  }

  const id = text(formData, "id");

  if (!id) {
    redirectBackTo("/teacher/materials", "error");
  }

  const material = await prisma.studyMaterial.delete({
    where: { id }
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: "study_material_deleted",
      entity: "StudyMaterial",
      entityId: id
    }
  });

  revalidatePath("/teacher/materials");
  revalidatePath("/student/dashboard");
  redirectBackTo("/teacher/materials", "deleted");
}

export async function generateTeacherReportAction(formData: FormData) {
  const session = await requireTeacherOrAdmin();
  const reportType = text(formData, "reportType");

  if (!reportType || !["attendance", "grades", "material_usage"].includes(reportType)) {
    redirectBackTo("/teacher/reports", "error");
  }

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: "teacher_report_generated",
      entity: "Report",
      metadata: { reportType }
    }
  });

  revalidatePath("/teacher/reports");
  redirectBackTo("/teacher/reports", "saved");
}
