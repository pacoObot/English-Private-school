import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAuth } from "@/lib/api-auth";
import { successResponse, errorResponse } from "@/lib/api-response";
import { Role } from "@/generated/prisma";

export async function GET(request: NextRequest) {
  const { error } = await requireApiAuth([Role.SUPER_ADMIN, Role.ADMIN]);
  if (error) return error;

  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const skip = (page - 1) * limit;

  try {
    const [classes, total] = await Promise.all([
      prisma.classGroup.findMany({
        skip,
        take: limit,
        include: { course: true, teacher: { include: { user: true } } },
        orderBy: { name: "asc" }
      }),
      prisma.classGroup.count()
    ]);

    return successResponse(classes, { page, limit, total });
  } catch (err) {
    return errorResponse("Internal Server Error", 500);
  }
}

export async function POST(request: NextRequest) {
  const { error, session } = await requireApiAuth([Role.SUPER_ADMIN, Role.ADMIN]);
  if (error) return error;

  try {
    const body = await request.json();
    const { name, room, schedule, courseId, teacherId } = body;

    if (!name || !schedule || !courseId) {
      return errorResponse("Missing required fields", 400);
    }

    const classGroup = await prisma.classGroup.create({
      data: {
        name,
        room: room || null,
        schedule,
        courseId,
        teacherId: teacherId || null
      }
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.userId,
        action: "api_class_created",
        entity: "ClassGroup",
        entityId: classGroup.id,
        metadata: { name, courseId }
      }
    });

    return successResponse(classGroup, null, 201);
  } catch (err) {
    return errorResponse("Internal Server Error", 500);
  }
}
