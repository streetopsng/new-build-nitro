// src/pages/MPEntry.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

const MPEntry: React.FC = () => {
  const navigate = useNavigate();

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
            Multiplayer
          </div>
        </div>

        <div className="flex flex-col gap-3 max-w-[320px] mx-auto mt-20">
          <div
            onClick={() => navigate("/mp-create")}
            className="bg-[#2e1b14] rounded-2xl p-6 border border-[rgba(255,255,255,0.08)] cursor-pointer transition-all hover:border-[#ff4d00] hover:-translate-y-0.5"
          >
            <div className="font-barlow text-[22px] font-black uppercase mb-1 text-[#ffe9dc]">
              🏠 Create Room
            </div>
            <div className="text-[13px] text-[rgba(255,255,255,0.4)] leading-relaxed">
              Host a game. Set the rules, share your code, and start when
              everyone is in.
            </div>
          </div>

          <div
            onClick={() => navigate("/mp-join")}
            className="bg-[#2e1b14] rounded-2xl p-6 border border-[rgba(255,255,255,0.08)] cursor-pointer transition-all hover:border-[#ff4d00] hover:-translate-y-0.5"
          >
            <div className="font-barlow text-[22px] font-black uppercase mb-1 text-[#ffe9dc]">
              🔗 Join a Room
            </div>
            <div className="text-[13px] text-[rgba(255,255,255,0.4)] leading-relaxed">
              Have a 4-letter code? Jump into an existing game.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MPEntry;
