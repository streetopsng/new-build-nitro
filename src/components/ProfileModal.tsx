import React, { useState } from "react";
import { Avatar, AVATAR_IDS, getRandomAvatarId } from "./Avatar";
import { useProfile } from "../contexts/ProfileContext";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAvatarSelect?: (avatarId: string) => void;
}

const TAKEN_USERNAMES = ["dodge_insync", "admin", "nitro", "host", "taken_user"];

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, onAvatarSelect }) => {
  const { profile, updateProfile } = useProfile();

  const [selectedAvatarId, setSelectedAvatarId] = useState(profile.avatarId || "av-1");
  const [username, setUsername] = useState(profile.username || "Ayoola");
  const [isSpinning, setIsSpinning] = useState(false);

  if (!isOpen) return null;

  const isTaken = TAKEN_USERNAMES.includes(username.trim().toLowerCase());
  const isValid = username.trim().length >= 2 && !isTaken;

  const handleShuffle = () => {
    setIsSpinning(true);
    setSelectedAvatarId(getRandomAvatarId());
    setTimeout(() => setIsSpinning(false), 450);
  };

  const handleConfirm = () => {
    if (!isValid) return;
    updateProfile(username.trim(), selectedAvatarId);
    if (onAvatarSelect) {
      onAvatarSelect(selectedAvatarId);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-card-fade-in">
      <div className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl bg-[#FFFBF7] border border-black/40 shadow-2xl p-6 sm:p-8 text-center text-slate-900 relative space-y-5 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-black/50 hover:text-black text-xl font-bold cursor-pointer z-10"
        >
          ✕
        </button>

        <div>
          <h2 className="text-2xl sm:text-3xl font-black font-heading text-black">
            ✨ Avatar Studio ✨
          </h2>
          <p className="text-xs sm:text-sm text-black/60 font-medium mt-1">
            Pick your GummyGum avatar
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-3">
          <div
            className={`p-1 rounded-full border-2 border-black bg-white shadow-md transition-transform duration-300 ${
              isSpinning ? "rotate-[360deg] scale-110" : ""
            }`}
          >
            <Avatar id={selectedAvatarId} size="xl" />
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

        <div className="flex-1 overflow-y-auto max-h-[340px] pr-1 py-1">
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 justify-items-center">
            {AVATAR_IDS.map((avId) => {
              const isSelected = selectedAvatarId === avId;
              return (
                <button
                  key={avId}
                  type="button"
                  onClick={() => setSelectedAvatarId(avId)}
                  className={`p-1 rounded-full transition-all cursor-pointer ${
                    isSelected
                      ? "ring-3 ring-[#FF8E37] scale-110 bg-orange-100"
                      : "hover:scale-105 opacity-80 hover:opacity-100"
                  }`}
                >
                  <Avatar id={avId} size="md" />
                </button>
              );
            })}
          </div>
        </div>

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
