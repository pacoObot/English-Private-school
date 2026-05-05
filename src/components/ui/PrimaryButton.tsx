"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
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

export function PrimaryButton({ children, className, tone = "navy", disabled, ...props }: PrimaryButtonProps) {
  const { pending } = useFormStatus();
  
  return (
    <button
      disabled={pending || disabled}
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-xs font-black uppercase tracking-widest transition-all",
        tones[tone],
        (pending || disabled) && "opacity-50 cursor-not-allowed scale-[0.98]",
        className
      )}
      {...props}
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>A processar...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
