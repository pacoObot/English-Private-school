"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function Modal({ open, onClose, title, description, children, footer, className }: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-5">
      <button
        type="button"
        aria-label="Fechar modal"
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={cn(
          "relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-[2.5rem] border border-slate-200 bg-white/95 shadow-xl backdrop-blur-md sm:rounded-[3rem]",
          className
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50/70 p-6 sm:p-8">
          <div>
            <h2 id="modal-title" className="text-xl font-black tracking-tight text-slate-900">
              {title}
            </h2>
            {description ? <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-400">{description}</p> : null}
          </div>
          <button
            type="button"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white/80 text-slate-400 backdrop-blur-md"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X size={19} />
          </button>
        </div>
        <div className="p-6 sm:p-8">{children}</div>
        {footer ? <div className="border-t border-slate-100 p-6 sm:p-8">{footer}</div> : null}
      </section>
    </div>
  );
}
