import React from "react";
import { ShieldCheck, Sparkles, Heart } from "lucide-react";

interface WebsiteCreditsProps {
  variant?: "full" | "minimal" | "compact";
  onOpenTerms?: () => void;
}

export const WebsiteCredits: React.FC<WebsiteCreditsProps> = ({ 
  variant = "full",
  onOpenTerms 
}) => {
  const currentYear = new Date().getFullYear();

  if (variant === "compact") {
    return (
      <footer className="w-full py-4 text-center text-xs text-slate-400 border-t border-slate-100 bg-white/50">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px]">
          <span className="font-medium text-slate-500">
            &copy; {currentYear} <strong className="text-slate-800 font-bold">ClassFund Manager</strong>
          </span>
          <span className="text-slate-300">&bull;</span>
          <span className="text-slate-500">
            Architected &amp; Developed by <strong className="text-emerald-700 font-bold">Darryl Jay Castillo (SHIRO)</strong>
          </span>
          {onOpenTerms && (
            <>
              <span className="text-slate-300">&bull;</span>
              <button
                type="button"
                onClick={onOpenTerms}
                className="text-slate-500 hover:text-emerald-700 underline font-medium transition cursor-pointer"
              >
                Security &amp; Terms
              </button>
            </>
          )}
        </div>
      </footer>
    );
  }

  if (variant === "minimal") {
    return (
      <div className="pt-4 border-t border-slate-100 text-center space-y-1">
        <p className="text-[11px] text-slate-500 font-medium tracking-wide">
          Official Ledger by <strong className="text-slate-800 font-bold">ClassFund Manager</strong> &bull; Crafted by <strong className="text-emerald-700 font-bold">Darryl Jay Castillo (SHIRO)</strong>
        </p>
        <p className="text-[10px] text-slate-400">
          Encrypted Cloud Audit Ledger &bull; Real-time Classroom Bookkeeping
        </p>
      </div>
    );
  }

  return (
    <footer className="w-full mt-12 border-t border-slate-200/80 bg-slate-50/70 py-8 px-4 sm:px-8 text-slate-500 text-xs transition">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Author Identity */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
          <div className="h-7 w-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
            CF
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 flex items-center justify-center sm:justify-start gap-1.5">
              <span>ClassFund Manager</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5" /> v2.4 Certified
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Designed &amp; Engineered with precision by <strong className="text-emerald-700 font-black">Darryl Jay Castillo (SHIRO)</strong>
            </p>
          </div>
        </div>

        {/* Security & System Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-[11px]">
          <div className="flex items-center gap-1 text-slate-500 font-medium bg-white px-2.5 py-1 rounded-lg border border-slate-200/70 shadow-2xs">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Tamper-Resistant Audit Trail</span>
          </div>

          {onOpenTerms && (
            <button
              type="button"
              onClick={onOpenTerms}
              className="text-slate-600 hover:text-emerald-700 font-bold hover:underline transition cursor-pointer"
            >
              Terms of Service &amp; Privacy
            </button>
          )}

          <span className="text-slate-300 hidden sm:inline">&bull;</span>
          <span className="text-slate-400 font-mono text-[10px]">
            &copy; {currentYear} All Rights Reserved
          </span>
        </div>
      </div>
    </footer>
  );
};
