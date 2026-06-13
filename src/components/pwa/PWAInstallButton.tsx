"use client";

import { useEffect, useState } from "react";
import { Download, Share, Plus, HelpCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { dictionaries, type Locale } from "@/i18n/config";

export function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [locale, setLocale] = useState<Locale>("pt-PT");
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [showFallbackModal, setShowFallbackModal] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Detect locale from cookie
    const match = document.cookie.match(/locale=([^;]+)/);
    if (match && (match[1] === "en-US" || match[1] === "pt-PT")) {
      setLocale(match[1] as Locale);
    }

    // Detect standalone mode (already installed)
    const isStandaloneMode = 
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes("android-app://");
    setIsStandalone(isStandaloneMode);

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Check if prompt is already captured
    if ((window as any).deferredPrompt) {
      setDeferredPrompt((window as any).deferredPrompt);
    }

    // Listen for custom event when prompt becomes available
    const handlePrompt = () => {
      setDeferredPrompt((window as any).deferredPrompt);
    };

    window.addEventListener("pwa-prompt-available", handlePrompt);

    return () => {
      window.removeEventListener("pwa-prompt-available", handlePrompt);
    };
  }, []);

  // Do not show button if already running as installed PWA
  if (isStandalone) {
    return null;
  }

  // We show the button if the deferred prompt is available, or if they are on mobile (iOS/Android)
  // to allow them to click and get instructions even if the prompt isn't immediately ready.
  const canInstall = !!deferredPrompt || isIOS || true; 

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`PWA Install Choice Outcome: ${outcome}`);
      (window as any).deferredPrompt = null;
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      setShowFallbackModal(true);
    }
  };

  const dict = dictionaries[locale];

  return (
    <>
      <button
        onClick={handleInstallClick}
        title={dict.downloadApp}
        className="flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-3 text-slate-500 backdrop-blur-md transition-colors hover:border-slate-350 hover:bg-slate-50 hover:text-crimson sm:px-4"
        type="button"
      >
        <Download size={16} />
        <span className="hidden md:inline text-[10px] font-black uppercase tracking-widest">
          {dict.downloadApp}
        </span>
      </button>

      {/* iOS Modal Instructions */}
      <Modal
        open={showIOSModal}
        onClose={() => setShowIOSModal(false)}
        title={dict.iosInstallTitle}
        description="PWA"
      >
        <div className="space-y-5 text-sm font-bold text-slate-600">
          <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-100">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-navy shadow-sm">
              <Share size={16} />
            </div>
            <p className="leading-relaxed">{dict.iosStep1}</p>
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-100">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-navy shadow-sm">
              <Plus size={16} />
            </div>
            <p className="leading-relaxed">{dict.iosStep2}</p>
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-100">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-crimson shadow-sm">
              <span className="text-[10px] font-black">ADD</span>
            </div>
            <p className="leading-relaxed">{dict.iosStep3}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setShowIOSModal(false)}
            className="rounded-2xl bg-navy px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-blue-900/20 hover:bg-slate-800 transition-all"
          >
            OK
          </button>
        </div>
      </Modal>

      {/* Fallback Modal Instructions (Android Manual or other browsers) */}
      <Modal
        open={showFallbackModal}
        onClose={() => setShowFallbackModal(false)}
        title={dict.otherInstallTitle}
        description="PWA"
      >
        <div className="space-y-4 text-sm font-bold text-slate-600">
          <p className="text-xs text-slate-400">{dict.otherInstallInstructions}</p>
          
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
            <h4 className="text-xs font-black uppercase text-navy mb-1">Android</h4>
            <p className="leading-relaxed">{dict.androidStep}</p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
            <h4 className="text-xs font-black uppercase text-navy mb-1">Desktop</h4>
            <p className="leading-relaxed">{dict.desktopStep}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setShowFallbackModal(false)}
            className="rounded-2xl bg-navy px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-blue-900/20 hover:bg-slate-800 transition-all"
          >
            OK
          </button>
        </div>
      </Modal>
    </>
  );
}
