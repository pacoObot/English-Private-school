import { NextResponse } from "next/server";
import { Role } from "@/generated/prisma";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { error } = await requireApiAuth([Role.SUPER_ADMIN, Role.ADMIN, Role.TEACHER, Role.STUDENT]);
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");
    const teacherId = searchParams.get("teacherId");
    const limit = Number(searchParams.get("limit")) || 50;
    const offset = Number(searchParams.get("offset")) || 0;

    const where: any = {};
    if (courseId) where.courseId = courseId;
    if (teacherId) where.teacherId = teacherId;

    const [total, materials] = await Promise.all([
      prisma.studyMaterial.count({ where }),
      prisma.studyMaterial.findMany({
        where,
        take: limit,
        skip: offset,
        include: {
          course: { select: { id: true, title: true, level: true } },
          teacher: { select: { id: true, user: { select: { name: true } } } }
        },
        orderBy: { createdAt: "desc" }
      })
    ]);

    return NextResponse.json({
      data: materials,
      meta: {
        total,
        limit,
        offset,
        hasMore: offset + materials.length < total
      }
    });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
