"use server";

import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { AttendanceStatus, Role } from "@/generated/prisma";
import { getCurrentSession } from "@/features/auth/current-user";
import { routeForRole } from "@/features/auth/session";
import { prisma } from "@/lib/prisma";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function redirectBack(result: "saved" | "error"): never {
  redirect(`/teacher/dashboard?status=${result}`);
}

function redirectBackTo(path: string, result: "saved" | "created" | "deleted" | "error"): never {
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
  const isWriting = formData.get("isWriting") === "true" || formData.get("isWriting") === "on";
  const isSpeaking = formData.get("isSpeaking") === "true" || formData.get("isSpeaking") === "on";

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
      maxScore,
      isWriting,
      isSpeaking
    }
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: "grade_created",
      entity: "Grade",
      entityId: grade.id,
      metadata: { studentId, classGroupId, score, maxScore, isWriting, isSpeaking }
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
  const isWriting = formData.get("isWriting") === "true" || formData.get("isWriting") === "on";
  const isSpeaking = formData.get("isSpeaking") === "true" || formData.get("isSpeaking") === "on";

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
          maxScore: 20,
          isWriting,
          isSpeaking
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

async function handleFileUpload(file: File, buffer: Buffer): Promise<string | null> {
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const filename = `${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const cleanUrl = supabaseUrl.replace(/\/$/, "");
      const uploadUrl = `${cleanUrl}/storage/v1/object/materials/${filename}`;

      console.log(`📤 Enviando arquivo para o Supabase Storage: ${uploadUrl}`);
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${supabaseKey}`,
          "Content-Type": file.type || "application/octet-stream",
          "x-upsert": "true"
        },
        body: new Uint8Array(buffer)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro no upload para o Supabase Storage:", response.statusText, errorText);
        throw new Error(`Supabase Storage: ${response.statusText}`);
      }

      return `${cleanUrl}/storage/v1/object/public/materials/${filename}`;
    } catch (err) {
      console.error("Falha no upload para o Supabase Storage, tentando fallback local...", err);
    }
  }

  try {
    const uploadDir = join(process.cwd(), "public/uploads/materials");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, filename), buffer);
    return `/uploads/materials/${filename}`;
  } catch (err) {
    console.error("Erro no upload local (fallback):", err);
    return null;
  }
}

export async function createStudyMaterialAction(formData: FormData) {
  const session = await requireTeacherOrAdmin();
  let teacherProfile: { id: string; classGroups: Array<{ courseId: string }> } | null = null;

  if (session.role === Role.TEACHER) {
    teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.userId },
      include: { classGroups: { select: { courseId: true } } }
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

  if (session.role === Role.TEACHER && !teacherProfile?.classGroups.some((classGroup) => classGroup.courseId === courseId)) {
    redirectBackTo("/teacher/materials", "error");
  }

  let fileUrl = null;
  const file = formData.get("file") as File | null;

  if (file && file.size > 0) {
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      fileUrl = await handleFileUpload(file, buffer);
    } catch (e) {
      console.error("Erro no upload do ficheiro", e);
    }
  }

  const teacherId = teacherProfile?.id;

  const material = await prisma.studyMaterial.create({
    data: {
      title,
      description: description || null,
      unit: unit || null,
      courseId,
      fileUrl,
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

export async function updateStudyMaterialAction(formData: FormData) {
  const session = await requireTeacherOrAdmin();
  let teacherProfile: { id: string; classGroups: Array<{ courseId: string }> } | null = null;

  if (session.role === Role.TEACHER) {
    teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.userId },
      include: { classGroups: { select: { courseId: true } } }
    });
    if (!teacherProfile) {
      redirectBackTo("/teacher/materials", "error");
    }
  }

  const id = text(formData, "id");
  const title = text(formData, "title");
  const description = text(formData, "description");
  const unit = text(formData, "unit");
  const courseId = text(formData, "courseId");

  if (!id || !title || !courseId) {
    redirectBackTo("/teacher/materials", "error");
  }

  // Verificar se material existe
  const existingMaterial = await prisma.studyMaterial.findUnique({ where: { id } });
  if (!existingMaterial) {
    redirectBackTo("/teacher/materials", "error");
  }

  if (
    session.role === Role.TEACHER &&
    (existingMaterial.teacherId !== teacherProfile?.id || !teacherProfile.classGroups.some((classGroup) => classGroup.courseId === courseId))
  ) {
    redirectBackTo("/teacher/materials", "error");
  }

  let fileUrl = existingMaterial.fileUrl;
  const file = formData.get("file") as File | null;

  if (file && file.size > 0) {
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      fileUrl = await handleFileUpload(file, buffer);
    } catch (e) {
      console.error("Erro no upload do ficheiro", e);
    }
  }

  const material = await prisma.studyMaterial.update({
    where: { id },
    data: {
      title,
      description: description || null,
      unit: unit || null,
      courseId,
      fileUrl
    }
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: "study_material_updated",
      entity: "StudyMaterial",
      entityId: material.id,
      metadata: { title, courseId }
    }
  });

  revalidatePath("/teacher/materials");
  revalidatePath("/student/dashboard");
  revalidatePath("/student/materials");
  redirectBackTo("/teacher/materials", "saved");
}

export async function deleteStudyMaterialAction(formData: FormData) {
  const session = await requireTeacherOrAdmin();
  let teacherProfile: { id: string } | null = null;

  if (session.role === Role.TEACHER) {
    teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.userId },
      select: { id: true }
    });
    if (!teacherProfile) {
      redirectBackTo("/teacher/materials", "error");
    }
  }

  const id = text(formData, "id");

  if (!id) {
    redirectBackTo("/teacher/materials", "error");
  }

  if (session.role === Role.TEACHER) {
    const existingMaterial = await prisma.studyMaterial.findUnique({
      where: { id },
      select: { teacherId: true }
    });

    if (!existingMaterial || existingMaterial.teacherId !== teacherProfile?.id) {
      redirectBackTo("/teacher/materials", "error");
    }
  }

  await prisma.studyMaterial.delete({
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
