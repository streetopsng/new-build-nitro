// src/components/SoundToggle.tsx
import React from "react";
import { useAudio } from "../contexts/AudioContext";

interface SoundToggleProps {
  className?: string;
}

const SoundToggle: React.FC<SoundToggleProps> = ({
  className = "px-3 py-1.5 bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.15)] rounded-full text-xs uppercase tracking-[2px] text-white transition-colors hover:bg-[rgba(255,255,255,0.15)]",
}) => {
  const { soundOn, toggleSound } = useAudio();

  return (
    <button
      onClick={toggleSound}
      className={`${className} cursor-pointer flex items-center justify-center`}
      title={soundOn ? "Click to mute" : "Click to unmute"}
    >
      <span className="text-lg">{soundOn ? "🔊" : "🔇"}</span>
    </button>
  );
};

export default SoundToggle;
