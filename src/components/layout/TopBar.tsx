"use client";

import type { ReactNode } from "react";
import { Bell, Menu, Search } from "lucide-react";
import { cn } from "@/lib/cn";

type TopBarProps = {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
  action?: ReactNode;
  showSearch?: boolean;
  className?: string;
};

export function TopBar({ title, subtitle, onMenuClick, action, showSearch = false, className }: TopBarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex min-h-20 shrink-0 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md lg:px-8",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        {onMenuClick ? (
          <button
            aria-label="Abrir menu"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 lg:hidden"
            onClick={onMenuClick}
            type="button"
          >
            <Menu size={20} />
          </button>
        ) : null}
        <div className="min-w-0">
          <h2 className="truncate text-base font-black text-slate-900 sm:text-lg lg:text-2xl">{title}</h2>
          {subtitle ? <p className="mt-1 hidden truncate text-xs font-bold text-slate-400 sm:block">{subtitle}</p> : null}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {showSearch ? (
          <div className="hidden h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-400 md:flex">
            <Search size={15} />
            <span className="text-xs font-bold">Procurar...</span>
          </div>
        ) : null}
        {action}
        <div className="hidden rounded-2xl bg-slate-100 p-1 sm:flex">
          <span className="rounded-xl px-3 py-1.5 text-[10px] font-black text-slate-400">EN</span>
          <span className="rounded-xl bg-white px-3 py-1.5 text-[10px] font-black text-slate-800 shadow-sm">PT</span>
        </div>
        <a
          href="/logout"
          className="hidden min-h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white/80 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 backdrop-blur-md transition-colors hover:text-crimson sm:flex"
        >
          Sair
        </a>
        <button
          type="button"
          className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white/80 text-slate-500 backdrop-blur-md"
          aria-label="Notificacoes"
        >
          <Bell size={18} />
          <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-crimson ring-2 ring-white" />
        </button>
      </div>
    </header>
  );
}
