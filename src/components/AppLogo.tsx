import React from "react";
import { LOGO_BASE64 } from "../assets/logoBase64";

interface AppLogoProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "hero";
  showText?: boolean;
  subtitle?: string;
  dark?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  className = "",
  size = "md",
  showText = false,
  subtitle,
  dark = false
}) => {
  const sizeConfig = {
    xs: { css: "h-6 w-6", px: 24 },
    sm: { css: "h-8 w-8", px: 32 },
    md: { css: "h-11 w-11", px: 44 },
    lg: { css: "h-16 w-16", px: 64 },
    xl: { css: "h-20 w-20", px: 80 },
    hero: { css: "h-24 w-24", px: 96 }
  };

  const config = sizeConfig[size] || sizeConfig.md;

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <div className={`relative shrink-0 flex items-center justify-center ${config.css}`}>
        <img
          src={LOGO_BASE64}
          alt="Class Funds Logo"
          width={config.px}
          height={config.px}
          loading="eager"
          decoding="sync"
          className="w-full h-full rounded-2xl object-contain drop-shadow-sm pointer-events-none"
        />
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
