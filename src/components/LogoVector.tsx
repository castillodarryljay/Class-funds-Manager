import React from "react";

interface LogoVectorProps {
  className?: string;
  size?: number | string;
}

export const LogoVector: React.FC<LogoVectorProps> = ({
  className = "w-full h-full",
  size = "100%"
}) => {
  return (
    <svg
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={`select-none ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Background Gradient */}
        <linearGradient id="cfBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#064e3b" />
          <stop offset="45%" stopColor="#047857" />
          <stop offset="100%" stopColor="#0f766e" />
        </linearGradient>

        {/* Coin / Gold Gradient */}
        <linearGradient id="cfGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="40%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>

        {/* Mint / Growth Gradient */}
        <linearGradient id="cfMintGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#6ee7b7" />
        </linearGradient>

        {/* Glow Filter */}
        <filter id="cfGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Drop Shadow */}
        <filter id="cfShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#022c22" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* Base Squircle Badge with Ambient Border */}
      <rect x="20" y="20" width="472" height="472" rx="116" fill="url(#cfBgGrad)" />
      <rect x="20" y="20" width="472" height="472" rx="116" fill="none" stroke="#6ee7b7" strokeWidth="6" strokeOpacity="0.3" />
      <rect x="26" y="26" width="460" height="460" rx="110" fill="none" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.15" />

      {/* Ambient Glass Highlight Arc */}
      <path
        d="M 36 140 C 36 75, 75 36, 140 36 L 372 36 C 210 65, 90 165, 55 320 Z"
        fill="#ffffff"
        fillOpacity="0.08"
      />

      {/* Central Security & Trust Shield */}
      <g filter="url(#cfShadow)">
        <path
          d="M 256 95 L 385 150 C 385 270, 335 360, 256 400 C 177 360, 127 270, 127 150 Z"
          fill="#022c22"
          fillOpacity="0.65"
          stroke="#a7f3d0"
          strokeWidth="5"
          strokeLinejoin="round"
        />
      </g>

      {/* Graduation Cap (School & Class Theme) */}
      <g id="cap">
        <polygon points="256,120 355,162 256,204 157,162" fill="#f0fdf4" filter="url(#cfGlow)" />
        <polygon points="256,128 340,162 256,196 172,162" fill="#10b981" />
        <path d="M 190 178 L 190 216 C 190 242, 322 242, 322 216 L 322 178 Z" fill="#047857" />
        <path d="M 320 174 Q 350 192 352 230" fill="none" stroke="#facc15" strokeWidth="4.5" strokeLinecap="round" />
        <circle cx="352" cy="235" r="5.5" fill="#facc15" />
      </g>

      {/* Financial Growth Chart Bars & Upward Trend Arrow */}
      <g id="growthBars" transform="translate(0, 18)">
        <rect x="178" y="285" width="28" height="55" rx="6" fill="#34d399" fillOpacity="0.5" />
        <rect x="220" y="255" width="28" height="85" rx="6" fill="#34d399" fillOpacity="0.75" />
        <rect x="262" y="225" width="28" height="115" rx="6" fill="#10b981" />
        <rect x="304" y="195" width="28" height="145" rx="6" fill="url(#cfMintGrad)" />

        {/* Upward Growth Arrow */}
        <path
          d="M 160 315 L 218 272 L 262 242 L 336 168"
          fill="none"
          stroke="#ffffff"
          strokeWidth="8.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polygon points="348,156 322,162 342,184" fill="#ffffff" />
      </g>

      {/* Central Currency Emblem */}
      <g id="currencyEmblem" transform="translate(256, 365)">
        <circle cx="0" cy="0" r="48" fill="#ca8a04" fillOpacity="0.4" filter="url(#cfGlow)" />
        <circle cx="0" cy="0" r="44" fill="url(#cfGoldGrad)" stroke="#fef08a" strokeWidth="4" />
        <circle cx="0" cy="0" r="35" fill="none" stroke="#a16207" strokeWidth="2.5" strokeDasharray="6,4" />
        <text
          x="0"
          y="16"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="46"
          fontWeight="900"
          textAnchor="middle"
          fill="#713f12"
        >
          ₱
        </text>
      </g>

      {/* Sparkles / Transparency Motifs */}
      <path d="M 115 105 Q 115 120 100 120 Q 115 120 115 135 Q 115 120 130 120 Q 115 120 115 105 Z" fill="#fef08a" fillOpacity="0.9" />
      <path d="M 400 100 Q 400 115 385 115 Q 400 115 400 130 Q 400 115 415 115 Q 400 115 400 100 Z" fill="#6ee7b7" fillOpacity="0.9" />
      <path d="M 385 405 Q 385 416 374 416 Q 385 416 385 427 Q 385 416 396 416 Q 385 416 385 405 Z" fill="#fef08a" fillOpacity="0.85" />
    </svg>
  );
};
