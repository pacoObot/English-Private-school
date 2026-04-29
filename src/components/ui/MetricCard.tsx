import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

type MetricCardProps = {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: "navy" | "rose" | "dark" | "light";
};

const toneMap = {
  navy: "bg-blue-50 text-navy",
  rose: "bg-rose-50 text-crimson",
  dark: "bg-slate-900 text-white",
  light: "bg-slate-100 text-slate-700"
};

export function MetricCard({ label, value, hint, icon: Icon, tone = "navy" }: MetricCardProps) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur-md transition-transform duration-300 hover:-translate-y-1">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl", toneMap[tone])}>
          <Icon size={18} />
        </div>
        {hint ? (
          <span className="rounded-xl bg-emerald-50 px-2.5 py-1 text-[9px] font-black uppercase text-emerald-600">
            {hint}
          </span>
        ) : null}
      </div>
      <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <strong className="text-2xl font-black tracking-tight text-slate-800">{value}</strong>
    </div>
  );
}
