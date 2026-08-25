// src/pages/Home.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../contexts/ProfileContext";
import { Avatar } from "../components/Avatar";
import { ProfileModal } from "../components/ProfileModal";
import SoundToggle from "../components/SoundToggle";
import { BackgroundDoodles } from "../components/BackgroundDoodles";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [showProfileModal, setShowProfileModal] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col items-center justify-between p-6 md:p-12 select-none relative overflow-hidden">
      {/* Background Line-Art Doodles */}
      <BackgroundDoodles opacity="opacity-20" />

      {/* Top Bar */}
      <div className="w-full max-w-5xl flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white border-2 border-black flex items-center justify-center font-heading font-extrabold text-lg shadow-sm">
            <span className="text-black">In</span>
            <span className="text-[#f97316]">S</span>
          </div>
          <span className="font-heading font-extrabold text-xl tracking-tight text-black">
            In<span className="text-[#f97316]">Sync</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <SoundToggle className="p-2 bg-white rounded-full border border-slate-300 text-slate-700 cursor-pointer shadow-sm" />

          {/* User Profile Pill Button */}
          <button
            onClick={() => setShowProfileModal(true)}
            className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-300 shadow-sm hover:border-[#f97316] transition-all cursor-pointer"
          >
            <Avatar id={profile.avatarId} size="sm" />
            <span className="font-bold text-sm text-slate-800">
              {profile.username}
            </span>
            <span className="text-xs text-slate-400">⚙️</span>
          </button>
        </div>
      </div>

      {/* Hero Card & Quick Stats */}
      <div className="w-full max-w-4xl my-auto text-center z-10 py-6 space-y-6">
        <div className="rounded-3xl bg-white border border-slate-300 p-6 md:p-8 shadow-md text-left relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#f97316] mb-1">
                WELCOME BACK, {profile.username.toUpperCase()}
              </div>
              <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-black">
                Ready to sync with your team?
              </h1>
            </div>
            <span className="px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-[#f97316] font-extrabold text-xs">
              Lvl {profile.level}
            </span>
          </div>

          <p className="text-xs md:text-sm text-slate-500 max-w-xl font-medium mb-6">
            Host a new session for your department or join an existing session code created by your HR admin.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => navigate("/mp-create")}
              className="px-6 py-3 rounded-2xl bg-[#f97316] hover:bg-[#ea580c] text-black font-extrabold text-sm border-2 border-black shadow-[3px_3px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
            >
              Host Session →
            </button>
            <button
              onClick={() => navigate("/mp-join")}
              className="px-6 py-3 rounded-2xl bg-white hover:bg-slate-50 text-black font-extrabold text-sm border-2 border-black shadow-[3px_3px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
            >
              Join Session →
            </button>
          </div>
        </div>

        {/* 4 Quick Mode Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
          <div
            onClick={() => navigate("/mp-create")}
            className="p-5 rounded-2xl bg-white border border-slate-300 hover:border-[#f97316] shadow-xs cursor-pointer transition-all hover:scale-102"
          >
            <div className="text-2xl mb-2">🎯</div>
            <div className="font-heading font-extrabold text-sm text-black">Host Session</div>
            <div className="text-[11px] text-slate-400 font-medium">Create room code</div>
          </div>

          <div
            onClick={() => navigate("/mp-join")}
            className="p-5 rounded-2xl bg-white border border-slate-300 hover:border-[#f97316] shadow-xs cursor-pointer transition-all hover:scale-102"
          >
            <div className="text-2xl mb-2">🔑</div>
            <div className="font-heading font-extrabold text-sm text-black">Join Code</div>
            <div className="text-[11px] text-slate-400 font-medium">Enter 6-digit room</div>
          </div>

          <div
            onClick={() => navigate("/solo-setup")}
            className="p-5 rounded-2xl bg-white border border-slate-300 hover:border-[#f97316] shadow-xs cursor-pointer transition-all hover:scale-102"
          >
            <div className="text-2xl mb-2">⚡</div>
            <div className="font-heading font-extrabold text-sm text-black">Solo Practice</div>
            <div className="text-[11px] text-slate-400 font-medium">Test your speed</div>
          </div>

          <div
            onClick={() => navigate("/rules")}
            className="p-5 rounded-2xl bg-white border border-slate-300 hover:border-[#f97316] shadow-xs cursor-pointer transition-all hover:scale-102"
          >
            <div className="text-2xl mb-2">📖</div>
            <div className="font-heading font-extrabold text-sm text-black">Instructions</div>
            <div className="text-[11px] text-slate-400 font-medium">Learn the rules</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-5xl flex items-center justify-between z-10 pt-4 border-t border-slate-200">
        <button
          onClick={() => navigate("/rules")}
          className="text-xs font-extrabold text-slate-500 hover:text-black flex items-center gap-1.5 cursor-pointer"
        >
          <span>📖</span> How to Play / Rules
        </button>

        <span className="text-xs font-semibold text-slate-400">
          ⚡ Powered By Gummy Gum
        </span>
      </div>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </div>
  );
};

export default Home;
