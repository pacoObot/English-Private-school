import type { LucideIcon } from "lucide-react";
import { Wallet } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { cn } from "@/lib/cn";

type FinanceCardProps = {
  label: string;
  amount: string;
  description?: string;
  status?: string;
  icon?: LucideIcon;
  tone?: "navy" | "rose" | "dark";
  className?: string;
};

const tones = {
  navy: "from-navy to-blue-500 shadow-blue-200",
  rose: "from-crimson to-rose-500 shadow-rose-200",
  dark: "from-slate-900 to-slate-800 shadow-slate-300"
};

export function FinanceCard({ label, amount, description, status = "Pendente", icon: Icon = Wallet, tone = "navy", className }: FinanceCardProps) {
  return (
    <section className={cn("rounded-[2.5rem] bg-gradient-to-br p-6 text-white shadow-xl backdrop-blur-md lg:p-8", tones[tone], className)}>
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md">
          <Icon size={22} />
        </div>
        <StatusBadge tone={tone === "rose" ? "danger" : "success"}>{status}</StatusBadge>
      </div>
      <p className="mt-12 text-[10px] font-black uppercase tracking-widest text-white/70">{label}</p>
      <h3 className="mt-2 text-3xl font-black tracking-tight">{amount}</h3>
      {description ? <p className="mt-2 text-sm font-semibold text-white/75">{description}</p> : null}
    </section>
  );
}
