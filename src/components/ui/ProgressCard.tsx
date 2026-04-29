import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { BentoCard } from "./BentoCard";
import { StatusBadge } from "./StatusBadge";

type ProgressItem = {
  label: string;
  value: number;
  tone?: "navy" | "rose" | "slate";
};

type ProgressCardProps = {
  eyebrow?: string;
  title: ReactNode;
  items: ProgressItem[];
  actions?: ReactNode;
  className?: string;
};

const barTones = {
  navy: "bg-navy",
  rose: "bg-crimson",
  slate: "bg-slate-900"
};

export function ProgressCard({ eyebrow = "Progresso", title, items, actions, className }: ProgressCardProps) {
  return (
    <BentoCard className={className}>
      <StatusBadge tone="navy">{eyebrow}</StatusBadge>
      <h3 className="mt-5 text-2xl font-black leading-tight tracking-tight text-slate-900 sm:text-4xl">{title}</h3>
      <div className="mt-7 space-y-5">
        {items.map((item) => (
          <div key={item.label}>
            <div className="mb-2 flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span>{item.label}</span>
              <span className="text-slate-700">{item.value}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className={cn("h-full rounded-full", barTones[item.tone ?? "navy"])} style={{ width: `${item.value}%` }} />
            </div>
          </div>
        ))}
      </div>
      {actions ? <div className="mt-8 grid gap-3 sm:flex">{actions}</div> : null}
    </BentoCard>
  );
}
