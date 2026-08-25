// src/components/JoiningLobby.tsx
import React from "react";

export const JoiningLobby: React.FC<{ message?: string }> = ({
  message = "Joining the lobby...",
}) => {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden select-none">
      {/* Background Line-Art Doodles matching Screenshot EXACTLY */}
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
        {/* Row 1 */}
        <svg className="absolute top-[8%] left-[6%] w-14 h-14 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <circle cx="12" cy="7" r="3"/>
          <path d="M5 21v-2a7 7 0 0 1 14 0v2"/>
        </svg>
        <svg className="absolute top-[10%] left-[23%] w-14 h-14 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M9 18V5l12-2v13M9 9l12-2"/>
          <circle cx="6" cy="18" r="3"/>
          <circle cx="18" cy="16" r="3"/>
        </svg>
        <svg className="absolute top-[8%] left-[40%] w-16 h-16 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <rect x="2" y="7" width="20" height="14" rx="2"/>
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
        </svg>
        <svg className="absolute top-[8%] left-[60%] w-16 h-16 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <line x1="18" y1="20" x2="18" y2="10"/>
          <line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="14"/>
          <line x1="2" y1="20" x2="22" y2="20"/>
          <polyline points="18 6 12 12 6 16"/>
        </svg>
        <svg className="absolute top-[8%] right-[8%] w-16 h-16 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>

        {/* Row 2 */}
        <svg className="absolute top-[32%] left-[10%] w-16 h-16 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
        </svg>
        <svg className="absolute top-[32%] left-[28%] w-14 h-14 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
        </svg>
        <svg className="absolute top-[26%] right-[20%] w-16 h-16 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
          <circle cx="12" cy="13" r="4"/>
        </svg>
        <svg className="absolute top-[38%] right-[32%] w-12 h-24 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M8 2h8l-2 4H10L8 2z"/>
          <path d="M10 6l-3 10 5 6 5-6-3-10H10z"/>
        </svg>

        {/* Row 3 */}
        <svg className="absolute top-[52%] left-[6%] w-16 h-16 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="m22 2-7 20-4-9-9-4Zm0 0L11 13"/>
        </svg>
        <svg className="absolute top-[54%] left-[24%] w-14 h-14 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z"/>
        </svg>
        <svg className="absolute top-[62%] left-[45%] w-16 h-16 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <circle cx="5.5" cy="17.5" r="3.5"/>
          <circle cx="18.5" cy="17.5" r="3.5"/>
          <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V9l3-3h3.5"/>
        </svg>
        <svg className="absolute top-[58%] right-[28%] w-16 h-16 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="12" r="6"/>
          <circle cx="12" cy="12" r="2"/>
        </svg>
        <svg className="absolute top-[52%] right-[10%] w-20 h-24 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <rect x="4" y="2" width="16" height="20" rx="1"/>
          <path d="M9 6h2M13 6h2M9 10h2M13 10h2M9 14h2M13 14h2M10 22v-4h4v4"/>
        </svg>

        {/* Row 4 */}
        <svg className="absolute bottom-[18%] left-[14%] w-16 h-16 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="m6.5 6.5 11 11M21 21l-1 1M3 3l1 1"/>
          <path d="M18 6a3 3 0 1 0-6 0v12a3 3 0 1 0 6 0V6z"/>
        </svg>
        <svg className="absolute bottom-[14%] left-[32%] w-16 h-16 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
        <svg className="absolute bottom-[16%] left-[58%] w-18 h-18 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <rect x="3" y="4" width="18" height="12" rx="2"/>
          <path d="M2 20h20"/>
        </svg>
        <svg className="absolute bottom-[14%] right-[15%] w-16 h-16 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      </div>

      {/* Center Orange Spinner & Message matching Screenshot EXACTLY */}
      <div className="relative z-10 flex flex-col items-center animate-card-fade-in">
        <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
          {/* Outer Orange Spinner Ring */}
          <div className="w-16 h-16 rounded-full border-4 border-orange-200 border-t-[#f97316] animate-spin" />
        </div>

        {/* Text directly below spinner */}
        <h2 className="font-heading font-extrabold text-xl text-black tracking-tight">
          {message}
        </h2>
      </div>
    </div>
  );
};
