import React, { useState } from "react";
import logoUrl from "../assets/logo.png";

interface AppLogoProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "hero";
  showText?: boolean;
  subtitle?: string;
  dark?: boolean;
}

const FALLBACK_SOURCES = [
  logoUrl,
  "/logo.png",
  "/LogoIcon.png",
  "/icon.png",
  "/icon-192.png"
];

export const AppLogo: React.FC<AppLogoProps> = ({
  className = "",
  size = "md",
  showText = false,
  subtitle,
  dark = false
}) => {
  const [sourceIndex, setSourceIndex] = useState(0);
  const [allFailed, setAllFailed] = useState(false);

  const sizeConfig = {
    xs: { css: "h-6 w-6", px: 24, iconSize: 14 },
    sm: { css: "h-8 w-8", px: 32, iconSize: 18 },
    md: { css: "h-11 w-11", px: 44, iconSize: 24 },
    lg: { css: "h-16 w-16", px: 64, iconSize: 34 },
    xl: { css: "h-20 w-20", px: 80, iconSize: 42 },
    hero: { css: "h-24 w-24", px: 96, iconSize: 52 }
  };

  const config = sizeConfig[size] || sizeConfig.md;

  const handleImageError = () => {
    if (sourceIndex < FALLBACK_SOURCES.length - 1) {
      setSourceIndex(prev => prev + 1);
    } else {
      setAllFailed(true);
    }
  };

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <div className={`relative shrink-0 flex items-center justify-center ${config.css}`}>
        {!allFailed ? (
          <img
            src={FALLBACK_SOURCES[sourceIndex]}
            alt="Class Funds Logo"
            width={config.px}
            height={config.px}
            loading="eager"
            decoding="sync"
            onError={handleImageError}
            className="w-full h-full rounded-2xl object-contain drop-shadow-sm pointer-events-none transition-opacity duration-200"
          />
        ) : (
          <div className="w-full h-full rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-md border border-emerald-400/30">
            <svg
              className="w-3/5 h-3/5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
        )}
      </div>

      {showText && (
        <div className="text-left flex flex-col justify-center">
          <span
            className={`font-black text-xl tracking-tight uppercase block leading-none ${
              dark ? "text-white" : "text-slate-950"
            }`}
          >
            Class Funds
          </span>
          {subtitle ? (
            <span
              className={`text-[9px] font-extrabold tracking-widest uppercase block mt-1 ${
                dark ? "text-emerald-400" : "text-emerald-600"
              }`}
            >
              {subtitle}
            </span>
          ) : (
            <span
              className={`text-[9px] font-extrabold tracking-widest uppercase block mt-1 ${
                dark ? "text-emerald-400" : "text-emerald-600"
              }`}
            >
              Financial Transparency
            </span>
          )}
        </div>
      )}
    </div>
  );
};
