import React from "react";
import { useGummyGum } from "../contexts/GummyGumContext";
import { returnToGummyGum } from "../lib/gummygumSession";
import { IconPowerOff } from "../components/icons";

// Dedicated terminal screen a participant is navigated to when the host ends
// the session (lobby cancel, mid-game exit, or a GummyGum dashboard force-end).
// A real route/navigate transition, not a modal overlay, so it replaces
// whatever screen was live underneath rather than covering a frozen one.
const SessionEnded: React.FC = () => {
  const { ggSession } = useGummyGum();

  return (
    <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center p-6 select-none">
      <div className="w-full max-w-sm rounded-2xl bg-[#FFFBF7] border border-black/15 p-8 text-center shadow-xl space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-500 flex items-center justify-center mx-auto">
          <IconPowerOff className="w-6 h-6" />
        </div>
        <h1 className="font-heading font-black text-2xl text-black">Session Ended</h1>
        <p className="text-sm text-black/60 leading-relaxed">
          The host has ended this session.{ggSession ? "" : " You can close this tab now."}
        </p>
        {ggSession && (
          <button
            type="button"
            onClick={() => returnToGummyGum()}
            className="w-full py-3.5 rounded-xl bg-[#FF8E37] hover:bg-[#EA580C] text-black font-heading font-black text-base border border-black/20 shadow-xs transition-colors cursor-pointer"
          >
            Return to GummyGum
          </button>
        )}
      </div>
    </div>
  );
};

export default SessionEnded;
