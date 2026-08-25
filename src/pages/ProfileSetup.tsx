// src/pages/ProfileSetup.tsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useProfile } from "../contexts/ProfileContext";
import { Avatar } from "../components/Avatar";
import { ProfileModal } from "../components/ProfileModal";

interface LocationState {
  roomCode?: string;
  playerName?: string;
}

const CATCHPHRASES = [
  "Here for the W 😼",
  "Probably the smartest 😒",
  "Tis I, the winner 😁",
  "Ready and prepared 🤫",
  "First time energy 😃",
  "Locked in 🤐",
];

const ProfileSetup: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const { profile, setProfile } = useProfile();

  const [selectedCatchphrase, setSelectedCatchphrase] = useState("Probably the smartest 😒");
  const [customCatchphrase, setCustomCatchphrase] = useState("");
  const [showAvatarPickerModal, setShowAvatarPickerModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const username = state?.playerName || profile.username || "Ayoola";
  const activeCatchphrase = customCatchphrase.trim() || selectedCatchphrase;

  const handleJoinLobby = () => {
    setIsSaving(true);
    setProfile({ username });

    setTimeout(() => {
      navigate("/lobby", {
        state: {
          roomCode: state?.roomCode || "6WEFAJ",
          playerId: "player_" + Date.now(),
          isHost: false,
          playerName: username,
          catchphrase: activeCatchphrase,
        },
      });
    }, 1500);
  };

  /* ------------------------------------------------------------------ */
  /* Render Mode: "Saving your identity..." Loading Screen (Image Match) */
  /* ------------------------------------------------------------------ */
  if (isSaving) {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex flex-col items-center justify-center p-6 select-none relative overflow-hidden">
        {/* Background Food & Drink Line-Art Doodles matching Screenshot EXACTLY */}
        <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
          {/* Burger */}
          <svg className="absolute top-10 left-12 w-20 h-20 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M6 10a6 6 0 0 1 12 0v1H6v-1z"/>
            <path d="M3 13h18"/>
            <path d="M5 20h14a2 2 0 0 0 2-2v-1H3v1a2 2 0 0 0 2 2z"/>
          </svg>

          {/* Drink with straw */}
          <svg className="absolute top-12 left-[35%] w-16 h-20 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M6 8l1.5 12a2 2 0 0 0 2 2h5a2 2 0 0 0 2-2L18 8"/>
            <line x1="12" y1="2" x2="16" y2="8"/>
          </svg>

          {/* Ramen Bowl with chopsticks */}
          <svg className="absolute top-10 left-[60%] w-20 h-20 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M3 12h18a9 9 0 0 1-18 0z"/>
            <line x1="16" y1="3" x2="10" y2="12"/>
            <line x1="20" y1="3" x2="12" y2="12"/>
          </svg>

          {/* Pizza */}
          <svg className="absolute top-12 right-16 w-24 h-24 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M15 11l-3 3M12 4L3 20h18L12 4z"/>
            <circle cx="10" cy="14" r="1.5" fill="currentColor"/>
          </svg>

          {/* Cloche */}
          <svg className="absolute top-[35%] left-16 w-20 h-20 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M12 4a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
            <path d="M4 18h16a1 1 0 0 0 1-1A9 9 0 0 0 3 17a1 1 0 0 0 1 1z"/>
          </svg>

          {/* Cupcake */}
          <svg className="absolute top-[36%] right-20 w-20 h-20 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M5 11l2 10h10l2-10"/>
            <path d="M4 11c0-2 2-3 4-3s3 1 4 3c1-2 2-3 4-3s4 1 4 3"/>
          </svg>

          {/* Coffee Cup */}
          <svg className="absolute top-[60%] left-20 w-20 h-20 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M18 8h1a4 4 0 1 1 0 8h-1"/>
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
          </svg>

          {/* Fork & Knife */}
          <svg className="absolute top-[60%] right-20 w-16 h-24 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M6 2v6a3 3 0 0 0 6 0V2"/>
            <line x1="9" y1="11" x2="9" y2="22"/>
            <path d="M18 2v8a4 4 0 0 1-4 4v8"/>
          </svg>

          {/* Chef Hat */}
          <svg className="absolute bottom-10 left-16 w-20 h-20 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M6 14h12v4a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-4z"/>
          </svg>

          {/* Coffee to go */}
          <svg className="absolute bottom-10 right-20 w-16 h-20 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M6 8l1.5 12a2 2 0 0 0 2 2h5a2 2 0 0 0 2-2L18 8"/>
            <rect x="4" y="4" width="16" height="4" rx="1"/>
          </svg>
        </div>

        {/* Center Orange Avatar Icon & Title matching Screenshot EXACTLY */}
        <div className="relative z-10 flex flex-col items-center animate-card-fade-in">
          <div className="w-20 h-20 rounded-full bg-[#f97316] flex items-center justify-center text-4xl shadow-md mb-4 animate-pulse">
            🦊
          </div>
          <h2 className="font-heading font-extrabold text-xl text-black">
            Saving your identity...
          </h2>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /* Main Profile Setup Form View                                      */
  /* ------------------------------------------------------------------ */
  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 flex items-center justify-center p-6 select-none relative overflow-hidden">
      {/* Background Line-Art Food & Drink Doodles */}
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
        <svg className="absolute top-10 left-12 w-20 h-20 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M6 10a6 6 0 0 1 12 0v1H6v-1z"/>
          <path d="M3 13h18"/>
          <path d="M5 20h14a2 2 0 0 0 2-2v-1H3v1a2 2 0 0 0 2 2z"/>
        </svg>

        <svg className="absolute top-12 right-16 w-24 h-24 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M15 11l-3 3M12 4L3 20h18L12 4z"/>
          <circle cx="10" cy="14" r="1.5" fill="currentColor"/>
        </svg>

        <svg className="absolute top-[35%] left-16 w-20 h-20 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M12 4a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
          <path d="M4 18h16a1 1 0 0 0 1-1A9 9 0 0 0 3 17a1 1 0 0 0 1 1z"/>
        </svg>

        <svg className="absolute top-[36%] right-20 w-20 h-20 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M5 11l2 10h10l2-10"/>
        </svg>

        <svg className="absolute top-[60%] left-20 w-20 h-20 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M18 8h1a4 4 0 1 1 0 8h-1"/>
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
        </svg>

        <svg className="absolute bottom-10 left-16 w-20 h-20 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M6 14h12v4a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-4z"/>
        </svg>
      </div>

      {/* Top Left Back Arrow */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 text-slate-800 hover:text-black text-xl font-bold cursor-pointer z-20"
      >
        ←
      </button>

      {/* Main Center Profile Setup Card matching Screenshot EXACTLY */}
      <div className="w-full max-w-md rounded-3xl bg-[#fffdfa] border border-slate-300 p-8 shadow-xl relative text-center z-10">
        {/* Top Profile Avatar & Name Preview */}
        <div className="mb-4 flex items-center justify-center gap-4">
          <div className="p-1 rounded-full border-2 border-black bg-white">
            <Avatar id={profile.avatarId || "av-1"} size="xl" />
          </div>
          <div className="text-left">
            <h2 className="font-heading font-extrabold text-xl text-black">
              {username}
            </h2>
            <div className="text-xs text-slate-700 font-medium italic">
              “{activeCatchphrase}”
            </div>
          </div>
        </div>

        {/* Choose Your Avatar Button */}
        <button
          type="button"
          onClick={() => setShowAvatarPickerModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 border border-slate-300 text-slate-800 font-bold text-xs mb-6 cursor-pointer transition-colors"
        >
          <span>👤</span> Choose Your Avatar
        </button>

        {/* PICK A CATCHPHRASE Section matching Screenshot */}
        <div className="mb-6 text-left">
          <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">
            PICK A CATCHPHRASE
          </label>
          <div className="grid grid-cols-2 gap-2">
            {CATCHPHRASES.map((phrase) => {
              const isSelected = selectedCatchphrase === phrase && !customCatchphrase;
              return (
                <button
                  key={phrase}
                  type="button"
                  onClick={() => {
                    setSelectedCatchphrase(phrase);
                    setCustomCatchphrase("");
                  }}
                  className={`px-3 py-2 rounded-xl border text-[11px] font-bold transition-all cursor-pointer truncate ${
                    isSelected
                      ? "bg-[#f97316] text-black border-2 border-black shadow-xs font-extrabold"
                      : "bg-white text-slate-800 border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {phrase}
                </button>
              );
            })}
          </div>
        </div>

        {/* OR WRITE YOUR OWN (0 / 25) Section */}
        <div className="mb-8 text-left">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              OR WRITE YOUR OWN
            </label>
            <span className="text-[10px] text-slate-400 font-bold">
              ({customCatchphrase.length} / 25)
            </span>
          </div>
          <input
            type="text"
            maxLength={25}
            value={customCatchphrase}
            onChange={(e) => setCustomCatchphrase(e.target.value)}
            placeholder="Say something clever..."
            className="w-full bg-white border border-slate-300 focus:border-[#f97316] rounded-2xl px-4 py-3 text-sm text-black font-semibold focus:outline-none transition-colors"
          />
        </div>

        {/* Join Lobby Action Button matching Screenshot EXACTLY */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleJoinLobby}
            className="px-8 py-3.5 rounded-2xl bg-[#f97316] hover:bg-[#ea580c] text-black font-extrabold text-sm border-2 border-black shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex items-center gap-2"
          >
            Join Lobby ➔
          </button>
        </div>
      </div>

      {/* Avatar Picker Modal */}
      <ProfileModal
        isOpen={showAvatarPickerModal}
        onClose={() => setShowAvatarPickerModal(false)}
      />
    </div>
  );
};

export default ProfileSetup;
