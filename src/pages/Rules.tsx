// src/pages/Rules.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import SoundToggle from "../components/SoundToggle";

const Rules: React.FC = () => {
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
            How to Play
          </div>
          <SoundToggle className="ml-auto px-3 py-1.5 bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.15)] rounded-full text-xs uppercase tracking-[2px] text-white transition-colors hover:bg-[rgba(255,255,255,0.15)]" />
        </div>

        <div className="space-y-3">
          <div className="bg-[#2e1b14] rounded-2xl p-[18px] border border-[rgba(255,255,255,0.06)]">
            <h3 className="font-barlow text-lg font-bold uppercase text-[#ff9a00] mb-2">
              The Loop
            </h3>
            <p className="text-sm leading-relaxed text-[rgba(255,255,255,0.75)]">
              Read the description → Type your guess → Beat the clock. No
              categories shown. No letters given (unless you use a hint).
            </p>
          </div>

          <div className="bg-[#2e1b14] rounded-2xl p-[18px] border border-[rgba(255,255,255,0.06)]">
            <h3 className="font-barlow text-lg font-bold uppercase text-[#ff9a00] mb-2">
              Modes
            </h3>
            <p className="text-sm leading-relaxed text-[rgba(255,255,255,0.75)]">
              <strong>Round Mode</strong> — 10 questions, each with its own
              timer. Easy: 30s | Medium: 20s | Hard: 10s
            </p>
            <p className="text-sm leading-relaxed text-[rgba(255,255,255,0.75)] mt-2">
              <strong>Sprint Mode</strong> — One global clock. Answer as many as
              you can before it runs out. Easy: 3min | Medium: 2min | Hard: 1min
            </p>
          </div>

          <div className="bg-[#2e1b14] rounded-2xl p-[18px] border border-[rgba(255,255,255,0.06)]">
            <h3 className="font-barlow text-lg font-bold uppercase text-[#ff9a00] mb-2">
              Scoring
            </h3>
            <table className="w-full border-collapse mt-2">
              <tbody>
                <tr className="border-b border-[rgba(255,255,255,0.05)]">
                  <td className="py-1.5 text-sm text-[rgba(255,255,255,0.7)]">
                    Correct guess
                  </td>
                  <td className="py-1.5 text-sm text-right text-[#ff9a00] font-semibold">
                    +50 pts
                  </td>
                </tr>
                <tr className="border-b border-[rgba(255,255,255,0.05)]">
                  <td className="py-1.5 text-sm text-[rgba(255,255,255,0.7)]">
                    1 letter off
                  </td>
                  <td className="py-1.5 text-sm text-right text-[#ff9a00] font-semibold">
                    +35 pts
                  </td>
                </tr>
                <tr className="border-b border-[rgba(255,255,255,0.05)]">
                  <td className="py-1.5 text-sm text-[rgba(255,255,255,0.7)]">
                    2 letters off
                  </td>
                  <td className="py-1.5 text-sm text-right text-[#ff9a00] font-semibold">
                    +15 pts
                  </td>
                </tr>
                <tr className="border-b border-[rgba(255,255,255,0.05)]">
                  <td className="py-1.5 text-sm text-[rgba(255,255,255,0.7)]">
                    Streak (3+ in a row)
                  </td>
                  <td className="py-1.5 text-sm text-right text-[#ff9a00] font-semibold">
                    +30 pts
                  </td>
                </tr>
                <tr>
                  <td className="py-1.5 text-sm text-[rgba(255,255,255,0.7)]">
                    Skip / Timeout
                  </td>
                  <td className="py-1.5 text-sm text-right text-[#ff9a00] font-semibold">
                    0 pts
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-[#2e1b14] rounded-2xl p-[18px] border border-[rgba(255,255,255,0.06)]">
            <h3 className="font-barlow text-lg font-bold uppercase text-[#ff9a00] mb-2">
              Hints
            </h3>
            <p className="text-sm leading-relaxed text-[rgba(255,255,255,0.75)]">
              Up to <strong>5 hints per game</strong>, max 1 per word. Reveals
              first and last letter. Costs 40% of base score.
            </p>
            <p className="text-sm leading-relaxed text-[rgba(255,255,255,0.75)] mt-2">
              Example: "Jollof rice" →{" "}
              <strong>J _ _ _ _ F &nbsp; R _ _ E</strong>
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/")}
          className="w-full mt-6 py-4 rounded-2xl bg-[#ff4d00] text-white font-barlow font-bold text-xl tracking-[1px] uppercase transition-all hover:bg-[#e04400]"
        >
          Got it!
        </button>
      </div>
    </div>
  );
};

export default Rules;
