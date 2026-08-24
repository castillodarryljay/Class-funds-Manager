import React from "react";
import { ShieldCheck, Sparkles } from "lucide-react";

interface WebsiteCreditsProps {
  variant?: "full" | "minimal" | "compact";
  onOpenTerms?: () => void;
}

export const WebsiteCredits: React.FC<WebsiteCreditsProps> = ({ 
  variant = "full",
  onOpenTerms 
}) => {
  const currentYear = new Date().getFullYear();

  if (variant === "compact" || variant === "minimal") {
    return (
      <footer className="w-full py-4 px-4 text-center border-t border-slate-200/60 bg-transparent text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">ClassFund Manager</span>
            <span className="text-slate-300">&bull;</span>
            <span>By <strong className="text-emerald-700 font-bold">Darryl Jay Castillo (SHIRO)</strong></span>
          </div>

          <div className="flex items-center gap-3">
            {onOpenTerms && (
              <button
                type="button"
                onClick={onOpenTerms}
                className="text-slate-500 hover:text-emerald-700 font-medium transition underline-offset-2 hover:underline cursor-pointer"
              >
                Terms &amp; Privacy
              </button>
            )}
            <span className="text-slate-400 font-mono">&copy; {currentYear}</span>
          </div>
        </div>
      </footer>
    );
  }

  // Refined, clean, modern standard footer
  return (
    <footer className="w-full mt-12 border-t border-slate-200/70 bg-white/60 backdrop-blur-xs py-7 px-4 sm:px-8 text-slate-500 text-xs transition">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Author Info */}
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <div className="h-7 w-7 rounded-lg bg-slate-950 text-white flex items-center justify-center font-black text-xs shadow-2xs">
            CF
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="font-bold text-slate-900 text-xs tracking-tight">ClassFund Manager</span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.2 rounded-full inline-flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5" /> Certified
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Architected &amp; Developed by <strong className="text-emerald-700 font-bold">Darryl Jay Castillo (SHIRO)</strong>
            </p>
          </div>
        </div>

        {/* Links, Badges, & Copyright */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span className="font-medium">Encrypted Audit Ledger</span>
          </div>

          {onOpenTerms && (
            <button
              type="button"
              onClick={onOpenTerms}
              className="text-slate-600 hover:text-emerald-700 font-medium hover:underline transition cursor-pointer"
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
