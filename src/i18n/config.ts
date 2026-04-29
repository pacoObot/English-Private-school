export const locales = ["pt-PT", "en-US"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "pt-PT";

export const dictionaries = {
  "pt-PT": {
    appName: "Delson Private School",
    login: "Login",
    dashboard: "Dashboard",
    support: "Suporte Rapido"
  },
  "en-US": {
    appName: "Delson Private School",
    login: "Sign in",
    dashboard: "Dashboard",
    support: "Quick Support"
  }
} satisfies Record<Locale, Record<string, string>>;
