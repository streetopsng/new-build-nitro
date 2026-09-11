// src/components/ProfileModal.tsx
import React, { useState } from "react";
import {
  Avatar,
  AVATAR_LIST,
  AVATAR_PALETTES,
  getRandomAvatarConfig,
  encodeAvatarConfig,
  decodeAvatarConfig,
  type AvatarConfig,
} from "./Avatar";
import { useProfile } from "../contexts/ProfileContext";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAvatarSelect?: (avatarIdOrJson: string) => void;
}

const TAKEN_USERNAMES = ["dodge_insync", "admin", "nitro", "host", "taken_user"];

const HAIR_STYLES: Array<{ key: AvatarConfig["hairStyle"]; label: string }> = [
  { key: "curly", label: "Curly" },
  { key: "wavy", label: "Wavy" },
  { key: "ponytail", label: "Ponytail" },
  { key: "bun", label: "Bun" },
  { key: "bob", label: "Bob" },
  { key: "afro", label: "Afro" },
  { key: "quiff", label: "Quiff" },
  { key: "sidepart", label: "Side Part" },
];

const ACCESSORIES: Array<{ key: AvatarConfig["accessory"]; label: string }> = [
  { key: "none", label: "None" },
  { key: "glasses", label: "Glasses" },
  { key: "mask", label: "Mask" },
  { key: "earring", label: "Earring" },
  { key: "beard", label: "Beard" },
  { key: "moustache", label: "Moustache" },
];

const OUTFITS: Array<{ key: AvatarConfig["outfit"]; label: string }> = [
  { key: "blue-collar", label: "Blue Collar" },
  { key: "yellow-collar", label: "Yellow Collar" },
  { key: "black-top", label: "Black Top" },
  { key: "navy-crew", label: "Navy Crew" },
  { key: "shirt-tie", label: "Shirt & Tie" },
  { key: "polka", label: "Polka Dots" },
  { key: "sweater", label: "Sweater" },
];

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, onAvatarSelect }) => {
  const { profile, updateProfile } = useProfile();

  const [activeTab, setActiveTab] = useState<"presets" | "custom">("presets");
  const [currentConfig, setCurrentConfig] = useState<AvatarConfig>(() =>
    decodeAvatarConfig(profile.avatarId || "av-1")
  );
  const [username, setUsername] = useState(profile.username || "Ayoola");
  const [isSpinning, setIsSpinning] = useState(false);

  if (!isOpen) return null;

  const isTaken = TAKEN_USERNAMES.includes(username.trim().toLowerCase());
  const isValid = username.trim().length >= 2 && !isTaken;

  const handleShuffle = () => {
    setIsSpinning(true);
    const randomized = getRandomAvatarConfig();
    setCurrentConfig(randomized);
    setTimeout(() => setIsSpinning(false), 450);
  };

  const handleSelectPreset = (preset: AvatarConfig) => {
    setCurrentConfig({ ...preset });
  };

  const handleConfirm = () => {
    if (!isValid) return;
    const serialized = encodeAvatarConfig(currentConfig);
    updateProfile(username.trim(), serialized);
    if (onAvatarSelect) {
      onAvatarSelect(serialized);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-card-fade-in">
      <div className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl bg-[#FFFBF7] border border-black/40 shadow-2xl p-6 sm:p-8 text-center text-slate-900 relative space-y-5 overflow-hidden">
        {/* Top Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-black/50 hover:text-black text-xl font-bold cursor-pointer z-10"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-black font-heading text-black">
            ✨ Avatar Studio ✨
          </h2>
          <p className="text-xs sm:text-sm text-black/60 font-medium mt-1">
            Pick a preset or customize your gender-neutral avatar
          </p>
        </div>

        {/* Main Avatar Preview & Shuffle */}
        <div className="flex flex-col items-center justify-center gap-3">
          <div
            className={`p-1 rounded-full border-2 border-black bg-white shadow-md transition-transform duration-300 ${
              isSpinning ? "rotate-[360deg] scale-110" : ""
            }`}
          >
            <Avatar config={currentConfig} size="xl" />
          </div>

          <button
            type="button"
            onClick={handleShuffle}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white hover:bg-orange-50 border border-black/30 text-xs font-black text-black cursor-pointer shadow-2xs transition-all active:scale-95"
          >
            <span className={isSpinning ? "animate-spin inline-block" : ""}>🔀</span>
            <span>Shuffle Look</span>
          </button>
        </div>

        {/* Tabs: Presets vs Custom Studio */}
        <div className="flex justify-center">
          <div className="inline-flex p-1 rounded-2xl bg-black/5 border border-black/15">
            <button
              type="button"
              onClick={() => setActiveTab("presets")}
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === "presets"
                  ? "bg-white text-black shadow-2xs border border-black/20"
                  : "text-black/60 hover:text-black"
              }`}
            >
              Curated Avatars (16)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("custom")}
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === "custom"
                  ? "bg-white text-black shadow-2xs border border-black/20"
                  : "text-black/60 hover:text-black"
              }`}
            >
              Mix & Match 🎨
            </button>
          </div>
        </div>

        {/* Tab Content Container */}
        <div className="flex-1 overflow-y-auto max-h-[300px] pr-1 space-y-4 text-left">
          {activeTab === "presets" ? (
            /* Presets Grid */
            <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-2.5 justify-items-center py-1">
              {AVATAR_LIST.map((av) => {
                const isSelected =
                  currentConfig.hairStyle === av.hairStyle &&
                  currentConfig.accessory === av.accessory &&
                  currentConfig.outfit === av.outfit &&
                  currentConfig.bg === av.bg;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => handleSelectPreset(av)}
                    className={`p-1 rounded-full transition-all cursor-pointer ${
                      isSelected
                        ? "ring-3 ring-[#FF8E37] scale-110 bg-orange-100"
                        : "hover:scale-105 opacity-80 hover:opacity-100"
                    }`}
                  >
                    <Avatar config={av} size="md" />
                  </button>
                );
              })}
            </div>
          ) : (
            /* Mix & Match Studio */
            <div className="space-y-4">
              {/* Background Color Swatches */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-black/80 mb-1.5">
                  Background Color
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {AVATAR_PALETTES.bg.map((color) => {
                    const isSelected = currentConfig.bg === color;
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setCurrentConfig((prev) => ({ ...prev, bg: color }))}
                        className={`w-7 h-7 rounded-full border-2 border-black transition-all cursor-pointer ${
                          isSelected ? "ring-2 ring-black scale-115" : "hover:scale-110"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Hairstyle Chips */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-black/80 mb-1.5">
                  Hairstyle
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {HAIR_STYLES.map((h) => {
                    const isSelected = currentConfig.hairStyle === h.key;
                    return (
                      <button
                        key={h.key}
                        type="button"
                        onClick={() =>
                          setCurrentConfig((prev) => ({ ...prev, hairStyle: h.key }))
                        }
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer truncate ${
                          isSelected
                            ? "bg-[#FF8E37] text-black border-black font-black shadow-2xs"
                            : "bg-white text-black/80 border-black/20 hover:bg-slate-50"
                        }`}
                      >
                        {h.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Accessories */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-black/80 mb-1.5">
                  Accessory
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {ACCESSORIES.map((acc) => {
                    const isSelected = currentConfig.accessory === acc.key;
                    return (
                      <button
                        key={acc.key}
                        type="button"
                        onClick={() =>
                          setCurrentConfig((prev) => ({ ...prev, accessory: acc.key }))
                        }
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer truncate ${
                          isSelected
                            ? "bg-[#FF8E37] text-black border-black font-black shadow-2xs"
                            : "bg-white text-black/80 border-black/20 hover:bg-slate-50"
                        }`}
                      >
                        {acc.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Outfits */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-black/80 mb-1.5">
                  Outfit
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {OUTFITS.map((outfit) => {
                    const isSelected = currentConfig.outfit === outfit.key;
                    return (
                      <button
                        key={outfit.key}
                        type="button"
                        onClick={() =>
                          setCurrentConfig((prev) => ({ ...prev, outfit: outfit.key }))
                        }
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer truncate ${
                          isSelected
                            ? "bg-[#FF8E37] text-black border-black font-black shadow-2xs"
                            : "bg-white text-black/80 border-black/20 hover:bg-slate-50"
                        }`}
                      >
                        {outfit.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Username Input Field */}
        <div className="text-left space-y-1">
          <label className="block text-[11px] font-black uppercase tracking-wider text-black">
            YOUR NAME
          </label>
          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name"
              className={`w-full bg-white border rounded-2xl px-4 py-2.5 text-sm text-black font-medium focus:outline-none transition-colors ${
                isTaken
                  ? "border-red-500 focus:border-red-500"
                  : "border-black/30 focus:border-[#FF8E37]"
              }`}
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-bold">
              {isTaken ? (
                <span className="text-red-500">✕</span>
              ) : username.trim().length >= 2 ? (
                <span className="text-emerald-500">✓</span>
              ) : null}
            </div>
          </div>
          {isTaken && (
            <div className="text-xs text-red-500 font-bold">Username already taken</div>
          )}
        </div>

        {/* Confirm Action Button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!isValid}
            className="w-full py-3.5 bg-[#FF8E37] hover:bg-[#EA580C] disabled:opacity-50 text-black font-heading font-black text-base border-[2px_4px_4px_2px] border-black rounded-2xl shadow-xs active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          >
            Apply Avatar
          </button>
        </div>
      </div>
    </div>
  );
};
