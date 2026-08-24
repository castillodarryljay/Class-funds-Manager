import React from "react";
import { LogoVector } from "./LogoVector";

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
    xs: { css: "h-6 w-6" },
    sm: { css: "h-8 w-8" },
    md: { css: "h-11 w-11" },
    lg: { css: "h-16 w-16" },
    xl: { css: "h-20 w-20" },
    hero: { css: "h-24 w-24" }
  };

  const config = sizeConfig[size] || sizeConfig.md;

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <div className={`relative shrink-0 flex items-center justify-center ${config.css}`}>
        <LogoVector className="w-full h-full drop-shadow-sm" />
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
