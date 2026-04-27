// src/pages/SoloSetup.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../contexts/GameContext";
import SoundToggle from "../components/SoundToggle";

const SoloSetup: React.FC = () => {
  const navigate = useNavigate();
  const { themes } = useGame();
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

  const toggleTheme = (themeKey: string) => {
    setSelectedThemes((prev) =>
      prev.includes(themeKey)
        ? prev.filter((t) => t !== themeKey)
        : [...prev, themeKey],
    );
  };

  const startGame = () => {
    if (selectedThemes.length === 0) {
      alert("Please select at least one theme");
      return;
    }
    // Navigate to game with solo mode params
    navigate("/game", {
      state: { mode, difficulty, themes: selectedThemes, isMultiplayer: false },
    });
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
            onClick={() => navigate("/")}
            className="w-10 h-10 rounded-full bg-[#2e1b14] border border-[rgba(255,255,255,0.1)] text-white text-xl cursor-pointer flex items-center justify-center hover:bg-[#231510]"
          >
            ←
          </button>
          <div className="font-barlow font-black text-[28px] uppercase tracking-wide text-[#ffe9dc]">
            Solo Game
          </div>
          <SoundToggle className="ml-auto px-3 py-1.5 bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.15)] rounded-full text-xs uppercase tracking-[2px] text-white transition-colors hover:bg-[rgba(255,255,255,0.15)]" />
        </div>

        {/* Mode Selection */}
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

        {/* Difficulty Selection */}
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

        {/* Themes Selection */}
        <div className="mb-8">
          <div className="text-[11px] tracking-[3px] uppercase text-[rgba(255,255,255,0.4)] mb-2.5">
            Themes (pick any)
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
          {selectedThemes.length === 0 && (
            <div className="text-xs text-[#d64545] mt-2">
              Select at least one theme
            </div>
          )}
        </div>

        <button
          onClick={startGame}
          disabled={selectedThemes.length === 0}
          className={`w-full py-4 rounded-2xl font-barlow font-bold text-xl tracking-[1px] uppercase transition-all ${selectedThemes.length === 0 ? "opacity-40 cursor-not-allowed bg-[#ff4d00]" : "bg-[#ff4d00] hover:bg-[#e04400] active:scale-97"}`}
        >
          Start Game
        </button>
      </div>
    </div>
  );
};

export default SoloSetup;
