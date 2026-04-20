// src/pages/Game.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../lib/firebase";
import { ref, onValue, update, get } from "firebase/database";
import { levenshtein, formatHint } from "../utils/helpers";
import type { Word } from "../types";

interface LocationState {
  mode: "round" | "sprint";
  difficulty: "easy" | "medium" | "hard";
  themes: string[];
  isMultiplayer?: boolean;
  roomCode?: string;
  playerId?: string;
  isHost?: boolean;
  playerName?: string;
}

interface Player {
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

const Game: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;

  // Game state
  const [words, setWords] = useState<Word[]>([]);
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [wordIndex, setWordIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [hintsLeft, setHintsLeft] = useState(5);
  const [hintUsed, setHintUsed] = useState(false);
  const [wordLog, setWordLog] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [sprintTimeLeft, setSprintTimeLeft] = useState(180);
  const [wordState, setWordState] = useState<
    | "IDLE"
    | "TYPING"
    | "SUBMITTED_CORRECT"
    | "SUBMITTED_ALMOST"
    | "SUBMITTED_WRONG"
    | "SKIPPED"
    | "TIMED_OUT"
  >("IDLE");
  const [guess, setGuess] = useState("");
  const [showHint, setShowHint] = useState("");
  const [feedback, setFeedback] = useState<{
    type: string;
    message: string;
  } | null>(null);
  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [showLBFlash, setShowLBFlash] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const timerRef = useRef<any | null>(null);
  const sprintTimerRef = useRef<any | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isAdvancingRef = useRef(false);

  // Load words from Firebase or generate from themes
  useEffect(() => {
    const loadWords = async () => {
      setIsLoading(true);
      try {
        if (state.isMultiplayer && state.roomCode) {
          // Get words from room
          const roomRef = ref(db, `rooms/${state.roomCode}`);
          const snapshot = await get(roomRef);
          if (snapshot.exists()) {
            const room = snapshot.val();
            const wordList = room.wordList || [];
            // Fetch full word objects
            const wordsRef = ref(db, "wordBank");
            const wordsSnap = await get(wordsRef);
            if (wordsSnap.exists()) {
              const bank = Object.values(wordsSnap.val()) as Word[];
              const loadedWords = wordList
                .map((w: string) => bank.find((b) => b.word === w))
                .filter(Boolean);
              setWords(loadedWords as Word[]);
              if (loadedWords.length > 0) setCurrentWord(loadedWords[0]);
            }
          }
        } else if (state.themes) {
          // Load from Firebase bank
          const wordsRef = ref(db, "wordBank");
          const snapshot = await get(wordsRef);
          if (snapshot.exists()) {
            const bank = Object.values(snapshot.val()) as Word[];
            const filtered = bank.filter((w) => state.themes.includes(w.theme));
            const shuffled = [...filtered].sort(() => Math.random() - 0.5);
            const selected = shuffled.slice(0, state.mode === "round" ? 10 : 50);
            setWords(selected);
            if (selected.length > 0) setCurrentWord(selected[0]);
          } else {
            // Empty state - no words available
            setWords([]);
            setCurrentWord(null);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadWords();
  }, [state]);

  // Setup timers
  useEffect(() => {
    if (!currentWord) return;

    if (state.mode === "round") {
      const durations = { easy: 30, medium: 20, hard: 10 };
      const totalTime = durations[state.difficulty];
      setTimeLeft(totalTime);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0.1) {
            if (timerRef.current) clearInterval(timerRef.current);
            handleTimeout();
            return 0;
          }
          return prev - 0.1;
        });
      }, 100);
    } else if (state.mode === "sprint" && !state.isMultiplayer) {
      const sprintDurations = { easy: 180, medium: 120, hard: 60 };
      setSprintTimeLeft(sprintDurations[state.difficulty]);

      sprintTimerRef.current = setInterval(() => {
        setSprintTimeLeft((prev) => {
          if (prev <= 0.1) {
            if (sprintTimerRef.current) clearInterval(sprintTimerRef.current);
            endGame();
            return 0;
          }
          return prev - 0.1;
        });
      }, 100);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (sprintTimerRef.current) clearInterval(sprintTimerRef.current);
    };
  }, [currentWord, state.mode, state.difficulty]);

  // Listen to multiplayer updates
  useEffect(() => {
    if (state.isMultiplayer && state.roomCode) {
      const playersRef = ref(db, `rooms/${state.roomCode}/players`);
      const unsubscribe = onValue(playersRef, (snapshot) => {
        if (snapshot.exists()) {
          setPlayers(snapshot.val());
        }
      });

      // Listen for word index changes
      const wordIndexRef = ref(db, `rooms/${state.roomCode}/currentWordIndex`);
      const indexUnsubscribe = onValue(wordIndexRef, (snapshot) => {
        const newIndex = snapshot.val();
        if (newIndex !== null && newIndex !== wordIndex && words[newIndex]) {
          setWordIndex(newIndex);
          setCurrentWord(words[newIndex]);
          setWordState("IDLE");
          setGuess("");
          setShowHint("");
          setHintUsed(false);
          setFeedback(null);
          if (inputRef.current) {
            inputRef.current.value = "";
            inputRef.current.focus();
          }
        }
      });

      return () => {
        unsubscribe();
        indexUnsubscribe();
      };
    }
  }, [state.isMultiplayer, state.roomCode, wordIndex, words]);

  const updateMPRecord = useCallback(
    async (
      pts: number,
      outcome: string,
      totalScore: number,
      currentStreak: number,
    ) => {
      if (!state.isMultiplayer || !state.roomCode || !state.playerId) return;
      await update(
        ref(db, `rooms/${state.roomCode}/players/${state.playerId}`),
        {
          score: totalScore,
          streak: currentStreak,
          answered: true,
          outcome,
          pts,
        },
      );
    },
    [state.isMultiplayer, state.roomCode, state.playerId],
  );

  const advanceToNextWord = useCallback(async () => {
    if (!state.isHost) return;
    const nextIndex = wordIndex + 1;
    if (nextIndex >= words.length) {
      await update(ref(db, `rooms/${state.roomCode}`), { status: "results" });
      endGame();
    } else {
      const resetObj: any = {
        currentWordIndex: nextIndex,
        currentWordStartTime: Date.now(),
      };
      Object.keys(players).forEach((pid) => {
        resetObj[`players/${pid}/answered`] = false;
        resetObj[`players/${pid}/outcome`] = "";
        resetObj[`players/${pid}/pts`] = 0;
      });
      await update(ref(db, `rooms/${state.roomCode}`), resetObj);
    }
  }, [state.isHost, state.roomCode, wordIndex, words.length, players]);

  const checkAllAnswered = useCallback(async () => {
    if (!state.isMultiplayer || !state.isHost || isAdvancingRef.current) return;

    const activePlayers = Object.values(players).filter((p) => p.connected !== false);
    if (activePlayers.length === 0) return;

    const allAnswered = activePlayers.every((p) => p.answered);
    if (!allAnswered) return;

    isAdvancingRef.current = true;
    try {
      await advanceToNextWord();
    } finally {
      // Small lock window prevents duplicate host advances from rapid RTDB updates.
      setTimeout(() => {
        isAdvancingRef.current = false;
      }, 250);
    }
  }, [state.isMultiplayer, state.isHost, players, advanceToNextWord]);

  useEffect(() => {
    if (!state.isMultiplayer || !state.isHost) return;
    checkAllAnswered();
  }, [players, state.isMultiplayer, state.isHost, checkAllAnswered]);

  const handleCorrect = useCallback(
    async (word: Word, isAutoAdvance: boolean) => {
      if (timerRef.current) clearInterval(timerRef.current);
      setWordState("SUBMITTED_CORRECT");

      let pts = 50;
      if (hintUsed) pts = Math.round(pts * 0.6);

      const newStreak = streak + 1;
      let finalPts = pts;
      if (newStreak >= 3) {
        finalPts += 30;
      }

      const newScore = score + finalPts;
      setScore(newScore);
      setStreak(newStreak);

      const newLog = [
        ...wordLog,
        { word: word.word, outcome: "correct", pts: finalPts },
      ];
      setWordLog(newLog);

      setFeedback({ type: "correct", message: `✓ Correct! +${finalPts}` });

      if (state.isMultiplayer) {
        await updateMPRecord(finalPts, "correct", newScore, newStreak);
      }

      setLastResult({ word: word.word, pts: finalPts, outcome: "correct" });
      setShowLBFlash(true);

      setTimeout(() => {
        setShowLBFlash(false);
        if (!isAutoAdvance) {
          if (!state.isMultiplayer) {
            const nextIndex = wordIndex + 1;
            if (nextIndex >= words.length) {
              endGame();
            } else {
              setWordIndex(nextIndex);
              setCurrentWord(words[nextIndex]);
              setWordState("IDLE");
              setGuess("");
              setShowHint("");
              setHintUsed(false);
              setFeedback(null);
              setTimeLeft(30);
              if (inputRef.current) inputRef.current.focus();
            }
          }
        }
      }, 1800);
    },
    [
      hintUsed,
      streak,
      score,
      wordLog,
      state.isMultiplayer,
      state.isHost,
      words,
      wordIndex,
      advanceToNextWord,
      updateMPRecord,
    ],
  );

  const handleAlmost = useCallback(
    async (word: Word, dist: number) => {
      if (timerRef.current) clearInterval(timerRef.current);
      setWordState("SUBMITTED_ALMOST");
      setStreak(0);

      let pts = dist === 1 ? 35 : 15;
      if (hintUsed) pts = Math.round(pts * 0.6);

      const newScore = score + pts;
      setScore(newScore);

      const newLog = [...wordLog, { word: word.word, outcome: "almost", pts }];
      setWordLog(newLog);

      setFeedback({
        type: "almost",
        message: `≈ So close! +${pts} (answer: ${word.word})`,
      });

      if (state.isMultiplayer) {
        await updateMPRecord(pts, "almost", newScore, 0);
      }

      setLastResult({ word: word.word, pts, outcome: "almost" });
      setShowLBFlash(true);

      setTimeout(() => {
        setShowLBFlash(false);
        if (!state.isMultiplayer) {
          const nextIndex = wordIndex + 1;
          if (nextIndex >= words.length) {
            endGame();
          } else {
            setWordIndex(nextIndex);
            setCurrentWord(words[nextIndex]);
            setWordState("IDLE");
            setGuess("");
            setShowHint("");
            setHintUsed(false);
            setFeedback(null);
            setTimeLeft(30);
            if (inputRef.current) inputRef.current.focus();
          }
        }
      }, 1800);
    },
    [
      hintUsed,
      score,
      wordLog,
      state.isMultiplayer,
      state.isHost,
      words,
      wordIndex,
      advanceToNextWord,
      updateMPRecord,
    ],
  );

  const handleTimeout = useCallback(async () => {
    if (!currentWord) return;
    setWordState("TIMED_OUT");
    setStreak(0);

    const newLog = [
      ...wordLog,
      { word: currentWord.word, outcome: "timeout", pts: 0 },
    ];
    setWordLog(newLog);

    setFeedback({
      type: "wrong",
      message: `⏱ Time! The word was: ${currentWord.word}`,
    });

    if (state.isMultiplayer) {
      await updateMPRecord(0, "timeout", score, 0);
    }

    setLastResult({ word: currentWord.word, pts: 0, outcome: "timeout" });
    setShowLBFlash(true);

    setTimeout(() => {
      setShowLBFlash(false);
      if (!state.isMultiplayer) {
        const nextIndex = wordIndex + 1;
        if (nextIndex >= words.length) {
          endGame();
        } else {
          setWordIndex(nextIndex);
          setCurrentWord(words[nextIndex]);
          setWordState("IDLE");
          setGuess("");
          setShowHint("");
          setHintUsed(false);
          setFeedback(null);
          if (inputRef.current) inputRef.current.focus();
        }
      }
    }, 1800);
  }, [
    currentWord,
    wordLog,
    score,
    state.isMultiplayer,
    state.isHost,
    words,
    wordIndex,
    advanceToNextWord,
    updateMPRecord,
  ]);

  const handleSkip = useCallback(() => {
    if (wordState === "SUBMITTED_CORRECT" || wordState === "SUBMITTED_ALMOST")
      return;
    if (timerRef.current) clearInterval(timerRef.current);
    setWordState("SKIPPED");
    setStreak(0);

    if (currentWord) {
      const newLog = [
        ...wordLog,
        { word: currentWord.word, outcome: "skipped", pts: 0 },
      ];
      setWordLog(newLog);

      if (state.isMultiplayer) {
        updateMPRecord(0, "skipped", score, 0);
      }

      setLastResult({ word: currentWord.word, pts: 0, outcome: "skipped" });
      setShowLBFlash(true);

      setTimeout(() => {
        setShowLBFlash(false);
        if (!state.isMultiplayer) {
          const nextIndex = wordIndex + 1;
          if (nextIndex >= words.length) {
            endGame();
          } else {
            setWordIndex(nextIndex);
            setCurrentWord(words[nextIndex]);
            setWordState("IDLE");
            setGuess("");
            setShowHint("");
            setHintUsed(false);
            setFeedback(null);
            if (inputRef.current) inputRef.current.focus();
          }
        }
      }, 1800);
    }
  }, [
    wordState,
    currentWord,
    wordLog,
    score,
    state.isMultiplayer,
    state.isHost,
    words,
    wordIndex,
    advanceToNextWord,
    updateMPRecord,
  ]);

  const handleSubmit = useCallback(() => {
    if (wordState === "SUBMITTED_CORRECT" || wordState === "SUBMITTED_ALMOST")
      return;
    if (!guess.trim() || !currentWord) return;

    const target = currentWord.word.toLowerCase();
    const dist = levenshtein(guess, target);

    if (dist === 0) {
      handleCorrect(currentWord, false);
    } else if (dist === 1 || dist === 2) {
      handleAlmost(currentWord, dist);
    } else {
      setWordState("SUBMITTED_WRONG");
      setFeedback({ type: "wrong", message: "✗ Wrong answer! Try again." });
      setTimeout(() => {
        setWordState("TYPING");
        setFeedback(null);
        setGuess("");
        if (inputRef.current) {
          inputRef.current.value = "";
          inputRef.current.focus();
        }
      }, 1000);
    }
  }, [guess, currentWord, wordState, handleCorrect, handleAlmost]);

  const handleUseHint = () => {
    if (hintsLeft <= 0 || hintUsed || !currentWord) return;
    setHintsLeft((prev) => prev - 1);
    setHintUsed(true);
    setShowHint(formatHint(currentWord.word));
  };

  const endGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (sprintTimerRef.current) clearInterval(sprintTimerRef.current);
    navigate("/results", {
      state: { score, wordLog, isMultiplayer: state.isMultiplayer, players },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a120d] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse">⏳</div>
          <div className="text-lg text-white">Loading game...</div>
          <div className="text-sm text-[rgba(255,255,255,0.5)] mt-1">
            Preparing your words
          </div>
        </div>
      </div>
    );
  }

  // Empty state - no words available
  if (!currentWord && words.length === 0) {
    return (
      <div className="min-h-screen bg-[#1a120d] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">📝</div>
          <div className="text-xl text-white mb-2">No Words Available</div>
          <div className="text-sm text-[rgba(255,255,255,0.5)] mb-6">
            No words found for the selected themes. Please add words in the
            admin panel or select different themes.
          </div>
          <button
            onClick={() => navigate("/solo-setup")}
            className="px-6 py-3 bg-[#ff4d00] rounded-2xl text-white font-barlow font-bold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!currentWord) {
    return (
      <div className="min-h-screen bg-[#1a120d] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const timerPercentage =
    (timeLeft /
      (state.mode === "round"
        ? { easy: 30, medium: 20, hard: 10 }[state.difficulty]
        : 1)) *
    100;
  const sprintMinutes = Math.floor(sprintTimeLeft / 60);
  const sprintSeconds = Math.floor(sprintTimeLeft % 60);
  const isDanger =
    (state.mode === "round" && timerPercentage <= 15) ||
    (state.mode === "sprint" && sprintTimeLeft <= 10);

  return (
    <div className="min-h-screen bg-[#1a120d] p-4 flex flex-col gap-3 text-[#ffe9dc]">
      {/* Sprint Header */}
      {state.mode === "sprint" && !state.isMultiplayer && (
        <>
          <div
            className={`text-center font-barlow text-[48px] font-black leading-none transition-colors ${isDanger ? "text-[#d64545]" : "text-white"}`}
          >
            {sprintMinutes}:{sprintSeconds.toString().padStart(2, "0")}
          </div>
          <div className="text-center text-[10px] tracking-[3px] uppercase text-[rgba(255,255,255,0.4)] mb-3">
            Time Remaining
          </div>
        </>
      )}

      {/* HUD */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] tracking-[2px] uppercase text-[rgba(255,255,255,0.4)]">
            Score
          </div>
          <div className="font-barlow text-[36px] font-black leading-none">
            {score}
          </div>
        </div>
        <div
          className={`flex items-center gap-1.5 bg-[rgba(255,154,0,0.15)] border border-[rgba(255,154,0,0.3)] rounded-full px-3 py-1.5 font-barlow font-bold text-base text-[#ff9a00] transition-opacity ${streak >= 2 ? "opacity-100" : "opacity-0"}`}
        >
          🔥 <span>{streak}</span>
        </div>
        <div className="text-right">
          <div className="text-[10px] tracking-[2px] uppercase text-[rgba(255,255,255,0.4)]">
            Question
          </div>
          <div className="text-base text-[rgba(255,255,255,0.4)]">
            {wordIndex + 1}/{state.mode === "round" ? words.length : "∞"}
          </div>
        </div>
      </div>

      {/* Round Timer */}
      {state.mode === "round" && (
        <>
          <div className="flex items-center justify-between mb-1">
            <div
              className={`font-barlow text-[28px] font-black transition-colors ${isDanger ? "text-[#d64545]" : "text-white"}`}
            >
              {Math.ceil(timeLeft)}
            </div>
            <div className="text-[10px] tracking-[2px] uppercase text-[rgba(255,255,255,0.4)]">
              seconds
            </div>
          </div>
          <div className="relative w-full h-2 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-100 ${isDanger ? "bg-[#d64545]" : "bg-[#ff4d00]"}`}
              style={{ width: `${Math.max(0, timerPercentage)}%` }}
            />
          </div>
        </>
      )}

      {/* Multiplayer Strip */}
      {state.isMultiplayer && Object.keys(players).length > 0 && (
        <>
          <div className="text-[11px] tracking-[3px] uppercase text-[rgba(255,255,255,0.4)] mb-2">
            Players
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {Object.values(players)
              .sort((a, b) => b.score - a.score)
              .map((player) => (
                <div
                  key={player.id}
                  className={`flex flex-col items-center min-w-[64px] p-2 bg-[#2e1b14] rounded-lg border ${player.answered ? "border-[rgba(47,179,109,0.4)]" : "border-[rgba(255,255,255,0.06)]"}`}
                >
                  <div className="text-[11px] text-[rgba(255,255,255,0.4)] text-center max-w-[58px] truncate">
                    {player.name}
                  </div>
                  <div
                    className="font-barlow text-xl font-black leading-none mt-0.5"
                    style={{ color: player.color }}
                  >
                    {player.score}
                  </div>
                  {player.answered && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#2fb36d] mt-1"></div>
                  )}
                </div>
              ))}
          </div>
        </>
      )}

      {/* Word Card */}
      <div className="bg-[#2e1b14] rounded-2xl p-6 pt-5 border border-[rgba(255,255,255,0.06)] flex-1 flex flex-col justify-center min-h-[120px] animate-card-fade-in">
        <div className="text-[10px] tracking-[3px] uppercase text-[#ff4d00] mb-2.5 opacity-80">
          {currentWord.theme?.charAt(0).toUpperCase() +
            currentWord.theme?.slice(1) || "General"}
        </div>
        <div className="text-[clamp(17px,4.5vw,22px)] leading-relaxed text-white">
          {currentWord[state.difficulty]}
        </div>
        {showHint && (
          <div className="font-barlow text-2xl font-bold tracking-[6px] text-[#ff9a00] mt-2.5">
            {showHint}
          </div>
        )}
        {feedback && (
          <div
            className={`flex items-center gap-2.5 p-3 px-4 rounded-lg mt-3 font-barlow text-xl font-bold ${
              feedback.type === "correct"
                ? "bg-[rgba(47,179,109,0.2)] text-[#2fb36d] border border-[rgba(47,179,109,0.3)]"
                : feedback.type === "almost"
                  ? "bg-[rgba(255,176,32,0.15)] text-[#ffb020] border border-[rgba(255,176,32,0.3)]"
                  : "bg-[rgba(214,69,69,0.15)] text-[#d64545] border border-[rgba(214,69,69,0.3)]"
            }`}
          >
            {feedback.message}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="space-y-2">
        <input
          ref={inputRef}
          type="text"
          onChange={(e) => setGuess(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className="w-full p-4 px-[18px] bg-[#2e1b14] border-2 border-[rgba(255,255,255,0.12)] rounded-lg text-white font-dm-sans text-lg font-medium outline-none focus:border-[#ff4d00] transition-colors"
          placeholder="Type your answer..."
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          disabled={
            wordState === "SUBMITTED_CORRECT" ||
            wordState === "SUBMITTED_ALMOST"
          }
        />
        <button
          onClick={handleSubmit}
          disabled={
            wordState === "SUBMITTED_CORRECT" ||
            wordState === "SUBMITTED_ALMOST"
          }
          className="w-full py-4 rounded-lg bg-[#ff4d00] text-white font-barlow text-[22px] font-black uppercase tracking-[1px] transition-all hover:bg-[#e04400] active:scale-98 disabled:opacity-35 disabled:cursor-not-allowed"
        >
          Submit
        </button>
        <div className="flex gap-2">
          <button
            onClick={handleUseHint}
            disabled={hintsLeft <= 0 || hintUsed}
            className="flex items-center gap-1.5 px-4 py-3 bg-[rgba(255,154,0,0.12)] border border-[rgba(255,154,0,0.25)] rounded-lg text-[#ff9a00] font-barlow text-base font-bold uppercase tracking-wide transition-all hover:bg-[rgba(255,154,0,0.2)] disabled:opacity-35 disabled:cursor-not-allowed"
          >
            💡 Hint (<span>{hintsLeft}</span>)
          </button>
          <button
            onClick={handleSkip}
            className="flex-1 px-4 py-3 bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-lg text-[rgba(255,255,255,0.4)] font-barlow text-base font-bold uppercase tracking-wide transition-all hover:bg-[rgba(255,255,255,0.1)] hover:text-white"
          >
            Skip →
          </button>
        </div>
      </div>

      {/* Leaderboard Flash Modal */}
      {showLBFlash && lastResult && (
        <div className="fixed inset-0 bg-[rgba(26,18,13,0.98)] flex flex-col items-center justify-center z-50 animate-[flashIn_0.25s_ease]">
          <div className="text-xs tracking-[3px] uppercase text-[rgba(255,255,255,0.4)] mb-1">
            The word was
          </div>
          <div className="font-barlow text-[42px] font-black uppercase text-white mb-1">
            {lastResult.word}
          </div>
          <div
            className={`px-4 py-1.5 rounded-full font-barlow text-base font-bold tracking-[1px] uppercase mb-6 ${
              lastResult.outcome === "correct"
                ? "bg-[rgba(47,179,109,0.2)] text-[#2fb36d]"
                : lastResult.outcome === "almost"
                  ? "bg-[rgba(255,176,32,0.15)] text-[#ffb020]"
                  : "bg-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.4)]"
            }`}
          >
            {lastResult.outcome === "correct"
              ? "Correct! ✓"
              : lastResult.outcome === "almost"
                ? "So close ≈"
                : "Skipped →"}
          </div>
          <div className="font-barlow text-[72px] font-black text-white leading-none mb-1">
            {lastResult.pts > 0 ? `+${lastResult.pts}` : "0"}
          </div>
          <div className="text-[11px] tracking-[3px] uppercase text-[rgba(255,255,255,0.4)] mb-6">
            Points This Round
          </div>

          {state.isMultiplayer && Object.keys(players).length > 0 && (
            <div className="w-full max-w-[360px] space-y-2">
              {Object.values(players)
                .sort((a, b) => b.score - a.score)
                .map((player, idx) => {
                  const medals = ["🥇", "🥈", "🥉"];
                  const medalColors = ["gold", "silver", "bronze"];
                  return (
                    <div
                      key={player.id}
                      className={`flex items-center gap-3 p-2.5 px-3.5 bg-[#2e1b14] rounded-lg border ${player.id === state.playerId ? "border-[rgba(255,77,0,0.4)] bg-[rgba(255,77,0,0.08)]" : "border-[rgba(255,255,255,0.06)]"}`}
                    >
                      <div
                        className={`font-barlow text-xl font-black w-6 ${medalColors[idx] || ""}`}
                      >
                        {medals[idx] || idx + 1}
                      </div>
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: player.color }}
                      ></div>
                      <div className="text-base flex-1">
                        {player.name}
                        {player.id === state.playerId ? " (you)" : ""}
                      </div>
                      <div className="font-barlow text-[22px] font-black text-white">
                        {player.score}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Game;
