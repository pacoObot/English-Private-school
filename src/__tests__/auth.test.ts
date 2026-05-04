import { requireApiAuth } from "@/lib/api-auth";
import { Role } from "@/generated/prisma";
import * as currentUserMod from "@/features/auth/current-user";

jest.mock("@/features/auth/current-user", () => ({
  getCurrentSession: jest.fn(),
}));

describe("API Auth and RBAC", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 when no session exists", async () => {
    (currentUserMod.getCurrentSession as jest.Mock).mockResolvedValue(null);

    const result = await requireApiAuth([Role.ADMIN]);
    
    expect(result.session).toBeNull();
    expect(result.error).toBeDefined();
    expect(result.error?.status).toBe(401);
  });

  it("returns 403 when session exists but role is forbidden", async () => {
    (currentUserMod.getCurrentSession as jest.Mock).mockResolvedValue({
      userId: "123",
      role: Role.STUDENT,
    });

    const result = await requireApiAuth([Role.ADMIN]);
    
    expect(result.session).toBeNull();
    expect(result.error).toBeDefined();
    expect(result.error?.status).toBe(403);
  });

  it("returns session when role is allowed", async () => {
    (currentUserMod.getCurrentSession as jest.Mock).mockResolvedValue({
      userId: "123",
      role: Role.ADMIN,
    });

    const result = await requireApiAuth([Role.ADMIN]);
    
    expect(result.error).toBeNull();
    expect(result.session).toBeDefined();
    expect(result.session?.role).toBe(Role.ADMIN);
  });

  it("returns session when no specific roles are required", async () => {
    (currentUserMod.getCurrentSession as jest.Mock).mockResolvedValue({
      userId: "123",
      role: Role.STUDENT,
    });

    const result = await requireApiAuth();
    
    expect(result.error).toBeNull();
    expect(result.session).toBeDefined();
    expect(result.session?.role).toBe(Role.STUDENT);
  });
});
