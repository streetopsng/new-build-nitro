import React from "react";

export const GUMMYGUM_AVATAR_BASE_URL = "https://gummygum.app/avatars";

export const AVATAR_IDS = Array.from({ length: 26 }, (_, i) => `av-${i + 1}`);

export const avatarUrl = (id?: string) =>
  `${GUMMYGUM_AVATAR_BASE_URL}/${id && AVATAR_IDS.includes(id) ? id : "av-1"}.svg`;

export const getRandomAvatarId = (): string =>
  AVATAR_IDS[Math.floor(Math.random() * AVATAR_IDS.length)];

export interface AvatarProps {
  id?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  badge?: string | number;
}

const sizeMap = {
  sm: "w-8 h-8 text-xs",
  md: "w-11 h-11 text-sm",
  lg: "w-16 h-16 text-base",
  xl: "w-24 h-24 text-xl",
  "2xl": "w-36 h-36 text-2xl",
};

export const Avatar: React.FC<AvatarProps> = ({ id = "av-1", size = "md", className = "", badge }) => {
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <img
        src={avatarUrl(id)}
        alt="Player avatar"
        className={`${sizeMap[size]} rounded-full border-2 border-black shadow-xs bg-white object-cover`}
      />

      {badge !== undefined && (
        <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-[#FF8E37] text-black font-black text-[10px] border-2 border-black shadow-xs">
          {badge}
        </span>
      )}
    </div>
  );
};
