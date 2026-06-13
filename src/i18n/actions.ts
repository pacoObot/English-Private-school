"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function setLocaleAction(locale: string) {
  const cookieStore = cookies();
  cookieStore.set("locale", locale, { path: "/" });
  revalidatePath("/");
}
