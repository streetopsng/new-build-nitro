import React from "react";
import { returnToGummyGum } from "../lib/gummygumSession";

interface SessionExpiredModalProps {
  isHost: boolean;
}

export const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({ isHost }) => {
  const handleHostRehost = () => {
    returnToGummyGum();
  };

  const handleClose = () => {
    try {
      window.close();
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none animate-fadeIn">
      <div className="bg-[#FFFBF7] border-2 border-black rounded-[24px] p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl animate-fadeUp flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-500 flex items-center justify-center text-2xl mb-3 shadow-xs">
          ⏱️
        </div>
        <h3 className="font-heading font-black text-xl text-slate-900 mb-1.5">
          Session Expired
        </h3>
        <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed mb-6">
          {isHost
            ? "This session was inactive in the lobby for more than 20 minutes and has expired. You can return to GummyGum to launch a fresh session."
            : "This session has expired due to inactivity. Thank you for being here — you can safely close this tab now."}
        </p>

        {isHost ? (
          <button
            type="button"
            onClick={handleHostRehost}
            className="w-full py-3.5 rounded-xl bg-[#FF8E37] hover:bg-[#EA580C] text-black font-extrabold text-sm border-2 border-black shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer text-center"
          >
            ← Return to GummyGum to Rehost
          </button>
        ) : (
          <button
            type="button"
            onClick={handleClose}
            className="w-full py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm border-2 border-black shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer text-center"
          >
            Close Tab
          </button>
        )}
      </div>
    </div>
  );
};

export default SessionExpiredModal;
