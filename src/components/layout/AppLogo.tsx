import { GraduationCap, Languages, MessageCircle } from "lucide-react";
import { cn } from "@/lib/cn";

type AppLogoProps = {
  context?: string;
  variant?: "default" | "auth" | "compact";
  dark?: boolean;
  className?: string;
};

export function AppLogo({ context = "Language Academy", variant = "default", dark = false, className }: AppLogoProps) {
  if (variant === "auth") {
    return (
      <div className={cn("text-center", className)}>
        <div className="relative mx-auto mb-4 h-[100px] w-[100px]">
          <div className="flex h-full w-full items-center justify-center rounded-[2rem] bg-crimson text-white shadow-xl shadow-rose-900/20">
            <Languages size={44} />
          </div>
          <div className="absolute -bottom-1 -right-1 flex h-12 w-12 items-center justify-center rounded-2xl border-4 border-white bg-navy text-white">
            <MessageCircle size={20} />
          </div>
        </div>
        <h1 className="text-3xl font-black uppercase leading-none tracking-tight text-slate-900">
          Delson<span className="text-navy">PS</span>
        </h1>
        <p className="mt-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-800">Delson Private School</p>
        <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.3em] text-slate-400">Maputo · Mozambique</p>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "flex items-center justify-center bg-crimson text-white shadow-sm shadow-rose-900/20",
          variant === "compact" ? "h-10 w-10 rounded-xl" : "h-11 w-11 rounded-2xl"
        )}
      >
        <GraduationCap size={variant === "compact" ? 20 : 21} />
      </div>
      <div>
        <h1 className={cn("font-black leading-none", variant === "compact" ? "text-base" : "text-lg", dark ? "text-white" : "text-slate-900")}>
          DELSON<span className="text-crimson">PS</span>
        </h1>
        <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-slate-400">{context}</p>
      </div>
    </div>
  );
}
