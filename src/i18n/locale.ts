import { cookies } from "next/headers";
import { Locale, defaultLocale, dictionaries } from "./config";

export async function getLocale(): Promise<Locale> {
  const cookieStore = cookies();
  const value = cookieStore.get("locale")?.value;
  return value === "en-US" || value === "pt-PT"
    ? (value as Locale)
    : defaultLocale;
}

export async function getDictionary() {
  const locale = await getLocale();
  return dictionaries[locale];
}
