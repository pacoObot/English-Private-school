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
    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        skip,
        take: limit,
        orderBy: { title: "asc" }
      }),
      prisma.course.count()
    ]);

    return successResponse(courses, { page, limit, total });
  } catch (err) {
    return errorResponse("Internal Server Error", 500);
  }
}

export async function POST(request: NextRequest) {
  const { error, session } = await requireApiAuth([Role.SUPER_ADMIN, Role.ADMIN]);
  if (error) return error;

  try {
    const body = await request.json();
    const { title, level, description, duration } = body;

    if (!title || !level) {
      return errorResponse("Missing required fields", 400);
    }

    const course = await prisma.course.create({
      data: {
        title,
        level,
        description: description || null,
        duration: duration || null
      }
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.userId,
        action: "api_course_created",
        entity: "Course",
        entityId: course.id,
        metadata: { title, level }
      }
    });

    return successResponse(course, null, 201);
  } catch (err) {
    return errorResponse("Internal Server Error", 500);
  }
}
