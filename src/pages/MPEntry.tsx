// src/pages/MPEntry.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

const MPEntry: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col items-center justify-between p-6 md:p-12 select-none relative overflow-hidden">
      {/* Background Line-Art Vector Icons matching Screenshot EXACTLY */}
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden z-0">
        {/* Trophy (Top Center) */}
        <svg className="absolute top-6 left-[50%] -translate-x-1/2 w-14 h-14 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
          <path d="M4 22h16"/>
          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
        </svg>

        {/* Clock (Top Mid Right) */}
        <svg className="absolute top-8 right-[24%] w-12 h-12 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>

        {/* Dice (Top Right) */}
        <svg className="absolute top-16 right-16 w-16 h-16 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
          <circle cx="15.5" cy="15.5" r="1.5" fill="currentColor"/>
          <circle cx="15.5" cy="8.5" r="1.5" fill="currentColor"/>
          <circle cx="8.5" cy="15.5" r="1.5" fill="currentColor"/>
        </svg>

        {/* Party Popper (Mid Right) */}
        <svg className="absolute top-[22%] right-[28%] w-16 h-16 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M5.8 11.3 2 22l10.7-3.8Z"/>
          <path d="M4 3h.01M9 6h.01M15 2h.01M12 9h.01"/>
        </svg>

        {/* Team People (Mid Right Lower) */}
        <svg className="absolute top-[35%] right-14 w-16 h-16 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>

        {/* Magic Wand (Lower Right) */}
        <svg className="absolute bottom-[22%] right-12 w-16 h-16 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="m19 2 2 2-12 12-2-2z"/>
          <path d="m5 15-3 5 5-3z"/>
        </svg>

        {/* Star Award Badge (Bottom Left) */}
        <svg className="absolute bottom-10 left-12 w-18 h-18 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <circle cx="12" cy="8" r="6"/>
          <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
        </svg>

        {/* Gift Box (Bottom Mid-Left) */}
        <svg className="absolute bottom-12 left-[24%] w-16 h-16 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <rect x="3" y="8" width="18" height="13" rx="2"/>
          <path d="M12 8v13M3 12h18"/>
          <path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/>
        </svg>

        {/* Heart (Bottom Center-Left) */}
        <svg className="absolute bottom-14 left-[40%] w-14 h-14 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
        </svg>

        {/* High Five (Bottom Center-Right) */}
        <svg className="absolute bottom-10 left-[56%] w-16 h-16 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M18 11V6a2 2 0 0 0-4 0v5"/>
          <path d="M14 10V4a2 2 0 0 0-4 0v6"/>
          <path d="M10 10.5V6a2 2 0 0 0-4 0v9"/>
        </svg>

        {/* Smiley Face (Bottom Mid-Right) */}
        <svg className="absolute bottom-10 right-[20%] w-16 h-16 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
          <line x1="9" y1="9" x2="9.01" y2="9"/>
          <line x1="15" y1="9" x2="15.01" y2="9"/>
        </svg>
      </div>

      {/* Top Header matching Screenshot EXACTLY */}
      <div className="w-full max-w-5xl flex items-center justify-between z-10 pt-2 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          {/* Dual Wave Circle Logo */}
          <div className="w-8 h-8 rounded-full border-2 border-[#f97316] flex items-center justify-center p-0.5">
            <div className="w-full h-full rounded-full border border-[#f97316]" />
          </div>
          <span className="font-heading font-extrabold text-2xl tracking-tight text-black">
            In<span className="text-[#f97316]">Sync</span>
          </span>
        </div>

        <button
          onClick={() => navigate("/rules")}
          className="text-xs font-bold text-black underline underline-offset-4 hover:text-[#f97316] transition-colors cursor-pointer"
        >
          how to play
        </button>
      </div>

      {/* Main Hero Section matching Screenshot EXACTLY */}
      <div className="w-full max-w-3xl my-auto text-left z-10 py-6">
        <h1 className="font-heading font-extrabold text-4xl md:text-6xl text-black mb-3 leading-tight tracking-tight">
          The word guessing game <br />
          <span className="text-[#f97316]">for teams.</span>
        </h1>

        <p className="text-slate-500 text-base md:text-lg mb-4 font-medium">
          Sync minds. Guess words. Win together.
        </p>

        {/* 2 Sub-Pill Badges matching Screenshot EXACTLY */}
        <div className="flex items-center gap-3 mb-10">
          <div className="px-3.5 py-1.5 rounded-full bg-white border border-slate-300 text-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-2xs">
            <span>🕒</span> ~5 min sessions
          </div>
          <div className="px-3.5 py-1.5 rounded-full bg-white border border-slate-300 text-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-2xs">
            <span>👥</span> up to 200 players
          </div>
        </div>

        {/* 2 Action Cards matching Screenshot EXACTLY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {/* Card 1: FOR HOST / ADMIN */}
          <div className="rounded-3xl bg-white border border-slate-300 p-6 md:p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100/80 text-[#f97316] font-extrabold text-[10px] uppercase tracking-wider mb-4 border border-orange-200">
                <span>👑</span> FOR HOST / ADMIN
              </div>

              <h2 className="font-heading font-extrabold text-xl text-black mb-2">
                Host a new lobby
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed font-medium mb-8">
                Create a private room, get a join code, and invite new hires in. You'll host and run the session, you won't play as a participant.
              </p>
            </div>

            <button
              onClick={() => navigate("/mp-create")}
              className="w-full py-3.5 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-black font-extrabold text-sm border-2 border-black shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer text-center"
            >
              Create new lobby →
            </button>
          </div>

          {/* Card 2: FOR EMPLOYEES */}
          <div className="rounded-3xl bg-white border border-slate-300 p-6 md:p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-extrabold text-[10px] uppercase tracking-wider mb-4 border border-slate-200">
                <span>👥</span> FOR EMPLOYEES
              </div>

              <h2 className="font-heading font-extrabold text-xl text-black mb-2">
                Join with a code
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed font-medium mb-8">
                Enter the 6-character code your HR shared to drop into the lobby.
              </p>
            </div>

            <button
              onClick={() => navigate("/mp-join")}
              className="w-full py-3.5 rounded-xl bg-white hover:bg-slate-50 text-[#f97316] font-extrabold text-sm border-2 border-[#f97316] shadow-2xs transition-all cursor-pointer text-center"
            >
              Join lobby →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MPEntry;
