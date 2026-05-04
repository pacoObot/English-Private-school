import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAuth } from "@/lib/api-auth";
import { successResponse, errorResponse } from "@/lib/api-response";
import { Role, EnrollmentStatus } from "@/generated/prisma";

export async function GET(request: NextRequest) {
  const { error } = await requireApiAuth([Role.SUPER_ADMIN, Role.ADMIN]);
  if (error) return error;

  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const skip = (page - 1) * limit;

  try {
    const [enrollments, total] = await Promise.all([
      prisma.enrollment.findMany({
        skip,
        take: limit,
        include: { student: { include: { user: true } }, course: true, classGroup: true },
        orderBy: { createdAt: "desc" }
      }),
      prisma.enrollment.count()
    ]);

    return successResponse(enrollments, { page, limit, total });
  } catch (err) {
    return errorResponse("Internal Server Error", 500);
  }
}

export async function POST(request: NextRequest) {
  const { error, session } = await requireApiAuth([Role.SUPER_ADMIN, Role.ADMIN]);
  if (error) return error;

  try {
    const body = await request.json();
    const { studentId, courseId, classGroupId, status } = body;

    if (!studentId || !courseId || !classGroupId) {
      return errorResponse("Missing required fields", 400);
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        studentId,
        courseId,
        classGroupId,
        status: status || EnrollmentStatus.ACTIVE
      }
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.userId,
        action: "api_enrollment_created",
        entity: "Enrollment",
        entityId: enrollment.id,
        metadata: { studentId, classGroupId }
      }
    });

    return successResponse(enrollment, null, 201);
  } catch (err: any) {
    if (err.code === "P2002") {
      return errorResponse("Duplicate enrollment", 409);
    }
    return errorResponse("Internal Server Error", 500);
  }
}
