// src/contexts/GameContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { ref, get } from "firebase/database";
import { db } from "../lib/firebase";
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
  const [wordBank, setWordBank] = useState<Word[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState<GameState | null>(null);

  const fetchWordBank = async () => {
    const snapshot = await get(ref(db, "wordBank"));
    if (!snapshot.exists()) {
      setWordBank([]);
      return;
    }

    const bank = Object.values(snapshot.val()) as Word[];
    setWordBank(bank);

    // Keep theme chips in sync with available words.
    const uniqueThemes = [...new Set(bank.map((w) => w.theme).filter(Boolean))]
      .sort()
      .map((key) => ({
        key,
        name: key
          .split(/[_\s-]+/)
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" "),
      }));
    setThemes(uniqueThemes);
  };

  const fetchThemes = async () => {
    const snapshot = await get(ref(db, "themes"));
    if (!snapshot.exists()) return;

    const rawThemes = snapshot.val();
    if (Array.isArray(rawThemes)) {
      setThemes(rawThemes as Theme[]);
      return;
    }

    if (typeof rawThemes === "object") {
      setThemes(Object.values(rawThemes) as Theme[]);
    }
  };

  useEffect(() => {
    const bootstrapGameData = async () => {
      setLoading(true);
      try {
        await fetchWordBank();
        await fetchThemes();
      } finally {
        setLoading(false);
      }
    };

    bootstrapGameData();
  }, []);

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
