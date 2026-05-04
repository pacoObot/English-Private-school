import { GET } from "@/app/api/v1/debates/route";
import { NextRequest } from "next/server";
import * as apiAuthMod from "@/lib/api-auth";
import { Role } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/api-auth", () => ({
  requireApiAuth: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    debateSession: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

describe("Debates API", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("blocks unauthorized access for students", async () => {
    (apiAuthMod.requireApiAuth as jest.Mock).mockResolvedValue({
      error: new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 }),
      session: null,
    });

    const req = new NextRequest("http://localhost/api/v1/debates");
    const res = await GET(req);

    expect(res.status).toBe(403);
  });

  it("returns debates list for teacher or admin", async () => {
    (apiAuthMod.requireApiAuth as jest.Mock).mockResolvedValue({
      error: null,
      session: { userId: "2", role: Role.TEACHER },
    });

    (prisma.debateSession.findMany as jest.Mock).mockResolvedValue([
      { id: "d1", topic: "AI in Education" },
    ]);
    (prisma.debateSession.count as jest.Mock).mockResolvedValue(1);

    const req = new NextRequest("http://localhost/api/v1/debates?page=1&limit=10");
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data[0].topic).toBe("AI in Education");
  });
});
