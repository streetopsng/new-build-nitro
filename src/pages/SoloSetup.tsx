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
    <div className="min-h-screen bg-white text-slate-900 p-4 md:p-8 flex flex-col items-center justify-center select-none relative overflow-x-hidden">
      <div className="max-w-md w-full animate-card-fade-in">
        <div className="card-insync bg-[#FFFBF7] p-6 md:p-8 shadow-sm relative space-y-6 text-left">
          <button
            onClick={() => navigate("/home")}
            className="absolute top-5 right-5 text-black/50 hover:text-black text-xl font-bold cursor-pointer"
          >
            ✕
          </button>

          <div className="w-12 h-12 rounded-2xl bg-orange-100 border border-orange-200 text-[#FF8E37] flex items-center justify-center text-2xl font-black">
            ▷
          </div>

          <div>
            <h1 className="font-heading font-black text-2xl text-black">
              Solo Practice Setup
            </h1>
            <p className="text-sm text-black/60 font-medium mt-1">
              Customize your solo round before playing
            </p>
          </div>

          {/* Game Type Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-black">
              ROUND TYPE
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "10Q", title: "10Q Classic", desc: "10 clues round" },
                { id: "sprint", title: "Time Sprint", desc: "5 minute rush" },
              ].map((item) => {
                const isSelected = mode === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMode(item.id as any)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#FF8E37] bg-white text-black shadow-xs font-black"
                        : "border-black/20 bg-white text-black/60 hover:bg-slate-50"
                    }`}
                  >
                    <div className="font-black text-sm text-black mb-0.5">{item.title}</div>
                    <div className="text-xs text-black/50">{item.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Difficulty Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-black">
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
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#FF8E37] bg-white text-[#FF8E37] shadow-xs font-black"
                        : "border-black/20 bg-white text-black hover:bg-slate-50"
                    }`}
                  >
                    <div className="font-black text-xs">{diff.label}</div>
                    <div className="text-[10px] text-black/50 font-semibold mt-0.5">{diff.time}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4">
            <button
              onClick={handleStartSolo}
              className="w-full py-4 rounded-2xl bg-[#FF8E37] hover:bg-[#EA580C] text-black font-heading font-black text-lg border-[2px_5px_5px_2px] border-black shadow-xs active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              Start Solo Game ▷
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoloSetup;
