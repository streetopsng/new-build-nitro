// src/pages/Splash.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BackgroundAudio from "../components/BackgroundAudio";
import SoundToggle from "../components/SoundToggle";
import { ProfileModal } from "../components/ProfileModal";
import { useProfile } from "../contexts/ProfileContext";
const Splash: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [progress, setProgress] = useState(0);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 2;
      });
    }, 35);

    return () => clearInterval(timer);
  }, []);

  const handleStart = () => {
    if (!profile.isProfileSet) {
      setShowProfileModal(true);
    } else {
      navigate("/mp-entry");
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col items-center justify-center text-center p-6 relative overflow-hidden select-none">
      {/* Background Floating Letter Graphics matching White Mockup */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.08] overflow-hidden">
        <span className="absolute top-[8%] left-[8%] text-8xl font-black font-heading">X</span>
        <span className="absolute top-[12%] left-[30%] text-7xl font-black font-heading">I</span>
        <span className="absolute top-[10%] right-[10%] text-9xl font-black font-heading">G</span>
        <span className="absolute top-[35%] left-[8%] text-9xl font-black font-heading">H</span>
        <span className="absolute top-[36%] left-[23%] text-6xl font-black font-heading">C</span>
        <span className="absolute top-[34%] left-[38%] text-7xl font-black font-heading">D</span>
        <span className="absolute top-[32%] right-[23%] text-8xl font-black font-heading">S</span>
        <span className="absolute top-[52%] left-[15%] text-9xl font-black font-heading">V</span>
        <span className="absolute top-[65%] left-[16%] text-[140px] font-black font-heading">U</span>
        <span className="absolute top-[88%] left-[10%] text-8xl font-black font-heading">O</span>
        <span className="absolute top-[60%] left-[45%] text-8xl font-black font-heading">E</span>
        <span className="absolute top-[80%] left-[45%] text-7xl font-black font-heading">B</span>
        <span className="absolute top-[58%] right-[18%] text-9xl font-black font-heading">H</span>
        <span className="absolute top-[52%] right-[8%] text-8xl font-black font-heading">R</span>
        <span className="absolute top-[86%] right-[30%] text-9xl font-black font-heading">X</span>
        <span className="absolute top-[85%] right-[8%] text-6xl font-black font-heading">T A R</span>
      </div>

      {/* Top right sound toggle */}
      <div className="absolute top-6 right-6 z-20">
        <SoundToggle className="px-3 py-1.5 bg-slate-100 border border-slate-300 rounded-full text-xs uppercase tracking-widest text-slate-700 hover:bg-slate-200 transition-all cursor-pointer" />
      </div>

      {/* Main Content Card matching Image 6 EXACTLY */}
      <div className="relative z-10 max-w-md w-full flex flex-col items-center animate-card-fade-in">

        {/* Brand Title: In (Black) + Sync (Orange) */}
        <h1 className="font-heading font-extrabold text-6xl tracking-tight mb-6">
          <span className="text-black">In</span>
          <span className="text-[#FF8E37]">Sync</span>
        </h1>

        {/* Loading Bar */}
        <div className="w-64 h-3.5 bg-white border border-slate-300 rounded-full overflow-hidden p-0.5 shadow-xs mb-4">
          <div
            className="h-full bg-[#FF8E37] rounded-full transition-all duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Powered By Gummy Gum Subtitle */}
        <div className="text-sm font-semibold text-slate-800 flex items-center justify-center gap-1.5 mb-8">
          <span className="text-[#FF8E37]">⚡</span> Powered By Gummy Gum
        </div>

        {/* Auto-enter button when progress finishes */}
        {progress >= 100 && (
          <button
            onClick={handleStart}
            className="px-8 py-3.5 rounded-2xl bg-[#FF8E37] hover:bg-[#EA580C] text-black font-extrabold text-base tracking-wide border-2 border-black shadow-[3px_3px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer animate-slide-in"
          >
            Enter Session →
          </button>
        )}
      </div>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => {
          setShowProfileModal(false);
          navigate("/mp-entry");
        }}
      />

      <BackgroundAudio />
    </div>
  );
};

export default Splash;
