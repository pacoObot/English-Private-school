import { GET } from "@/app/api/v1/students/route";
import { NextRequest } from "next/server";
import * as apiAuthMod from "@/lib/api-auth";
import { Role } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/api-auth", () => ({
  requireApiAuth: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    studentProfile: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

describe("Students API", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("blocks unauthorized access", async () => {
    (apiAuthMod.requireApiAuth as jest.Mock).mockResolvedValue({
      error: new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 }),
      session: null,
    });

    const req = new NextRequest("http://localhost/api/v1/students");
    const res = await GET(req);

    expect(res.status).toBe(403);
  });

  it("returns students list when authorized", async () => {
    (apiAuthMod.requireApiAuth as jest.Mock).mockResolvedValue({
      error: null,
      session: { userId: "1", role: Role.ADMIN },
    });

    (prisma.studentProfile.findMany as jest.Mock).mockResolvedValue([
      { id: "s1", studentNumber: "STU-01" },
    ]);
    (prisma.studentProfile.count as jest.Mock).mockResolvedValue(1);

    const req = new NextRequest("http://localhost/api/v1/students?page=1&limit=10");
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.length).toBe(1);
    expect(json.meta.total).toBe(1);
  });
});
