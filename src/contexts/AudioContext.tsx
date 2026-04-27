// src/contexts/AudioContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

interface AudioContextType {
  soundOn: boolean;
  toggleSound: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [soundOn, setSoundOn] = useState(() => {
    const saved = localStorage.getItem("soundOn");
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem("soundOn", JSON.stringify(soundOn));
  }, [soundOn]);

  const toggleSound = () => {
    setSoundOn((prev: boolean) => !prev);
  };

  return (
    <AudioContext.Provider value={{ soundOn, toggleSound }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error("useAudio must be used within AudioProvider");
  return context;
};
