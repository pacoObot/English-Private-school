import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  tone?: "navy" | "rose" | "dark" | "light";
};

const tones = {
  navy: "bg-navy text-white shadow-sm hover:bg-blue-950",
  rose: "bg-crimson text-white shadow-sm hover:bg-rose-700",
  dark: "bg-slate-900 text-white shadow-sm hover:bg-slate-800",
  light: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
};

export function PrimaryButton({ children, className, tone = "navy", ...props }: PrimaryButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-xs font-black uppercase tracking-widest transition-all",
        tones[tone],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
