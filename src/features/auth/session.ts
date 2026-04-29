import type { Role } from "@/generated/prisma";

export const SESSION_COOKIE = "delson_ps_session";

export type SessionPayload = {
  userId: string;
  name: string;
  email: string;
  role: Role;
  exp: number;
};

const encoder = new TextEncoder();

function getSecret() {
  return process.env.AUTH_SECRET ?? "dev-only-delson-ps-change-me";
}

function toBase64Url(value: ArrayBuffer | string) {
  const bytes = typeof value === "string" ? encoder.encode(value) : new Uint8Array(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function fromBase64Url(value: string) {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function getKey() {
  return crypto.subtle.importKey("raw", encoder.encode(getSecret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function createSessionToken(payload: Omit<SessionPayload, "exp">) {
  const body: SessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8
  };
  const encodedPayload = toBase64Url(JSON.stringify(body));
  const signature = await crypto.subtle.sign("HMAC", await getKey(), encoder.encode(encodedPayload));
  return `${encodedPayload}.${toBase64Url(signature)}`;
}

export async function verifySessionToken(token?: string | null): Promise<SessionPayload | null> {
  if (!token) {
    return null;
  }

  const [encodedPayload, encodedSignature] = token.split(".");

  if (!encodedPayload || !encodedSignature) {
    return null;
  }

  const valid = await crypto.subtle.verify("HMAC", await getKey(), fromBase64Url(encodedSignature), encoder.encode(encodedPayload));

  if (!valid) {
    return null;
  }

  const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(encodedPayload))) as SessionPayload;

  if (payload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
}

export function routeForRole(role: Role) {
  const routes: Record<Role, string> = {
    SUPER_ADMIN: "/admin/dashboard",
    ADMIN: "/admin/dashboard",
    TEACHER: "/teacher/dashboard",
    STUDENT: "/student/dashboard"
  };

  return routes[role];
}
