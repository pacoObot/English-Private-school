import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: Array<{ label: string; value: string }>;
  helperText?: string;
};

export function SelectField({ label, options, helperText, className, ...props }: SelectFieldProps) {
  return (
    <label className="block space-y-2">
      <span className="ml-2 text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
      <span className="relative block">
        <select
          className={cn(
            "min-h-14 w-full appearance-none rounded-[1.5rem] border border-slate-200 bg-white/80 px-5 py-4 pr-12 text-sm font-bold text-slate-700 outline-none backdrop-blur-md transition-all focus:border-navy focus:bg-white focus:ring-4 focus:ring-blue-900/10",
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
      </span>
      {helperText ? <span className="ml-2 block text-[11px] font-bold text-slate-400">{helperText}</span> : null}
    </label>
  );
}
