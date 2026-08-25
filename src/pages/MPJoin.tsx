// src/pages/MPJoin.tsx
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ref, get, update } from "firebase/database";
import { db } from "../lib/firebase";
import { useProfile } from "../contexts/ProfileContext";
import { JoiningLobby } from "../components/JoiningLobby";
import { ProfileModal } from "../components/ProfileModal";

const MPJoin: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();

  const [codeDigits, setCodeDigits] = useState<string[]>(["6", "W", "E", "F", "A", "J"]);
  const [displayName, setDisplayName] = useState(profile.username || "Game_master");
  const [isJoining, setIsJoining] = useState(false);
  const [isLockedModalOpen, setIsLockedModalOpen] = useState(false);
  const [showProfileSetupModal, setShowProfileSetupModal] = useState(false);
  const [error, setError] = useState("");

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleDigitChange = (index: number, value: string) => {
    const val = value.toUpperCase().slice(-1);
    const newDigits = [...codeDigits];
    newDigits[index] = val;
    setCodeDigits(newDigits);

    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !codeDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleJoinOrProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = codeDigits.join("").trim().toUpperCase();
    if (fullCode.length < 6 || !displayName.trim()) {
      setError("Please enter a 6-character room code and a display name.");
      return;
    }

    // Open profile modal setup or proceed directly to join
    if (!profile.isProfileSet) {
      setShowProfileSetupModal(true);
      return;
    }

    proceedJoin(fullCode);
  };

  const proceedJoin = async (fullCode: string) => {
    setError("");
    setIsJoining(true);

    try {
      const roomRef = ref(db, `rooms/${fullCode}`);
      const snapshot = await get(roomRef);

      if (!snapshot.exists()) {
        setError("Room not found. Check your 6-character code!");
        setIsJoining(false);
        return;
      }

      const room = snapshot.val();

      if (room.locked) {
        setIsJoining(false);
        setIsLockedModalOpen(true);
        return;
      }

      const playerId = "player_" + Date.now();

      await update(ref(db, `rooms/${fullCode}/players/${playerId}`), {
        id: playerId,
        name: displayName.trim(),
        avatarId: profile.avatarId,
        score: 0,
        ready: true,
        isHost: false,
      });

      setTimeout(() => {
        navigate("/lobby", {
          state: {
            roomCode: fullCode,
            playerId,
            isHost: false,
            playerName: displayName.trim(),
            lobbyName: room.name || "Onboarding Lobby",
          },
        });
      }, 1200);
    } catch (err) {
      console.error("Failed to join room:", err);
      setError("Error connecting to room.");
      setIsJoining(false);
    }
  };

  if (isJoining) {
    return <JoiningLobby message="Joining the lobby..." />;
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 flex items-center justify-center p-6 select-none relative overflow-hidden">
      {/* Background Line-Art Food & Drink Doodles matching Screenshot EXACTLY */}
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
        {/* Burger (Top Left) */}
        <svg className="absolute top-10 left-12 w-20 h-20 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M6 10a6 6 0 0 1 12 0v1H6v-1z"/>
          <path d="M3 13h18"/>
          <path d="M3 17h18"/>
          <path d="M5 20h14a2 2 0 0 0 2-2v-1H3v1a2 2 0 0 0 2 2z"/>
        </svg>

        {/* Pizza Slice (Top Right) */}
        <svg className="absolute top-12 right-16 w-24 h-24 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M15 11l-3 3M12 4L3 20h18L12 4z"/>
          <circle cx="10" cy="14" r="1.5" fill="currentColor"/>
          <circle cx="15" cy="16" r="1.5" fill="currentColor"/>
        </svg>

        {/* Serving Cloche (Mid Left) */}
        <svg className="absolute top-[35%] left-16 w-20 h-20 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M12 4a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
          <path d="M4 18h16a1 1 0 0 0 1-1A9 9 0 0 0 3 17a1 1 0 0 0 1 1z"/>
          <path d="M2 20h20"/>
        </svg>

        {/* Cupcake (Mid Right) */}
        <svg className="absolute top-[36%] right-20 w-20 h-20 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M5 11l2 10h10l2-10"/>
          <path d="M4 11c0-2 2-3 4-3s3 1 4 3c1-2 2-3 4-3s4 1 4 3"/>
          <circle cx="12" cy="5" r="2" fill="currentColor"/>
        </svg>

        {/* Coffee Cup (Lower Mid Left) */}
        <svg className="absolute top-[60%] left-20 w-20 h-20 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M18 8h1a4 4 0 1 1 0 8h-1"/>
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
          <line x1="6" y1="2" x2="6" y2="4"/>
          <line x1="10" y1="2" x2="10" y2="4"/>
          <line x1="14" y1="2" x2="14" y2="4"/>
        </svg>

        {/* Fork & Knife (Lower Mid Right) */}
        <svg className="absolute top-[60%] right-20 w-16 h-24 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M6 2v6a3 3 0 0 0 6 0V2"/>
          <line x1="9" y1="11" x2="9" y2="22"/>
          <path d="M18 2v8a4 4 0 0 1-4 4v8"/>
        </svg>

        {/* Chef Hat (Bottom Left) */}
        <svg className="absolute bottom-10 left-16 w-20 h-20 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M6 14h12v4a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-4z"/>
          <path d="M6 14a4 4 0 1 1 2-7.5 5 5 0 0 1 8 0 4 4 0 1 1 2 7.5"/>
        </svg>

        {/* Apple (Bottom Mid) */}
        <svg className="absolute bottom-10 left-[42%] w-20 h-20 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M12 2c1 1 1 3 0 4"/>
          <path d="M12 6c-3.5 0-6 2.5-6 6a6 6 0 0 0 10.5 4c1-1 1.5-2.5 1.5-4 0-3.5-2.5-6-6-6z"/>
        </svg>

        {/* Coffee Cup to Go (Bottom Right) */}
        <svg className="absolute bottom-10 right-20 w-16 h-20 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M6 8l1.5 12a2 2 0 0 0 2 2h5a2 2 0 0 0 2-2L18 8"/>
          <rect x="4" y="4" width="16" height="4" rx="1"/>
        </svg>
      </div>

      {/* Top Left Close Button */}
      <button
        onClick={() => navigate("/mp-entry")}
        className="absolute top-6 left-6 text-slate-400 hover:text-black text-xl cursor-pointer z-20"
      >
        ✕
      </button>

      {/* Main Center Modal Card matching Screenshot EXACTLY */}
      <div className="w-full max-w-md rounded-3xl bg-[#fffdfa] border border-slate-300 p-8 shadow-xl relative text-left z-10">
        <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">
          ENTER LOBBY
        </div>
        <h1 className="font-heading font-extrabold text-2xl text-black mb-6">
          Join your team
        </h1>

        <form onSubmit={handleJoinOrProfile} className="space-y-6">
          {/* LOBBY CODE Section with 6 Square Digits */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">
              LOBBY CODE
            </label>
            <div className="grid grid-cols-6 gap-2">
              {codeDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { inputRefs.current[idx] = el; }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-full h-12 rounded-xl bg-white border border-slate-300 focus:border-black font-mono font-extrabold text-lg text-center text-black uppercase focus:outline-none shadow-xs transition-colors"
                />
              ))}
            </div>
          </div>

          {/* DISPLAY NAME FOR THIS SESSION Section */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">
              DISPLAY NAME FOR THIS SESSION
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="eg. Game_master"
              className="w-full bg-white border border-slate-300 focus:border-[#f97316] rounded-2xl px-4 py-3 text-sm text-black font-semibold focus:outline-none transition-colors"
            />
          </div>

          {error && (
            <div className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5 text-center">
              {error}
            </div>
          )}

          {/* Action Button matching Screenshot EXACTLY */}
          <div className="flex justify-center pt-2">
            <button
              type="submit"
              className="px-8 py-3.5 rounded-2xl bg-[#f97316] hover:bg-[#ea580c] text-black font-extrabold text-sm border-2 border-black shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
            >
              Set up profile
            </button>
          </div>
        </form>
      </div>

      {/* Locked Lobby Modal */}
      {isLockedModalOpen && (
        <div
          onClick={() => setIsLockedModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-card-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-[#71717a] border border-slate-600 p-6 text-center text-white shadow-2xl"
          >
            <div className="w-14 h-14 rounded-full bg-pink-400/30 text-pink-400 border border-pink-400/40 flex items-center justify-center text-2xl mx-auto mb-4">
              🔒
            </div>
            <h3 className="font-heading font-extrabold text-xl mb-2 text-white">
              This lobby is locked
            </h3>
            <p className="text-xs text-slate-200 leading-relaxed max-w-xs mx-auto mb-4">
              Host has closed new joins for this session. Check with your Admin contact if you think this is a mistake.
            </p>
            <button
              onClick={() => setIsLockedModalOpen(false)}
              className="px-6 py-2.5 rounded-xl bg-black text-white font-bold text-xs hover:bg-slate-900 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Profile Setup Modal */}
      <ProfileModal
        isOpen={showProfileSetupModal}
        onClose={() => {
          setShowProfileSetupModal(false);
          proceedJoin(codeDigits.join("").trim().toUpperCase());
        }}
      />
    </div>
  );
};

export default MPJoin;
