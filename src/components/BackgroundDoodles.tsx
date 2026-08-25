// src/components/BackgroundDoodles.tsx
import React from "react";

export const BackgroundDoodles: React.FC<{ opacity?: string }> = ({
  opacity = "opacity-20",
}) => {
  return (
    <div className={`absolute inset-0 pointer-events-none ${opacity} overflow-hidden z-0 select-none`}>
      {/* Top Left: Burger */}
      <svg className="absolute top-10 left-12 w-20 h-20 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M6 10a6 6 0 0 1 12 0v1H6v-1z"/>
        <path d="M3 13h18"/>
        <path d="M5 20h14a2 2 0 0 0 2-2v-1H3v1a2 2 0 0 0 2 2z"/>
      </svg>

      {/* Top Center-Left: Briefcase */}
      <svg className="absolute top-8 left-[32%] w-18 h-18 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <rect x="2" y="7" width="20" height="14" rx="2"/>
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
      </svg>

      {/* Top Center-Right: Growth Chart */}
      <svg className="absolute top-8 left-[58%] w-18 h-18 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
        <line x1="2" y1="20" x2="22" y2="20"/>
        <polyline points="18 6 12 12 6 16"/>
      </svg>

      {/* Top Right: Pizza Slice */}
      <svg className="absolute top-12 right-16 w-24 h-24 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M15 11l-3 3M12 4L3 20h18L12 4z"/>
        <circle cx="10" cy="14" r="1.5" fill="currentColor"/>
        <circle cx="15" cy="16" r="1.5" fill="currentColor"/>
      </svg>

      {/* Mid Left: Serving Cloche */}
      <svg className="absolute top-[35%] left-16 w-20 h-20 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M12 4a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
        <path d="M4 18h16a1 1 0 0 0 1-1A9 9 0 0 0 3 17a1 1 0 0 0 1 1z"/>
        <path d="M2 20h20"/>
      </svg>

      {/* Mid Center: Target */}
      <svg className="absolute top-[38%] left-[46%] w-20 h-20 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="12" r="6"/>
        <circle cx="12" cy="12" r="2"/>
      </svg>

      {/* Mid Right: Cupcake */}
      <svg className="absolute top-[36%] right-20 w-20 h-20 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M5 11l2 10h10l2-10"/>
        <path d="M4 11c0-2 2-3 4-3s3 1 4 3c1-2 2-3 4-3s4 1 4 3"/>
        <circle cx="12" cy="5" r="2" fill="currentColor"/>
      </svg>

      {/* Lower Mid Left: Coffee Cup */}
      <svg className="absolute top-[60%] left-20 w-20 h-20 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M18 8h1a4 4 0 1 1 0 8h-1"/>
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
        <line x1="6" y1="2" x2="6" y2="4"/>
        <line x1="10" y1="2" x2="10" y2="4"/>
        <line x1="14" y1="2" x2="14" y2="4"/>
      </svg>

      {/* Lower Mid Right: Fork & Knife */}
      <svg className="absolute top-[60%] right-20 w-16 h-24 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M6 2v6a3 3 0 0 0 6 0V2"/>
        <line x1="9" y1="11" x2="9" y2="22"/>
        <path d="M18 2v8a4 4 0 0 1-4 4v8"/>
      </svg>

      {/* Bottom Left: Chef Hat */}
      <svg className="absolute bottom-10 left-16 w-20 h-20 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M6 14h12v4a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-4z"/>
        <path d="M6 14a4 4 0 1 1 2-7.5 5 5 0 0 1 8 0 4 4 0 1 1 2 7.5"/>
      </svg>

      {/* Bottom Center: Apple */}
      <svg className="absolute bottom-10 left-[44%] w-20 h-20 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M12 2c1 1 1 3 0 4"/>
        <path d="M12 6c-3.5 0-6 2.5-6 6a6 6 0 0 0 10.5 4c1-1 1.5-2.5 1.5-4 0-3.5-2.5-6-6-6z"/>
      </svg>

      {/* Bottom Right: Coffee Cup to Go */}
      <svg className="absolute bottom-10 right-20 w-16 h-20 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M6 8l1.5 12a2 2 0 0 0 2 2h5a2 2 0 0 0 2-2L18 8"/>
        <rect x="4" y="4" width="16" height="4" rx="1"/>
      </svg>

      {/* Right Edge: Office Building */}
      <svg className="absolute top-[48%] right-6 w-20 h-28 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <rect x="4" y="2" width="16" height="20" rx="1"/>
        <path d="M9 6h2M13 6h2M9 10h2M13 10h2M9 14h2M13 14h2M10 22v-4h4v4"/>
      </svg>
    </div>
  );
};
