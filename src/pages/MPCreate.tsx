// src/pages/MPCreate.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ref, set, get } from "firebase/database";
import { db } from "../lib/firebase";
import { useProfile } from "../contexts/ProfileContext";
import { useGummyGum } from "../contexts/GummyGumContext";
import { GummyGumGateModal } from "../components/GummyGumGateModal";

const THEME_OPTIONS = [
  { id: "General", label: "General", icon: "🌐" },
  { id: "Corporate", label: "Corporate", icon: "🏢" },
  { id: "Food", label: "Food", icon: "🍴" },
  { id: "Culture", label: "Culture", icon: "☕" },
  { id: "Family & Friends", label: "Family & Friends", icon: "🎓" },
];

const MPCreate: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { ggSession, ggAccessState } = useGummyGum();

  const [lobbyName, setLobbyName] = useState("Q3 New Hire Batch");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [selectedThemes, setSelectedThemes] = useState<string[]>(["General", "Corporate"]);
  const [isCreating, setIsCreating] = useState(false);
  const [showGate, setShowGate] = useState(false);

  const toggleTheme = (themeId: string) => {
    setSelectedThemes((prev) =>
      prev.includes(themeId)
        ? prev.filter((t) => t !== themeId)
        : [...prev, themeId]
    );
  };

  const generateRoomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleGenerateCode = async () => {
    if (!lobbyName.trim() || isCreating) return;
    if (ggAccessState === "denied") {
      setShowGate(true);
      return;
    }
    setIsCreating(true);

    const hostName = ggSession?.player?.name || profile.username || "Host Admin";
    const hostId = "host_" + Date.now();

    try {
      // Launched via GummyGum: the room code is fixed to the hub's own PIN
      // (already emailed to the team as their join code), not a random one.
      // If this host already created the room — tab closed and reopened —
      // reuse it instead of overwriting the players already in it.
      if (ggSession?.roomCode) {
        const roomCode = ggSession.roomCode;
        const existing = await get(ref(db, `rooms/${roomCode}`));
        if (existing.exists()) {
          navigate("/lobby", {
            state: { roomCode, playerId: hostId, isHost: true, playerName: hostName, lobbyName: existing.val().name || lobbyName },
          });
          return;
        }

        await set(ref(db, `rooms/${roomCode}`), {
          name: lobbyName,
          code: roomCode,
          hostId,
          hostName,
          hostEmail: ggSession.player?.email || null,
          status: "waiting",
          locked: false,
          settings: { difficulty, themes: selectedThemes, maxPlayers: 200 },
          players: {
            [hostId]: {
              id: hostId,
              name: hostName,
              email: ggSession.player?.email || null,
              avatarId: profile.avatarId,
              score: 0,
              ready: true,
              isHost: true,
            },
          },
        });
        navigate("/lobby", { state: { roomCode, playerId: hostId, isHost: true, playerName: hostName, lobbyName } });
        return;
      }

      const roomCode = generateRoomCode();
      await set(ref(db, `rooms/${roomCode}`), {
        name: lobbyName,
        code: roomCode,
        hostId,
        hostName,
        status: "waiting",
        locked: false,
        settings: { difficulty, themes: selectedThemes, maxPlayers: 200 },
        players: {
          [hostId]: { id: hostId, name: hostName, avatarId: profile.avatarId, score: 0, ready: true, isHost: true },
        },
      });
      navigate("/lobby", { state: { roomCode, playerId: hostId, isHost: true, playerName: hostName, lobbyName } });
    } catch (err) {
      console.error("Failed to create room:", err);
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-slate-900 flex items-center justify-center p-6 relative overflow-hidden select-none">
      {/* Background Vector Line-Art Graphics matching Mockup EXACTLY */}
      <div className="absolute inset-0 pointer-events-none opacity-25 overflow-hidden">
        {/* Top-Left: Briefcase / Messenger Bag */}
        <svg className="absolute top-12 left-16 w-24 h-24 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
          <path d="M12 12v3" />
          <path d="M8 12h8" />
        </svg>

        {/* Top-Right: Target with Arrow */}
        <svg className="absolute top-14 right-16 w-28 h-28 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
          <path d="M22 2l-7.5 7.5" />
          <path d="M22 2h-5" />
          <path d="M22 2v5" />
        </svg>

        {/* Mid-Left: Necktie */}
        <svg className="absolute top-[45%] left-10 w-20 h-32 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M8 2h8l-2 4H10L8 2z" />
          <path d="M10 6l-3 10 5 6 5-6-3-10H10z" />
        </svg>

        {/* Mid-Right: Office Building */}
        <svg className="absolute top-[42%] right-10 w-24 h-32 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <rect x="4" y="2" width="16" height="20" rx="1" />
          <path d="M9 6h2M13 6h2M9 10h2M13 10h2M9 14h2M13 14h2M10 22v-4h4v4" />
        </svg>

        {/* Bottom-Left: Bar Chart / Growth Graph */}
        <svg className="absolute bottom-12 left-16 w-24 h-24 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
          <line x1="2" y1="20" x2="22" y2="20" />
        </svg>

        {/* Bottom-Right: ID Card / Badge */}
        <svg className="absolute bottom-10 right-16 w-24 h-24 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="9" cy="10" r="3" />
          <path d="M15 8h3M15 12h3M7 17h10" />
        </svg>
      </div>

      {/* Main Modal Box */}
      <div className="w-full max-w-xl rounded-3xl bg-white border border-slate-300 p-8 shadow-2xl relative text-left z-10">
        {/* Top Left Close Icon */}
        <button
          onClick={() => navigate("/mp-entry")}
          className="absolute top-6 left-6 text-slate-400 hover:text-black text-xl cursor-pointer"
        >
          ✕
        </button>

        {/* Header content */}
        <div className="mt-4 mb-6">
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">
            STEP 1 OF 2
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-black">
            Set up your onboarding session
          </h1>
        </div>

        {/* LOBBY NAME Field */}
        <div className="mb-6">
          <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">
            LOBBY NAME
          </label>
          <input
            type="text"
            value={lobbyName}
            onChange={(e) => setLobbyName(e.target.value)}
            placeholder="eg. Q3 New Hire Batch"
            className="w-full bg-white border-2 border-[#f97316] rounded-2xl px-4 py-3 text-sm text-black font-semibold focus:outline-none transition-colors"
          />
        </div>

        {/* DIFFICULTY Buttons */}
        <div className="mb-6">
          <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">
            DIFFICULTY
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "easy", label: "★ Easy" },
              { id: "medium", label: "★★ Medium" },
              { id: "hard", label: "★★★ Hard" },
            ].map((diff) => {
              const isSelected = difficulty === diff.id;
              return (
                <button
                  key={diff.id}
                  type="button"
                  onClick={() => setDifficulty(diff.id as any)}
                  className={`py-3 px-3 rounded-2xl border transition-all font-bold text-xs cursor-pointer ${
                    isSelected
                      ? "border-[#f97316] text-[#f97316] bg-white shadow-xs"
                      : "border-slate-300 text-black bg-white hover:bg-slate-50"
                  }`}
                >
                  <span className={isSelected ? "text-[#f97316]" : "text-black"}>
                    {diff.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* THEMES Chips */}
        <div className="mb-6">
          <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">
            THEMES (choose from one or more)
          </label>
          <div className="flex flex-wrap gap-2.5">
            {THEME_OPTIONS.map((theme) => {
              const isSelected = selectedThemes.includes(theme.id);
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => toggleTheme(theme.id)}
                  className={`py-2.5 px-4 rounded-2xl border transition-all font-bold text-xs flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? "border-[#f97316] text-[#f97316] bg-white shadow-xs"
                      : "border-slate-300 text-black bg-white hover:bg-slate-50"
                  }`}
                >
                  <span>{theme.icon}</span> {theme.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider OR */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <span className="relative bg-white px-4 text-xs font-extrabold tracking-widest text-slate-400 uppercase">
            OR
          </span>
        </div>

        {/* Create your own questions card */}
        <div className="mb-8 rounded-2xl border-2 border-dashed border-[#f97316] bg-white p-4 flex items-center justify-between cursor-pointer hover:bg-orange-50/20 transition-colors">
          <div>
            <div className="font-extrabold text-sm text-black">Create your own questions</div>
            <div className="text-xs text-slate-500 font-medium">Write custom clues tailored to your team</div>
          </div>
          <div className="w-7 h-7 rounded-full border border-[#f97316] text-[#f97316] flex items-center justify-center font-extrabold text-sm">
            →
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleGenerateCode}
            disabled={!lobbyName.trim() || isCreating}
            className="px-8 py-3.5 rounded-2xl bg-[#f97316] hover:bg-[#ea580c] text-black font-extrabold text-sm border-2 border-black shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          >
            {isCreating ? "Generating..." : "Generate lobby code"}
          </button>
        </div>
      </div>
      {showGate && <GummyGumGateModal onClose={() => setShowGate(false)} />}
    </div>
  );
};

export default MPCreate;
