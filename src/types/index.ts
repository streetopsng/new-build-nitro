// src/types/index.ts
export interface Word {
  word: string;
  theme: string;
  easy: string;
  medium: string;
  hard: string;
}

export interface Theme {
  key: string;
  name: string;
}

export interface Player {
  id: string;
  name: string;
  color: string;
  score: number;
  streak: number;
  answered: boolean;
  outcome: string;
  pts: number;
  connected: boolean;
}

export interface Room {
  code: string;
  host: string;
  hostPlays: boolean;
  status: "lobby" | "playing" | "results";
  settings: {
    mode: "round" | "sprint";
    difficulty: "easy" | "medium" | "hard";
    themes: string[];
    timerDuration: number;
  };
  wordList: string[];
  currentWordIndex: number;
  currentWordStartTime: number;
  players: Record<string, Player>;
}

export interface GameState {
  mode: "round" | "sprint";
  difficulty: "easy" | "medium" | "hard";
  themes: string[];
  words: Word[];
  wordIndex: number;
  score: number;
  streak: number;
  hintsLeft: number;
  hintUsedThisWord: boolean;
  wordLog: Array<{
    word: string;
    outcome: "correct" | "almost" | "timeout" | "skipped" | "wrong";
    pts: number;
  }>;
  timeLeft: number;
  totalTime: number;
  sprintTimeLeft: number;
  wordState:
    | "IDLE"
    | "TYPING"
    | "SUBMITTED_CORRECT"
    | "SUBMITTED_ALMOST"
    | "SUBMITTED_WRONG"
    | "SKIPPED"
    | "TIMED_OUT";
  usedWords: Set<string>;
}
