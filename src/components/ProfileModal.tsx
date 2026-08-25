// src/components/ProfileModal.tsx
import React, { useState } from "react";
import { Avatar, AVATAR_LIST } from "./Avatar";
import { useProfile } from "../contexts/ProfileContext";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TAKEN_USERNAMES = ["dodge_inSync", "admin", "nitro", "host", "taken_user"];

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { profile, updateProfile } = useProfile();
  const [selectedAvatarId, setSelectedAvatarId] = useState(profile.avatarId || "av-1");
  const [username, setUsername] = useState(profile.username || "ayus_insync");

  if (!isOpen) return null;

  const isTaken = TAKEN_USERNAMES.includes(username.trim().toLowerCase());
  const isValid = username.trim().length >= 3 && !isTaken;

  const handleConfirm = () => {
    if (!isValid) return;
    updateProfile(username.trim(), selectedAvatarId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-card-fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-[#16162a] border border-[#2a2656] shadow-2xl p-6 text-center text-white relative">
        {/* Top Selected Avatar Preview */}
        <div className="mb-4 flex justify-center">
          <div className="p-1 rounded-full border-2 border-[#7c3aed] glow-purple bg-[#0c0d1e]">
            <Avatar id={selectedAvatarId} size="xl" />
          </div>
        </div>

        <h2 className="text-2xl font-bold font-heading mb-1 text-white">Set up your profile</h2>
        <p className="text-xs text-gray-400 mb-6">Pick an avatar and a username</p>

        {/* Choose Avatar Section */}
        <div className="mb-6">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3 text-left">
            CHOOSE AN AVATAR
          </div>
          <div className="grid grid-cols-5 gap-2 justify-items-center">
            {AVATAR_LIST.map((av) => {
              const isSelected = selectedAvatarId === av.id;
              return (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => setSelectedAvatarId(av.id)}
                  className={`p-1 rounded-full transition-all cursor-pointer ${
                    isSelected
                      ? "ring-2 ring-[#17e8c3] scale-110 bg-[#17e8c3]/20"
                      : "hover:scale-105 opacity-80 hover:opacity-100"
                  }`}
                >
                  <Avatar id={av.id} size="md" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Username Input Section */}
        <div className="mb-6 text-left">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
            USERNAME
          </label>
          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className={`w-full bg-[#0d0d1a] border rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none transition-colors ${
                isTaken
                  ? "border-red-500/80 focus:border-red-500"
                  : "border-[#2a2656] focus:border-[#7c3aed]"
              }`}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold">
              {isTaken ? (
                <span className="text-red-500">✕</span>
              ) : username.trim().length >= 3 ? (
                <span className="text-emerald-400">✓</span>
              ) : null}
            </div>
          </div>

          {/* Validation Message */}
          <div className="mt-2 text-xs font-medium">
            {isTaken ? (
              <span className="text-red-400 flex items-center gap-1">
                <span>✕</span> Username already taken
              </span>
            ) : username.trim().length >= 3 ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <span>✓</span> Username available
              </span>
            ) : (
              <span className="text-gray-400">Must be at least 3 characters</span>
            )}
          </div>
        </div>

        {/* Confirm Button */}
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!isValid}
          className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all cursor-pointer shadow-lg ${
            isValid
              ? "bg-[#7c3aed] hover:bg-[#6d28d9] text-white active:scale-98 glow-purple"
              : "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700"
          }`}
        >
          Confirm & Continue
        </button>
      </div>
    </div>
  );
};
