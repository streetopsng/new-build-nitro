// src/pages/Results.tsx
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useProfile } from "../contexts/ProfileContext";
import { useGummyGum } from "../contexts/GummyGumContext";
import { Avatar } from "../components/Avatar";
import { db } from "../lib/firebase";
import { ref, get } from "firebase/database";
import { reportGummyGumResult, closeGummyGumSession } from "../lib/gummygumSession";

interface LocationState {
  score?: number;
  rank?: number;
  streaks?: number;
  hintsUsed?: number;
  correctCount?: number;
  roomCode?: string;
  playerName?: string;
}

interface LeaderboardUser {
  id: string;
  name: string;
  avatarId?: string;
  catchphrase?: string;
  score: number;
  isHost?: boolean;
}

const DEFAULT_LEADERBOARD_LIST: LeaderboardUser[] = [
  { id: "p-1", name: "Chidi", avatarId: "av-2", catchphrase: "Locked in paa..", score: 960 },
  { id: "p-2", name: "Blessing", avatarId: "av-6", catchphrase: "Probably the smartest 😒", score: 780 },
  { id: "p-3", name: "Ayoola", avatarId: "av-1", catchphrase: "Probably the smartest 😒", score: 720 },
  { id: "p-4", name: "Tope", avatarId: "av-9", catchphrase: "Unstoppable energy", score: 620 },
  { id: "p-5", name: "Mercy", avatarId: "av-5", catchphrase: "I am here to WIN", score: 580 },
  { id: "p-6", name: "Ope", avatarId: "av-4", catchphrase: "Force of nature", score: 540 },
  { id: "p-7", name: "Ade", avatarId: "av-3", catchphrase: "Quietly the GOAT", score: 480 },
];

const Results: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  const { profile } = useProfile();
  const { ggSession } = useGummyGum();

  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>(DEFAULT_LEADERBOARD_LIST);
  const ggReportedRef = useRef(false);

  const roomCode = state?.roomCode;
  const userScore = state?.score ?? 780;
  const userRank = state?.rank ?? 3;
  const userStreaks = state?.streaks ?? 3;
  const userHintsUsed = state?.hintsUsed ?? 1;
  const playerName = state?.playerName || profile.username || "Ayoola";

  // Real-Time Firebase Fetch for Room Final Scores if available
  useEffect(() => {
    if (roomCode) {
      const fetchFinalScores = async () => {
        try {
          const snapshot = await get(ref(db, `rooms/${roomCode}/players`));
          if (snapshot.exists()) {
            const rawPlayers = snapshot.val();
            const list: LeaderboardUser[] = Object.values(rawPlayers).map((p: any) => ({
              id: p.id || p.name,
              name: p.name,
              avatarId: p.avatarId,
              catchphrase: p.catchphrase || "Ready and prepared",
              score: p.score || 0,
              isHost: Boolean(p.isHost),
            }));

            list.sort((a, b) => b.score - a.score);
            if (list.length > 0) {
              setLeaderboard(list);
            }
          }
        } catch (err) {
          console.error("Failed to fetch room results:", err);
        }
      };

      fetchFinalScores();
    }
  }, [roomCode]);

  // Reports the launching player's final result back to GummyGum, once,
  // after the real leaderboard (not the placeholder default) has loaded.
  useEffect(() => {
    if (ggReportedRef.current) return;
    if (leaderboard === DEFAULT_LEADERBOARD_LIST) return;
    ggReportedRef.current = true;

    const rank = leaderboard.findIndex((p) => p.name === playerName) + 1;
    reportGummyGumResult({
      roomCode,
      finalScore: userScore,
      placement: rank || null,
      totalPlayers: leaderboard.length,
      leaderboard: leaderboard.map((p) => ({ name: p.name, score: p.score, isHost: p.isHost })),
    });
  }, [leaderboard, playerName, roomCode, userScore]);

  const winner1 = leaderboard[0] || DEFAULT_LEADERBOARD_LIST[0];
  const winner2 = leaderboard[1] || DEFAULT_LEADERBOARD_LIST[1];
  const winner3 = leaderboard[2] || DEFAULT_LEADERBOARD_LIST[2];

  const lowerRanks = leaderboard.slice(3);

  return (
    <div className="min-h-screen bg-[#FFEDD5] text-slate-900 p-6 md:p-12 flex flex-col items-center select-none relative overflow-x-hidden">
      {/* Background Decorative Rings matching Figma */}
      <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full border-[18px] border-orange-200/50 pointer-events-none" />
      <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full border-[18px] border-orange-200/50 pointer-events-none" />

      <div className="max-w-5xl w-full z-10 space-y-8 animate-card-fade-in">
        {/* Top Header matching Figma #1604:420 */}
        <header className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white border-2 border-black font-black text-xs uppercase tracking-widest text-[#FF8E37] shadow-xs">
            <span>🏆</span> SESSION CONCLUDED
          </div>
          <h1 className="font-heading font-black text-4xl md:text-5xl text-black">
            Final Results
          </h1>
          <p className="text-black/60 font-medium text-base">
            Congratulations to everyone on the leaderboard!
          </p>
        </header>

        {/* Top 3 Podium Winners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4 pb-2">
          {/* 2nd Place */}
          <div className="order-2 md:order-1 bg-white border-2 border-black rounded-3xl p-6 text-center shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-slate-400 text-slate-700 font-black text-lg flex items-center justify-center mx-auto">
              2
            </div>
            <Avatar id={winner2.avatarId || "av-6"} size="lg" className="mx-auto" />
            <div>
              <div className="font-heading font-black text-xl text-black">{winner2.name}</div>
              <div className="text-xs text-black/50 italic">"{winner2.catchphrase}"</div>
            </div>
            <div className="text-2xl font-black font-heading text-[#FF8E37]">
              {winner2.score} pts
            </div>
          </div>

          {/* 1st Place (Center / Taller) */}
          <div className="order-1 md:order-2 bg-[#FFFBF7] border-[3px] border-black rounded-3xl p-8 text-center shadow-lg space-y-4 relative -translate-y-2">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#FF8E37] text-black font-black text-xs uppercase tracking-wider border-2 border-black flex items-center gap-1.5 shadow-xs">
              <span>👑</span> 1ST PLACE
            </div>
            <div className="pt-2">
              <Avatar id={winner1.avatarId || "av-2"} size="xl" className="mx-auto" />
            </div>
            <div>
              <div className="font-heading font-black text-2xl text-black">{winner1.name}</div>
              <div className="text-xs text-black/50 italic">"{winner1.catchphrase}"</div>
            </div>
            <div className="text-4xl font-black font-heading text-[#FF8E37]">
              {winner1.score} pts
            </div>
          </div>

          {/* 3rd Place */}
          <div className="order-3 bg-white border-2 border-black rounded-3xl p-6 text-center shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 border-2 border-amber-600 text-amber-800 font-black text-lg flex items-center justify-center mx-auto">
              3
            </div>
            <Avatar id={winner3.avatarId || "av-1"} size="lg" className="mx-auto" />
            <div>
              <div className="font-heading font-black text-xl text-black">{winner3.name}</div>
              <div className="text-xs text-black/50 italic">"{winner3.catchphrase}"</div>
            </div>
            <div className="text-2xl font-black font-heading text-[#FF8E37]">
              {winner3.score} pts
            </div>
          </div>
        </div>

        {/* Your Performance Summary Card */}
        <div className="bg-white border-2 border-black rounded-3xl p-6 shadow-xs text-left">
          <div className="text-xs font-black uppercase tracking-wider text-black/50 mb-4">
            YOUR PERFORMANCE SUMMARY ({playerName})
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-orange-50 rounded-2xl border border-orange-200">
              <div className="text-xs text-black/50 font-bold">YOUR RANK</div>
              <div className="font-heading font-black text-2xl text-black mt-1">#{userRank}</div>
            </div>
            <div className="p-3 bg-orange-50 rounded-2xl border border-orange-200">
              <div className="text-xs text-black/50 font-bold">TOTAL SCORE</div>
              <div className="font-heading font-black text-2xl text-[#FF8E37] mt-1">{userScore} pts</div>
            </div>
            <div className="p-3 bg-orange-50 rounded-2xl border border-orange-200">
              <div className="text-xs text-black/50 font-bold">MAX STREAK</div>
              <div className="font-heading font-black text-2xl text-black mt-1">{userStreaks} 🔥</div>
            </div>
            <div className="p-3 bg-orange-50 rounded-2xl border border-orange-200">
              <div className="text-xs text-black/50 font-bold">HINTS USED</div>
              <div className="font-heading font-black text-2xl text-black mt-1">{userHintsUsed} / 5</div>
            </div>
          </div>
        </div>

        {/* All Participants List (ranks 4+) */}
        {lowerRanks.length > 0 && (
          <div className="bg-white border-2 border-black rounded-3xl p-6 shadow-xs text-left space-y-3">
            <div className="text-xs font-black uppercase tracking-wider text-black/50 mb-2">
              ALL PARTICIPANTS
            </div>
            <div className="space-y-2">
              {lowerRanks.map((player, idx) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-black/10 bg-slate-50/50 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-white border border-black/20 text-xs font-black flex items-center justify-center">
                      {idx + 4}
                    </span>
                    <Avatar id={player.avatarId || "av-1"} size="sm" />
                    <div>
                      <div className="font-bold text-sm text-black">{player.name}</div>
                      <div className="text-xs text-black/40 italic">"{player.catchphrase}"</div>
                    </div>
                  </div>
                  <div className="font-heading font-black text-base text-[#FF8E37]">
                    {player.score} pts
                  </div>
                </div>
              ))}
            </div>

            {/* Back to Home Button matching Screenshot EXACTLY */}
            {ggSession ? (
              <div className="flex flex-col gap-2.5 w-full items-center">
                {ggSession.isHost ? (
                  <>
                    <button
                      onClick={() => closeGummyGumSession()}
                      className="w-full px-8 py-3.5 rounded-2xl bg-[#f97316] hover:bg-[#ea580c] text-black font-extrabold text-sm border-2 border-black shadow-[2px_2px_0px_#000000] transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Close Session & Return to GummyGum</span> →
                    </button>
                    <button
                      onClick={() => navigate("/home")}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    >
                      Insync Home
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => navigate("/home")}
                    className="w-full px-8 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-black font-extrabold text-sm border-2 border-black shadow-[2px_2px_0px_#000000] transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Leave Game</span>
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate("/home")}
                className="px-8 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-black font-extrabold text-sm border-2 border-black shadow-xs transition-all cursor-pointer flex items-center gap-2"
              >
                <span>Back to Home</span>
              </button>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4 pb-8">
          <button
            onClick={() => navigate("/home")}
            className="px-8 py-4 bg-white hover:bg-slate-50 text-black font-heading font-black text-lg border-[2px_5px_5px_2px] border-black rounded-2xl shadow-xs active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          >
            Back to Home
          </button>
          <button
            onClick={() => navigate("/mp-create")}
            className="px-8 py-4 bg-[#FF8E37] hover:bg-[#EA580C] text-black font-heading font-black text-lg border-[2px_5px_5px_2px] border-black rounded-2xl shadow-xs active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2"
          >
            <span>Play Again</span>
            <span>➔</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Results;
