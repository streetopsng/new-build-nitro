// src/pages/MPCreate.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../contexts/GameContext";
import { genRoomCode, genPlayerId, PLAYER_COLORS } from "../utils/helpers";
import { db } from "../lib/firebase";
import { ref, set } from "firebase/database";

const MPCreate: React.FC = () => {
  const navigate = useNavigate();
  const { themes, wordBank } = useGame();
  const [playerName, setPlayerName] = useState("");
  const [mode, setMode] = useState<"round" | "sprint">("round");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "easy",
  );
  const [selectedThemes, setSelectedThemes] = useState<string[]>([
    "general",
    "corporate",
    "food",
    "culture",
    "family",
  ]);
  const [hostPlays, setHostPlays] = useState(true);
  const [error, setError] = useState("");

  const toggleTheme = (themeKey: string) => {
    setSelectedThemes((prev) =>
      prev.includes(themeKey)
        ? prev.filter((t) => t !== themeKey)
        : [...prev, themeKey],
    );
  };

  const createRoom = async () => {
    if (!playerName.trim()) {
      setError("Please enter your name");
      return;
    }
    if (selectedThemes.length === 0) {
      setError("Please select at least one theme");
      return;
    }

    const code = genRoomCode();
    const playerId = genPlayerId();
    const color = PLAYER_COLORS[0];

    const durations = { easy: 30, medium: 20, hard: 10 };
    const sprintDur = { easy: 180, medium: 120, hard: 60 };

    // Filter words based on selected themes and difficulty
    const availableWords = wordBank.filter((w) =>
      selectedThemes.includes(w.theme),
    );
    if (availableWords.length === 0) {
      setError("No words available for selected themes");
      return;
    }

    const words = shuffle(availableWords).slice(0, mode === "round" ? 10 : 50);
    const wordList = words.map((w) => w.word);

    const roomData = {
      code,
      host: playerId,
      hostPlays,
      status: "lobby",
      settings: {
        mode,
        difficulty,
        themes: selectedThemes,
        timerDuration:
          mode === "round" ? durations[difficulty] : sprintDur[difficulty],
      },
      wordList,
      currentWordIndex: 0,
      currentWordStartTime: 0,
      players: hostPlays
        ? {
            [playerId]: {
              id: playerId,
              name: playerName,
              color,
              score: 0,
              streak: 0,
              answered: false,
              outcome: "",
              pts: 0,
              connected: true,
            },
          }
        : {},
    };

    try {
      await set(ref(db, `rooms/${code}`), roomData);
      navigate("/lobby", {
        state: {
          roomCode: code,
          playerId,
          isHost: true,
          playerName,
          hostPlays,
          words,
        },
      });
    } catch (err) {
      setError("Failed to create room. Check your Firebase connection.");
    }
  };

  const shuffle = (arr: any[]) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const availableThemes =
    themes.length > 0
      ? themes
      : [
          { key: "general", name: "General" },
          { key: "corporate", name: "Corporate" },
          { key: "food", name: "Food" },
          { key: "culture", name: "Culture" },
          { key: "family", name: "Family & Friends" },
        ];

  return (
    <div className="min-h-screen bg-[#1a120d] p-6 text-[#ffe9dc]">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-7">
          <button
            onClick={() => navigate("/mp-entry")}
            className="w-10 h-10 rounded-full bg-[#2e1b14] border border-[rgba(255,255,255,0.1)] text-white text-xl cursor-pointer flex items-center justify-center hover:bg-[#231510]"
          >
            ←
          </button>
          <div className="font-barlow font-black text-[28px] uppercase tracking-wide text-[#ffe9dc]">
            Create Room
          </div>
        </div>

        <div className="mb-6">
          <div className="text-[11px] tracking-[3px] uppercase text-[rgba(255,255,255,0.4)] mb-2.5">
            Your Name
          </div>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full p-3.5 px-4 bg-[#2e1b14] border border-[rgba(255,255,255,0.12)] rounded-lg text-white text-base outline-none focus:border-[#ff4d00] transition-colors"
            placeholder="Enter your name"
            maxLength={20}
          />
        </div>

        <div className="mb-6">
          <div className="text-[11px] tracking-[3px] uppercase text-[rgba(255,255,255,0.4)] mb-2.5">
            Mode
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setMode("round")}
              className={`px-[18px] py-2.5 rounded-full border text-sm font-medium transition-all ${mode === "round" ? "bg-[#ff4d00] border-[#ff4d00] text-white shadow-[0_2px_12px_rgba(255,77,0,0.4)]" : "border-[rgba(255,255,255,0.15)] bg-[#2e1b14] text-[rgba(255,255,255,0.7)] hover:border-[rgba(255,77,0,0.5)] hover:text-white"}`}
            >
              Round (10 Qs)
            </button>
            <button
              onClick={() => setMode("sprint")}
              className={`px-[18px] py-2.5 rounded-full border text-sm font-medium transition-all ${mode === "sprint" ? "bg-[#ff4d00] border-[#ff4d00] text-white shadow-[0_2px_12px_rgba(255,77,0,0.4)]" : "border-[rgba(255,255,255,0.15)] bg-[#2e1b14] text-[rgba(255,255,255,0.7)] hover:border-[rgba(255,77,0,0.5)] hover:text-white"}`}
            >
              Sprint
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="text-[11px] tracking-[3px] uppercase text-[rgba(255,255,255,0.4)] mb-2.5">
            Difficulty
          </div>
          <div className="flex gap-2 flex-wrap">
            {(["easy", "medium", "hard"] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`px-[18px] py-2.5 rounded-full border text-sm font-medium transition-all ${difficulty === d ? "bg-[#ff4d00] border-[#ff4d00] text-white shadow-[0_2px_12px_rgba(255,77,0,0.4)]" : "border-[rgba(255,255,255,0.15)] bg-[#2e1b14] text-[rgba(255,255,255,0.7)] hover:border-[rgba(255,77,0,0.5)] hover:text-white"}`}
              >
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <div className="text-[11px] tracking-[3px] uppercase text-[rgba(255,255,255,0.4)] mb-2.5">
            Themes
          </div>
          <div className="flex gap-2 flex-wrap">
            {availableThemes.map((theme) => (
              <button
                key={theme.key}
                onClick={() => toggleTheme(theme.key)}
                className={`px-[18px] py-2.5 rounded-full border text-sm font-medium transition-all ${selectedThemes.includes(theme.key) ? "bg-[#ff9a00] border-[#ff9a00] text-white shadow-[0_2px_12px_rgba(255,154,0,0.4)]" : "border-[rgba(255,255,255,0.15)] bg-[#2e1b14] text-[rgba(255,255,255,0.7)] hover:border-[rgba(255,77,0,0.5)] hover:text-white"}`}
              >
                {theme.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <div className="text-[11px] tracking-[3px] uppercase text-[rgba(255,255,255,0.4)] mb-2.5">
            Your Role
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setHostPlays(true)}
              className={`px-[18px] py-2.5 rounded-full border text-sm font-medium transition-all ${hostPlays ? "bg-[#ff4d00] border-[#ff4d00] text-white shadow-[0_2px_12px_rgba(255,77,0,0.4)]" : "border-[rgba(255,255,255,0.15)] bg-[#2e1b14] text-[rgba(255,255,255,0.7)] hover:border-[rgba(255,77,0,0.5)] hover:text-white"}`}
            >
              🎮 I'm playing too
            </button>
            <button
              onClick={() => setHostPlays(false)}
              className={`px-[18px] py-2.5 rounded-full border text-sm font-medium transition-all ${!hostPlays ? "bg-[#ff4d00] border-[#ff4d00] text-white shadow-[0_2px_12px_rgba(255,77,0,0.4)]" : "border-[rgba(255,255,255,0.15)] bg-[#2e1b14] text-[rgba(255,255,255,0.7)] hover:border-[rgba(255,77,0,0.5)] hover:text-white"}`}
            >
              👁️ Just hosting
            </button>
          </div>
          <div className="text-xs text-[rgba(255,255,255,0.3)] mt-1.5">
            Play along with your team, or just host and watch the scores come
            in.
          </div>
        </div>

        {error && <div className="text-sm text-[#d64545] mb-4">{error}</div>}

        <button
          onClick={createRoom}
          className="w-full py-4 rounded-2xl bg-[#ff4d00] text-white font-barlow font-bold text-xl tracking-[1px] uppercase transition-all hover:bg-[#e04400] active:scale-97"
        >
          Create Room
        </button>
      </div>
    </div>
  );
};

export default MPCreate;
