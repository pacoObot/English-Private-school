"use server";

import { Role } from "@/generated/prisma";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/features/auth/password";

const DEFAULT_PASSWORD = "Delson@2026";

export async function createStudentAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const studentNumber = String(formData.get("studentNumber") ?? "").trim();
  const level = String(formData.get("level") ?? "").trim();

  if (!name || !email || !studentNumber || !level) {
    return;
  }

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: hashPassword(DEFAULT_PASSWORD),
      role: Role.STUDENT,
      studentProfile: {
        create: {
          studentNumber,
          level
        }
      }
    }
  });

  revalidatePath("/admin/students");
  revalidatePath("/admin/dashboard");
}

export async function createStaffAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const staffNumber = String(formData.get("staffNumber") ?? "").trim();
  const specialty = String(formData.get("specialty") ?? "").trim();
  const role = String(formData.get("role") ?? "TEACHER") as Role;

  if (!name || !email || !staffNumber || !specialty) {
    return;
  }

  await prisma.user.create({
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
    }
  });

  revalidatePath("/admin/staff");
  revalidatePath("/admin/dashboard");
}

export async function createCourseAction(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const level = String(formData.get("level") ?? "").trim();
  const duration = String(formData.get("duration") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!title || !level) {
    return;
  }

  await prisma.course.create({
    data: {
      title,
      level,
      duration,
      description
    }
  });

  revalidatePath("/admin/courses");
  revalidatePath("/admin/dashboard");
}

export async function createClassGroupAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const schedule = String(formData.get("schedule") ?? "").trim();
  const room = String(formData.get("room") ?? "").trim();
  const courseId = String(formData.get("courseId") ?? "");
  const teacherId = String(formData.get("teacherId") ?? "");

  if (!name || !schedule || !courseId) {
    return;
  }

  await prisma.classGroup.create({
    data: {
      name,
      schedule,
      room,
      courseId,
      teacherId: teacherId || null
    }
  });

  revalidatePath("/admin/classes");
  revalidatePath("/admin/dashboard");
}
