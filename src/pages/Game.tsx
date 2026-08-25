// src/pages/Game.tsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Avatar } from "../components/Avatar";
import { useGame } from "../contexts/GameContext";
import { db } from "../lib/firebase";
import { ref, onValue, update } from "firebase/database";
import { BackgroundDoodles } from "../components/BackgroundDoodles";

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

  const roomCode = state?.roomCode || "DEFAULT";
  const playerName = state?.playerName || "Player";
  const playerId = state?.playerId || "player_" + Date.now();

  const [score, setScore] = useState(0);
  const [wordTimer, setWordTimer] = useState(30);
  const [sessionTimer, setSessionTimer] = useState(300); // 05:00
  const [streak, setStreak] = useState(0);
  const [hintsLeft, setHintsLeft] = useState(5);
  const [userGuess, setUserGuess] = useState("");
  const [showRoundCompleteModal, setShowRoundCompleteModal] = useState(false);

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Current Question
  const rawWord = wordBank[currentWordIndex];
  const activeWord = {
    word: rawWord?.word || "TOUCHLIGHT",
    clue: rawWord?.easy || rawWord?.medium || rawWord?.hard || "A portable light you hold in your hand when it is dark.",
    theme: rawWord?.theme || "GENERAL",
  };

  // Realtime Firebase Leaderboard Sync
  useEffect(() => {
    if (roomCode && roomCode !== "DEFAULT") {
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
    }
  }, [roomCode]);

  // Timers
  useEffect(() => {
    if (sessionTimer > 0) {
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
    }
  }, [sessionTimer]);

  useEffect(() => {
    const wordInterval = setInterval(() => {
      setWordTimer((prev) => (prev > 0 ? prev - 1 : 30));
    }, 1000);
    return () => clearInterval(wordInterval);
  }, []);

  const handleGuessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userGuess.trim()) return;

    if (userGuess.trim().toUpperCase() === activeWord.word.toUpperCase()) {
      const pointsGained = 100 + streak * 10;
      const newScore = score + pointsGained;
      setScore(newScore);
      setStreak((prev) => prev + 1);
      setUserGuess("");
      setWordTimer(30);
      setCurrentWordIndex((prev) => (prev + 1) % Math.max(wordBank.length, 1));

      // Push score to Firebase
      if (roomCode && roomCode !== "DEFAULT") {
        try {
          await update(ref(db, `rooms/${roomCode}/players/${playerId}`), {
            score: newScore,
          });
        } catch (err) {
          console.error("Failed to update score:", err);
        }
      }
    } else {
      setStreak(0);
      setUserGuess("");
    }
  };

  const handleHint = () => {
    if (hintsLeft > 0) {
      setHintsLeft((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    setWordTimer(30);
    setUserGuess("");
    setCurrentWordIndex((prev) => (prev + 1) % Math.max(wordBank.length, 1));
  };

  const formatSessionTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleProceedToResults = () => {
    navigate("/results", { state: { score, roomCode, playerName } });
  };

  const topScorerName = leaderboard[0]?.name || "Winner";
  const topScorerScore = leaderboard[0]?.score || score;

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 p-4 md:p-8 flex flex-col items-center justify-center select-none relative overflow-hidden">
      {/* Background Line-Art Doodles */}
      <BackgroundDoodles opacity="opacity-15" />

      {/* Outer Tech Frame Container with Corner Cutouts matching Screenshot */}
      <div className="max-w-5xl w-full bg-white border-2 border-slate-300 rounded-3xl p-6 md:p-8 shadow-2xl relative z-10">
        {/* Top Notch Accents */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-1">
          <div className="w-3 h-1 bg-[#f97316] rounded-xs" />
          <div className="w-3 h-1 bg-[#f97316] rounded-xs" />
          <div className="w-3 h-1 bg-[#f97316] rounded-xs" />
        </div>

        {/* Session Header */}
        <div className="text-center mb-6">
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            SESSIONS NAME
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-black flex items-center justify-center gap-2 mt-0.5">
            <span className="text-[#f97316]">•</span> Q3 New Hire Batch <span className="text-[#f97316]">•</span>
          </h1>
        </div>

        {/* Top 4 Stat Cards Bar with Thick Orange Underline */}
        <div className="mb-6 pb-2 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
            <div className="rounded-2xl bg-[#fffdfa] border border-slate-200 p-3.5 text-left shadow-xs">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <span>🏆</span> YOUR SCORE
              </div>
              <div className="font-heading font-extrabold text-3xl text-[#f97316] mt-1">
                {score}
              </div>
            </div>

            <div className="rounded-2xl bg-[#fffdfa] border border-slate-200 p-3.5 text-left shadow-xs">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <span>🕒</span> TIME
              </div>
              <div className="font-heading font-extrabold text-3xl text-black mt-1">
                {wordTimer}s
              </div>
            </div>

            <div className="rounded-2xl bg-[#fffdfa] border border-slate-200 p-3.5 text-left shadow-xs">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <span>🔥</span> STREAK
              </div>
              <div className="font-heading font-extrabold text-3xl text-black mt-1">
                {streak}
              </div>
            </div>

            <div className="rounded-2xl bg-[#fffdfa] border border-slate-200 p-3.5 text-left shadow-xs">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <span>💡</span> HINTS
              </div>
              <div className="font-heading font-extrabold text-3xl text-black mt-1">
                {hintsLeft}
              </div>
            </div>
          </div>

          {/* Orange Timer Progress Line Under Stat Cards matching Screenshot */}
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#f97316] rounded-full transition-all duration-300"
              style={{ width: `${(wordTimer / 30) * 100}%` }}
            />
          </div>
        </div>

        {/* Main Content Area: Left Rankings vs Center Clue Card */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left Sidebar: LIVE RANKINGS matching Screenshot EXACTLY */}
          <div className="md:col-span-4 rounded-2xl border border-slate-300 p-4 bg-white text-left space-y-3">
            <div className="text-xs font-extrabold text-[#f97316] uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <span>((•))</span> LIVE RANKINGS
            </div>

            {/* 5 Vibrant Orange Rank Cards matching Screenshot */}
            <div className="space-y-2">
              {leaderboard.length === 0 ? (
                <div className="text-xs text-slate-400 font-semibold text-center py-4">
                  Waiting for player rankings...
                </div>
              ) : (
                leaderboard.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-2xl bg-[#f97316] text-white flex items-center justify-between shadow-xs border border-orange-600"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-white text-black font-extrabold text-xs flex items-center justify-center shadow-xs">
                        {idx + 1}
                      </span>
                      <Avatar id={item.avatarId || "av-1"} size="sm" />
                      <span className="font-extrabold text-xs text-white truncate max-w-[90px]">
                        {item.name}
                      </span>
                    </div>
                    <span className="font-mono font-extrabold text-xs text-white">
                      {item.score}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Bottom Self Rank Badge matching Screenshot */}
            <div className="pt-2 border-t border-slate-200">
              <div className="p-3 rounded-2xl bg-[#ffedd5] border border-[#f97316] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="font-extrabold text-xs text-[#f97316]">#--</span>
                  <Avatar id="av-1" size="sm" />
                  <div className="text-left">
                    <div className="font-extrabold text-xs text-slate-900">
                      {playerName} <span className="text-[#f97316]">(YOU)</span>
                    </div>
                    <div className="text-[10px] font-bold text-[#f97316]">
                      {score} pts
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Center Clue Card matching Screenshot EXACTLY */}
          <div className="md:col-span-8 rounded-3xl bg-[#fffdfa] border border-orange-200 p-6 md:p-8 text-left shadow-sm">
            <div className="inline-block px-3 py-1 rounded-md border border-[#f97316] text-[#f97316] font-extrabold text-xs uppercase tracking-wider mb-4">
              {activeWord.theme || "GENERAL"}
            </div>

            <h2 className="font-heading font-extrabold text-xl md:text-2xl text-black leading-snug mb-6">
              {activeWord.clue}
            </h2>

            <form onSubmit={handleGuessSubmit} className="space-y-6">
              <input
                type="text"
                value={userGuess}
                onChange={(e) => setUserGuess(e.target.value)}
                placeholder="Type your guess..."
                className="w-full bg-white border border-slate-300 focus:border-[#f97316] focus:outline-none rounded-2xl px-5 py-4 text-base text-black font-semibold transition-colors"
              />

              {/* 3 Action Buttons matching Screenshot EXACTLY */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleHint}
                  className="flex-1 min-w-[120px] py-3.5 px-6 rounded-xl bg-[#cbd5e1] hover:bg-slate-300 text-black font-bold text-sm border-2 border-black shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>💡</span> Hint ({hintsLeft})
                </button>

                <button
                  type="button"
                  onClick={handleSkip}
                  className="flex-1 min-w-[120px] py-3.5 px-6 rounded-xl bg-[#cbd5e1] hover:bg-slate-300 text-black font-bold text-sm border-2 border-black shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>▷</span> Skip
                </button>

                <button
                  type="submit"
                  className="flex-1 min-w-[140px] py-3.5 px-8 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-black font-extrabold text-sm border-2 border-black shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  Submit ➔
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom Session Time Left */}
        <div className="text-center mt-6 text-xs font-bold text-slate-500">
          Session time left: <span className="text-[#f97316] font-extrabold">{formatSessionTime(sessionTimer)}</span>
        </div>

        {/* Bottom Notch Accents */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          <div className="w-3 h-1 bg-[#f97316] rounded-xs" />
          <div className="w-3 h-1 bg-[#f97316] rounded-xs" />
          <div className="w-3 h-1 bg-[#f97316] rounded-xs" />
        </div>
      </div>

      {/* ROUND COMPLETE Celebration Overlay Modal matching Screenshot EXACTLY */}
      {showRoundCompleteModal && (
        <div
          onClick={handleProceedToResults}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-card-fade-in cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-[#fffdfa] border border-slate-200 p-8 text-center text-slate-900 shadow-2xl relative"
          >
            {/* Floating Star Particles */}
            <span className="absolute top-4 left-6 text-[#f97316] text-xl animate-bounce">★</span>
            <span className="absolute top-6 right-6 text-[#f97316] text-2xl animate-pulse">★</span>
            <span className="absolute bottom-6 left-8 text-[#f97316] text-lg">★</span>
            <span className="absolute bottom-4 right-8 text-[#f97316] text-xl">★</span>

            <h2 className="font-heading font-extrabold text-2xl text-black mb-4 tracking-tight">
              ROUND COMPLETE!
            </h2>

            <div className="text-xs font-bold text-slate-500 mb-1">
              Top scorer this round
            </div>

            <div className="font-heading font-extrabold text-xl text-black mb-2">
              {topScorerName}
            </div>

            <div className="font-heading font-extrabold text-2xl text-[#f97316] mb-6">
              +{topScorerScore} pts
            </div>

            <button
              onClick={handleProceedToResults}
              className="w-full py-3 rounded-2xl bg-[#f97316] hover:bg-[#ea580c] text-black font-extrabold text-sm border-2 border-black shadow-[2px_2px_0px_#000000] cursor-pointer"
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
