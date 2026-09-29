import React from "react";
import { useLocation } from "react-router-dom";
import { IconPowerOff, IconTrophy } from "../components/icons";

// Dedicated terminal screen a participant is navigated to when the host ends
// the session (lobby cancel, mid-game exit, or a GummyGum dashboard force-end).
// A real route/navigate transition, not a modal overlay, so it replaces
// whatever screen was live underneath rather than covering a frozen one.
const SessionEnded: React.FC = () => {
  const location = useLocation();
  const completed = !!(location.state as { completed?: boolean } | null)?.completed;

  return (
    <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center p-6 select-none">
      <div className="w-full max-w-sm rounded-2xl bg-[#FFFBF7] border border-black/15 p-8 text-center shadow-xl space-y-4">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto border ${
            completed ? "bg-orange-50 border-[#FF8E37] text-[#FF8E37]" : "bg-rose-50 border-rose-200 text-rose-500"
          }`}
        >
          {completed ? <IconTrophy className="w-6 h-6" /> : <IconPowerOff className="w-6 h-6" />}
        </div>
        <h1 className="font-heading font-black text-2xl text-black">{completed ? "Session Complete" : "Session Ended"}</h1>
        <p className="text-sm text-black/60 leading-relaxed">
          {completed
            ? "This session is complete. Thanks for playing! You can close this tab now."
            : "The host ended this session. You can close this tab now."}
        </p>
      </div>
    </div>
  );
};

export default SessionEnded;
