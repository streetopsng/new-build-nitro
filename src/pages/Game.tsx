import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Avatar } from "../components/Avatar";
import { useGame } from "../contexts/GameContext";
import { useGummyGum } from "../contexts/GummyGumContext";
import { db } from "../lib/firebase";
import { ref, onValue, update, get } from "firebase/database";
import { closeGummyGumSession, returnToGummyGum } from "../lib/gummygumSession";
import { SessionExpiredModal } from "../components/SessionExpiredModal";
import type { Word } from "../types";
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconClock,
  IconFlame,
  IconLightbulb,
  IconTrophy,
  IconUsers,
  IconClose,
  IconStar,
} from "../components/icons";

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

// A room stuck on "playing" with no connected client for this long is
// abandoned, not just a long-running game — hours, not the lobby's 20 min.
const ABANDON_THRESHOLD_MS = 3 * 60 * 60 * 1000;
const HEARTBEAT_INTERVAL_MS = 60 * 1000;

const Game: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  const { wordBank } = useGame();
  const { ggSession } = useGummyGum();

  // location.state is lost on a hard reload (common on mobile); ggSession
  // survives it via sessionStorage, so it's checked before falling back to
  // the literal demo room — otherwise a reload mid-real-game would fall
  // into the demo leaderboard and its fake participants.
  const roomCode = state?.roomCode || ggSession?.roomCode || "DEMO";
  const playerName = state?.playerName || ggSession?.player?.name || "Player";
  const playerId = state?.playerId || "player_" + Date.now();
  const isHost = state?.isHost ?? ggSession?.isHost ?? false;
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const cancelledHandledRef = useRef(false);

  const [score, setScore] = useState(0);
  const [wordTimer, setWordTimer] = useState(30);
  const [sessionTimer, setSessionTimer] = useState(300);
  const [sessionDurationSec, setSessionDurationSec] = useState(300);
  const [roundStartedAt, setRoundStartedAt] = useState<number | null>(null);
  const [isSessionAbandoned, setIsSessionAbandoned] = useState(false);
  const [roundConfig, setRoundConfig] = useState<{ type: "sprint" | "count"; value: number }>({ type: "sprint", value: 5 });
  const [wordsPlayedCount, setWordsPlayedCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [hintsLeft, setHintsLeft] = useState(5);
  const [hintActive, setHintActive] = useState(false);
  const [userGuess, setUserGuess] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | "streak" | null>(null);
  const [showRoundCompleteModal, setShowRoundCompleteModal] = useState(false);

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Host's own clues from setup, if any — falls back to the built-in word bank.
  const [customWords, setCustomWords] = useState<Word[] | null>(null);
  useEffect(() => {
    if (!roomCode || roomCode === "DEMO") return;
    get(ref(db, `rooms/${roomCode}/customWords`)).then((snapshot) => {
      if (snapshot.exists()) {
        const list = Object.values(snapshot.val()) as Word[];
        if (list.length > 0) setCustomWords(list);
      }
    }).catch((err) => console.error("Failed to load custom words:", err));
  }, [roomCode]);

  useEffect(() => {
    if (!roomCode || roomCode === "DEMO") return;
    get(ref(db, `rooms/${roomCode}/settings`)).then((snapshot) => {
      if (!snapshot.exists()) return;
      const settings = snapshot.val();
      if (settings.roundType === "count" && settings.roundValue) {
        setRoundConfig({ type: "count", value: settings.roundValue });
        setSessionDurationSec(30 * 60);
      } else if (settings.roundType === "sprint" && settings.roundValue) {
        setRoundConfig({ type: "sprint", value: settings.roundValue });
        setSessionDurationSec(settings.roundValue * 60);
      }
    }).catch((err) => console.error("Failed to load round settings:", err));
  }, [roomCode]);

  // Refresh-safe session clock: the countdown is derived from the room's
  // persisted start timestamp (written when the host starts the game), not
  // from local state, so reloading the tab doesn't reset elapsed time back
  // to the full duration.
  //
  // This same mount also doubles as abandonment detection for an in-game
  // room: if nobody has been connected (no heartbeat) for ABANDON_THRESHOLD_MS
  // while status is still "playing", the room is stale — mark it expired
  // instead of leaving it to look "live" forever. The check runs once up
  // front, before this client's own heartbeat starts, so it can't mask a
  // genuinely abandoned room with its own first write.
  useEffect(() => {
    if (!roomCode || roomCode === "DEMO") return;
    const roomRef = ref(db, `rooms/${roomCode}`);
    let heartbeatInterval: ReturnType<typeof setInterval> | undefined;

    get(roomRef).then((snapshot) => {
      if (!snapshot.exists()) return;
      const room = snapshot.val();
      const lastActivity = room.lastActivity || room.startTime || room.createdAt;

      if (
        room.status === "playing" &&
        lastActivity &&
        Date.now() - lastActivity >= ABANDON_THRESHOLD_MS
      ) {
        update(roomRef, { status: "expired", abandoned: true }).catch(() => {});
        setIsSessionAbandoned(true);
        return;
      }

      if (room.startTime) {
        setRoundStartedAt(room.startTime);
      } else {
        const now = Date.now();
        setRoundStartedAt(now);
        update(roomRef, { startTime: now }).catch(() => {});
      }

      const beat = () => update(roomRef, { lastActivity: Date.now() }).catch(() => {});
      beat();
      heartbeatInterval = setInterval(beat, HEARTBEAT_INTERVAL_MS);
    }).catch((err) => console.error("Failed to load session activity:", err));

    return () => {
      if (heartbeatInterval) clearInterval(heartbeatInterval);
    };
  }, [roomCode]);

  const effectiveWordBank = customWords && customWords.length > 0 ? customWords : wordBank;

  const rawWord = effectiveWordBank[currentWordIndex % Math.max(effectiveWordBank.length, 1)];
  const activeWord = {
    word: rawWord?.word || "TOUCHLIGHT",
    clue: rawWord?.easy || rawWord?.medium || rawWord?.hard || "A portable light you hold in your hand when it is dark.",
    theme: rawWord?.theme || "GENERAL",
    hint: rawWord?.hint,
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
          setLeaderboard(list);
        }
      });
      return () => unsubscribe();
    } else {
      setLeaderboard([
        { id: "1", name: "Chidi", avatarId: "av-2", score: 960 },
        { id: "2", name: "Blessing", avatarId: "av-6", score: 780 },
        { id: "3", name: playerName, avatarId: "av-1", score },
        { id: "4", name: "Tope", avatarId: "av-9", score: 620 },
      ]);
    }
  }, [roomCode, playerName, score]);

  // GummyGum-launched sessions only: the room can disappear out from under
  // an active player if GummyGum cancels the session from its own side.
  // Native/standalone play has no such external cancel source, so this is
  // left a no-op when there's no ggSession.
  useEffect(() => {
    if (!ggSession || !roomCode || roomCode === "DEMO") return;

    const roomRef = ref(db, `rooms/${roomCode}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      if (cancelledHandledRef.current) return;
      const cancelled = !snapshot.exists() || !!snapshot.val()?.cancelled;
      if (!cancelled) return;
      cancelledHandledRef.current = true;
      if (ggSession.isHost) {
        returnToGummyGum();
      } else {
        navigate("/session-ended");
      }
    });
    return () => unsubscribe();
  }, [ggSession, roomCode, navigate]);

  useEffect(() => {
    const tick = () => {
      if (roomCode !== "DEMO" && roundStartedAt) {
        const elapsed = Math.floor((Date.now() - roundStartedAt) / 1000);
        const remaining = Math.max(sessionDurationSec - elapsed, 0);
        setSessionTimer(remaining);
        if (remaining <= 0) setShowRoundCompleteModal(true);
        return;
      }
      // DEMO room, or the real room's start timestamp hasn't loaded yet.
      setSessionTimer((prev) => {
        if (prev <= 1) {
          setShowRoundCompleteModal(true);
          return 0;
        }
        return prev - 1;
      });
    };
    tick();
    const sessionInterval = setInterval(tick, 1000);
    return () => clearInterval(sessionInterval);
  }, [roomCode, roundStartedAt, sessionDurationSec]);

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
    const nextCount = wordsPlayedCount + 1;
    setWordsPlayedCount(nextCount);
    if (roundConfig.type === "count" && nextCount >= roundConfig.value) {
      setShowRoundCompleteModal(true);
      return;
    }
    setWordTimer(30);
    setHintActive(false);
    setUserGuess("");
    setCurrentWordIndex((prev) => (prev + 1) % Math.max(effectiveWordBank.length, 1));
  };

  const handleGuessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanGuess = userGuess.trim().toUpperCase();
    if (!cleanGuess || isHost) return;

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
  const sidebarLeaderboard = leaderboard.slice(0, 5);
  const totalPlayers = leaderboard.length;
  const avgScore = totalPlayers ? Math.round(leaderboard.reduce((sum, p) => sum + p.score, 0) / totalPlayers) : 0;

  return (
    <div className="min-h-screen bg-white text-slate-900 p-4 md:p-8 flex flex-col items-center justify-center select-none relative overflow-x-hidden">
      {isHost && (
        <button
          onClick={() => setShowEndConfirm(true)}
          className="absolute top-5 left-5 z-20 px-4 py-2 rounded-xl bg-white border border-black/20 hover:bg-red-50 hover:text-red-600 hover:border-red-300 text-xs font-bold text-black flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
          title="Leave Session & Return to GummyGum"
        >
          <IconArrowLeft className="w-3.5 h-3.5" />
          <span>{ggSession ? "Back to GummyGum" : "End Session"}</span>
        </button>
      )}

      {/* Outer Tech Frame Container matching Figma #1563:2405 */}
      <div className="max-w-6xl w-full bg-[#FFFBF7] border border-black/20 rounded-3xl p-6 md:p-10 shadow-lg relative z-10 space-y-5 animate-card-fade-in">
        {/* Primary heading: live status + session name */}
        <div className="text-center pt-1 pb-3 border-b border-black/10">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-[#FF8E37]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF8E37] animate-pulse" />
            Live Session
          </div>
          <h1 className="font-heading font-black text-2xl md:text-3xl text-black mt-1">
            Q3 New Hire Batch
          </h1>
        </div>

        {/* Stat Cards Bar with Progress Bar — secondary to the heading above; participants only see what's relevant to them */}
        <div className="space-y-2.5">
          <div className={`grid gap-3 text-left ${isHost ? "grid-cols-2 md:grid-cols-4" : "grid-cols-2"}`}>
            <div className="bg-white border border-black/15 rounded-xl p-3 shadow-2xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-black/45 flex items-center gap-1.5">
                {isHost ? <IconUsers className="w-3 h-3" /> : <IconTrophy className="w-3 h-3" />} {isHost ? "PLAYERS" : "YOUR SCORE"}
              </div>
              <div className="font-heading font-black text-2xl md:text-3xl text-[#FF8E37] mt-0.5">
                {isHost ? leaderboard.length : score}
              </div>
            </div>

            <div className="bg-white border border-black/15 rounded-xl p-3 shadow-2xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-black/45 flex items-center gap-1.5">
                <IconClock className="w-3 h-3" /> TIME
              </div>
              <div className={`font-heading font-black text-2xl md:text-3xl mt-0.5 ${wordTimer <= 5 ? "text-red-500 animate-pulse" : "text-black"}`}>
                {wordTimer}s
              </div>
            </div>

            {isHost && (
              <>
                <div className="bg-white border border-black/15 rounded-xl p-3 shadow-2xs">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-black/45 flex items-center gap-1.5">
                    <IconFlame className="w-3 h-3" /> STREAK
                  </div>
                  <div className="font-heading font-black text-2xl md:text-3xl text-black mt-0.5">
                    {streak}
                  </div>
                </div>

                <div className="bg-white border border-black/15 rounded-xl p-3 shadow-2xs">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-black/45 flex items-center gap-1.5">
                    <IconLightbulb className="w-3 h-3" /> HINTS
                  </div>
                  <div className="font-heading font-black text-2xl md:text-3xl text-black mt-0.5">
                    {hintsLeft}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="w-full bg-black/10 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                wordTimer <= 5 ? "bg-red-500 animate-pulse" : "bg-[#FF8E37]"
              }`}
              style={{ width: `${(wordTimer / 30) * 100}%` }}
            />
          </div>
        </div>

        <div className={isHost ? "grid grid-cols-1 md:grid-cols-12 gap-6 items-start" : ""}>
          {isHost && (
          <div className="md:col-span-4 bg-white border border-black/15 rounded-2xl p-5 shadow-xs text-left space-y-3">
            <div className="text-xs font-black text-[#FF8E37] uppercase tracking-wider flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#FF8E37] animate-pulse" />
              <span>LIVE RANKINGS</span>
            </div>

            <div className="space-y-2">
              {sidebarLeaderboard.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-[#FF8E37] text-black border border-black/15 flex items-center justify-between shadow-xs font-heading font-black"
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
          </div>
          )}

          <div className={`${isHost ? "md:col-span-8 " : ""}bg-white border border-black/15 rounded-2xl p-6 md:p-8 text-left shadow-xs space-y-6 relative overflow-hidden`}>
            {feedback === "correct" && (
              <div className="absolute top-4 right-6 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-400 text-emerald-800 font-black text-xs flex items-center gap-1.5 animate-bounce">
                <IconCheck className="w-3.5 h-3.5" /> CORRECT! +30 PTS
              </div>
            )}
            {feedback === "streak" && (
              <div className="absolute top-4 right-6 px-4 py-1.5 rounded-full bg-orange-50 border border-[#FF8E37] text-[#FF8E37] font-black text-xs flex items-center gap-1.5 animate-bounce">
                <IconFlame className="w-3.5 h-3.5" /> STREAK BONUS! +60 PTS
              </div>
            )}
            {feedback === "incorrect" && (
              <div className="absolute top-4 right-6 px-4 py-1.5 rounded-full bg-red-50 border border-red-400 text-red-800 font-black text-xs flex items-center gap-1.5 animate-pulse">
                <IconClose className="w-3.5 h-3.5" /> INCORRECT! TRY AGAIN
              </div>
            )}

            <div className="inline-block px-3.5 py-1 rounded-full border border-[#FF8E37] bg-orange-50 text-[#FF8E37] font-black text-xs uppercase tracking-wider">
              {activeWord.theme}
            </div>

            <h2 className="font-heading font-black text-xl md:text-2xl text-black leading-relaxed">
              {activeWord.clue}
            </h2>

            {hintActive && (
              <div className="p-4 rounded-2xl bg-[#FFFBF7] border border-dashed border-[#FF8E37] text-center">
                <div className="text-xs font-black text-black/50 mb-1">{activeWord.hint ? "HINT" : "REVEALED LETTERS"}</div>
                <div className={activeWord.hint ? "font-bold text-base text-black" : "font-mono font-black text-2xl tracking-[0.25em] text-black"}>
                  {activeWord.hint || getHintDisplay(activeWord.word)}
                </div>
              </div>
            )}

            {/* Host presents/moderates only, never guesses — sees full team stats instead of a guess form */}
            {isHost ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 border border-black/15 rounded-2xl p-3 text-center">
                    <div className="text-[10px] font-black uppercase tracking-wider text-black/50">Players</div>
                    <div className="font-heading font-black text-2xl text-black mt-0.5">{totalPlayers}</div>
                  </div>
                  <div className="bg-slate-50 border border-black/15 rounded-2xl p-3 text-center">
                    <div className="text-[10px] font-black uppercase tracking-wider text-black/50">Avg Score</div>
                    <div className="font-heading font-black text-2xl text-black mt-0.5">{avgScore}</div>
                  </div>
                  <div className="bg-slate-50 border border-black/15 rounded-2xl p-3 text-center">
                    <div className="text-[10px] font-black uppercase tracking-wider text-black/50">Top Score</div>
                    <div className="font-heading font-black text-2xl text-[#FF8E37] mt-0.5">{topScorerScore}</div>
                  </div>
                </div>

                <div className="border border-dashed border-black/20 rounded-2xl p-3 max-h-56 overflow-y-auto space-y-2">
                  {totalPlayers === 0 ? (
                    <div className="text-center text-sm font-bold text-black/40 py-4">Waiting for players to join…</div>
                  ) : (
                    leaderboard.map((item, idx) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-black/10"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-black/60 font-black text-[10px] flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <Avatar id={item.avatarId || "av-1"} size="sm" />
                          <span className="text-sm font-bold text-black truncate max-w-[160px]">{item.name}</span>
                        </div>
                        <span className="font-mono text-sm font-black text-[#FF8E37]">{item.score} pts</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
            <form onSubmit={handleGuessSubmit} className="space-y-6">
              <input
                ref={inputRef}
                type="text"
                value={userGuess}
                onChange={(e) => setUserGuess(e.target.value)}
                placeholder="Type your guess..."
                autoFocus
                className={`w-full bg-white border rounded-2xl px-5 py-4 text-lg text-black font-semibold focus:outline-none transition-colors ${
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
                  className="flex-1 min-w-[120px] py-3.5 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-black font-black text-sm border border-black/20 shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <IconLightbulb className="w-4 h-4" /> Hint ({hintsLeft})
                </button>

                <button
                  type="button"
                  onClick={handleSkip}
                  className="flex-1 min-w-[120px] py-3.5 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-black font-black text-sm border border-black/20 shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <IconArrowRight className="w-4 h-4" /> Skip
                </button>

                <button
                  type="submit"
                  className="flex-1 min-w-[140px] py-3.5 px-8 rounded-2xl bg-[#FF8E37] hover:bg-[#EA580C] text-black font-heading font-black text-base border border-black/20 shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  Submit <IconArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
            )}
          </div>
        </div>

        <div className="text-center text-xs font-bold text-black/50">
          {roundConfig.type === "count" ? (
            <>Word <span className="text-[#FF8E37] font-black">{Math.min(wordsPlayedCount + 1, roundConfig.value)}</span> of <span className="text-[#FF8E37] font-black">{roundConfig.value}</span></>
          ) : (
            <>Session time left: <span className="text-[#FF8E37] font-black">{formatSessionTime(sessionTimer)}</span></>
          )}
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
            className="w-full max-w-sm rounded-2xl bg-[#FFFBF7] border border-black/15 p-8 text-center text-slate-900 shadow-xl relative space-y-4"
          >
            <span className="absolute top-4 left-6 text-[#FF8E37] animate-bounce"><IconStar className="w-5 h-5" /></span>
            <span className="absolute top-6 right-6 text-[#FF8E37] animate-pulse"><IconStar className="w-6 h-6" /></span>
            <span className="absolute bottom-6 left-8 text-[#FF8E37]"><IconStar className="w-4 h-4" /></span>

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
              className="w-full py-3.5 rounded-xl bg-[#FF8E37] hover:bg-[#EA580C] text-black font-heading font-black text-lg border border-black/20 shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              View Final Results <IconArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {showEndConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-card-fade-in" onClick={() => setShowEndConfirm(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-2xl bg-[#FFFBF7] border border-black/15 p-7 text-center text-slate-900 shadow-xl space-y-4">
            <h3 className="font-heading font-black text-xl text-black">End this session?</h3>
            <p className="text-sm text-black/60 leading-relaxed">
              Everyone still playing will be disconnected{ggSession ? " and this returns to GummyGum." : "."}
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowEndConfirm(false)}
                className="flex-1 py-3 rounded-xl bg-white border border-black/20 text-black font-bold text-sm hover:bg-slate-50 cursor-pointer"
              >
                Keep playing
              </button>
              <button
                onClick={() => (ggSession ? closeGummyGumSession() : navigate("/home"))}
                className="flex-1 py-3 rounded-xl bg-[#EF4444] text-white font-bold text-sm hover:bg-red-600 cursor-pointer shadow-xs"
              >
                End session
              </button>
            </div>
          </div>
        </div>
      )}

      {isSessionAbandoned && <SessionExpiredModal isHost={isHost} context="game" />}

    </div>
  );
};

export default Game;
