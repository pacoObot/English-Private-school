import { Role } from "@/generated/prisma";
import { getCurrentSession } from "@/features/auth/current-user";
import { errorResponse } from "./api-response";

export async function requireApiAuth(allowedRoles?: Role[]) {
  const session = await getCurrentSession();

  if (!session) {
    return { error: errorResponse("Unauthorized", 401, "UNAUTHORIZED"), session: null };
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(session.role)) {
      return { error: errorResponse("Forbidden", 403, "FORBIDDEN"), session: null };
    }
  }

  return { error: null, session };
}
