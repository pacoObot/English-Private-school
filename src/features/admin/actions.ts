"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { EnrollmentStatus, InvoiceStatus, Prisma, Role } from "@/generated/prisma";
import { getCurrentSession } from "@/features/auth/current-user";
import { routeForRole } from "@/features/auth/session";
import { hashPassword } from "@/features/auth/password";
import { prisma } from "@/lib/prisma";
import { generateStudentCode } from "@/lib/id-generators";
import { readFileSync } from "fs";
import { join } from "path";

const DEFAULT_PASSWORD = "Delson@2026";
const adminRoles: Role[] = [Role.SUPER_ADMIN, Role.ADMIN];

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function intValue(formData: FormData, key: string) {
  const value = Number.parseInt(text(formData, key), 10);
  return Number.isFinite(value) ? value : 0;
}

function dateValue(formData: FormData, key: string) {
  const value = text(formData, key);
  return value ? new Date(`${value}T00:00:00.000Z`) : new Date();
}

type ActionStatus =
  | "created"
  | "updated"
  | "deactivated"
  | "activated"
  | "error"
  | "paid"
  | "cancelled"
  | "enrolled"
  | "duplicate_email"
  | "duplicate_student_number"
  | "duplicate_staff_number"
  | "duplicate_enrollment"
  | "duplicate_attendance"
  | "duplicate_evaluation"
  | "duplicate_student_code"
  | "invalid_email"
  | "forbidden"
  | "deleted";

function redirectBack(path: string, result: ActionStatus) {
  redirect(`${path}${path.includes("?") ? "&" : "?"}status=${result}`);
}

function isRedirectError(error: any): error is Error & { digest: string } {
  return error && (
    (typeof error.digest === "string" && error.digest.startsWith("NEXT_REDIRECT")) ||
    error.message === "NEXT_REDIRECT"
  );
}

function handlePrismaError(error: unknown, path: string) {
  if (isRedirectError(error)) {
    throw error;
  }
  const connector = path.includes("?") ? "&" : "?";
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    const target = (error.meta?.target as string[]) || [];
    if (target.includes("email")) return redirect(`${path}${connector}status=validation_error&duplicate=email`);
    if (target.includes("studentNumber")) return redirect(`${path}${connector}status=validation_error&duplicate=studentNumber`);
    if (target.includes("studentCode")) return redirect(`${path}${connector}status=validation_error&duplicate=studentCode`);
    if (target.includes("staffNumber")) return redirect(`${path}${connector}status=validation_error&duplicate=staffNumber`);
    if (target.includes("studentId") && target.includes("classGroupId")) {
      if (target.includes("lessonDate")) return redirect(`${path}${connector}status=validation_error&duplicate=attendance`);
      return redirect(`${path}${connector}status=validation_error&duplicate=enrollment`);
    }
    if (target.includes("sessionId") && target.includes("studentId")) return redirect(`${path}${connector}status=validation_error&duplicate=evaluation`);
  }
  return redirect(`${path}${connector}status=error`);
}

function normalizeEmail(value: string) {
  const email = value.toLowerCase().trim();
  return email || null;
}

function isValidEmail(email: string | null) {
  return !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function requireAdmin() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (!adminRoles.includes(session.role)) {
    redirect(routeForRole(session.role));
  }

  return session;
}

async function audit(actorId: string, action: string, entity: string, entityId?: string, metadata?: Prisma.InputJsonObject) {
  await prisma.auditLog.create({
    data: {
      actorId,
      action,
      entity,
      entityId,
      metadata
    }
  });
}

export async function createStudentAction(formData: FormData) {
  const session = await requireAdmin();
  const name = text(formData, "name");
  const email = normalizeEmail(text(formData, "email"));
  const studentNumberInput = text(formData, "studentNumber");
  const level = text(formData, "level");
  const phone = text(formData, "phone");
  const guardianName = text(formData, "guardianName");

  const missing = [];
  if (!name) missing.push("name");
  if (!level) missing.push("level");

  if (missing.length > 0) {
    redirect(`/admin/students?status=validation_error&missing=${missing.join(",")}`);
  }

  if (!isValidEmail(email)) {
    redirect(`/admin/students?status=validation_error&invalid=email`);
  }

  try {
    const studentCode = await generateStudentCode();
    const studentNumber = studentNumberInput || studentCode;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashPassword(DEFAULT_PASSWORD),
        role: Role.STUDENT,
        studentProfile: {
          create: {
            studentNumber,
            studentCode,
            level,
            phone: phone || null,
            guardianName: guardianName || null
          }
        }
      },
      include: { studentProfile: true }
    });

    await audit(session.userId, "student_created", "StudentProfile", user.studentProfile?.id, { email, studentNumber, studentCode });
    revalidatePath("/admin/students");
    revalidatePath("/admin/dashboard");
    redirect(`/admin/students?status=created&newCode=${studentCode}&newName=${encodeURIComponent(name)}&studentId=${user.studentProfile?.id}`);
  } catch (error) {
    return handlePrismaError(error, "/admin/students");
  }
}

export async function bulkImportStudentsAction(formData: FormData) {
  const session = await requireAdmin();
  const file = formData.get("file") as File;

  if (!file) {
    redirectBack("/admin/students", "error");
  }

  if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
    redirectBack("/admin/students", "error");
  }

  const fileText = await file.text();
  const lines = fileText.split("\n").filter((line) => line.trim());

  if (lines.length < 2) {
    redirectBack("/admin/students", "error");
  }

  const [header, ...names] = lines;
  const columnsHeader = header.toLowerCase().split(",").map((col) => col.trim());
  const emailIndex = columnsHeader.findIndex((col) => col === "email");
  const nameIndex = columnsHeader.findIndex((col) => col === "name");
  const studentNumberIndex = columnsHeader.findIndex((col) => col === "studentnumber" || col === "student_number" || col === "student code" || col === "studentcode");
  const levelIndex = columnsHeader.findIndex((col) => col === "level" || col === "nivel");

  if (nameIndex === -1) {
    redirectBack("/admin/students", "error");
  }

  let successCount = 0;
  let errorCount = 0;
  const errors: string[] = [];

  for (const line of names) {
    const columns = line.split(",");
    const name = columns[nameIndex]?.trim();
    const email = emailIndex >= 0 ? normalizeEmail(columns[emailIndex] ?? "") : null;
    const studentNumberInput = studentNumberIndex >= 0 ? columns[studentNumberIndex]?.trim() : "";
    const level = levelIndex >= 0 ? columns[levelIndex]?.trim() : "A1 Beginner";

    if (!name) {
      errorCount++;
      errors.push(`Linha inválida: ${line}`);
      continue;
    }

    if (!isValidEmail(email)) {
      errorCount++;
      errors.push(`Email inválido: ${email}`);
      continue;
    }

    try {
      const studentCode = await generateStudentCode();
      await prisma.user.create({
        data: {
          name,
          email,
          passwordHash: hashPassword(DEFAULT_PASSWORD),
          role: Role.STUDENT,
          studentProfile: {
            create: {
              studentNumber: studentNumberInput || studentCode,
              studentCode,
              level,
              phone: null,
              guardianName: null
            }
          }
        },
        include: { studentProfile: true }
      });
      successCount++;
    } catch (error) {
      errorCount++;
      if (error instanceof Error) {
        errors.push(`Erro ao importar ${email ?? name}: ${error.message}`);
      }
    }
  }

  await audit(session.userId, "students_bulk_import", "StudentProfile", undefined, { successCount, errorCount });

  const status = successCount > 0 ? "created" : "error";
  redirectBack(`/admin/students?importStatus=success:${successCount}&errorCount=${errorCount}`, status);
}

export async function updateStudentAction(formData: FormData) {
  const session = await requireAdmin();
  const id = text(formData, "id");
  const userId = text(formData, "userId");
  const name = text(formData, "name");
  const email = normalizeEmail(text(formData, "email"));
  const level = text(formData, "level");
  const phone = text(formData, "phone");
  const guardianName = text(formData, "guardianName");

  if (!id || !userId || !name || !level) {
    redirectBack("/admin/students", "error");
  }

  if (!isValidEmail(email)) {
    redirectBack("/admin/students", "invalid_email");
  }

  try {
    await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { name, email } }),
      prisma.studentProfile.update({
        where: { id },
        data: { level, phone: phone || null, guardianName: guardianName || null }
      }),
      prisma.auditLog.create({ data: { actorId: session.userId, action: "student_updated", entity: "StudentProfile", entityId: id } })
    ]);

    revalidatePath("/admin/students");
    revalidatePath("/student/dashboard");
    redirectBack("/admin/students", "updated");
  } catch (error) {
    return handlePrismaError(error, "/admin/students");
  }
}

export async function setStudentActiveAction(formData: FormData) {
  const session = await requireAdmin();
  const id = text(formData, "id");
  const userId = text(formData, "userId");
  const isActive = text(formData, "isActive") === "true";

  if (!id || !userId) {
    redirectBack("/admin/students", "error");
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { isActive } }),
    prisma.auditLog.create({
      data: { actorId: session.userId, action: isActive ? "student_activated" : "student_deactivated", entity: "StudentProfile", entityId: id }
    })
  ]);

  revalidatePath("/admin/students");
  revalidatePath("/admin/dashboard");
  redirectBack("/admin/students", isActive ? "activated" : "deactivated");
}

export async function createStaffAction(formData: FormData) {
  const session = await requireAdmin();
  const name = text(formData, "name");
  const email = text(formData, "email").toLowerCase();
  const staffNumber = text(formData, "staffNumber");
  const specialty = text(formData, "specialty");
  const role = text(formData, "role") as Role;

  const missing = [];
  if (!name) missing.push("name");
  if (!email) missing.push("email");
  if (!role || !adminRoles.concat(Role.TEACHER).includes(role)) missing.push("role");

  if (missing.length > 0) {
    redirect(`/admin/staff?status=validation_error&missing=${missing.join(",")}`);
  }

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashPassword(DEFAULT_PASSWORD),
        role,
        teacherProfile:
          role === Role.TEACHER
            ? {
              create: {
                staffNumber,
                specialty
              }
            }
            : undefined
      },
      include: { teacherProfile: true }
    });

    await audit(session.userId, "staff_created", role === Role.TEACHER ? "TeacherProfile" : "User", user.teacherProfile?.id ?? user.id, { email, role });
    revalidatePath("/admin/staff");
    revalidatePath("/admin/dashboard");

    const identifier = role === Role.TEACHER ? (staffNumber || email) : email;
    redirect(`/admin/staff?status=created&newCode=${encodeURIComponent(identifier)}&newName=${encodeURIComponent(name)}`);
  } catch (error) {
    return handlePrismaError(error, "/admin/staff");
  }
}

export async function updateStaffAction(formData: FormData) {
  const session = await requireAdmin();
  const id = text(formData, "id");
  const teacherProfileId = text(formData, "teacherProfileId");
  const name = text(formData, "name");
  const email = text(formData, "email").toLowerCase();
  const staffNumber = text(formData, "staffNumber");
  const specialty = text(formData, "specialty");

  if (!id || !name || !email) {
    redirectBack("/admin/staff", "error");
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id }, data: { name, email } });

      if (teacherProfileId) {
        await tx.teacherProfile.update({
          where: { id: teacherProfileId },
          data: { staffNumber, specialty }
        });
      }

      await tx.auditLog.create({ data: { actorId: session.userId, action: "staff_updated", entity: teacherProfileId ? "TeacherProfile" : "User", entityId: teacherProfileId || id } });
    });

    revalidatePath("/admin/staff");
    revalidatePath("/teacher/dashboard");
    redirectBack("/admin/staff", "updated");
  } catch (error) {
    return handlePrismaError(error, "/admin/staff");
  }
}

export async function setStaffActiveAction(formData: FormData) {
  const session = await requireAdmin();
  const id = text(formData, "id");
  const isActive = text(formData, "isActive") === "true";

  if (!id || id === session.userId) {
    redirectBack("/admin/staff", "error");
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id }, data: { isActive } }),
    prisma.auditLog.create({ data: { actorId: session.userId, action: isActive ? "staff_activated" : "staff_deactivated", entity: "User", entityId: id } })
  ]);

  revalidatePath("/admin/staff");
  revalidatePath("/admin/dashboard");
  redirectBack("/admin/staff", isActive ? "activated" : "deactivated");
}

export async function setDebateModerationPermissionAction(formData: FormData) {
  const session = await requireAdmin();
  const userId = text(formData, "userId");
  const canModerateDebates = text(formData, "canModerateDebates") === "true";
  const returnTo = text(formData, "returnTo") || "/admin/staff";

  if (!userId || userId === session.userId) {
    redirectBack(returnTo, "error");
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, isActive: true }
  });

  if (!target || !target.isActive || !([Role.TEACHER, Role.STUDENT] as Role[]).includes(target.role)) {
    redirectBack(returnTo, "forbidden");
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { canModerateDebates }
    }),
    prisma.auditLog.create({
      data: {
        actorId: session.userId,
        action: canModerateDebates ? "debate_moderation_enabled" : "debate_moderation_disabled",
        entity: "User",
        entityId: userId
      }
    })
  ]);

  revalidatePath("/admin/staff");
  revalidatePath("/admin/students");
  revalidatePath("/debate");
  redirectBack(returnTo, "updated");
}

export async function createCourseAction(formData: FormData) {
  const session = await requireAdmin();
  const title = text(formData, "title");
  const level = text(formData, "level");
  const duration = text(formData, "duration");
  const description = text(formData, "description");

  if (!title || !level) {
    redirectBack("/admin/courses", "error");
  }

  const course = await prisma.course.create({ data: { title, level, duration, description } });
  await audit(session.userId, "course_created", "Course", course.id, { title, level });
  revalidatePath("/admin/courses");
  revalidatePath("/admin/dashboard");
  redirectBack("/admin/courses", "created");
}

export async function updateCourseAction(formData: FormData) {
  const session = await requireAdmin();
  const id = text(formData, "id");
  const title = text(formData, "title");
  const level = text(formData, "level");
  const duration = text(formData, "duration");
  const description = text(formData, "description");

  if (!id || !title || !level) {
    redirectBack("/admin/courses", "error");
  }

  await prisma.$transaction([
    prisma.course.update({ where: { id }, data: { title, level, duration, description } }),
    prisma.auditLog.create({ data: { actorId: session.userId, action: "course_updated", entity: "Course", entityId: id } })
  ]);

  revalidatePath("/admin/courses");
  revalidatePath("/admin/dashboard");
  redirectBack("/admin/courses", "updated");
}

export async function setCourseActiveAction(formData: FormData) {
  const session = await requireAdmin();
  const id = text(formData, "id");
  const isActive = text(formData, "isActive") === "true";

  if (!id) {
    redirectBack("/admin/courses", "error");
  }

  await prisma.$transaction([
    prisma.course.update({ where: { id }, data: { isActive } }),
    prisma.auditLog.create({ data: { actorId: session.userId, action: isActive ? "course_activated" : "course_deactivated", entity: "Course", entityId: id } })
  ]);

  revalidatePath("/admin/courses");
  revalidatePath("/admin/dashboard");
  redirectBack("/admin/courses", isActive ? "activated" : "deactivated");
}

export async function createClassGroupAction(formData: FormData) {
  const session = await requireAdmin();
  const name = text(formData, "name");
  const schedule = text(formData, "schedule");
  const room = text(formData, "room");
  const courseId = text(formData, "courseId");
  const teacherId = text(formData, "teacherId");

  if (!name || !schedule || !courseId) {
    redirectBack("/admin/classes", "error");
  }

  const classGroup = await prisma.classGroup.create({ data: { name, schedule, room, courseId, teacherId: teacherId || null } });
  await audit(session.userId, "class_group_created", "ClassGroup", classGroup.id, { name, courseId, teacherId: teacherId || null });
  revalidatePath("/admin/classes");
  revalidatePath("/admin/dashboard");
  redirectBack("/admin/classes", "created");
}

export async function updateClassGroupAction(formData: FormData) {
  const session = await requireAdmin();
  const id = text(formData, "id");
  const name = text(formData, "name");
  const schedule = text(formData, "schedule");
  const room = text(formData, "room");
  const courseId = text(formData, "courseId");
  const teacherId = text(formData, "teacherId");

  if (!id || !name || !schedule || !courseId) {
    redirectBack("/admin/classes", "error");
  }

  await prisma.$transaction([
    prisma.classGroup.update({ where: { id }, data: { name, schedule, room, courseId, teacherId: teacherId || null } }),
    prisma.auditLog.create({ data: { actorId: session.userId, action: "class_group_updated", entity: "ClassGroup", entityId: id } })
  ]);

  revalidatePath("/admin/classes");
  revalidatePath("/teacher/dashboard");
  redirectBack("/admin/classes", "updated");
}

export async function setClassGroupActiveAction(formData: FormData) {
  const session = await requireAdmin();
  const id = text(formData, "id");

  if (!id) {
    redirectBack("/admin/classes", "error");
  }

  const enrollments = await prisma.enrollment.count({ where: { classGroupId: id } });

  if (enrollments > 0) {
    await audit(session.userId, "class_group_delete_blocked_has_enrollments", "ClassGroup", id, { enrollments });
    redirectBack("/admin/classes", "error");
  }

  await prisma.$transaction([
    prisma.classGroup.delete({ where: { id } }),
    prisma.auditLog.create({ data: { actorId: session.userId, action: "class_group_deleted", entity: "ClassGroup", entityId: id } })
  ]);

  revalidatePath("/admin/classes");
  revalidatePath("/admin/dashboard");
  redirectBack("/admin/classes", "deactivated");
}

export async function createEnrollmentAction(formData: FormData) {
  const session = await requireAdmin();
  const studentId = text(formData, "studentId");
  const courseId = text(formData, "courseId");
  const classGroupId = text(formData, "classGroupId");
  const status = text(formData, "status") as EnrollmentStatus;
  const monthlyFeeMt = intValue(formData, "monthlyFeeMt");
  const dueDate = dateValue(formData, "dueDate");

  const missing = [];
  if (!studentId) missing.push("studentId");
  if (!courseId) missing.push("courseId");
  if (!classGroupId) missing.push("classGroupId");
  if (monthlyFeeMt <= 0) missing.push("monthlyFeeMt");
  if (!Object.values(EnrollmentStatus).includes(status)) missing.push("status");

  if (missing.length > 0) {
    redirect(`/admin/students?status=validation_error&missing=${missing.join(",")}`);
  }

  try {
    const created = await prisma.$transaction(async (tx) => {
      const enrollment = await tx.enrollment.create({
        data: {
          studentId,
          courseId,
          classGroupId,
          status
        }
      });
      const invoice = await tx.invoice.create({
        data: {
          studentId,
          enrollmentId: enrollment.id,
          reference: `INV-${Date.now()}-${enrollment.id.slice(0, 6).toUpperCase()}`,
          amountMt: monthlyFeeMt,
          status: InvoiceStatus.PENDING,
          dueDate
        }
      });

      await tx.auditLog.create({
        data: {
          actorId: session.userId,
          action: "student_enrolled_invoice_created",
          entity: "Enrollment",
          entityId: enrollment.id,
          metadata: { invoiceId: invoice.id, amountMt: monthlyFeeMt }
        }
      });

      return { enrollment, invoice };
    });

    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: { user: true }
    });

    revalidatePath("/admin/students");
    revalidatePath("/admin/dashboard");
    revalidatePath("/student/dashboard");

    if (created.invoice) {
      redirect(`/admin/students?status=enrolled&newCode=${student?.studentCode || ""}&newName=${encodeURIComponent(student?.user.name || "")}&studentId=${studentId}`);
    } else {
      redirect(`/admin/students?status=error`);
    }
  } catch (error) {
    return handlePrismaError(error, "/admin/students");
  }
}

export async function updateEnrollmentStatusAction(formData: FormData) {
  const session = await requireAdmin();
  const id = text(formData, "id");
  const status = text(formData, "status") as EnrollmentStatus;

  if (!id || !Object.values(EnrollmentStatus).includes(status)) {
    redirectBack("/admin/students", "error");
  }

  await prisma.$transaction([
    prisma.enrollment.update({ where: { id }, data: { status } }),
    prisma.auditLog.create({ data: { actorId: session.userId, action: "enrollment_status_updated", entity: "Enrollment", entityId: id, metadata: { status } } })
  ]);

  revalidatePath("/admin/students");
  revalidatePath("/student/dashboard");
  redirectBack("/admin/students", "updated");
}

export async function changeEnrollmentClassAction(formData: FormData) {
  const session = await requireAdmin();
  const enrollmentId = String(formData.get("enrollmentId") ?? "").trim();
  const classGroupId = String(formData.get("classGroupId") ?? "").trim();

  if (!enrollmentId || !classGroupId) {
    redirectBack("/admin/students?tab=matricular", "error");
  }

  const newClass = await prisma.classGroup.findUnique({ where: { id: classGroupId } });
  if (!newClass) redirectBack("/admin/students?tab=matricular", "error");

  const enrollment = await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: { classGroupId }
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: "student_transferred_class",
      entity: "Enrollment",
      entityId: enrollment.id,
      metadata: { newClassGroupId: classGroupId }
    }
  });

  revalidatePath("/admin/students");
  redirectBack("/admin/students?tab=matricular", "updated");
}

export async function updateInvoiceStatusAction(formData: FormData) {
  const session = await requireAdmin();
  const id = text(formData, "id");
  const status = text(formData, "status") as InvoiceStatus;

  if (!id || ![InvoiceStatus.PAID, InvoiceStatus.CANCELLED, InvoiceStatus.OVERDUE, InvoiceStatus.PENDING].includes(status)) {
    redirectBack("/admin/dashboard", "error");
  }

  await prisma.$transaction([
    prisma.invoice.update({
      where: { id },
      data: {
        status,
        paidAt: status === InvoiceStatus.PAID ? new Date() : null
      }
    }),
    prisma.auditLog.create({ data: { actorId: session.userId, action: "invoice_status_updated", entity: "Invoice", entityId: id, metadata: { status } } })
  ]);

  revalidatePath("/admin/dashboard");
  revalidatePath("/student/dashboard");
  redirectBack("/admin/dashboard", status === InvoiceStatus.PAID ? "paid" : status === InvoiceStatus.CANCELLED ? "cancelled" : "updated");
}

// ── Calendário Académico ──

export async function createCalendarEventAction(formData: FormData) {
  const session = await requireAdmin();

  const title = text(formData, "title");
  const description = text(formData, "description");
  const startsAtValue = text(formData, "startsAt");
  const endsAtValue = text(formData, "endsAt");
  const type = text(formData, "type") || "GENERAL";
  const location = text(formData, "location");
  const isImportant = formData.get("isImportant") === "true";

  if (!title || !startsAtValue) {
    redirectBack("/admin/calendar", "error");
  }

  const event = await prisma.calendarEvent.create({
    data: {
      title,
      description: description || null,
      startsAt: new Date(startsAtValue),
      endsAt: endsAtValue ? new Date(endsAtValue) : null,
      type,
      location: location || null,
      isImportant,
    }
  });

  await audit(session.userId, "calendar_event_created", "CalendarEvent", event.id, { title, type });

  revalidatePath("/admin/calendar");
  revalidatePath("/student/calendar");
  redirectBack("/admin/calendar", "created");
}

export async function deleteCalendarEventAction(formData: FormData) {
  const session = await requireAdmin();
  const id = text(formData, "id");

  if (!id) {
    redirectBack("/admin/calendar", "error");
  }

  await prisma.calendarEvent.delete({ where: { id } });
  await audit(session.userId, "calendar_event_deleted", "CalendarEvent", id);

  revalidatePath("/admin/calendar");
  revalidatePath("/student/calendar");
  redirectBack("/admin/calendar", "deleted");
}

