"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

type MobileDrawerProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  dark?: boolean;
  title?: string;
};

export function MobileDrawer({ open, onClose, children, className, dark = false, title = "Menu" }: MobileDrawerProps) {
  return (
    <>
      <button
        type="button"
        aria-label="Fechar menu"
        className={cn("fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm lg:hidden", open ? "block" : "hidden")}
        onClick={onClose}
      />
      <aside
        aria-label={title}
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 max-w-[86vw] flex-col border-r transition-transform duration-300 lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
          dark ? "border-slate-800 bg-slate-900 text-white" : "border-slate-200 bg-white/95 text-slate-900 backdrop-blur-md",
          className
        )}
      >
        <button
          type="button"
          aria-label="Fechar menu"
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white/80 text-slate-400 backdrop-blur-md"
          onClick={onClose}
        >
          <X size={19} />
        </button>
        {children}
      </aside>
    </>
  );
}
