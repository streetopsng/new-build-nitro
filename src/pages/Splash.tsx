// src/pages/Splash.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import SoundToggle from "../components/SoundToggle";

const Splash: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#1a120d] flex flex-col items-center justify-center text-center p-6 relative overflow-hidden text-[#ffe9dc]">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_10%,rgba(255,77,0,0.12)_0%,transparent_60%),radial-gradient(ellipse_at_80%_90%,rgba(255,154,0,0.08)_0%,transparent_50%)] pointer-events-none" />

      <div className="relative z-10">
        <div className="mb-2 flex items-center justify-center gap-4">
          <SoundToggle className="px-3 py-1.5 bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.15)] rounded-full text-xs uppercase tracking-[2px] text-white transition-colors hover:bg-[rgba(255,255,255,0.15)]" />
        </div>
        <div className="mb-2">
          <svg
            className="w-[72px] h-20 mx-auto animate-[flicker_1.4s_ease-in-out_infinite_alternate]"
            viewBox="0 0 72 80"
            fill="none"
          >
            <path
              d="M36 4C36 4 52 20 52 38C52 47 47 54 40 57C42 52 42 47 38 43C38 43 40 55 28 62C22 65 14 61 12 54C10 47 14 40 20 36C20 36 16 46 24 50C24 50 18 42 22 30C24 24 30 16 36 4Z"
              fill="url(#flameG)"
            />
            <path
              d="M36 28C36 28 44 36 44 46C44 52 40 56 36 58C38 54 37 50 34 47C34 47 36 53 30 57C26 59 22 56 21 52C20 48 22 44 26 42C26 42 24 48 28 50C28 50 25 45 28 38C30 33 32 30 36 28Z"
              fill="url(#flameG2)"
            />
            <defs>
              <linearGradient
                id="flameG"
                x1="36"
                y1="4"
                x2="36"
                y2="70"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#FF9A00" />
                <stop offset="1" stopColor="#FF4D00" />
              </linearGradient>
              <linearGradient
                id="flameG2"
                x1="36"
                y1="28"
                x2="36"
                y2="60"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#FFD700" />
                <stop offset="1" stopColor="#FF9A00" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="font-barlow font-black text-[clamp(52px,12vw,88px)] leading-[0.9] tracking-[-1px] uppercase bg-gradient-to-br from-white via-[#ff9a00] to-[#ff4d00] bg-clip-text text-transparent mb-2">
          Guess
          <br />
          The Word
        </div>

        <div className="text-[13px] tracking-[3px] uppercase text-[rgba(255,255,255,0.5)] mb-12">
          TeamNitro — April 2026
        </div>

        <div className="flex flex-col gap-3 w-full max-w-[320px] mx-auto">
          <button
            onClick={() => navigate("/solo-setup")}
            className="flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-[#ff4d00] text-white font-barlow font-bold text-xl tracking-[1px] uppercase transition-all hover:bg-[#e04400] active:scale-97 shadow-[0_4px_24px_rgba(255,77,0,0.4)]"
          >
            ▶ Play Solo
          </button>
          <button
            onClick={() => navigate("/mp-entry")}
            className="flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-[#2e1b14] text-white font-barlow font-bold text-xl tracking-[1px] uppercase transition-all hover:bg-[#231510] active:scale-97 border border-[rgba(255,255,255,0.12)]"
          >
            👥 Multiplayer
          </button>
          <button
            onClick={() => navigate("/rules")}
            className="flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-transparent text-[rgba(255,255,255,0.5)] font-barlow font-bold text-base tracking-[1px] uppercase transition-all hover:text-white border border-[rgba(255,255,255,0.15)]"
          >
            How to Play
          </button>
        </div>
      </div>
    </div>
  );
};

export default Splash;
