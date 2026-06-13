"use client";

import { useTransition, useState, useEffect } from "react";
import { setLocaleAction } from "@/i18n/actions";

export function LoginLanguageToggle() {
  const [isPending, startTransition] = useTransition();
  const [currentLocale, setCurrentLocale] = useState("pt-PT");

  useEffect(() => {
    const match = document.cookie.match(/locale=([^;]+)/);
    if (match && match[1]) {
      setCurrentLocale(match[1]);
    }
  }, [isPending]);

  const handleSet = (lang: string) => {
    startTransition(async () => {
      await setLocaleAction(lang);
      setCurrentLocale(lang);
    });
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleSet("pt-PT")}
        disabled={isPending}
        className={`px-5 py-2 rounded-full border-2 flex items-center gap-2 bg-white shadow-sm transition-all ${
          currentLocale === "pt-PT"
            ? "border-navy"
            : "border-slate-100 opacity-60 hover:opacity-100"
        }`}
      >
        <img src="https://flagcdn.com/w40/pt.png" className="w-4 h-auto rounded-xs" alt="PT" />
        <span className="text-[10px] font-black text-navy">PT</span>
      </button>
      <button
        onClick={() => handleSet("en-US")}
        disabled={isPending}
        className={`px-5 py-2 rounded-full border-2 flex items-center gap-2 bg-white shadow-sm transition-all ${
          currentLocale === "en-US"
            ? "border-navy"
            : "border-slate-100 opacity-60 hover:opacity-100"
        }`}
      >
        <img
          src="https://flagcdn.com/w40/gb.png"
          className="w-4 h-auto rounded-xs"
          alt="EN"
        />
        <span className="text-[10px] font-black text-slate-400">EN</span>
      </button>
    </div>
  );
}
