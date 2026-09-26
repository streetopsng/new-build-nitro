import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useProfile } from "../contexts/ProfileContext";
import { useGummyGum } from "../contexts/GummyGumContext";
import { Avatar, getRandomAvatarId } from "../components/Avatar";
import { ProfileModal } from "../components/ProfileModal";
import { ref, update } from "firebase/database";
import { db } from "../lib/firebase";

interface LocationState {
  roomCode?: string;
  playerName?: string;
  playerId?: string;
  carriedScore?: number;
  email?: string | null;
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
  const { profile, updateProfile } = useProfile();
  const { ggSession } = useGummyGum();

  const [avatarId, setAvatarId] = useState(profile.avatarId || "av-1");
  const [isShuffling, setIsShuffling] = useState(false);

  const [playerName, setPlayerName] = useState(
    state?.playerName || ggSession?.player?.name || profile.username || ""
  );
  const [selectedCatchphrase, setSelectedCatchphrase] = useState(
    profile.catchphrase || "Probably the smartest 😒"
  );
  const [customCatchphrase, setCustomCatchphrase] = useState("");
  const [showAvatarPickerModal, setShowAvatarPickerModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const activeCatchphrase = customCatchphrase.trim() || selectedCatchphrase;

  const email = (state?.email || "").toLowerCase().trim();

  // Sync initial avatar from profile or localStorage for this email
  useEffect(() => {
    if (profile.avatarId) {
      setAvatarId(profile.avatarId);
    } else if (email) {
      const savedAv = localStorage.getItem(`nitro_avatar_${email}`);
      if (savedAv) setAvatarId(savedAv);
      const savedName = localStorage.getItem(`nitro_name_${email}`);
      if (savedName && !state?.playerName) setPlayerName(savedName);
    }
  }, [profile.avatarId, email, state?.playerName]);

  // Shuffle Avatar generator action matching Figma #1586:3066
  const handleShuffle = () => {
    setIsShuffling(true);
    setAvatarId(getRandomAvatarId());
    setTimeout(() => {
      setIsShuffling(false);
    }, 400);
  };

  const handleJoinLobby = async () => {
    setIsSaving(true);
    const finalName = playerName.trim() || ggSession?.player?.name || "Player";
    updateProfile(finalName, avatarId, activeCatchphrase);

    const roomCode = state?.roomCode || "DEMO01";
    const playerId = state?.playerId || "player_" + Date.now();

    if (email) {
      localStorage.setItem(`nitro_avatar_${email}`, avatarId);
      localStorage.setItem(`nitro_name_${email}`, finalName);
      if (roomCode) {
        localStorage.setItem(`nitro_joined_${roomCode}_${email}`, "true");
        localStorage.setItem(`nitro_player_id_${roomCode}_${email}`, playerId);
      }
    }

    try {
      if (state?.roomCode) {
        await update(ref(db, `rooms/${roomCode}/players/${playerId}`), {
          id: playerId,
          name: finalName,
          email: state?.email || null,
          avatarId,
          score: state?.carriedScore || 0,
          ready: true,
          isHost: false,
          catchphrase: activeCatchphrase,
        });
      }
    } catch (err) {
      console.warn("Could not save to Firebase, continuing locally:", err);
    }

    setTimeout(() => {
      navigate("/lobby", {
        state: {
          roomCode,
          playerId,
          isHost: false,
          playerName: finalName,
          catchphrase: activeCatchphrase,
          avatarId,
          email: state?.email || null,
        },
      });
    }, 1500);
  };

  // Step 2: Saving / Identity Transition Screen from node #1586:3066
  if (isSaving) {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex flex-col items-center justify-center p-6 select-none relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 animate-bounce text-2xl opacity-60">
          🎨
        </div>
        <div className="absolute bottom-1/3 right-1/4 animate-pulse text-2xl opacity-60">
          ✨
        </div>
        <div className="absolute top-1/3 right-1/3 animate-bounce text-2xl opacity-60 delay-150">
          👓
        </div>

        <div className="relative z-10 flex flex-col items-center space-y-5 text-center animate-card-fade-in max-w-md">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-[#FF8E37]/30 animate-ping" />
            <div className="relative p-1.5 rounded-full bg-white border-2 border-black shadow-lg">
              <Avatar id={avatarId} size="xl" />
            </div>
          </div>

          <div className="space-y-1.5">
            <h2 className="font-heading font-black text-2xl md:text-3xl text-black">
              Preparing your session identity...
            </h2>
            <p className="text-sm font-medium text-black/60">
              Creating something awesome...
            </p>
          </div>

          <div className="w-56 h-3 bg-slate-100 border border-black/20 rounded-full overflow-hidden p-0.5">
            <div className="h-full bg-[#FF8E37] animate-pulse-progress rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center p-4 md:p-10 select-none relative overflow-x-hidden">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 text-black/60 hover:text-black text-2xl font-bold cursor-pointer z-20"
        title="Back"
      >
        ←
      </button>

      <div className="w-full max-w-xl bg-[#FFFBF7] border border-black/50 rounded-3xl p-6 sm:p-10 shadow-sm relative text-center space-y-7 z-10 animate-card-fade-in">
        {/* Title Header matching node 1586:3066 */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF8E37]/15 border border-[#FF8E37]/40 text-[11px] font-black uppercase tracking-wider text-black">
            <span>✨</span> Session Identity <span>✨</span>
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-black pt-1">
            Your Session Avatar
          </h1>
          <p className="text-xs sm:text-sm text-black/60 font-medium">
            Randomly generated gender-neutral avatar for your game room
          </p>
        </div>

        <div className="flex flex-col items-center justify-center space-y-3">
          <div
            className={`p-1.5 rounded-full border-3 border-black bg-white shadow-md transition-all duration-300 ${
              isShuffling ? "rotate-[360deg] scale-110" : "hover:scale-105"
            }`}
          >
            <Avatar id={avatarId} size="2xl" />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleShuffle}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#FF8E37] hover:bg-[#EA580C] text-black font-heading font-black text-sm border-2 border-black shadow-2xs active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              <span className={isShuffling ? "animate-spin inline-block" : ""}>🔀</span>
              <span>Shuffle Avatar</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAvatarPickerModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-black font-bold text-sm border border-black/30 shadow-2xs transition-all cursor-pointer"
            >
              <span>🎨</span>
              <span>Customize</span>
            </button>
          </div>
        </div>

        <div className="text-left space-y-2">
          <label className="block text-xs font-black uppercase tracking-wider text-black">
            ENTER YOUR NAME
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40 text-base">
              👤
            </span>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              maxLength={20}
              className="w-full bg-white border border-black/30 focus:border-[#FF8E37] rounded-2xl pl-11 pr-4 py-3.5 text-base text-black font-semibold focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="text-left space-y-2.5">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-black uppercase tracking-wider text-black">
              PICK A CATCHPHRASE
            </label>
            <span className="text-[11px] text-black/50 font-bold">
              {activeCatchphrase.length} / 30
            </span>
          </div>

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
                  className={`px-3 py-2.5 rounded-2xl border text-xs sm:text-sm font-bold transition-all cursor-pointer truncate ${
                    isSelected
                      ? "bg-[#FF8E37] text-black border-2 border-black shadow-2xs font-black"
                      : "bg-white text-black/80 border-black/25 hover:bg-slate-50"
                  }`}
                >
                  {phrase}
                </button>
              );
            })}
          </div>

          <input
            type="text"
            maxLength={30}
            value={customCatchphrase}
            onChange={(e) => setCustomCatchphrase(e.target.value)}
            placeholder="Or write your own witty phrase..."
            className="w-full bg-white border border-black/30 focus:border-[#FF8E37] rounded-2xl px-4 py-3 text-sm text-black font-medium focus:outline-none transition-colors mt-2"
          />
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleJoinLobby}
            disabled={!playerName.trim()}
            className="w-full sm:w-auto px-10 py-4 bg-[#FF8E37] hover:bg-[#EA580C] disabled:opacity-50 text-black font-heading font-black text-xl border-[2px_5px_5px_2px] border-black rounded-2xl shadow-xs active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-3 mx-auto"
          >
            <span>Join Lobby</span>
            <span>➔</span>
          </button>
        </div>
      </div>

      <ProfileModal
        isOpen={showAvatarPickerModal}
        onClose={() => setShowAvatarPickerModal(false)}
        onAvatarSelect={(selected) => {
          setAvatarId(selected);
        }}
      />
    </div>
  );
};

export default ProfileSetup;
