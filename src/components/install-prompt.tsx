"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Share, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const DISMISS_KEY = "hangout-switch:install-dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const navStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone;
  return window.matchMedia("(display-mode: standalone)").matches || navStandalone === true;
}

function isIos(): boolean {
  if (typeof window === "undefined") return false;
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    if (localStorage.getItem(DISMISS_KEY)) return;

    if (isIos()) {
      const timer = setTimeout(() => {
        setIosHint(true);
        setVisible(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore
    }
  }

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    dismiss();
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="pb-safe fixed inset-x-0 bottom-0 z-[60] flex justify-center px-4 pb-4"
        >
          <div className="flex w-full max-w-sm items-center gap-3 rounded-2xl border border-black/5 bg-white p-4 shadow-2xl shadow-black/20 dark:border-white/10 dark:bg-neutral-900">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-rose-400 text-white">
              {iosHint ? <Share className="size-5" /> : <Download className="size-5" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                Add Hangout Switch to your home screen
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {iosHint
                  ? "Tap Share, then “Add to Home Screen.”"
                  : "Play full-screen, even offline."}
              </p>
            </div>
            {!iosHint && (
              <Button size="sm" onClick={handleInstall} className="shrink-0">
                Install
              </Button>
            )}
            <button
              onClick={dismiss}
              className="flex size-7 shrink-0 items-center justify-center rounded-full text-neutral-400 transition hover:bg-black/5 dark:hover:bg-white/10"
              aria-label="Dismiss"
            >
              <X className="size-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
