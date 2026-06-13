"use client";

import { useFormStatus } from "react-dom";
import { Loader2, ChevronRight } from "lucide-react";

export function LoginSubmitButton({ label, loadingLabel }: { label: string; loadingLabel: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full btn-gradient text-white font-black text-[11px] uppercase tracking-[0.3em] py-5 rounded-[1.5rem] flex items-center justify-center gap-3 disabled:opacity-75 disabled:cursor-not-allowed transition-all"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{loadingLabel}</span>
        </>
      ) : (
        <>
          {label}
          <ChevronRight size={14} />
        </>
      )}
    </button>
  );
}
