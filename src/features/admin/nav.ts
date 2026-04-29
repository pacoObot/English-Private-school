import { adminNav } from "@/lib/mock-data";

export function adminNavigation(activeHref: string) {
  return adminNav.map((item) => ({
    ...item,
    active: item.href === activeHref && (activeHref !== "/admin/dashboard" || item.label === "Dashboard Central")
  }));
}
