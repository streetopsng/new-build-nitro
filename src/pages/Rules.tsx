// src/pages/Rules.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

const Rules: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col items-center p-6 md:py-10 select-none relative overflow-x-hidden">
      {/* Background Floating Element */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04] overflow-hidden">
        <span className="absolute top-[12%] left-[8%] text-8xl font-black font-heading">?</span>
        <span className="absolute bottom-[20%] right-[10%] text-9xl font-black font-heading">!</span>
      </div>

      {/* Top Header matching Figma #1480:2406 */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between pb-6 border-b border-black/10 z-10">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate("/home")}>
          <span className="font-heading font-extrabold text-2xl tracking-tight text-black">
            In<span className="text-[#FF8E37]">Sync</span>
          </span>
        </div>

        <h1 className="font-heading font-black text-2xl md:text-3xl text-black">
          Instructions
        </h1>
      </header>

      {/* Main Instructions Content Container (880px) matching Figma #1480:2414 */}
      <main className="w-full max-w-[880px] my-8 space-y-6 z-10">
        {/* Card 1: THE LOOP */}
        <section className="bg-white border border-black/30 rounded-2xl p-6 md:p-7 text-left space-y-2.5 shadow-xs">
          <h2 className="font-heading font-black text-lg md:text-xl text-black uppercase tracking-wider">
            THE LOOP
          </h2>
          <p className="text-base md:text-lg text-black/60 font-normal leading-relaxed">
            Read the clue → Type your guess → Beat the clock. No letters revealed (unless you use a hint).
          </p>
        </section>

        {/* Card 2: MULTIPLAYER */}
        <section className="bg-white border border-black/30 rounded-2xl p-6 md:p-7 text-left space-y-2.5 shadow-xs">
          <h2 className="font-heading font-black text-lg md:text-xl text-black uppercase tracking-wider">
            MULTIPLAYER
          </h2>
          <p className="text-base md:text-lg text-black/60 font-normal leading-relaxed">
            Up to 200 players in a room. Onboarding lobbies can only be hosted by HR/Admin. Live chat, ready-check and host-controlled start.
          </p>
        </section>

        {/* Card 3: SESSIONS & TIMING */}
        <section className="bg-white border border-black/30 rounded-2xl p-6 md:p-7 text-left space-y-4 shadow-xs">
          <h2 className="font-heading font-black text-lg md:text-xl text-black uppercase tracking-wider">
            SESSIONS & TIMING
          </h2>
          <p className="text-base md:text-lg text-black/60 font-normal leading-relaxed">
            Each session runs for 5 minutes. Answer as many clues as you can before time runs out, every correct answer counts toward your final score.
          </p>

          <div className="space-y-3 pt-2 text-base md:text-lg">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <span className="text-black/60">Easy</span>
              <span className="font-heading font-black text-black">30 Seconds</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <span className="text-black/60">Medium</span>
              <span className="font-heading font-black text-black">20 Seconds</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-black/60">Hard</span>
              <span className="font-heading font-black text-black">10 Seconds</span>
            </div>
          </div>
        </section>

        {/* Card 4: SCORING */}
        <section className="bg-white border border-black/30 rounded-2xl p-6 md:p-7 text-left space-y-4 shadow-xs">
          <h2 className="font-heading font-black text-lg md:text-xl text-black uppercase tracking-wider">
            SCORING
          </h2>

          <div className="space-y-3 text-base md:text-lg">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <span className="text-black/60">Correct guess</span>
              <span className="font-heading font-black text-black">+30 pts</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <span className="text-black/60">1 letter off</span>
              <span className="font-heading font-black text-black">+24 pts</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <span className="text-black/60">Fast answer</span>
              <span className="font-heading font-black text-black">+5 pts</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <span className="text-black/60">Streak (3+ in a row)</span>
              <span className="font-heading font-black text-black">+30 pts</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-black/60">Skip / Timeout</span>
              <span className="font-heading font-black text-black">0 pts</span>
            </div>
          </div>
        </section>

        {/* Card 5: HINTS */}
        <section className="bg-white border border-black/30 rounded-2xl p-6 md:p-7 text-left space-y-3 shadow-xs">
          <h2 className="font-heading font-black text-lg md:text-xl text-black uppercase tracking-wider">
            HINTS
          </h2>
          <p className="text-base md:text-lg text-black/60 leading-relaxed font-normal">
            Up to <strong className="font-black text-black">5 hints per game</strong>, max 1 per word. Reveals first and last letter. Costs 40% of base score.
          </p>
          <p className="text-base md:text-lg text-black/60 font-normal">
            <strong className="font-black text-black">Example:</strong> "Jollof rice" → <strong className="font-black text-black">J</strong> _ _ _ _ <strong className="font-black text-black">F</strong> &nbsp; <strong className="font-black text-black">R</strong> _ _ <strong className="font-black text-black">E</strong>
          </p>
        </section>

        {/* Button Click matching Figma #1480:2455 */}
        <div className="flex justify-center pt-4 pb-8">
          <button
            onClick={() => navigate(-1)}
            className="w-44 py-3.5 px-8 bg-white hover:bg-orange-50/60 text-[#FF8E37] font-heading font-black text-xl border-[2px_5px_5px_2px] border-[#FF8E37] rounded-2xl shadow-xs active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer text-center"
          >
            Got it
          </button>
        </div>
      </main>
    </div>
  );
};

export default Rules;
