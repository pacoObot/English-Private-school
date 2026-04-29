import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/cn";

type FloatingActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: ReactNode;
  tone?: "navy" | "rose" | "dark";
};

const tones = {
  navy: "bg-navy text-white hover:bg-blue-950",
  rose: "bg-crimson text-white hover:bg-rose-700",
  dark: "bg-slate-900 text-white hover:bg-slate-800"
};

export function FloatingActionButton({ children, className, tone = "rose", ...props }: FloatingActionButtonProps) {
  return (
    <button
      aria-label={props["aria-label"] ?? "Acao rapida"}
      className={cn(
        "fixed bottom-5 right-5 z-30 flex h-14 min-w-14 items-center justify-center gap-2 rounded-[1.25rem] px-4 text-xs font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 md:bottom-8 md:right-8",
        tones[tone],
        className
      )}
      type="button"
      {...props}
    >
      {children ?? <Plus size={22} />}
    </button>
  );
}
