// src/components/Avatar.tsx
import React from "react";

export interface AvatarConfig {
  id: string;
  bg: string;
  hairColor: string;
  hairStyle: "curly" | "wavy" | "ponytail" | "bun" | "bob" | "afro" | "quiff" | "sidepart";
  accessory: "glasses" | "mask" | "earring" | "beard" | "moustache" | "none";
  outfit: "blue-collar" | "yellow-collar" | "black-top" | "navy-crew" | "shirt-tie" | "polka" | "sweater";
}

export const AVATAR_PALETTES = {
  bg: ["#FFEAE4", "#FFD166", "#83BCA9", "#93B5FF", "#E2F4E9", "#FFF8EE", "#FED7AA", "#FF7A7A"],
  hair: ["#1e1b4b", "#451a03", "#0f172a", "#312e81", "#7c2d12", "#18181b"],
  outfits: ["#3b82f6", "#eab308", "#18181b", "#1e3a8a", "#ffffff", "#ef4444", "#83BCA9"],
};

export const AVATAR_LIST: AvatarConfig[] = [
  // 8 Main Avatars from Figma node 1586:3066
  { id: "av-1", bg: "#FFEAE4", hairColor: "#451a03", hairStyle: "curly", accessory: "beard", outfit: "blue-collar" },
  { id: "av-2", bg: "#FFD166", hairColor: "#1e1b4b", hairStyle: "wavy", accessory: "none", outfit: "yellow-collar" },
  { id: "av-3", bg: "#FFEAE4", hairColor: "#0f172a", hairStyle: "bun", accessory: "mask", outfit: "black-top" },
  { id: "av-4", bg: "#83BCA9", hairColor: "#451a03", hairStyle: "sidepart", accessory: "glasses", outfit: "yellow-collar" },
  { id: "av-5", bg: "#FF7A7A", hairColor: "#1e1b4b", hairStyle: "ponytail", accessory: "none", outfit: "navy-crew" },
  { id: "av-6", bg: "#93B5FF", hairColor: "#18181b", hairStyle: "wavy", accessory: "mask", outfit: "blue-collar" },
  { id: "av-7", bg: "#83BCA9", hairColor: "#1e1b4b", hairStyle: "bob", accessory: "earring", outfit: "navy-crew" },
  { id: "av-8", bg: "#FED7AA", hairColor: "#18181b", hairStyle: "quiff", accessory: "mask", outfit: "yellow-collar" },
  // Extended gallery combinations
  { id: "av-9", bg: "#E2F4E9", hairColor: "#312e81", hairStyle: "afro", accessory: "glasses", outfit: "shirt-tie" },
  { id: "av-10", bg: "#FFF8EE", hairColor: "#7c2d12", hairStyle: "curly", accessory: "earring", outfit: "polka" },
  { id: "av-11", bg: "#FFD166", hairColor: "#0f172a", hairStyle: "sidepart", accessory: "moustache", outfit: "sweater" },
  { id: "av-12", bg: "#93B5FF", hairColor: "#1e1b4b", hairStyle: "bun", accessory: "glasses", outfit: "blue-collar" },
  { id: "av-13", bg: "#FFEAE4", hairColor: "#451a03", hairStyle: "bob", accessory: "none", outfit: "black-top" },
  { id: "av-14", bg: "#83BCA9", hairColor: "#18181b", hairStyle: "quiff", accessory: "beard", outfit: "navy-crew" },
  { id: "av-15", bg: "#FF7A7A", hairColor: "#312e81", hairStyle: "ponytail", accessory: "earring", outfit: "shirt-tie" },
  { id: "av-16", bg: "#E2F4E9", hairColor: "#0f172a", hairStyle: "curly", accessory: "mask", outfit: "yellow-collar" },
];

export const getRandomAvatarConfig = (): AvatarConfig => {
  const styles: AvatarConfig["hairStyle"][] = ["curly", "wavy", "ponytail", "bun", "bob", "afro", "quiff", "sidepart"];
  const accessories: AvatarConfig["accessory"][] = ["glasses", "mask", "earring", "beard", "moustache", "none"];
  const outfits: AvatarConfig["outfit"][] = ["blue-collar", "yellow-collar", "black-top", "navy-crew", "shirt-tie", "polka", "sweater"];

  return {
    id: "av-custom-" + Date.now(),
    bg: AVATAR_PALETTES.bg[Math.floor(Math.random() * AVATAR_PALETTES.bg.length)],
    hairColor: AVATAR_PALETTES.hair[Math.floor(Math.random() * AVATAR_PALETTES.hair.length)],
    hairStyle: styles[Math.floor(Math.random() * styles.length)],
    accessory: accessories[Math.floor(Math.random() * accessories.length)],
    outfit: outfits[Math.floor(Math.random() * outfits.length)],
  };
};

export interface AvatarProps {
  id?: string;
  config?: Partial<AvatarConfig>;
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

export const decodeAvatarConfig = (idOrJson?: string): AvatarConfig => {
  if (!idOrJson) return AVATAR_LIST[0];
  if (typeof idOrJson === "string" && (idOrJson.startsWith("{") || idOrJson.includes('"hairStyle"'))) {
    try {
      return JSON.parse(idOrJson);
    } catch (e) {
      console.warn("Could not parse avatar config json", e);
    }
  }
  const found = AVATAR_LIST.find((a) => a.id === idOrJson);
  if (found) return found;
  const itemIndex = parseInt(idOrJson.replace(/\D/g, "") || "1", 10) - 1;
  return AVATAR_LIST[Math.abs(itemIndex) % AVATAR_LIST.length] || AVATAR_LIST[0];
};

export const encodeAvatarConfig = (config: AvatarConfig): string => {
  return JSON.stringify(config);
};

export const Avatar: React.FC<AvatarProps> = ({ id = "av-1", config: customConfig, size = "md", className = "", badge }) => {
  const baseConfig = decodeAvatarConfig(id);
  const cfg: AvatarConfig = { ...baseConfig, ...customConfig };

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <svg
        className={`${sizeMap[size]} rounded-full border-2 border-black shadow-xs`}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background Circle */}
        <circle cx="50" cy="50" r="50" fill={cfg.bg} />

        {/* Base Body Silhouette matching Figma */}
        {cfg.outfit === "blue-collar" && (
          <g>
            <path d="M15 92 C 15 68, 32 64, 50 64 C 68 64, 85 68, 85 92 Z" fill="#60A5FA" stroke="#000000" strokeWidth="2.5" />
            <path d="M40 64 L50 78 L60 64" stroke="#000000" strokeWidth="2.5" fill="#ffffff" />
          </g>
        )}
        {cfg.outfit === "yellow-collar" && (
          <g>
            <path d="M15 92 C 15 68, 32 64, 50 64 C 68 64, 85 68, 85 92 Z" fill="#FBBF24" stroke="#000000" strokeWidth="2.5" />
            <path d="M38 64 L50 76 L62 64" stroke="#000000" strokeWidth="2.5" fill="#F59E0B" />
            <circle cx="50" cy="84" r="2" fill="#000000" />
          </g>
        )}
        {cfg.outfit === "black-top" && (
          <g>
            <path d="M15 92 C 15 68, 32 64, 50 64 C 68 64, 85 68, 85 92 Z" fill="#18181B" stroke="#000000" strokeWidth="2.5" />
            <path d="M42 64 C 42 68, 58 68, 58 64" stroke="#ffffff" strokeWidth="2" fill="none" />
          </g>
        )}
        {cfg.outfit === "navy-crew" && (
          <g>
            <path d="M15 92 C 15 68, 32 64, 50 64 C 68 64, 85 68, 85 92 Z" fill="#1E3A8A" stroke="#000000" strokeWidth="2.5" />
            <path d="M40 64 C 40 70, 60 70, 60 64" stroke="#000000" strokeWidth="2.5" fill="#3B82F6" />
          </g>
        )}
        {cfg.outfit === "shirt-tie" && (
          <g>
            <path d="M15 92 C 15 68, 32 64, 50 64 C 68 64, 85 68, 85 92 Z" fill="#FFFFFF" stroke="#000000" strokeWidth="2.5" />
            <path d="M40 64 L50 75 L60 64 Z" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
            <path d="M47 70 L50 92 L53 70 Z" fill="#EF4444" stroke="#000000" strokeWidth="1.5" />
          </g>
        )}
        {cfg.outfit === "polka" && (
          <g>
            <path d="M15 92 C 15 68, 32 64, 50 64 C 68 64, 85 68, 85 92 Z" fill="#FFFFFF" stroke="#000000" strokeWidth="2.5" />
            <circle cx="28" cy="78" r="2.5" fill="#000000" />
            <circle cx="40" cy="86" r="2.5" fill="#000000" />
            <circle cx="60" cy="86" r="2.5" fill="#000000" />
            <circle cx="72" cy="78" r="2.5" fill="#000000" />
            <circle cx="50" cy="76" r="2.5" fill="#000000" />
          </g>
        )}
        {cfg.outfit === "sweater" && (
          <g>
            <path d="M15 92 C 15 68, 32 64, 50 64 C 68 64, 85 68, 85 92 Z" fill="#34D399" stroke="#000000" strokeWidth="2.5" />
            <path d="M40 64 Q 50 72 60 64" stroke="#000000" strokeWidth="2.5" fill="none" />
          </g>
        )}

        {/* Neck */}
        <rect x="44" y="52" width="12" height="15" rx="2" fill="#FED7AA" stroke="#000000" strokeWidth="2" />

        {/* Head Base Silhouette matching Figma "Base" */}
        <path
          d="M32 44 C 32 26, 68 26, 68 44 C 68 56, 60 62, 50 62 C 40 62, 32 56, 32 44 Z"
          fill="#FED7AA"
          stroke="#000000"
          strokeWidth="2.5"
        />

        {/* Ears */}
        <circle cx="31" cy="45" r="4.5" fill="#FED7AA" stroke="#000000" strokeWidth="2" />
        <circle cx="69" cy="45" r="4.5" fill="#FED7AA" stroke="#000000" strokeWidth="2" />

        {/* Hair Styles matching Figma "Top" */}
        {cfg.hairStyle === "curly" && (
          <g fill={cfg.hairColor} stroke="#000000" strokeWidth="2.5">
            <circle cx="36" cy="28" r="9" />
            <circle cx="48" cy="24" r="10" />
            <circle cx="60" cy="27" r="9" />
            <circle cx="32" cy="38" r="7" />
            <circle cx="68" cy="38" r="7" />
          </g>
        )}
        {cfg.hairStyle === "wavy" && (
          <path
            d="M30 38 C 28 20, 72 20, 70 38 C 65 25, 35 25, 30 38 Z"
            fill={cfg.hairColor}
            stroke="#000000"
            strokeWidth="2.5"
          />
        )}
        {cfg.hairStyle === "ponytail" && (
          <g fill={cfg.hairColor} stroke="#000000" strokeWidth="2.5">
            <path d="M30 36 C 30 18, 70 18, 70 36 C 65 24, 35 24, 30 36 Z" />
            {/* High pony to the side */}
            <path d="M68 30 C 80 26, 84 46, 78 58 C 74 64, 68 56, 72 44 Z" />
          </g>
        )}
        {cfg.hairStyle === "bun" && (
          <g fill={cfg.hairColor} stroke="#000000" strokeWidth="2.5">
            <circle cx="50" cy="18" r="11" />
            <path d="M30 36 C 30 20, 70 20, 70 36 C 65 25, 35 25, 30 36 Z" />
          </g>
        )}
        {cfg.hairStyle === "bob" && (
          <path
            d="M28 48 C 26 24, 74 24, 72 48 C 72 42, 68 28, 50 28 C 32 28, 28 42, 28 48 Z"
            fill={cfg.hairColor}
            stroke="#000000"
            strokeWidth="2.5"
          />
        )}
        {cfg.hairStyle === "afro" && (
          <circle cx="50" cy="36" r="22" fill={cfg.hairColor} stroke="#000000" strokeWidth="2.5" />
        )}
        {cfg.hairStyle === "quiff" && (
          <g fill={cfg.hairColor} stroke="#000000" strokeWidth="2.5">
            <path d="M32 36 C 34 16, 60 14, 68 28 C 60 22, 40 24, 32 36 Z" />
          </g>
        )}
        {cfg.hairStyle === "sidepart" && (
          <path
            d="M32 36 C 35 22, 68 20, 68 34 C 62 26, 42 26, 32 36 Z"
            fill={cfg.hairColor}
            stroke="#000000"
            strokeWidth="2.5"
          />
        )}

        {/* Eyes & Eyebrows matching Figma Base */}
        <circle cx="43" cy="44" r="2.2" fill="#000000" />
        <circle cx="57" cy="44" r="2.2" fill="#000000" />
        <path d="M40 39 Q 43 37 46 39" stroke="#000000" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M54 39 Q 57 37 60 39" stroke="#000000" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Nose dot */}
        <circle cx="50" cy="48" r="1.2" fill="#000000" />

        {/* Smile (when no mask) */}
        {cfg.accessory !== "mask" && (
          <path d="M45 54 Q 50 58 55 54" stroke="#000000" strokeWidth="2" strokeLinecap="round" fill="none" />
        )}

        {/* Accessories matching Figma "Accessories" */}
        {cfg.accessory === "glasses" && (
          <g stroke="#000000" strokeWidth="2.5" fill="none">
            <circle cx="43" cy="44" r="7.5" fill="#FFFFFF" fillOpacity="0.2" />
            <circle cx="57" cy="44" r="7.5" fill="#FFFFFF" fillOpacity="0.2" />
            <line x1="50.5" y1="44" x2="49.5" y2="44" strokeWidth="3" />
            <line x1="35.5" y1="43" x2="31" y2="44" />
            <line x1="64.5" y1="43" x2="69" y2="44" />
          </g>
        )}

        {cfg.accessory === "mask" && (
          <path
            d="M34 50 C 34 47, 66 47, 66 50 L 63 60 C 60 63, 40 63, 37 60 Z"
            fill="#18181B"
            stroke="#000000"
            strokeWidth="2"
          />
        )}

        {cfg.accessory === "beard" && (
          <path
            d="M36 50 C 36 64, 64 64, 64 50 C 58 54, 42 54, 36 50 Z"
            fill={cfg.hairColor}
            stroke="#000000"
            strokeWidth="2"
          />
        )}

        {cfg.accessory === "moustache" && (
          <path
            d="M44 51 Q 50 49 56 51 Q 50 54 44 51 Z"
            fill={cfg.hairColor}
            stroke="#000000"
            strokeWidth="1.5"
          />
        )}

        {cfg.accessory === "earring" && (
          <circle cx="31" cy="49" r="2.5" stroke="#F59E0B" strokeWidth="1.8" fill="none" />
        )}
      </svg>

      {/* Rank or Level Badge */}
      {badge !== undefined && (
        <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-[#FF8E37] text-black font-black text-[10px] border-2 border-black shadow-xs">
          {badge}
        </span>
      )}
    </div>
  );
};
