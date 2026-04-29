import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type BentoCardProps = {
  children: ReactNode;
  className?: string;
  dark?: boolean;
  premium?: boolean;
};

export function BentoCard({ children, className, dark = false, premium = false }: BentoCardProps) {
  return (
    <section
      className={cn(
        "rounded-[2rem] border p-5 backdrop-blur-md sm:p-6 lg:rounded-[2.5rem] lg:p-8",
        dark
          ? "border-white/10 bg-slate-900 text-white"
          : "border-slate-200/80 bg-white/90 text-slate-900",
        premium ? "shadow-xl" : "shadow-sm",
        className
      )}
    >
      {children}
    </section>
  );
}
