import React from "react";

interface GameRulesModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  playerName?: string;
}

export const GameRulesModal: React.FC<GameRulesModalProps> = ({
  isOpen,
  onConfirm,
  playerName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none animate-fadeIn">
      <div className="bg-[#FFFBF7] border-2 border-black rounded-[24px] p-6 sm:p-8 max-w-md w-full shadow-2xl animate-fadeUp flex flex-col max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 border border-[#FF8E37]/40 text-[#EA580C] text-[11px] font-extrabold uppercase tracking-wider mb-2">
            Game Overview
          </div>
          <h3 className="font-heading font-black text-2xl sm:text-[26px] text-slate-900 tracking-tight">
            How InSync Works
          </h3>
          <p className="text-xs sm:text-[13px] text-slate-600 mt-1.5 leading-relaxed">
            Welcome{playerName ? `, ${playerName}` : ""}! Before you enter the lobby, here is how the race works:
          </p>
        </div>

        {/* 3 Steps */}
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-black/15 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-[#FF8E37] text-black font-black text-sm flex items-center justify-center shrink-0 border border-black/20">
              1
            </div>
            <div className="text-left">
              <div className="text-[13px] font-black text-slate-900">Type with speed & accuracy</div>
              <div className="text-[11.5px] text-slate-600 mt-0.5 leading-snug">
                Type the words shown on your screen accurately to propel your runner along the track.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-black/15 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-[#FF8E37] text-black font-black text-sm flex items-center justify-center shrink-0 border border-black/20">
              2
            </div>
            <div className="text-left">
              <div className="text-[13px] font-black text-slate-900">Build your nitro streak</div>
              <div className="text-[11.5px] text-slate-600 mt-0.5 leading-snug">
                Chain consecutive clean words without errors to activate nitro boosts and overtake colleagues.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-black/15 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-[#FF8E37] text-black font-black text-sm flex items-center justify-center shrink-0 border border-black/20">
              3
            </div>
            <div className="text-left">
              <div className="text-[13px] font-black text-slate-900">Cross the finish line together</div>
              <div className="text-[11.5px] text-slate-600 mt-0.5 leading-snug">
                Watch live race positions, celebrate top scorers, and enjoy the post-race team leaderboard!
              </div>
            </div>
          </div>
        </div>

        {/* Tip Box */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-left flex items-center gap-2.5 mb-6">
          <span className="text-base shrink-0">💡</span>
          <span className="text-[11.5px] text-amber-900 font-medium leading-snug">
            <strong>Pro tip:</strong> Rhythm and accuracy beat frantic typing — mistakes pause your runner momentarily!
          </span>
        </div>

        {/* Action Button - curved rounded-xl, never rounded-full */}
        <button
          type="button"
          onClick={onConfirm}
          className="w-full py-3.5 text-sm font-extrabold rounded-xl bg-[#FF8E37] hover:bg-[#EA580C] text-black border-2 border-black shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer text-center"
        >
          Got it, enter lobby →
        </button>
      </div>
    </div>
  );
};

export default GameRulesModal;
