"use client";

import { useState } from "react";
import { CalendarCheck, MapPin, Star, Sparkles, PartyPopper, BookOpen, Mic2, Filter } from "lucide-react";

type CalendarEvent = {
  id: string;
  title: string;
  description: string | null;
  startsAt: string; // ISO string from server
  endsAt: string | null;
  type: string;
  location: string | null;
  isImportant: boolean;
};

const typeConfig: Record<string, { label: string; icon: React.ReactNode; color: string; border: string; bg: string; badge: string }> = {
  DEBATE: {
    label: "Debate",
    icon: <Mic2 size={16} />,
    color: "text-rose-600",
    border: "border-rose-200",
    bg: "bg-gradient-to-br from-rose-50 to-white",
    badge: "bg-rose-100 text-rose-700 border-rose-200",
  },
  PARTY: {
    label: "Festa",
    icon: <PartyPopper size={16} />,
    color: "text-violet-600",
    border: "border-violet-200",
    bg: "bg-gradient-to-br from-violet-50 to-white",
    badge: "bg-violet-100 text-violet-700 border-violet-200",
  },
  SPECIAL_CLASS: {
    label: "Aula Especial",
    icon: <BookOpen size={16} />,
    color: "text-amber-600",
    border: "border-amber-200",
    bg: "bg-gradient-to-br from-amber-50 to-white",
    badge: "bg-amber-100 text-amber-700 border-amber-200",
  },
  GENERAL: {
    label: "Geral",
    icon: <CalendarCheck size={16} />,
    color: "text-slate-600",
    border: "border-slate-200",
    bg: "bg-gradient-to-br from-slate-50 to-white",
    badge: "bg-slate-100 text-slate-600 border-slate-200",
  },
};

const filters = [
  { key: "ALL", label: "Todos", icon: <Sparkles size={14} /> },
  { key: "DEBATE", label: "Debates", icon: <Mic2 size={14} /> },
  { key: "PARTY", label: "Festas", icon: <PartyPopper size={14} /> },
  { key: "SPECIAL_CLASS", label: "Aulas", icon: <BookOpen size={14} /> },
];

export function CalendarTimeline({ events }: { events: CalendarEvent[] }) {
  const [activeFilter, setActiveFilter] = useState("ALL");

  const filtered = activeFilter === "ALL" ? events : events.filter((e) => e.type === activeFilter);

  // Group by month
  const grouped = filtered.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
    const d = new Date(event.startsAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(event);
    return acc;
  }, {});

  const monthFormatter = new Intl.DateTimeFormat("pt-PT", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      {/* Filtros Rápidos */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all border ${
              activeFilter === f.key
                ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20 scale-105"
                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700"
            }`}
          >
            {f.icon}
            {f.label}
          </button>
        ))}
      </div>

      {/* Timeline Feed */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <CalendarCheck size={48} className="mx-auto text-slate-200" />
          <p className="text-sm font-bold text-slate-400">
            Nenhum evento encontrado para este filtro.
          </p>
        </div>
      ) : (
        Object.entries(grouped).map(([monthKey, monthEvents]) => {
          const sampleDate = new Date(monthEvents[0].startsAt);
          return (
            <div key={monthKey} className="space-y-3">
              {/* Month Header */}
              <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md py-2">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">
                  {monthFormatter.format(sampleDate)}
                </h3>
              </div>

              {/* Event Cards */}
              <div className="space-y-3 relative">
                {/* Timeline Line */}
                <div className="absolute left-[1.72rem] top-4 bottom-4 w-[2px] bg-slate-100 rounded-full" />

                {monthEvents.map((event) => {
                  const cfg = typeConfig[event.type] ?? typeConfig.GENERAL;
                  const d = new Date(event.startsAt);
                  const endD = event.endsAt ? new Date(event.endsAt) : null;

                  return (
                    <div
                      key={event.id}
                      className={`relative flex gap-4 group ${
                        event.isImportant ? "animate-pulse-subtle" : ""
                      }`}
                    >
                      {/* Timeline Dot */}
                      <div className="relative z-10 flex-shrink-0">
                        <div
                          className={`h-14 w-14 rounded-2xl flex flex-col items-center justify-center shadow-md transition-all group-hover:scale-110 group-hover:shadow-lg ${
                            event.isImportant
                              ? "bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-rose-200"
                              : "bg-slate-900 text-white"
                          }`}
                        >
                          <span className="text-[8px] font-black uppercase tracking-widest leading-none">
                            {d.toLocaleDateString("pt-PT", { month: "short" })}
                          </span>
                          <span className="text-lg font-black leading-none mt-0.5">
                            {d.getDate()}
                          </span>
                        </div>
                      </div>

                      {/* Card */}
                      <div
                        className={`flex-1 rounded-2xl border p-4 transition-all group-hover:shadow-md group-hover:-translate-y-0.5 ${
                          event.isImportant
                            ? `border-rose-200 bg-gradient-to-r from-rose-50/80 via-white to-white shadow-sm shadow-rose-100`
                            : `${cfg.border} ${cfg.bg}`
                        }`}
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-black text-sm text-slate-900 leading-tight">
                                {event.title}
                              </h4>
                              {event.isImportant && (
                                <Star
                                  size={13}
                                  className="text-amber-500 fill-amber-500 flex-shrink-0"
                                />
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border ${cfg.badge}`}
                              >
                                {cfg.icon}
                                {cfg.label}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400">
                                {d.toLocaleTimeString("pt-PT", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                                {endD
                                  ? ` — ${endD.toLocaleTimeString("pt-PT", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}`
                                  : ""}
                              </span>
                            </div>
                          </div>
                          {/* Day of Week */}
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 flex-shrink-0 mt-0.5">
                            {d.toLocaleDateString("pt-PT", { weekday: "short" })}
                          </span>
                        </div>

                        {/* Description */}
                        {event.description && (
                          <p className="mt-2 text-xs font-semibold text-slate-500 leading-relaxed">
                            {event.description}
                          </p>
                        )}

                        {/* Location */}
                        {event.location && (
                          <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                            <MapPin size={11} className="text-slate-300" />
                            {event.location}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
