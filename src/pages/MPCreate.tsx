// src/pages/MPCreate.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ref, set, get } from "firebase/database";
import { db } from "../lib/firebase";
import { useProfile } from "../contexts/ProfileContext";
import { useGummyGum } from "../contexts/GummyGumContext";
import { GummyGumGateModal } from "../components/GummyGumGateModal";

interface ThemeOption {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const MPCreate: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { ggSession, ggAccessState } = useGummyGum();

  const [lobbyName, setLobbyName] = useState("Q3 New Hire Batch");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [selectedThemes, setSelectedThemes] = useState<string[]>(["General", "Corporate"]);
  const [isCreating, setIsCreating] = useState(false);
  const [showGate, setShowGate] = useState(false);

  const themeOptions: ThemeOption[] = [
    {
      id: "General",
      label: "General",
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      ),
    },
    {
      id: "Corporate",
      label: "Corporate",
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <path d="M9 6h2M13 6h2M9 10h2M13 10h2M9 14h2M13 14h2M10 22v-4h4v4" />
        </svg>
      ),
    },
    {
      id: "Food",
      label: "Food",
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8h1a4 4 0 1 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
          <line x1="6" y1="2" x2="6" y2="4" />
          <line x1="10" y1="2" x2="10" y2="4" />
        </svg>
      ),
    },
    {
      id: "Culture",
      label: "Culture",
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="7" r="4" />
          <path d="M6 21v-2a6 6 0 0 1 12 0v2" />
        </svg>
      ),
    },
    {
      id: "Family & Friends",
      label: "Family & Friends",
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
  ];

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

    const roomData = {
      name: lobbyName,
      code: roomCode,
      hostId,
      hostName: profile.username || "Host Admin",
      status: "waiting",
      locked: false,
      settings: {
        difficulty,
        themes: selectedThemes,
        maxPlayers: 200,
      },
      players: {
        [hostId]: {
          id: hostId,
          name: profile.username || "Host Admin",
          avatarId: profile.avatarId || "av-1",
          score: 0,
          ready: true,
          isHost: true,
        },
      },
    };

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
    <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center p-4 md:p-10 select-none relative overflow-x-hidden">
      {/* Top Left Close Icon matching Figma #1487:2494 */}
      <button
        onClick={() => navigate("/home")}
        className="absolute top-6 left-6 text-black/60 hover:text-black text-2xl font-bold cursor-pointer z-20"
      >
        ✕
      </button>

      {/* Main Admin Setup Container matching Figma #1428:2411 */}
      <div className="w-full max-w-4xl bg-[#FFFBF7] border border-black/50 rounded-3xl p-6 md:p-12 shadow-sm relative text-left space-y-8 z-10 animate-card-fade-in">
        {/* Step Header */}
        <div className="space-y-1">
          <div className="text-xs md:text-sm font-semibold uppercase tracking-wider text-black/50">
            STEP 1 OF 2
          </div>
          <h1 className="font-heading font-black text-2xl md:text-3xl text-black">
            Set up your onboarding session
          </h1>
        </div>

        {/* LOBBY NAME Field */}
        <div className="space-y-2">
          <label className="block text-xs md:text-sm font-black uppercase tracking-wider text-black">
            LOBBY NAME
          </label>
          <input
            type="text"
            value={lobbyName}
            onChange={(e) => setLobbyName(e.target.value)}
            placeholder="eg. Q3 New Hire Batch"
            className="w-full h-14 md:h-16 px-5 rounded-2xl bg-white border border-[#FF6403] focus:outline-none text-base md:text-lg font-medium text-black transition-colors"
          />
        </div>

        {/* DIFFICULTY Selection matching Figma #1375:2267 */}
        <div className="space-y-2">
          <label className="block text-xs md:text-sm font-black uppercase tracking-wider text-black">
            DIFFICULTY
          </label>
          <div className="flex flex-wrap gap-4">
            {/* Easy */}
            <button
              type="button"
              onClick={() => setDifficulty("easy")}
              className={`h-16 md:h-20 px-6 rounded-xl border flex items-center justify-center gap-2 font-black text-base md:text-lg transition-all cursor-pointer ${
                difficulty === "easy"
                  ? "bg-white border-[#FF8E37] text-[#FF8E37] shadow-xs"
                  : "bg-white border-black/40 text-black hover:bg-slate-50"
              }`}
            >
              <span>★</span>
              <span>Easy</span>
            </button>

            {/* Medium */}
            <button
              type="button"
              onClick={() => setDifficulty("medium")}
              className={`h-16 md:h-20 px-6 rounded-xl border flex items-center justify-center gap-2 font-black text-base md:text-lg transition-all cursor-pointer ${
                difficulty === "medium"
                  ? "bg-white border-[#FF8E37] text-[#FF8E37] shadow-xs"
                  : "bg-white border-black/40 text-black hover:bg-slate-50"
              }`}
            >
              <span>★★</span>
              <span>Medium</span>
            </button>

            {/* Hard */}
            <button
              type="button"
              onClick={() => setDifficulty("hard")}
              className={`h-16 md:h-20 px-6 rounded-xl border flex items-center justify-center gap-2 font-black text-base md:text-lg transition-all cursor-pointer ${
                difficulty === "hard"
                  ? "bg-white border-[#FF8E37] text-[#FF8E37] shadow-xs"
                  : "bg-white border-black/40 text-black hover:bg-slate-50"
              }`}
            >
              <span>★★★</span>
              <span>Hard</span>
            </button>
          </div>
        </div>

        {/* THEMES Selection matching Figma #1375:2276 */}
        <div className="space-y-2">
          <label className="block text-xs md:text-sm font-black uppercase tracking-wider text-black">
            THEMES (choose from one or more)
          </label>
          <div className="flex flex-wrap gap-4">
            {themeOptions.map((t) => {
              const isSelected = selectedThemes.includes(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleTheme(t.id)}
                  className={`h-16 md:h-20 px-6 rounded-xl border flex items-center justify-center gap-3 font-black text-base md:text-lg transition-all cursor-pointer ${
                    isSelected
                      ? "bg-white border-[#FF8E37] text-[#FF8E37] shadow-xs"
                      : "bg-white border-black/40 text-black hover:bg-slate-50"
                  }`}
                >
                  {t.icon}
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* OR Divider matching Figma #1674:483 */}
        <div className="flex items-center justify-center gap-4 py-2">
          <div className="w-48 sm:w-64 border-t border-black/30" />
          <span className="text-xs font-black text-black/50 uppercase tracking-widest">
            OR
          </span>
          <div className="w-48 sm:w-64 border-t border-black/30" />
        </div>

        {/* Create Your Own Questions Dashed Card matching Figma #1674:486 */}
        <div className="p-6 rounded-2xl border-2 border-dashed border-[#FF8E37] bg-white flex items-center justify-between cursor-pointer hover:bg-orange-50/20 transition-colors">
          <div className="space-y-1">
            <h3 className="font-heading font-black text-lg md:text-xl text-black">
              Create your own questions
            </h3>
            <p className="text-sm md:text-base text-black/60 font-normal">
              Write custom clues tailored to your team
            </p>
          </div>
          <div className="w-10 h-10 rounded-full border border-[#FF8E37] text-[#FF8E37] flex items-center justify-center text-lg font-black">
            ➔
          </div>
        </div>

        {/* Action Button matching Figma #1488:2573 */}
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={handleGenerateCode}
            disabled={!lobbyName.trim() || isCreating}
            className="w-full sm:w-auto px-10 py-4 bg-[#FF8E37] hover:bg-[#EA580C] text-black font-heading font-black text-xl border-[2px_5px_5px_2px] border-black rounded-2xl shadow-xs active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
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
