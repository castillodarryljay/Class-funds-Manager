import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Download, X, Share, PlusSquare, Smartphone, CheckCircle2 } from "lucide-react";
import { LogoVector } from "./LogoVector";

export const MobileInstallBanner: React.FC = () => {
  const [swRegistered, setSwRegistered] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    return sessionStorage.getItem("cf_dismiss_install_banner") === "true";
  });
  const [showIosInstructions, setShowIosInstructions] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    // 1. Detect if running in standalone / PWA mode
    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes("android-app://");
      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();

    // 2. Detect mobile device or viewport
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileUA = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isSmallViewport = window.innerWidth <= 768;
      setIsMobile(isMobileUA || isSmallViewport);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    // 3. Trigger on Service Worker Successful Registration
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready
        .then((registration) => {
          if (registration) {
            setSwRegistered(true);
          }
        })
        .catch(() => {
          // Fallback if ready promise times out
          if (navigator.serviceWorker.controller) {
            setSwRegistered(true);
          }
        });

      // Also listen for active controller change
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        setSwRegistered(true);
      });
    }

    // 4. Capture native browser install prompt (Chrome/Android/Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // If service worker is supported, ensure banner is ready
      setSwRegistered(true);
    };

    const handleAppInstalled = () => {
      setIsStandalone(true);
      setInstalledSuccess(true);
      setDeferredPrompt(null);
      setTimeout(() => {
        setIsDismissed(true);
      }, 3000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setInstalledSuccess(true);
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIosInstructions(true);
    } else {
      // General instructions for browsers that don't support beforeinstallprompt
      setShowIosInstructions(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem("cf_dismiss_install_banner", "true");
  };

  // Only show banner if:
  // 1. Service Worker successfully registered
  // 2. User is on mobile
  // 3. App is NOT already running in standalone PWA mode
  // 4. User has not dismissed the banner for this session
  const shouldShow = swRegistered && isMobile && !isStandalone && !isDismissed;

  return (
    <>
      <AnimatePresence>
        {shouldShow && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-3 inset-x-3 sm:left-auto sm:right-4 sm:max-w-sm z-50 pointer-events-auto"
          >
            <div className="bg-slate-950/95 backdrop-blur-md text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl border border-slate-800 flex items-center justify-between gap-3">
              {/* App Icon */}
              <div className="w-11 h-11 shrink-0 rounded-xl overflow-hidden shadow-md flex items-center justify-center bg-slate-900 border border-emerald-500/30">
                <LogoVector className="w-full h-full" />
              </div>

              {/* Text Information */}
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs sm:text-sm font-black text-white truncate tracking-tight">
                    Install ClassFund
                  </h4>
                  <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-500/30">
                    PWA
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-400 leading-tight mt-0.5 truncate">
                  {installedSuccess 
                    ? "Installed successfully!" 
                    : "Add to home screen for fast offline access."}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                {installedSuccess ? (
                  <span className="p-2 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs px-3 py-2 rounded-xl transition shadow-md shadow-emerald-900/40 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Install</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleDismiss}
                  className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                  title="Dismiss banner"
                  aria-label="Dismiss banner"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS / Manual Add to Home Screen Instructions Modal */}
      <AnimatePresence>
        {showIosInstructions && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 text-left space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm">
                    <LogoVector className="w-full h-full" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-950 text-base">Install ClassFund</h3>
                    <p className="text-xs text-slate-500">Quick home screen setup</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIosInstructions(false)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-emerald-100 text-emerald-800 p-2 rounded-xl shrink-0 mt-0.5">
                    <Share className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Step 1</p>
                    <p className="text-xs text-slate-600">
                      Tap the <strong className="text-slate-900">Share</strong> icon at the bottom of Safari (or the 3-dots menu in Chrome).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-emerald-100 text-emerald-800 p-2 rounded-xl shrink-0 mt-0.5">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Step 2</p>
                    <p className="text-xs text-slate-600">
                      Scroll down and tap <strong className="text-slate-900">&quot;Add to Home Screen&quot;</strong>.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIosInstructions(false)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-xs transition"
              >
                Got It
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
