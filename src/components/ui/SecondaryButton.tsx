import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type SecondaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function SecondaryButton({ children, className, ...props }: SecondaryButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-700 backdrop-blur-md transition-all hover:bg-slate-50",
        className
      )}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}
