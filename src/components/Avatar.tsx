// src/components/Avatar.tsx
import React from "react";

export interface AvatarProps {
  id?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  badge?: string | number;
}

export const AVATAR_LIST = [
  { id: "av-1", bg: "#dbeafe", hair: "#1e1b4b", skin: "#fde047", accessory: "glasses", gender: "man" },
  { id: "av-2", bg: "#fef3c7", hair: "#451a03", skin: "#fdba74", accessory: "beard", gender: "man" },
  { id: "av-3", bg: "#fce7f3", hair: "#831843", skin: "#fbcfe8", accessory: "mask", gender: "woman" },
  { id: "av-4", bg: "#d1fae5", hair: "#064e3b", skin: "#a7f3d0", accessory: "earrings", gender: "woman" },
  { id: "av-5", bg: "#fee2e2", hair: "#7f1d1d", skin: "#fca5a5", accessory: "glasses", gender: "man" },
  { id: "av-6", bg: "#e0e7ff", hair: "#312e81", skin: "#c7d2fe", accessory: "none", gender: "woman" },
  { id: "av-7", bg: "#f3e8ff", hair: "#581c87", skin: "#e9d5ff", accessory: "mask", gender: "man" },
  { id: "av-8", bg: "#ccfbf1", hair: "#134e4a", skin: "#99f6e4", accessory: "earrings", gender: "woman" },
  { id: "av-9", bg: "#ffedd5", hair: "#7c2d12", skin: "#fed7aa", accessory: "none", gender: "man" },
];

const sizeMap = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-base",
  xl: "w-20 h-20 text-xl",
};

export const Avatar: React.FC<AvatarProps> = ({ id = "av-1", size = "md", className = "", badge }) => {
  const itemIndex = parseInt(id.replace(/\D/g, "") || "1", 10) - 1;
  const config = AVATAR_LIST[itemIndex % AVATAR_LIST.length];

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <svg
        className={`${sizeMap[size]} rounded-full border-2 border-white/20 shadow-sm`}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background Circle */}
        <circle cx="50" cy="50" r="50" fill={config.bg} />

        {/* Shoulders / Torso */}
        <path
          d="M20 90 C 20 70, 35 65, 50 65 C 65 65, 80 70, 80 90 Z"
          fill={config.gender === "woman" ? "#f43f5e" : "#3b82f6"}
        />
        {/* Collar / Tie */}
        <path d="M45 65 L50 80 L55 65 Z" fill="#ffffff" />
        {config.gender === "man" && <path d="M48 68 L50 90 L52 68 Z" fill="#ef4444" />}

        {/* Neck */}
        <rect x="43" y="50" width="14" height="20" rx="3" fill="#f87171" opacity="0.8" />

        {/* Head */}
        <circle cx="50" cy="42" r="22" fill="#fbcfe8" />
        <ellipse cx="50" cy="44" rx="18" ry="20" fill="#fecdd3" />

        {/* Hair */}
        {config.gender === "woman" ? (
          <>
            <path
              d="M30 35 C 30 18, 70 18, 70 35 C 70 25, 60 15, 50 15 C 40 15, 30 25, 30 35 Z"
              fill={config.hair}
            />
            {/* Ponytail or Bob */}
            <circle cx="28" cy="40" r="10" fill={config.hair} />
            <circle cx="72" cy="40" r="10" fill={config.hair} />
          </>
        ) : (
          <path
            d="M30 40 C 28 20, 72 20, 70 40 C 65 25, 35 25, 30 40 Z"
            fill={config.hair}
          />
        )}

        {/* Eyes */}
        <circle cx="43" cy="40" r="2.5" fill="#1e293b" />
        <circle cx="57" cy="40" r="2.5" fill="#1e293b" />

        {/* Accessories */}
        {config.accessory === "glasses" && (
          <g stroke="#1e1b4b" strokeWidth="2.5" fill="none">
            <circle cx="43" cy="40" r="7" />
            <circle cx="57" cy="40" r="7" />
            <line x1="50" y1="40" x2="50" y2="40" />
            <line x1="36" y1="40" x2="26" y2="38" />
            <line x1="64" y1="40" x2="74" y2="38" />
          </g>
        )}

        {config.accessory === "mask" && (
          <rect x="36" y="44" width="28" height="16" rx="4" fill="#0f172a" />
        )}

        {config.accessory === "beard" && (
          <path d="M34 45 C 34 60, 66 60, 66 45 Z" fill={config.hair} opacity="0.9" />
        )}

        {config.accessory === "earrings" && (
          <circle cx="28" cy="48" r="4" stroke="#eab308" strokeWidth="2" fill="none" />
        )}

        {/* Smile if no mask */}
        {config.accessory !== "mask" && (
          <path d="M44 52 Q 50 57 56 52" stroke="#9f1239" strokeWidth="2" fill="none" />
        )}
      </svg>

      {/* Rank or Level Badge */}
      {badge !== undefined && (
        <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-[#17e8c3] text-[#0c0d1e] font-bold text-[10px] border border-[#0c0d1e] shadow">
          {badge}
        </span>
      )}
    </div>
  );
};
