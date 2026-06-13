"use client";

import { useTransition, useState, useEffect } from "react";
import { setLocaleAction } from "@/i18n/actions";

export function LanguageToggle() {
  const [isPending, startTransition] = useTransition();
  const [currentLocale, setCurrentLocale] = useState("pt-PT");

  useEffect(() => {
    const match = document.cookie.match(/locale=([^;]+)/);
    if (match && match[1]) {
      setCurrentLocale(match[1]);
    }
  }, [isPending]);

  const handleToggle = (lang: string) => {
    startTransition(async () => {
      await setLocaleAction(lang);
      setCurrentLocale(lang);
    });
  };

  return (
    <div className="hidden rounded-2xl bg-slate-100 p-1 sm:flex gap-1">
      <button
        onClick={() => handleToggle("en-US")}
        disabled={isPending}
        className={`rounded-xl px-3 py-1.5 text-[10px] font-black transition-all ${
          currentLocale === "en-US"
            ? "bg-white text-slate-800 shadow-sm"
            : "text-slate-400 hover:text-slate-650"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => handleToggle("pt-PT")}
        disabled={isPending}
        className={`rounded-xl px-3 py-1.5 text-[10px] font-black transition-all ${
          currentLocale === "pt-PT"
            ? "bg-white text-slate-800 shadow-sm"
            : "text-slate-400 hover:text-slate-650"
        }`}
      >
        PT
      </button>
    </div>
  );
}
