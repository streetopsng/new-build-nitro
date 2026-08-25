// src/pages/SoloSetup.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SoloSetup: React.FC = () => {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [mode, setMode] = useState<"10Q" | "sprint">("10Q");

  const handleStartSolo = () => {
    navigate("/game", {
      state: {
        isMultiplayer: false,
        isHost: false,
        mode: difficulty,
        gameType: mode,
      },
    });
  };

  return (
    <div className="min-h-screen bg-insync-dark text-white p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="max-w-md w-full animate-card-fade-in">
        <div className="rounded-3xl bg-[#13122b]/90 border border-[#2a2656] p-6 md:p-8 shadow-2xl backdrop-blur-xl relative">
          <button
            onClick={() => navigate("/home")}
            className="absolute top-4 right-4 text-gray-400 hover:text-white text-lg cursor-pointer"
          >
            ✕
          </button>

          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-[#7c3aed] flex items-center justify-center text-2xl font-bold mb-4">
            ▷
          </div>

          <h1 className="font-heading font-extrabold text-2xl text-white mb-1">
            Solo Mode Setup
          </h1>
          <p className="text-xs text-gray-400 mb-6 font-medium">
            Customize your solo practice round before playing
          </p>

          {/* Game Type Selection */}
          <div className="mb-6 text-left">
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-2">
              ROUND TYPE
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "10Q", title: "10Q Classic", desc: "10 clues round" },
                { id: "sprint", title: "Time Sprint", desc: "2 minute rush" },
              ].map((item) => {
                const isSelected = mode === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMode(item.id as any)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#17e8c3] bg-[#17e8c3]/15 text-white glow-teal"
                        : "border-[#2a2656] bg-[#0d0d1a] text-gray-400 hover:border-gray-600"
                    }`}
                  >
                    <div className="font-bold text-sm text-white mb-0.5">{item.title}</div>
                    <div className="text-[11px] text-gray-400">{item.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Difficulty Selection */}
          <div className="mb-8 text-left">
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-2">
              DIFFICULTY
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: "easy", label: "★ Easy", time: "30s" },
                { id: "medium", label: "★★ Medium", time: "20s" },
                { id: "hard", label: "★★★ Hard", time: "10s" },
              ].map((diff) => {
                const isSelected = difficulty === diff.id;
                return (
                  <button
                    key={diff.id}
                    type="button"
                    onClick={() => setDifficulty(diff.id as any)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#7c3aed] bg-[#7c3aed]/20 text-white glow-purple"
                        : "border-[#2a2656] bg-[#0d0d1a] text-gray-400 hover:border-gray-600"
                    }`}
                  >
                    <div className="font-bold text-xs text-white">{diff.label}</div>
                    <div className="text-[10px] text-gray-400 font-medium mt-0.5">{diff.time}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleStartSolo}
            className="w-full py-4 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-extrabold text-base uppercase tracking-wider shadow-lg glow-purple transition-all active:scale-97 cursor-pointer"
          >
            Start Solo Round →
          </button>
        </div>
      </div>
    </div>
  );
};

export default SoloSetup;
