// src/pages/Home.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import SoundToggle from "../components/SoundToggle";
import BackgroundAudio from "../components/BackgroundAudio";

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between p-6 md:px-16 md:py-10 select-none relative overflow-hidden">
      {/* Subtle Background Floating Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] overflow-hidden">
        <span className="absolute top-[10%] left-[8%] text-8xl font-black font-heading">X</span>
        <span className="absolute top-[15%] right-[12%] text-9xl font-black font-heading">G</span>
        <span className="absolute bottom-[20%] left-[10%] text-9xl font-black font-heading">V</span>
        <span className="absolute bottom-[15%] right-[10%] text-8xl font-black font-heading">O</span>
      </div>

      {/* Top Navigation Bar matching Figma #1473:2249 */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between z-10 pb-6 border-b border-black/10">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate("/home")}>
          <span className="font-heading font-extrabold text-3xl tracking-tight text-black">
            In<span className="text-[#FF8E37]">Sync</span>
          </span>
        </div>

        <div className="flex items-center gap-6">
          <SoundToggle className="px-3 py-1 bg-slate-100 border border-slate-300 rounded-full text-xs text-slate-700 hover:bg-slate-200 transition-all cursor-pointer" />
          <button
            onClick={() => navigate("/rules")}
            className="text-lg md:text-xl font-normal text-black underline underline-offset-4 hover:text-[#FF8E37] transition-colors cursor-pointer"
          >
            how to play
          </button>
        </div>
      </header>

      {/* Main Hero & Content Cards matching Figma */}
      <main className="w-full max-w-7xl mx-auto my-auto py-8 z-10 space-y-12">
        {/* Hero Title & Pills matching Figma #1480:2165 */}
        <div className="space-y-4 text-left max-w-3xl">
          <h1 className="font-heading font-black text-5xl md:text-7xl text-black leading-[1.1] tracking-tight">
            The word guessing game <br />
            <span className="text-[#FF8E37]">for teams.</span>
          </h1>
          <p className="text-xl md:text-2xl text-black/50 font-normal">
            Sync minds. Guess words. Win together.
          </p>

          {/* Session Info Pills */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-black/50 bg-white text-black text-sm md:text-base font-normal shadow-xs">
              <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>~5 min sessions</span>
            </div>

            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-black/50 bg-white text-black text-sm md:text-base font-normal shadow-xs">
              <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span>up to 200 players</span>
            </div>
          </div>
        </div>

        {/* 2 Big Action Cards matching Figma #1480:2238 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
          {/* Card 1: FOR HOST / ADMIN */}
          <div className="card-insync bg-white p-8 md:p-12 border border-black/50 rounded-3xl flex flex-col justify-between hover:shadow-lg transition-shadow">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FBE6D5] text-[#FF8E37] text-sm font-normal">
                <svg className="w-4 h-4 text-[#FF8E37]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
                </svg>
                <span className="font-semibold uppercase tracking-wider text-xs">FOR HOST / ADMIN</span>
              </div>

              <div className="space-y-2">
                <h2 className="font-heading font-black text-2xl md:text-3xl text-black">
                  Host a new lobby
                </h2>
                <p className="text-black/60 text-base md:text-lg leading-relaxed">
                  Create a private room, get a join code, and invite new hires in. <br />
                  You'll host and run the session. You won't play as a participant.
                </p>
              </div>
            </div>

            <div className="pt-8">
              <button
                onClick={() => navigate("/mp-create")}
                className="w-full sm:w-auto px-8 py-4 bg-[#FF8E37] hover:bg-[#EA580C] text-black font-heading font-black text-lg md:text-xl border-[2px_5px_5px_2px] border-black rounded-2xl flex items-center justify-center gap-4 active:translate-x-0.5 active:translate-y-0.5 shadow-xs transition-all cursor-pointer"
              >
                <span>Create new lobby</span>
                <span className="text-xl">➔</span>
              </button>
            </div>
          </div>

          {/* Card 2: FOR EMPLOYEES */}
          <div className="card-insync bg-white p-8 md:p-12 border border-black/50 rounded-3xl flex flex-col justify-between hover:shadow-lg transition-shadow">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E6E6E6] text-black text-sm font-normal">
                <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span className="font-semibold uppercase tracking-wider text-xs">FOR EMPLOYEES</span>
              </div>

              <div className="space-y-2">
                <h2 className="font-heading font-black text-2xl md:text-3xl text-black">
                  Join with a code
                </h2>
                <p className="text-black/60 text-base md:text-lg leading-relaxed">
                  Enter the 6-character code your HR shared to drop into the lobby.
                </p>
              </div>
            </div>

            <div className="pt-8">
              <button
                onClick={() => navigate("/mp-join")}
                className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-orange-50/50 text-[#FF8E37] font-heading font-black text-lg md:text-xl border-[2px_5px_5px_2px] border-[#FF8E37] rounded-2xl flex items-center justify-center gap-4 active:translate-x-0.5 active:translate-y-0.5 shadow-xs transition-all cursor-pointer"
              >
                <span>Join lobby</span>
                <span className="text-xl">➔</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto flex items-center justify-between z-10 pt-6 border-t border-black/10 text-xs md:text-sm text-black/50">
        <button
          onClick={() => navigate("/rules")}
          className="hover:text-black font-semibold cursor-pointer underline"
        >
          Rules & Guidelines
        </button>
        <span className="flex items-center gap-1">
          <span className="text-[#FF8E37]">⚡</span> Powered By Gummy Gum
        </span>
      </footer>

      <BackgroundAudio />
    </div>
  );
};

export default Home;
