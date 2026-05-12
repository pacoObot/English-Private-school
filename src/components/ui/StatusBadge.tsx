import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type StatusBadgeProps = {
  children: ReactNode;
  tone?: "success" | "warning" | "danger" | "neutral" | "navy";
};

const tones = {
  success: "bg-emerald-50 text-emerald-600",
  warning: "bg-amber-50 text-amber-600",
  danger: "bg-rose-50 text-crimson",
  neutral: "bg-slate-100 text-slate-500",
  navy: "bg-blue-50 text-navy"
};

export function StatusBadge({ children, tone = "neutral" }: StatusBadgeProps) {
  return (
    <span className={cn("rounded-xl px-2.5 py-1 text-[9px] font-black uppercase tracking-widest", tones[tone])}>
      {children}
    </span>
  );
}
