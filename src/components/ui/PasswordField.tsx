"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { cn } from "@/lib/cn";

type PasswordFieldProps = {
  name: string;
  placeholder?: string;
  required?: boolean;
};

export function PasswordField({ name, placeholder, required }: PasswordFieldProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative block">
      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
        <Lock size={18} />
      </span>
      <input
        name={name}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        required={required}
        className={cn(
          "min-h-14 w-full rounded-[2rem] border border-slate-200 bg-white/80 pl-12 pr-12 py-4 text-sm font-bold text-slate-700 outline-none backdrop-blur-md transition-all placeholder:text-slate-300 focus:border-navy focus:bg-white focus:ring-4 focus:ring-blue-900/10"
        )}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-navy transition-colors"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
