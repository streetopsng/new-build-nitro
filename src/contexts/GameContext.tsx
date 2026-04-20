// src/contexts/GameContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { GameState, Theme, Word } from "../types";

interface GameContextType {
  wordBank: Word[];
  themes: Theme[];
  loading: boolean;
  gameState: GameState | null;
  setGameState: (state: GameState | null) => void;
  fetchWordBank: () => Promise<void>;
  fetchThemes: () => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [wordBank] = useState<Word[]>([]);
  const [themes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState<GameState | null>(null);

  const fetchWordBank = async () => {
    // This will be implemented with Firebase
    setLoading(false);
  };

  const fetchThemes = async () => {
    // This will be implemented with Firebase
  };

  return (
    <GameContext.Provider
      value={{
        wordBank,
        themes,
        loading,
        gameState,
        setGameState,
        fetchWordBank,
        fetchThemes,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within GameProvider");
  return context;
};
