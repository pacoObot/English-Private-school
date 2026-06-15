import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CalendarTimeline } from "@/components/calendar/CalendarTimeline";
import { studentNav } from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";
import { getLocale, getDictionary } from "@/i18n/locale";

export const dynamic = "force-dynamic";

export default async function StudentCalendarPage() {
  const dict = await getDictionary();
  const events = await prisma.calendarEvent.findMany({
    where: { startsAt: { gte: new Date() } },
    orderBy: { startsAt: "asc" },
  });

  // Serialize dates to ISO strings for client component
  const serialized = events.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    startsAt: e.startsAt.toISOString(),
    endsAt: e.endsAt ? e.endsAt.toISOString() : null,
    type: e.type,
    location: e.location,
    isImportant: e.isImportant,
  }));

  return (
    <DashboardLayout
      navItems={studentNav.map((item) => ({ ...item, active: item.label === "Calendário" }))}
      title={dict.academicCalendarTitle}
      subtitle={dict.academicCalendarSub}
      context="Student Portal"
      darkSidebar
    >
      <CalendarTimeline events={serialized} />
    </DashboardLayout>
  );
}
