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
  const sizeMap = {
    xs: "h-6 w-6 min-w-6",
    sm: "h-8 w-8 min-w-8",
    md: "h-11 w-11 min-w-11",
    lg: "h-16 w-16 min-w-16",
    xl: "h-20 w-20 min-w-20",
    hero: "h-24 w-24 min-w-24"
  };

  const imgDimension = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative shrink-0 flex items-center justify-center">
        <img
          src={LOGO_BASE64}
          alt="ClassFund Manager Logo"
          className={`${imgDimension} rounded-2xl object-contain drop-shadow-md transition-transform duration-200 hover:scale-105`}
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
