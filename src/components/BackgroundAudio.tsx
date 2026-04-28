import React from "react";
import { useAudio } from "../contexts/AudioContext";

const BackgroundAudio: React.FC = () => {
  const { soundOn } = useAudio();

  return (
    <audio autoPlay loop muted={!soundOn} className="hidden" preload="auto">
      <source src="/sounds/game-lobby.mp3" type="audio/mpeg" />
    </audio>
  );
};

export default BackgroundAudio;
