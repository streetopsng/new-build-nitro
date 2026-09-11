// src/pages/Game.tsx
import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Avatar } from "../components/Avatar";
import { useGame } from "../contexts/GameContext";
import { db } from "../lib/firebase";
import { ref, onValue, update } from "firebase/database";

interface LocationState {
  roomCode?: string;
  playerId?: string;
  isHost?: boolean;
  playerName?: string;
  isMultiplayer?: boolean;
}

interface LeaderboardEntry {
  id: string;
  name: string;
  avatarId?: string;
  score: number;
}

const Game: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  const { wordBank } = useGame();

  const roomCode = state?.roomCode || "DEMO";
  const playerName = state?.playerName || "Ayoola";
  const playerId = state?.playerId || "player_" + Date.now();

  const [score, setScore] = useState(0);
  const [wordTimer, setWordTimer] = useState(30);
  const [sessionTimer, setSessionTimer] = useState(300); // 5 mins
  const [streak, setStreak] = useState(0);
  const [hintsLeft, setHintsLeft] = useState(5);
  const [hintActive, setHintActive] = useState(false);
  const [userGuess, setUserGuess] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | "streak" | null>(null);
  const [showRoundCompleteModal, setShowRoundCompleteModal] = useState(false);

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Active word
  const rawWord = wordBank[currentWordIndex % Math.max(wordBank.length, 1)];
  const activeWord = {
    word: rawWord?.word || "TOUCHLIGHT",
    clue: rawWord?.easy || rawWord?.medium || rawWord?.hard || "A portable light you hold in your hand when it is dark.",
    theme: rawWord?.theme || "GENERAL",
  };

  // Helper to generate hint pattern: first and last letter of each word revealed
  const getHintDisplay = (word: string) => {
    return word
      .split(" ")
      .map((part) => {
        if (part.length <= 2) return part;
        return (
          part[0] +
          " " +
          part
            .slice(1, -1)
            .split("")
            .map(() => "_")
            .join(" ") +
          " " +
          part[part.length - 1]
        );
      })
      .join("   ");
  };

  // Realtime Firebase Leaderboard Sync
  useEffect(() => {
    if (roomCode && roomCode !== "DEMO") {
      const playersRef = ref(db, `rooms/${roomCode}/players`);
      const unsubscribe = onValue(playersRef, (snapshot) => {
        if (snapshot.exists()) {
          const playersObj = snapshot.val();
          const list: LeaderboardEntry[] = Object.values(playersObj).map((p: any) => ({
            id: p.id || p.name,
            name: p.name,
            avatarId: p.avatarId,
            score: p.score || 0,
          }));
          list.sort((a, b) => b.score - a.score);
          setLeaderboard(list.slice(0, 5));
        }
      });
      return () => unsubscribe();
    } else {
      // Demo rankings
      setLeaderboard([
        { id: "1", name: "Chidi", avatarId: "av-2", score: 960 },
        { id: "2", name: "Blessing", avatarId: "av-6", score: 780 },
        { id: "3", name: playerName, avatarId: "av-1", score },
        { id: "4", name: "Tope", avatarId: "av-9", score: 620 },
      ]);
    }
  }, [roomCode, playerName, score]);

  // Session 5-minute timer
  useEffect(() => {
    const sessionInterval = setInterval(() => {
      setSessionTimer((prev) => {
        if (prev <= 1) {
          clearInterval(sessionInterval);
          setShowRoundCompleteModal(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(sessionInterval);
  }, []);

  // Clue 30s timer
  useEffect(() => {
    const wordInterval = setInterval(() => {
      setWordTimer((prev) => {
        if (prev <= 1) {
          handleNextWord();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(wordInterval);
  }, [currentWordIndex]);

  const handleNextWord = () => {
    setWordTimer(30);
    setHintActive(false);
    setUserGuess("");
    setCurrentWordIndex((prev) => (prev + 1) % Math.max(wordBank.length, 1));
  };

  const handleGuessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanGuess = userGuess.trim().toUpperCase();
    if (!cleanGuess) return;

    if (cleanGuess === activeWord.word.toUpperCase()) {
      const basePoints = hintActive ? 18 : 30;
      const speedBonus = wordTimer > 20 ? 5 : 0;
      const streakBonus = streak >= 2 ? 30 : 0;
      const pointsGained = basePoints + speedBonus + streakBonus;

      const newScore = score + pointsGained;
      const newStreak = streak + 1;
      setScore(newScore);
      setStreak(newStreak);

      setFeedback(newStreak >= 3 ? "streak" : "correct");
      setTimeout(() => setFeedback(null), 1400);

      // Push score to Firebase
      if (roomCode && roomCode !== "DEMO") {
        try {
          await update(ref(db, `rooms/${roomCode}/players/${playerId}`), {
            score: newScore,
          });
        } catch (err) {
          console.error("Failed to update score:", err);
        }
      }

      handleNextWord();
    } else {
      setStreak(0);
      setFeedback("incorrect");
      setTimeout(() => setFeedback(null), 1200);
      setUserGuess("");
    }
    inputRef.current?.focus();
  };

  const handleHint = () => {
    if (hintsLeft > 0 && !hintActive) {
      setHintsLeft((prev) => prev - 1);
      setHintActive(true);
    }
  };

  const handleSkip = () => {
    setStreak(0);
    handleNextWord();
  };

  const formatSessionTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleProceedToResults = () => {
    navigate("/results", {
      state: {
        score,
        roomCode,
        playerName,
        streaks: streak,
        hintsUsed: 5 - hintsLeft,
      },
    });
  };

  const topScorerName = leaderboard[0]?.name || playerName;
  const topScorerScore = leaderboard[0]?.score || score;

  return (
    <div className="min-h-screen bg-white text-slate-900 p-4 md:p-8 flex flex-col items-center justify-center select-none relative overflow-x-hidden">
      {/* Outer Tech Frame Container matching Figma #1563:2405 */}
      <div className="max-w-6xl w-full bg-[#FFFBF7] border-2 border-black/40 rounded-3xl p-6 md:p-10 shadow-xl relative z-10 space-y-6 animate-card-fade-in">
        {/* Top Notch Accents */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 flex gap-1.5">
          <div className="w-4 h-1.5 bg-[#FF8E37] rounded-full" />
          <div className="w-4 h-1.5 bg-[#FF8E37] rounded-full" />
          <div className="w-4 h-1.5 bg-[#FF8E37] rounded-full" />
        </div>

        {/* Session Name Header */}
        <div className="text-center pt-2">
          <div className="text-[11px] font-black uppercase tracking-widest text-black/50">
            SESSION
          </div>
          <h1 className="font-heading font-black text-2xl text-black flex items-center justify-center gap-2 mt-0.5">
            <span className="text-[#FF8E37]">•</span> Q3 New Hire Batch <span className="text-[#FF8E37]">•</span>
          </h1>
        </div>

        {/* 4 Stat Cards Bar with Progress Bar matching Figma */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="bg-white border border-black/20 rounded-2xl p-4 shadow-2xs">
              <div className="text-[11px] font-black uppercase tracking-wider text-black/50 flex items-center gap-1.5">
                <span>🏆</span> YOUR SCORE
              </div>
              <div className="font-heading font-black text-3xl md:text-4xl text-[#FF8E37] mt-1">
                {score}
              </div>
            </div>

            <div className="bg-white border border-black/20 rounded-2xl p-4 shadow-2xs">
              <div className="text-[11px] font-black uppercase tracking-wider text-black/50 flex items-center gap-1.5">
                <span>🕒</span> TIME
              </div>
              <div className={`font-heading font-black text-3xl md:text-4xl mt-1 ${wordTimer <= 5 ? "text-red-500 animate-pulse" : "text-black"}`}>
                {wordTimer}s
              </div>
            </div>

            <div className="bg-white border border-black/20 rounded-2xl p-4 shadow-2xs">
              <div className="text-[11px] font-black uppercase tracking-wider text-black/50 flex items-center gap-1.5">
                <span>🔥</span> STREAK
              </div>
              <div className="font-heading font-black text-3xl md:text-4xl text-black mt-1">
                {streak}
              </div>
            </div>

            <div className="bg-white border border-black/20 rounded-2xl p-4 shadow-2xs">
              <div className="text-[11px] font-black uppercase tracking-wider text-black/50 flex items-center gap-1.5">
                <span>💡</span> HINTS
              </div>
              <div className="font-heading font-black text-3xl md:text-4xl text-black mt-1">
                {hintsLeft}
              </div>
            </div>
          </div>

          {/* Full-width Timer Progress Line */}
          <div className="w-full bg-black/10 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                wordTimer <= 5 ? "bg-red-500 animate-pulse" : "bg-[#FF8E37]"
              }`}
              style={{ width: `${(wordTimer / 30) * 100}%` }}
            />
          </div>
        </div>

        {/* Main Content: LIVE RANKINGS vs CLUE CARD */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left Column: LIVE RANKINGS */}
          <div className="md:col-span-4 bg-white border border-black/30 rounded-3xl p-5 shadow-xs text-left space-y-3">
            <div className="text-xs font-black text-[#FF8E37] uppercase tracking-wider flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF8E37] animate-ping" />
              <span>LIVE RANKINGS</span>
            </div>

            <div className="space-y-2">
              {leaderboard.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-[#FF8E37] text-black border-2 border-black flex items-center justify-between shadow-xs font-heading font-black"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-white text-black font-black text-xs flex items-center justify-center shadow-xs">
                      {idx + 1}
                    </span>
                    <Avatar id={item.avatarId || "av-1"} size="sm" />
                    <span className="truncate max-w-[100px] text-sm">
                      {item.name}
                    </span>
                  </div>
                  <span className="font-mono text-sm">{item.score}</span>
                </div>
              ))}
            </div>

            {/* Current Player Indicator */}
            <div className="pt-2 border-t border-black/10">
              <div className="p-3 rounded-2xl bg-[#FFEDD5] border-2 border-[#FF8E37] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Avatar id="av-1" size="sm" />
                  <div className="text-left">
                    <div className="font-black text-xs text-black">
                      {playerName} <span className="text-[#FF8E37]">(YOU)</span>
                    </div>
                    <div className="text-xs font-black text-[#FF8E37]">
                      {score} pts
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: CLUE CARD */}
          <div className="md:col-span-8 bg-white border border-black/30 rounded-3xl p-6 md:p-8 text-left shadow-xs space-y-6 relative overflow-hidden">
            {/* Feedback Popups */}
            {feedback === "correct" && (
              <div className="absolute top-4 right-6 px-4 py-1.5 rounded-full bg-emerald-100 border border-emerald-400 text-emerald-800 font-black text-xs animate-bounce">
                ✓ CORRECT! +30 PTS
              </div>
            )}
            {feedback === "streak" && (
              <div className="absolute top-4 right-6 px-4 py-1.5 rounded-full bg-orange-100 border-2 border-[#FF8E37] text-[#FF8E37] font-black text-xs animate-bounce">
                🔥 STREAK BONUS! +60 PTS
              </div>
            )}
            {feedback === "incorrect" && (
              <div className="absolute top-4 right-6 px-4 py-1.5 rounded-full bg-red-100 border border-red-400 text-red-800 font-black text-xs animate-pulse">
                ✕ INCORRECT! TRY AGAIN
              </div>
            )}

            {/* Theme / Category Badge */}
            <div className="inline-block px-3.5 py-1 rounded-full border-2 border-[#FF8E37] bg-orange-50 text-[#FF8E37] font-black text-xs uppercase tracking-wider">
              {activeWord.theme}
            </div>

            {/* Clue Text */}
            <h2 className="font-heading font-black text-xl md:text-2xl text-black leading-relaxed">
              {activeWord.clue}
            </h2>

            {/* Hint Revealed Display */}
            {hintActive && (
              <div className="p-4 rounded-2xl bg-[#FFFBF7] border-2 border-dashed border-[#FF8E37] text-center">
                <div className="text-xs font-black text-black/50 mb-1">REVEALED LETTERS</div>
                <div className="font-mono font-black text-2xl tracking-[0.25em] text-black">
                  {getHintDisplay(activeWord.word)}
                </div>
              </div>
            )}

            {/* Guess Form */}
            <form onSubmit={handleGuessSubmit} className="space-y-6">
              <input
                ref={inputRef}
                type="text"
                value={userGuess}
                onChange={(e) => setUserGuess(e.target.value)}
                placeholder="Type your guess..."
                autoFocus
                className={`w-full bg-white border-2 rounded-2xl px-5 py-4 text-lg text-black font-semibold focus:outline-none transition-colors ${
                  feedback === "incorrect"
                    ? "border-red-500"
                    : feedback === "correct"
                    ? "border-emerald-500"
                    : "border-black/30 focus:border-[#FF8E37]"
                }`}
              />

              {/* 3 Action Buttons matching Figma */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleHint}
                  disabled={hintsLeft <= 0 || hintActive}
                  className="flex-1 min-w-[120px] py-3.5 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-black font-black text-sm border-2 border-black shadow-xs active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>💡</span> Hint ({hintsLeft})
                </button>

                <button
                  type="button"
                  onClick={handleSkip}
                  className="flex-1 min-w-[120px] py-3.5 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-black font-black text-sm border-2 border-black shadow-xs active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>▷</span> Skip
                </button>

                <button
                  type="submit"
                  className="flex-1 min-w-[140px] py-3.5 px-8 rounded-2xl bg-[#FF8E37] hover:bg-[#EA580C] text-black font-heading font-black text-base border-[2px_5px_5px_2px] border-black shadow-xs active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  Submit ➔
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Session Time Remaining Footer */}
        <div className="text-center text-xs font-bold text-black/50">
          Session time left: <span className="text-[#FF8E37] font-black">{formatSessionTime(sessionTimer)}</span>
        </div>
      </div>

      {/* ROUND COMPLETE Celebration Overlay Modal matching Figma #1608:1175 */}
      {showRoundCompleteModal && (
        <div
          onClick={handleProceedToResults}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-card-fade-in cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-[#FFFBF7] border-2 border-black p-8 text-center text-slate-900 shadow-2xl relative space-y-4"
          >
            <span className="absolute top-4 left-6 text-[#FF8E37] text-2xl animate-bounce">★</span>
            <span className="absolute top-6 right-6 text-[#FF8E37] text-3xl animate-pulse">★</span>
            <span className="absolute bottom-6 left-8 text-[#FF8E37] text-xl">★</span>

            <h2 className="font-heading font-black text-3xl text-black tracking-tight">
              ROUND COMPLETE!
            </h2>

            <div className="text-xs font-bold uppercase tracking-wider text-black/50">
              Top scorer this round
            </div>

            <div className="font-heading font-black text-2xl text-black">
              {topScorerName}
            </div>

            <div className="font-heading font-black text-4xl text-[#FF8E37]">
              +{topScorerScore} pts
            </div>

            <button
              onClick={handleProceedToResults}
              className="w-full py-4 rounded-2xl bg-[#FF8E37] hover:bg-[#EA580C] text-black font-heading font-black text-lg border-[2px_5px_5px_2px] border-black shadow-xs cursor-pointer"
            >
              View Final Results →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
