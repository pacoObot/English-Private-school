import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "./session";

export async function getCurrentSession() {
  return verifySessionToken(cookies().get(SESSION_COOKIE)?.value);
}
