import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAuth } from "@/lib/api-auth";
import { successResponse, errorResponse } from "@/lib/api-response";
import { Role } from "@/generated/prisma";
import { hashPassword } from "@/features/auth/password";
import { generateStudentCode } from "@/lib/id-generators";

export async function GET(request: NextRequest) {
  const { error } = await requireApiAuth([Role.SUPER_ADMIN, Role.ADMIN]);
  if (error) return error;

  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const skip = (page - 1) * limit;

  try {
    const [students, total] = await Promise.all([
      prisma.studentProfile.findMany({
        skip,
        take: limit,
        include: { user: { select: { name: true, email: true, isActive: true } } },
        orderBy: { createdAt: "desc" }
      }),
      prisma.studentProfile.count()
    ]);

    return successResponse(students, { page, limit, total });
  } catch (err) {
    return errorResponse("Internal Server Error", 500);
  }
}

export async function POST(request: NextRequest) {
  const { error, session } = await requireApiAuth([Role.SUPER_ADMIN, Role.ADMIN]);
  if (error) return error;

  try {
    const body = await request.json();
    const { name, email, studentNumber, level, phone, guardianName } = body;
    const normalizedEmail = typeof email === "string" && email.trim() ? email.toLowerCase().trim() : null;

    if (!name || !level) {
      return errorResponse("Missing required fields", 400);
    }

    if (normalizedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return errorResponse("Invalid email", 400, "INVALID_EMAIL");
    }

    const studentCode = await generateStudentCode();

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash: hashPassword("Delson@2026"), // Default password
        role: Role.STUDENT,
        studentProfile: {
          create: {
            studentNumber: studentNumber || studentCode,
            studentCode,
            level,
            phone: phone || null,
            guardianName: guardianName || null
          }
        }
      },
      include: { studentProfile: true }
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.userId,
        action: "api_student_created",
        entity: "StudentProfile",
        entityId: user.studentProfile?.id,
        metadata: { email: normalizedEmail, studentNumber: studentNumber || studentCode, studentCode }
      }
    });

    return successResponse(user, null, 201);
  } catch (err: any) {
    if (err.code === "P2002") {
      return errorResponse("Duplicate record (email or student number)", 409);
    }
    return errorResponse("Internal Server Error", 500);
  }
}
