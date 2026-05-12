"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSessionToken, routeForRole, SESSION_COOKIE } from "./session";
import { verifyPassword } from "./password";

export async function loginAction(formData: FormData) {
  const identifier = String(formData.get("email") ?? "").toLowerCase().trim();
  const password = String(formData.get("password") ?? "");

  if (!identifier || !password) {
    redirect("/login?error=invalid");
  }

  let user;
  try {
    user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier || undefined },
          { studentProfile: { studentCode: identifier } },
          { studentProfile: { studentNumber: identifier } },
          { teacherProfile: { staffNumber: identifier } }
        ]
      }
    });
  } catch (err) {
    console.error("Prisma error during login:", err);
    redirect("/login?error=db");
  }

  if (!user || !user.isActive || !verifyPassword(password, user.passwordHash)) {
    redirect("/login?error=invalid");
  }

  const token = await createSessionToken({
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  });

  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });

  redirect(routeForRole(user.role));
}
