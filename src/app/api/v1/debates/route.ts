import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAuth } from "@/lib/api-auth";
import { successResponse, errorResponse } from "@/lib/api-response";
import { Role } from "@/generated/prisma";

export async function GET(request: NextRequest) {
  const { error } = await requireApiAuth([Role.SUPER_ADMIN, Role.ADMIN, Role.TEACHER]);
  if (error) return error;

  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const skip = (page - 1) * limit;

  try {
    const [debates, total] = await Promise.all([
      prisma.debateSession.findMany({
        skip,
        take: limit,
        include: { moderator: true, _count: { select: { participants: true, evaluations: true } } },
        orderBy: { startsAt: "desc" }
      }),
      prisma.debateSession.count()
    ]);

    return successResponse(debates, { page, limit, total });
  } catch (err) {
    return errorResponse("Internal Server Error", 500);
  }
}
