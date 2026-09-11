// src/pages/MPJoin.tsx
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ref, get } from "firebase/database";
import { db } from "../lib/firebase";
import { useProfile } from "../contexts/ProfileContext";
import { JoiningLobby } from "../components/JoiningLobby";

const MPJoin: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();

  const [codeDigits, setCodeDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [displayName, setDisplayName] = useState(profile.username || "");
  const [isJoining, setIsJoining] = useState(false);
  const [isLockedModalOpen, setIsLockedModalOpen] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = codeDigits.join("").trim().toUpperCase();
    if (fullCode.length < 6) {
      setError("Please enter all 6 characters of the room code.");
      return;
    }
    if (!displayName.trim()) {
      setError("Please enter a display name for this session.");
      return;
    }

    setIsJoining(true);
    setError("");

    try {
      const roomRef = ref(db, `rooms/${fullCode}`);
      const snapshot = await get(roomRef);
      if (snapshot.exists()) {
        const room = snapshot.val();
        if (room.locked) {
          setIsJoining(false);
          setIsLockedModalOpen(true);
          return;
        }
      }
    } catch (err) {
      console.warn("Could not check room status on Firebase:", err);
    }
    setIsJoining(false);

    // Go to profile avatar & catchphrase setup first
    navigate("/profile-setup", {
      state: {
        roomCode: fullCode,
        playerName: displayName.trim(),
      },
    });
  };

  if (isJoining) {
    return <JoiningLobby message="Joining the lobby..." />;
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center p-4 md:p-10 select-none relative overflow-x-hidden">
      {/* Top Left Close Icon matching Figma */}
      <button
        onClick={() => navigate("/home")}
        className="absolute top-6 left-6 text-black/60 hover:text-black text-2xl font-bold cursor-pointer z-20"
      >
        ✕
      </button>

      {/* Main Center Modal Container matching Figma #1494:3626 */}
      <div className="w-full max-w-xl bg-[#FFFBF7] border border-black/50 rounded-3xl p-8 md:p-12 shadow-sm relative text-left space-y-8 z-10 animate-card-fade-in">
        {/* Header */}
        <div className="space-y-1">
          <div className="text-xs md:text-sm font-semibold uppercase tracking-wider text-black/50">
            ENTER LOBBY
          </div>
          <h1 className="font-heading font-black text-2xl md:text-3xl text-black">
            Join your team
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* LOBBY CODE with 6 Individual 70x70 Boxes matching Figma #1494:3596 */}
          <div className="space-y-3">
            <label className="block text-xs md:text-sm font-black uppercase tracking-wider text-black">
              LOBBY CODE
            </label>
            <div className="flex items-center justify-between gap-2 sm:gap-3">
              {codeDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { inputRefs.current[idx] = el; }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  placeholder="•"
                  className="w-12 h-14 sm:w-16 sm:h-18 rounded-xl bg-white border-2 border-black/30 focus:border-[#FF8E37] font-mono font-black text-2xl sm:text-3xl text-center text-black uppercase focus:outline-none transition-all shadow-xs"
                />
              ))}
            </div>
          </div>

          {/* DISPLAY NAME FOR THIS SESSION matching Figma #1494:3617 */}
          <div className="space-y-3">
            <label className="block text-xs md:text-sm font-black uppercase tracking-wider text-black">
              DISPLAY NAME FOR THIS SESSION
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="eg. Game_master"
              className="w-full h-14 md:h-16 px-5 rounded-2xl bg-white border border-black/40 focus:border-[#FF8E37] focus:outline-none text-base md:text-lg font-medium text-black transition-colors"
            />
          </div>

          {error && (
            <div className="text-sm font-bold text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 text-center">
              {error}
            </div>
          )}

          {/* Action Button matching Figma #1494:3618 */}
          <div className="flex justify-center pt-2">
            <button
              type="submit"
              className="w-full sm:w-auto px-10 py-4 bg-[#FF8E37] hover:bg-[#EA580C] text-black font-heading font-black text-xl border-[2px_5px_5px_2px] border-black rounded-2xl shadow-xs active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer text-center"
            >
              Set up profile
            </button>
          </div>
        </form>
      </div>

      {/* Locked Lobby Modal matching Figma #1494:3627 */}
      {isLockedModalOpen && (
        <div
          onClick={() => setIsLockedModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-card-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-white border border-black/40 p-8 text-center text-slate-900 shadow-2xl space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-orange-100 text-[#FF8E37] flex items-center justify-center text-3xl mx-auto">
              🔒
            </div>
            <h3 className="font-heading font-black text-2xl text-black">
              This lobby is locked
            </h3>
            <p className="text-sm text-black/60 leading-relaxed">
              Host has closed new joins for this session. Check with your Admin contact if you think this is a mistake.
            </p>
            <button
              onClick={() => setIsLockedModalOpen(false)}
              className="w-full py-3 rounded-2xl bg-black text-white font-bold text-sm cursor-pointer hover:bg-slate-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MPJoin;
