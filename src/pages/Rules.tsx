// src/pages/Rules.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { BackgroundDoodles } from "../components/BackgroundDoodles";

const Rules: React.FC = () => {
  const navigate = useNavigate();

  const rulesList = [
    {
      step: "01",
      title: "THE LOOP",
      desc: "Each round gives you a clue. Type your guess in the letter slots or full input box. Complete words to earn points and progress to the next round.",
      tag: "CORE",
    },
    {
      step: "02",
      title: "MULTIPLAYER",
      desc: "Join a room using a 6-character code created by your host. Compete against teammates in real-time on the live session leaderboard.",
      tag: "TEAMS",
    },
    {
      step: "03",
      title: "SESSIONS & TIMING",
      desc: "The host sets total session duration (e.g. 5 minutes). Solve as many clues as possible before the timer runs out!",
      tag: "TIMER",
    },
    {
      step: "04",
      title: "SCORING",
      desc: "Earn base points per correct guess plus a streak bonus for consecutive correct answers. Fast responses earn higher points.",
      tag: "POINTS",
    },
    {
      step: "05",
      title: "HINTS",
      desc: "Stuck on a tricky word? Click the Hint button to reveal starting letters. Each hint costs 40% of max round points.",
      tag: "HELP",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 p-6 md:p-12 flex flex-col items-center justify-between select-none relative overflow-hidden">
      {/* Background Line-Art Doodles */}
      <BackgroundDoodles opacity="opacity-20" />

      {/* Header */}
      <div className="w-full max-w-2xl flex items-center justify-between z-10 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white border border-slate-300 text-slate-700 flex items-center justify-center font-bold hover:bg-slate-50 cursor-pointer shadow-sm"
          >
            ←
          </button>
          <h1 className="font-heading font-extrabold text-2xl text-black">
            How to Play
          </h1>
        </div>
        <span className="text-xs font-bold text-[#f97316] uppercase tracking-wider">
          GAME RULES
        </span>
      </div>

      {/* Main 5 Rule Cards matching Image 8 */}
      <div className="w-full max-w-2xl space-y-3 z-10 my-auto">
        {rulesList.map((item) => (
          <div
            key={item.step}
            className="rounded-2xl bg-white border border-slate-300 p-4 md:p-5 shadow-xs hover:border-[#f97316] transition-all text-left flex items-start gap-4"
          >
            <span className="font-mono font-extrabold text-base text-[#f97316] bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-xl">
              {item.step}
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-heading font-extrabold text-sm text-black">
                  {item.title}
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200">
                  {item.tag}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Action Button matching Image 8 */}
      <div className="w-full max-w-2xl z-10 mt-6 pt-4 flex justify-center border-t border-slate-200">
        <button
          onClick={() => navigate(-1)}
          className="px-10 py-3.5 rounded-2xl bg-[#f97316] hover:bg-[#ea580c] text-black font-extrabold text-base border-2 border-black shadow-[3px_3px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
        >
          Got it
        </button>
      </div>
    </div>
  );
};

export default Rules;
