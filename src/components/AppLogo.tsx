import React from "react";

interface AppLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
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
    sm: "h-7 w-7",
    md: "h-9 w-9",
    lg: "h-12 w-12",
    xl: "h-16 w-16"
  };

  const imgSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative shrink-0 flex items-center justify-center">
        <img
          src="/logo.png"
          alt="ClassFund Logo"
          referrerPolicy="no-referrer"
          className={`${imgSize} rounded-xl object-cover shadow-sm ring-1 ring-black/5 bg-white`}
          onError={(e) => {
            // Fallback in case image format needs jpg
            (e.target as HTMLImageElement).src = "/logo.jpg";
          }}
        />
      </div>

      {showText && (
        <div className="text-left">
          <span
            className={`font-black text-lg tracking-tight uppercase block leading-none ${
              dark ? "text-white" : "text-slate-950"
            }`}
          >
            Class Funds
          </span>
          {subtitle ? (
            <span
              className={`text-[9px] font-bold tracking-wider uppercase block mt-1 ${
                dark ? "text-emerald-400" : "text-emerald-600"
              }`}
            >
              {subtitle}
            </span>
          ) : (
            <span
              className={`text-[9px] font-bold tracking-wider uppercase block mt-1 ${
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
