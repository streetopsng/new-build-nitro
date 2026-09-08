// src/components/GummyGumGateModal.tsx
import React from "react";

export const GummyGumGateModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div
    onClick={onClose}
    className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-xs"
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="w-full max-w-sm rounded-3xl bg-white border border-slate-300 p-8 text-center shadow-2xl"
    >
      <h3 className="font-heading font-extrabold text-xl text-black mb-2">Not available here</h3>
      <p className="text-sm text-slate-500 mb-6">
        This experience is only available through GummyGum. Head back to the hub to launch it.
      </p>
      <a
        href="https://gummygum.app"
        className="inline-block w-full px-8 py-3.5 rounded-2xl bg-[#f97316] hover:bg-[#ea580c] text-black font-extrabold text-sm border-2 border-black shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
      >
        Back to GummyGum
      </a>
    </div>
  </div>
);
