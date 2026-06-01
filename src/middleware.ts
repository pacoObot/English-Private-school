import { NextRequest, NextResponse } from "next/server";
import { routeForRole, SESSION_COOKIE, verifySessionToken } from "@/features/auth/session";

const access = {
  "/admin": ["SUPER_ADMIN", "ADMIN"],
  "/teacher": ["SUPER_ADMIN", "ADMIN", "TEACHER"],
  "/student": ["SUPER_ADMIN", "ADMIN", "STUDENT"],
  "/debate": ["SUPER_ADMIN", "ADMIN", "TEACHER", "STUDENT"]
} as const;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname === "/login") {
    if (session) {
      return NextResponse.redirect(new URL(routeForRole(session.role), request.url));
    }
    return NextResponse.next();
  }

  const protectedPrefix = Object.keys(access).find((prefix) => pathname.startsWith(prefix));

  if (!protectedPrefix) {
    return NextResponse.next();
  }

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const allowedRoles: string[] = [...access[protectedPrefix as keyof typeof access]];

  if (!allowedRoles.includes(session.role)) {
    return NextResponse.redirect(new URL(routeForRole(session.role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/admin/:path*", "/teacher/:path*", "/student/:path*", "/debate/:path*"]
};
