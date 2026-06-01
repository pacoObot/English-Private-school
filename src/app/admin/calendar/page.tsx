import { CalendarCheck, MapPin, Trash2, Star } from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { ActionNotice, BentoCard, FormField, PrimaryButton, StatusBadge } from "@/components/ui";
import { createCalendarEventAction, deleteCalendarEventAction } from "@/features/admin/actions";
import { adminNavigation } from "@/features/admin/nav";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type CalendarPageProps = {
  searchParams?: { status?: string };
};

const typeLabels: Record<string, string> = {
  DEBATE: "Debate",
  PARTY: "Festa / Evento Social",
  SPECIAL_CLASS: "Aula Especial",
  GENERAL: "Geral",
};

const typeColors: Record<string, string> = {
  DEBATE: "bg-rose-100 text-rose-700 border-rose-200",
  PARTY: "bg-violet-100 text-violet-700 border-violet-200",
  SPECIAL_CLASS: "bg-amber-100 text-amber-700 border-amber-200",
  GENERAL: "bg-slate-100 text-slate-600 border-slate-200",
};

export default async function AdminCalendarPage({ searchParams }: CalendarPageProps) {
  const events = await prisma.calendarEvent.findMany({
    orderBy: { startsAt: "asc" },
  });

  const upcoming = events.filter((e) => e.startsAt >= new Date());
  const past = events.filter((e) => e.startsAt < new Date());

  return (
    <DashboardLayout
      navItems={adminNavigation("/admin/calendar")}
      title="Calendário Académico"
      subtitle="Datas e eventos importantes da escola"
      context="Super Admin"
      darkSidebar
    >
      <div className="space-y-5">
        <ActionNotice status={searchParams?.status} />

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          {/* Formulário de Novo Evento */}
          <BentoCard className="xl:col-span-4">
            <h3 className="mb-6 text-lg font-black text-slate-900">Novo Evento</h3>
            <form action={createCalendarEventAction} className="space-y-4">
              <FormField name="title" label="Título" placeholder="Ex: Debate Especial de Oratória" required />

              <label className="block space-y-2">
                <span className="ml-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Descrição</span>
                <textarea
                  name="description"
                  placeholder="Detalhes opcionais do evento..."
                  rows={3}
                  className="min-h-14 w-full rounded-[1.5rem] border border-slate-200 bg-white/80 px-5 py-4 text-sm font-bold text-slate-700 outline-none backdrop-blur-md transition-all placeholder:text-slate-300 focus:border-navy focus:bg-white focus:ring-4 focus:ring-blue-900/10 resize-none"
                />
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField name="startsAt" label="Data/Hora Início" type="datetime-local" required />
                <FormField name="endsAt" label="Data/Hora Fim" type="datetime-local" />
              </div>

              <label className="block space-y-2">
                <span className="ml-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Tipo de Evento</span>
                <select
                  name="type"
                  className="min-h-14 w-full rounded-[1.5rem] border border-slate-200 bg-white/80 px-5 py-4 text-sm font-bold text-slate-700 outline-none backdrop-blur-md transition-all focus:border-navy focus:bg-white focus:ring-4 focus:ring-blue-900/10"
                  defaultValue="GENERAL"
                >
                  <option value="GENERAL">Geral</option>
                  <option value="DEBATE">Debate</option>
                  <option value="PARTY">Festa / Evento Social</option>
                  <option value="SPECIAL_CLASS">Aula Especial</option>
                </select>
              </label>

              <FormField name="location" label="Localização" placeholder="Ex: Sala 3, Campus Principal" />

              <label className="flex items-center gap-3 px-2 py-2 cursor-pointer group">
                <input
                  type="checkbox"
                  name="isImportant"
                  value="true"
                  className="h-5 w-5 rounded-lg border-2 border-slate-300 text-rose-600 focus:ring-rose-500/20 transition-all"
                />
                <span className="flex items-center gap-1.5 text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">
                  <Star size={14} className="text-amber-500" />
                  Marcar como Importante
                </span>
              </label>

              <PrimaryButton className="w-full" tone="navy" type="submit">
                <CalendarCheck size={16} /> Criar Evento
              </PrimaryButton>
            </form>
          </BentoCard>

          {/* Lista de Eventos */}
          <div className="xl:col-span-8 space-y-5">
            {/* Próximos Eventos */}
            <BentoCard className="p-0">
              <div className="flex items-center justify-between p-6 pb-4">
                <h3 className="font-black text-slate-900">Próximos Eventos</h3>
                <StatusBadge tone="navy">{`${upcoming.length} Agendados`}</StatusBadge>
              </div>

              {upcoming.length === 0 ? (
                <div className="px-6 pb-6">
                  <p className="text-sm font-bold text-slate-400 italic text-center py-8">
                    Nenhum evento futuro agendado.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 px-6 pb-6">
                  {upcoming.map((event) => (
                    <EventRow key={event.id} event={event} />
                  ))}
                </div>
              )}
            </BentoCard>

            {/* Eventos Passados */}
            {past.length > 0 && (
              <BentoCard className="p-0">
                <div className="flex items-center justify-between p-6 pb-4">
                  <h3 className="font-black text-slate-500">Histórico</h3>
                  <StatusBadge tone="neutral">{`${past.length} Passados`}</StatusBadge>
                </div>
                <div className="space-y-3 px-6 pb-6 opacity-60">
                  {past.slice(0, 10).map((event) => (
                    <EventRow key={event.id} event={event} />
                  ))}
                </div>
              </BentoCard>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

type CalendarEventRow = {
  id: string;
  title: string;
  description: string | null;
  startsAt: Date;
  endsAt: Date | null;
  type: string;
  location: string | null;
  isImportant: boolean;
};

function EventRow({ event }: { event: CalendarEventRow }) {
  return (
    <div
      className={`flex items-center justify-between gap-4 rounded-2xl border p-4 transition-all hover:shadow-md ${
        event.isImportant
          ? "border-rose-200 bg-gradient-to-r from-rose-50/80 to-white"
          : "border-slate-100 bg-white hover:bg-slate-50/50"
      }`}
    >
      <div className="flex items-center gap-4 min-w-0">
        {/* Data Box */}
        <div
          className={`flex flex-col items-center justify-center rounded-2xl h-14 w-14 flex-shrink-0 text-center ${
            event.isImportant
              ? "bg-rose-600 text-white shadow-lg shadow-rose-200"
              : "bg-slate-900 text-white"
          }`}
        >
          <span className="text-[9px] font-black uppercase tracking-widest leading-none">
            {event.startsAt.toLocaleDateString("pt-PT", { month: "short" })}
          </span>
          <span className="text-xl font-black leading-none mt-0.5">
            {event.startsAt.getDate()}
          </span>
        </div>

        {/* Info */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-black text-sm text-slate-900 truncate">{event.title}</h4>
            {event.isImportant && (
              <Star size={12} className="text-amber-500 fill-amber-500 flex-shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border ${
                typeColors[event.type] ?? typeColors.GENERAL
              }`}
            >
              {typeLabels[event.type] ?? event.type}
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              {event.startsAt.toLocaleTimeString("pt-PT", {
                hour: "2-digit",
                minute: "2-digit",
              })}
              {event.endsAt
                ? ` — ${event.endsAt.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}`
                : ""}
            </span>
            {event.location && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                <MapPin size={10} /> {event.location}
              </span>
            )}
          </div>
          {event.description && (
            <p className="mt-1 text-xs font-semibold text-slate-500 line-clamp-1">{event.description}</p>
          )}
        </div>
      </div>

      {/* Delete */}
      <form action={deleteCalendarEventAction} className="flex-shrink-0">
        <input type="hidden" name="id" value={event.id} />
        <button
          type="submit"
          className="h-10 w-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-all"
          title="Eliminar evento"
        >
          <Trash2 size={16} />
        </button>
      </form>
    </div>
  );
}
