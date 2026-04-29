import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon?: ReactNode;
  helperText?: string;
};

export function FormField({ label, icon, helperText, className, ...props }: FormFieldProps) {
  return (
    <label className="block space-y-2">
      {label ? <span className="ml-2 text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span> : null}
      <span className="relative block">
        {icon ? <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">{icon}</span> : null}
        <input
          className={cn(
            "min-h-14 w-full rounded-[1.5rem] border border-slate-200 bg-white/80 px-5 py-4 text-sm font-bold text-slate-700 outline-none backdrop-blur-md transition-all placeholder:text-slate-300 focus:border-navy focus:bg-white focus:ring-4 focus:ring-blue-900/10",
            className
          )}
          style={{ paddingLeft: icon ? "3rem" : undefined }}
          {...props}
        />
      </span>
      {helperText ? <span className="ml-2 block text-[11px] font-bold text-slate-400">{helperText}</span> : null}
    </label>
  );
}
