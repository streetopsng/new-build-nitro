// src/pages/Game.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../lib/firebase";
import { ref, onValue, update, get, remove } from "firebase/database";
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
  const [mpRoundTimeLeft, setMpRoundTimeLeft] = useState(30);
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
  const mpTimerRef = useRef<any | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isAdvancingRef = useRef(false);

  // Load words from Firebase or generate from themes
  useEffect(() => {
    const loadWords = async () => {
      setIsLoading(true);
      try {
        if (state.isMultiplayer && state.roomCode) {
          const roomRef = ref(db, `rooms/${state.roomCode}`);
          const snapshot = await get(roomRef);
          if (snapshot.exists()) {
            const room = snapshot.val();
            const wordList = room.wordList || [];
            const wordsRef = ref(db, "wordBank");
            const wordsSnap = await get(wordsRef);
            if (wordsSnap.exists()) {
              const bank = Object.values(wordsSnap.val()) as Word[];
              const loadedWords = wordList
                .map((w: string) => bank.find((b) => b.word === w))
                .filter(Boolean);
              setWords(loadedWords as Word[]);
              if (loadedWords.length > 0) {
                setCurrentWord(loadedWords[0]);
              }
            }
          }
        } else if (state.themes) {
          const wordsRef = ref(db, "wordBank");
          const snapshot = await get(wordsRef);
          if (snapshot.exists()) {
            const bank = Object.values(snapshot.val()) as Word[];
            const filtered = bank.filter((w) => state.themes.includes(w.theme));
            const shuffled = [...filtered].sort(() => Math.random() - 0.5);
            const selected = shuffled.slice(
              0,
              state.mode === "round" ? 10 : 50,
            );
            setWords(selected);
            if (selected.length > 0) setCurrentWord(selected[0]);
          } else {
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

  // SPRINT TIMER - Continuous timer for BOTH solo AND multiplayer
  useEffect(() => {
    if (state.mode === "sprint") {
      const sprintDurations = { easy: 180, medium: 120, hard: 60 };
      const initialTime = sprintDurations[state.difficulty];

      // Set initial time
      setSprintTimeLeft(initialTime);

      // For multiplayer, sync to Firebase if host
      if (state.isMultiplayer && state.isHost && state.roomCode) {
        update(ref(db, `rooms/${state.roomCode}`), {
          sprintTimeLeft: initialTime,
        });
      }

      // Clear existing timer
      if (sprintTimerRef.current) {
        clearInterval(sprintTimerRef.current);
      }

      // Start continuous countdown
      sprintTimerRef.current = setInterval(() => {
        setSprintTimeLeft((prev) => {
          if (prev <= 0.1) {
            if (sprintTimerRef.current) {
              clearInterval(sprintTimerRef.current);
              sprintTimerRef.current = null;
            }
            endGame();
            return 0;
          }
          const newTime = prev - 0.1;

          // Sync to Firebase for multiplayer (host only)
          if (state.isMultiplayer && state.isHost && state.roomCode) {
            update(ref(db, `rooms/${state.roomCode}`), {
              sprintTimeLeft: newTime,
            });
          }

          return newTime;
        });
      }, 100);

      return () => {
        if (sprintTimerRef.current) {
          clearInterval(sprintTimerRef.current);
          sprintTimerRef.current = null;
        }
      };
    }
  }, [
    state.mode,
    state.difficulty,
    state.isMultiplayer,
    state.isHost,
    state.roomCode,
  ]);

  // Listen to global sprint timer (for non-host multiplayer)
  useEffect(() => {
    if (
      state.isMultiplayer &&
      state.mode === "sprint" &&
      state.roomCode &&
      !state.isHost
    ) {
      const sprintTimeRef = ref(db, `rooms/${state.roomCode}/sprintTimeLeft`);
      const unsubscribe = onValue(sprintTimeRef, (snapshot) => {
        const timeLeft = snapshot.val();
        if (timeLeft !== null && timeLeft !== undefined) {
          setSprintTimeLeft(timeLeft);
          if (timeLeft <= 0.1) {
            endGame();
          }
        }
      });
      return () => unsubscribe();
    }
  }, [state.isMultiplayer, state.mode, state.roomCode, state.isHost]);

  // Setup round timer for solo mode (ONLY round mode)
  useEffect(() => {
    if (!currentWord || state.isMultiplayer || state.mode !== "round") return;

    const durations = { easy: 30, medium: 20, hard: 10 };
    const totalTime = durations[state.difficulty];
    setTimeLeft(totalTime);

    if (timerRef.current) clearInterval(timerRef.current);
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

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentWord, state.mode, state.difficulty, state.isMultiplayer]);

  // Setup multiplayer round timer (ONLY round mode)
  useEffect(() => {
    if (!state.isMultiplayer || !currentWord || state.mode !== "round") return;

    const durations = { easy: 30, medium: 20, hard: 10 };
    const totalTime = durations[state.difficulty];
    setMpRoundTimeLeft(totalTime);

    if (mpTimerRef.current) clearInterval(mpTimerRef.current);
    mpTimerRef.current = setInterval(() => {
      setMpRoundTimeLeft((prev) => {
        if (prev <= 0.1) {
          if (mpTimerRef.current) clearInterval(mpTimerRef.current);
          if (state.isHost) {
            advanceToNextWord();
          }
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => {
      if (mpTimerRef.current) clearInterval(mpTimerRef.current);
    };
  }, [
    currentWord,
    state.isMultiplayer,
    state.difficulty,
    state.isHost,
    state.mode,
  ]);

  // Listen to multiplayer players updates
  useEffect(() => {
    if (state.isMultiplayer && state.roomCode) {
      const playersRef = ref(db, `rooms/${state.roomCode}/players`);
      const unsubscribe = onValue(playersRef, (snapshot) => {
        if (snapshot.exists()) {
          setPlayers(snapshot.val());
        }
      });
      return () => unsubscribe();
    }
  }, [state.isMultiplayer, state.roomCode]);

  // For MULTIPLAYER ROUND MODE - listen to host-controlled word index
  useEffect(() => {
    if (state.isMultiplayer && state.mode === "round" && state.roomCode) {
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
          const durations = { easy: 30, medium: 20, hard: 10 };
          setMpRoundTimeLeft(durations[state.difficulty]);
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }
      });
      return () => indexUnsubscribe();
    }
  }, [
    state.isMultiplayer,
    state.mode,
    state.roomCode,
    wordIndex,
    words,
    state.difficulty,
  ]);

  // For MULTIPLAYER SPRINT MODE - listen to game status only (no word index sync)
  useEffect(() => {
    if (state.isMultiplayer && state.mode === "sprint" && state.roomCode) {
      // Only listen for game end, not word index
      const statusRef = ref(db, `rooms/${state.roomCode}/status`);
      const statusUnsubscribe = onValue(statusRef, (snapshot) => {
        const status = snapshot.val();
        if (status === "results") {
          endGame();
        }
      });
      return () => statusUnsubscribe();
    }
  }, [state.isMultiplayer, state.mode, state.roomCode]);

  // Listen for game status changes (results)
  useEffect(() => {
    if (!state.isMultiplayer || !state.roomCode) return;

    const statusRef = ref(db, `rooms/${state.roomCode}/status`);
    const unsubscribe = onValue(statusRef, (snapshot) => {
      const status = snapshot.val();
      if (status === "results") {
        if (timerRef.current) clearInterval(timerRef.current);
        if (sprintTimerRef.current) clearInterval(sprintTimerRef.current);
        if (mpTimerRef.current) clearInterval(mpTimerRef.current);

        navigate("/results", {
          state: {
            score,
            wordLog,
            isMultiplayer: true,
            players,
            roomCode: state.roomCode,
          },
        });
      }
    });

    return () => unsubscribe();
  }, [state.isMultiplayer, state.roomCode, score, wordLog, players, navigate]);

  const updateMPRecord = useCallback(
    async (
      pts: number,
      outcome: string,
      totalScore: number,
      currentStreak: number,
    ) => {
      if (!state.isMultiplayer || !state.roomCode || !state.playerId) return;

      const updateData: any = {
        score: totalScore,
        streak: currentStreak,
        pts,
      };

      // Only mark as answered in ROUND mode
      if (state.mode === "round") {
        updateData.answered = true;
        updateData.outcome = outcome;
      }

      await update(
        ref(db, `rooms/${state.roomCode}/players/${state.playerId}`),
        updateData,
      );
    },
    [state.isMultiplayer, state.roomCode, state.playerId, state.mode],
  );

  const advanceToNextWord = useCallback(async () => {
    if (!state.isHost || state.mode !== "round") return;

    const nextIndex = wordIndex + 1;
    if (nextIndex >= words.length) {
      await update(ref(db, `rooms/${state.roomCode}`), {
        status: "results",
        gameEndedAt: Date.now(),
      });
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
  }, [
    state.isHost,
    state.mode,
    state.roomCode,
    wordIndex,
    words.length,
    players,
  ]);

  const checkAllAnswered = useCallback(async () => {
    if (!state.isMultiplayer || !state.isHost || isAdvancingRef.current) return;
    if (state.mode !== "round") return;

    const activePlayers = Object.values(players).filter(
      (p) => p.connected !== false,
    );
    if (activePlayers.length === 0) return;

    const allAnswered = activePlayers.every((p) => p.answered);
    if (!allAnswered) return;

    isAdvancingRef.current = true;
    try {
      await advanceToNextWord();
    } finally {
      setTimeout(() => {
        isAdvancingRef.current = false;
      }, 250);
    }
  }, [
    state.isMultiplayer,
    state.isHost,
    players,
    advanceToNextWord,
    state.mode,
  ]);

  useEffect(() => {
    if (!state.isMultiplayer || !state.isHost) return;
    checkAllAnswered();
  }, [players, state.isMultiplayer, state.isHost, checkAllAnswered]);

  // Move to next word - for SOLO and MULTIPLAYER SPRINT
  const moveToNextWord = useCallback(() => {
    const nextIndex = wordIndex + 1;
    if (nextIndex >= words.length) {
      if (state.mode === "sprint") {
        // Loop back to beginning for sprint mode
        setWordIndex(0);
        setCurrentWord(words[0]);
      } else {
        endGame();
        return;
      }
    } else {
      setWordIndex(nextIndex);
      setCurrentWord(words[nextIndex]);
    }
    setWordState("IDLE");
    setGuess("");
    setShowHint("");
    setHintUsed(false);
    setFeedback(null);
    if (state.mode === "round") {
      setTimeLeft(30);
    }
    if (inputRef.current) inputRef.current.focus();
  }, [wordIndex, words, state.mode]);

  const handleCorrect = useCallback(
    async (word: Word) => {
      // Only clear round timer for round mode
      if (state.mode === "round" && timerRef.current) {
        clearInterval(timerRef.current);
      }

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

        // In SPRINT mode, move to next word immediately
        if (state.mode === "sprint") {
          setLastResult({ word: word.word, pts: finalPts, outcome: "correct" });
          setShowLBFlash(true);
          setTimeout(() => {
            setShowLBFlash(false);
            moveToNextWord();
          }, 1800);
        }
        // In ROUND mode, wait for all players
      } else {
        // Solo mode
        setLastResult({ word: word.word, pts: finalPts, outcome: "correct" });
        setShowLBFlash(true);
        setTimeout(() => {
          setShowLBFlash(false);
          moveToNextWord();
        }, 1800);
      }
    },
    [
      hintUsed,
      streak,
      score,
      wordLog,
      state.isMultiplayer,
      state.mode,
      updateMPRecord,
      moveToNextWord,
    ],
  );

  const handleAlmost = useCallback(
    async (word: Word, dist: number) => {
      if (state.mode === "round" && timerRef.current) {
        clearInterval(timerRef.current);
      }

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

        if (state.mode === "sprint") {
          setLastResult({ word: word.word, pts, outcome: "almost" });
          setShowLBFlash(true);
          setTimeout(() => {
            setShowLBFlash(false);
            moveToNextWord();
          }, 1800);
        }
      } else {
        setLastResult({ word: word.word, pts, outcome: "almost" });
        setShowLBFlash(true);
        setTimeout(() => {
          setShowLBFlash(false);
          moveToNextWord();
        }, 1800);
      }
    },
    [
      hintUsed,
      score,
      wordLog,
      state.isMultiplayer,
      state.mode,
      updateMPRecord,
      moveToNextWord,
    ],
  );

  const handleWrong = useCallback(
    async (word: Word, outcome: "wrong" | "skipped") => {
      if (state.mode === "round" && timerRef.current) {
        clearInterval(timerRef.current);
      }

      setWordState("SUBMITTED_WRONG");
      setStreak(0);

      const newLog = [...wordLog, { word: word.word, outcome, pts: 0 }];
      setWordLog(newLog);
      setFeedback({
        type: "wrong",
        message:
          outcome === "skipped"
            ? `↷ Skipped (answer: ${word.word})`
            : `✗ Wrong - try again!`,
      });

      if (state.isMultiplayer) {
        if (outcome === "skipped") {
          await updateMPRecord(0, outcome, score, 0);

          if (state.mode === "sprint") {
            setLastResult({ word: word.word, pts: 0, outcome });
            setShowLBFlash(true);
            setTimeout(() => {
              setShowLBFlash(false);
              moveToNextWord();
            }, 1800);
            return;
          }
        }
      } else if (outcome === "skipped") {
        setLastResult({ word: word.word, pts: 0, outcome });
        setShowLBFlash(true);
        setTimeout(() => {
          setShowLBFlash(false);
          moveToNextWord();
        }, 1800);
        return;
      }

      // For wrong answers, stay on same word
      setTimeout(() => {
        setWordState("IDLE");
        setFeedback(null);
        if (inputRef.current) inputRef.current.focus();
      }, 1500);
    },
    [
      wordLog,
      state.isMultiplayer,
      state.mode,
      score,
      updateMPRecord,
      moveToNextWord,
    ],
  );

  const handleTimeout = useCallback(async () => {
    if (!currentWord) return;

    if (state.mode === "round" && timerRef.current) {
      clearInterval(timerRef.current);
    }

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

    if (state.isMultiplayer && state.mode === "round") {
      await updateMPRecord(0, "timeout", score, 0);
    }

    setLastResult({ word: currentWord.word, pts: 0, outcome: "timeout" });
    setShowLBFlash(true);

    setTimeout(() => {
      setShowLBFlash(false);
      moveToNextWord();
    }, 1800);
  }, [
    currentWord,
    wordLog,
    score,
    state.isMultiplayer,
    state.mode,
    updateMPRecord,
    moveToNextWord,
  ]);

  const handleSkip = useCallback(() => {
    if (
      wordState === "SUBMITTED_CORRECT" ||
      wordState === "SUBMITTED_ALMOST" ||
      wordState === "SUBMITTED_WRONG"
    )
      return;
    if (!currentWord) return;
    setWordState("SKIPPED");
    handleWrong(currentWord, "skipped");
  }, [wordState, currentWord, handleWrong]);

  const handleSubmit = useCallback(() => {
    if (
      wordState === "SUBMITTED_CORRECT" ||
      wordState === "SUBMITTED_ALMOST" ||
      wordState === "SUBMITTED_WRONG"
    )
      return;
    if (!guess.trim() || !currentWord) return;

    const target = currentWord.word.toLowerCase();
    const dist = levenshtein(guess, target);

    if (dist === 0) {
      handleCorrect(currentWord);
    } else if (dist === 1 || dist === 2) {
      handleAlmost(currentWord, dist);
    } else {
      handleWrong(currentWord, "wrong");
    }
  }, [guess, currentWord, wordState, handleCorrect, handleAlmost, handleWrong]);

  const handleUseHint = () => {
    if (hintsLeft <= 0 || hintUsed || !currentWord) return;
    setHintsLeft((prev) => prev - 1);
    setHintUsed(true);
    setShowHint(formatHint(currentWord.word));
  };

  const endGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (sprintTimerRef.current) {
      clearInterval(sprintTimerRef.current);
      sprintTimerRef.current = null;
    }
    if (mpTimerRef.current) clearInterval(mpTimerRef.current);

    navigate("/results", {
      state: {
        score,
        wordLog,
        isMultiplayer: state.isMultiplayer,
        players,
        roomCode: state.roomCode,
        playerId: state.playerId,
        playerName: state.playerName,
      },
    });
  };

  const leaveGame = async () => {
    if (state.isMultiplayer && state.roomCode && state.playerId) {
      const playerRef = ref(
        db,
        `rooms/${state.roomCode}/players/${state.playerId}`,
      );
      await remove(playerRef);
    }
    navigate("/");
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
  const mpTimerPercentage =
    (mpRoundTimeLeft /
      (state.difficulty === "easy"
        ? 30
        : state.difficulty === "medium"
          ? 20
          : 10)) *
    100;
  const sprintMinutes = Math.floor(sprintTimeLeft / 60);
  const sprintSeconds = Math.floor(sprintTimeLeft % 60);
  const isDanger =
    (state.mode === "round" && !state.isMultiplayer && timerPercentage <= 15) ||
    (state.mode === "sprint" && sprintTimeLeft <= 10);
  const isMpDanger =
    state.isMultiplayer && state.mode === "round" && mpRoundTimeLeft <= 5;

  const hasPlayerAnswered =
    state.isMultiplayer && state.mode === "round" && state.playerId
      ? players[state.playerId]?.answered
      : false;

  return (
    <div className="min-h-screen bg-[#1a120d] p-4 flex flex-col gap-3 text-[#ffe9dc]">
      {/* Sprint Header - Shows for BOTH solo and multiplayer sprint */}
      {state.mode === "sprint" && (
        <>
          <audio autoPlay loop>
            <source src="/sounds/game-lobby.mp3" type="audio/mpeg" />
          </audio>
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
          {state.isMultiplayer ? (
            <button
              onClick={leaveGame}
              className="px-3 py-1.5 bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.2)] rounded-lg text-sm text-white hover:bg-[rgba(255,255,255,0.2)] transition-colors"
            >
              Leave Game
            </button>
          ) : (
            <>
              <div className="text-[10px] tracking-[2px] uppercase text-[rgba(255,255,255,0.4)]">
                Question
              </div>
              <div className="text-base text-[rgba(255,255,255,0.4)]">
                {state.mode === "sprint"
                  ? `${wordIndex + 1} answered`
                  : `${wordIndex + 1}/${words.length}`}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Solo Round Timer */}
      {state.mode === "round" && !state.isMultiplayer && (
        <>
          <audio autoPlay loop>
            <source src="/sounds/solo.mp3" type="audio/mpeg" />
          </audio>
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

      {/* Multiplayer Round Timer */}
      {state.isMultiplayer && state.mode === "round" && (
        <>
          <audio autoPlay loop>
            <source src="/sounds/multi-player.mp3" type="audio/mpeg" />
          </audio>
          <div className="flex items-center justify-between mb-1">
            <div
              className={`font-barlow text-[28px] font-black transition-colors ${isMpDanger ? "text-[#d64545]" : "text-white"}`}
            >
              {Math.ceil(mpRoundTimeLeft)}
            </div>
            <div className="text-[10px] tracking-[2px] uppercase text-[rgba(255,255,255,0.4)]">
              seconds
            </div>
          </div>
          <div className="relative w-full h-2 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-100 ${isMpDanger ? "bg-[#d64545]" : "bg-[#ff4d00]"}`}
              style={{ width: `${Math.max(0, mpTimerPercentage)}%` }}
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
                  className={`flex flex-col items-center min-w-[64px] p-2 bg-[#2e1b14] rounded-lg border ${player.answered && state.mode === "round" ? "border-[rgba(47,179,109,0.4)]" : "border-[rgba(255,255,255,0.06)]"}`}
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
                  {player.answered && state.mode === "round" && (
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
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className="w-full p-4 px-[18px] bg-[#2e1b14] border-2 border-[rgba(255,255,255,0.12)] rounded-lg text-white font-dm-sans text-lg font-medium outline-none focus:border-[#ff4d00] transition-colors"
          placeholder={
            hasPlayerAnswered
              ? "Waiting for other players..."
              : "Type your answer..."
          }
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          disabled={
            wordState === "SUBMITTED_CORRECT" ||
            wordState === "SUBMITTED_ALMOST" ||
            wordState === "SUBMITTED_WRONG" ||
            hasPlayerAnswered
          }
        />
        <button
          onClick={handleSubmit}
          disabled={
            wordState === "SUBMITTED_CORRECT" ||
            wordState === "SUBMITTED_ALMOST" ||
            wordState === "SUBMITTED_WRONG" ||
            hasPlayerAnswered
          }
          className="w-full py-4 rounded-lg bg-[#ff4d00] text-white font-barlow text-[22px] font-black uppercase tracking-[1px] transition-all hover:bg-[#e04400] active:scale-98 disabled:opacity-35 disabled:cursor-not-allowed"
        >
          Submit
        </button>
        <div className="flex gap-2">
          <button
            onClick={handleUseHint}
            disabled={hintsLeft <= 0 || hintUsed || hasPlayerAnswered}
            className="flex items-center gap-1.5 px-4 py-3 bg-[rgba(255,154,0,0.12)] border border-[rgba(255,154,0,0.25)] rounded-lg text-[#ff9a00] font-barlow text-base font-bold uppercase tracking-wide transition-all hover:bg-[rgba(255,154,0,0.2)] disabled:opacity-35 disabled:cursor-not-allowed"
          >
            💡 Hint (<span>{hintsLeft}</span>)
          </button>
          <button
            onClick={handleSkip}
            disabled={hasPlayerAnswered}
            className="flex-1 px-4 py-3 bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-lg text-[rgba(255,255,255,0.4)] font-barlow text-base font-bold uppercase tracking-wide transition-all hover:bg-[rgba(255,255,255,0.1)] hover:text-white disabled:opacity-35 disabled:cursor-not-allowed"
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
