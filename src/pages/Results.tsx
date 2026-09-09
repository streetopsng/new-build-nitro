// src/pages/Results.tsx
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useProfile } from "../contexts/ProfileContext";
import { useGummyGum } from "../contexts/GummyGumContext";
import { Avatar } from "../components/Avatar";
import { db } from "../lib/firebase";
import { ref, get } from "firebase/database";
import { reportGummyGumResult, closeGummyGumSession, returnToGummyGum } from "../lib/gummygumSession";

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
  { id: "p-4", name: "Tope", avatarId: "av-9", catchphrase: "Unstoppable energy", score: 720 },
  { id: "p-5", name: "Mercy", avatarId: "av-5", catchphrase: "I am here to WIN", score: 680 },
  { id: "p-6", name: "Ope", avatarId: "av-4", catchphrase: "Force of nature", score: 630 },
  { id: "p-7", name: "Ade", avatarId: "av-3", catchphrase: "Quietly the GOAT", score: 570 },
  { id: "p-8", name: "Barry", avatarId: "av-5", catchphrase: "Probably the smartest 😒", score: 510 },
  { id: "p-9", name: "Augusta", avatarId: "av-8", catchphrase: "Tis I, the winner 😁", score: 460 },
  { id: "p-10", name: "Kunle", avatarId: "av-9", catchphrase: "Small but mighty", score: 400 },
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
  const userCorrectCount = state?.correctCount ?? 11;
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
              catchphrase: p.catchphrase || "Game enthusiast",
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
    <div className="min-h-screen bg-[#fff5e9] text-slate-900 p-6 md:p-12 flex flex-col items-center select-none relative overflow-hidden">
      {/* Background Decorative Orange Wave Circles */}
      <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-[16px] border-orange-200/50 -translate-x-20 -translate-y-20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-48 h-48 rounded-full border-[16px] border-orange-200/50 translate-x-20 -translate-y-20 pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-32 bg-[#ffd8b3]/40 rounded-t-[50%] pointer-events-none" />

      <div className="max-w-5xl w-full z-10 animate-card-fade-in">
        {/* Top Header */}
        <div className="text-center mb-8">
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
            ROUND COMPLETE • Q3 NEW HIRE BATCH
          </div>
          <h1 className="font-heading font-extrabold text-3xl text-black flex items-center justify-center gap-2 mt-1">
            <span>🏆</span> Final Results
          </h1>
        </div>

        {/* Podium Section (Top 3 Winners) matching Screenshot EXACTLY */}
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto items-end mb-10 text-center">
          {/* #2 Silver Winner (Left) */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-extrabold text-slate-400 mb-1">#2</span>
            <div className="p-1 rounded-full border-2 border-black bg-white mb-2 shadow-xs">
              <Avatar id={winner2.avatarId || "av-2"} size="lg" />
            </div>
            <h3 className="font-heading font-extrabold text-lg text-black">
              {winner2.name}
            </h3>
            <div className="text-[11px] text-slate-500 font-medium italic mb-1">
              "{winner2.catchphrase || "Probably the smartest 😒"}"
            </div>
            <div className="font-heading font-extrabold text-2xl text-slate-800 mb-3">
              {winner2.score}
            </div>
            <div className="w-full h-16 rounded-2xl bg-slate-200 border border-slate-300 flex items-center justify-center shadow-xs">
              <div className="w-8 h-8 rounded-full bg-slate-300 border border-slate-400 flex items-center justify-center font-extrabold text-xs text-slate-700">
                🥈 2
              </div>
            </div>
          </div>

          {/* #1 Gold Winner (Center - Elevated) */}
          <div className="flex flex-col items-center -translate-y-4">
            <span className="text-sm font-extrabold text-[#f97316] flex items-center gap-1 mb-1">
              <span>👑</span> #1 WINNER
            </span>
            <div className="p-1.5 rounded-full border-2 border-black bg-white mb-2 shadow-md">
              <Avatar id={winner1.avatarId || "av-1"} size="xl" />
            </div>
            <h3 className="font-heading font-extrabold text-xl text-black">
              {winner1.name}
            </h3>
            <div className="text-[11px] text-[#f97316] font-extrabold italic mb-1">
              "{winner1.catchphrase || "Locked in paa.."}"
            </div>
            <div className="font-heading font-extrabold text-3xl text-[#f97316] mb-3">
              {winner1.score}
            </div>
            <div className="w-full h-20 rounded-2xl bg-[#ffedd5] border-2 border-[#f97316] flex items-center justify-center shadow-md">
              <div className="w-10 h-10 rounded-full bg-[#f97316] text-black flex items-center justify-center font-extrabold text-sm shadow-xs">
                🥇 1
              </div>
            </div>
          </div>

          {/* #3 Bronze Winner (Right) */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-extrabold text-slate-400 mb-1">#3</span>
            <div className="p-1 rounded-full border-2 border-black bg-white mb-2 shadow-xs">
              <Avatar id={winner3.avatarId || "av-3"} size="lg" />
            </div>
            <h3 className="font-heading font-extrabold text-lg text-black">
              {winner3.name}
            </h3>
            <div className="text-[11px] text-slate-500 font-medium italic mb-1">
              "{winner3.catchphrase || "Probably the smartest 😒"}"
            </div>
            <div className="font-heading font-extrabold text-2xl text-slate-800 mb-3">
              {winner3.score}
            </div>
            <div className="w-full h-16 rounded-2xl bg-[#fed7aa]/60 border border-orange-300 flex items-center justify-center shadow-xs">
              <div className="w-8 h-8 rounded-full bg-orange-300 border border-orange-400 flex items-center justify-center font-extrabold text-xs text-orange-900">
                🥉 3
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-orange-200/60 my-6" />

        {/* Main 2 Columns: LEADERBOARD list vs YOUR RESULT card matching Screenshot */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Column: LEADERBOARD (Ranks 4-10) */}
          <div className="md:col-span-7 text-left space-y-2.5">
            <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">
              LEADERBOARD
            </div>

            {lowerRanks.map((item, idx) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-white border-2 border-orange-200 flex items-center justify-between shadow-xs hover:border-[#f97316] transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <span className="font-extrabold text-sm text-slate-400 w-5 text-center">
                    {idx + 4}
                  </span>
                  <Avatar id={item.avatarId || "av-1"} size="md" />
                  <div>
                    <div className="font-extrabold text-sm text-black">
                      {item.name}
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">
                      {item.catchphrase || "Game participant"}
                    </div>
                  </div>
                </div>

                <div className="font-heading font-extrabold text-base text-[#f97316]">
                  {item.score}
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: YOUR RESULT Card matching Screenshot EXACTLY */}
          <div className="md:col-span-5 text-center flex flex-col items-center">
            <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider text-left w-full mb-3">
              YOUR RESULT
            </div>

            <div className="w-full rounded-3xl bg-white border-2 border-[#f97316] p-6 shadow-md relative text-center mb-6">
              {/* #3 PLACE Top Badge */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#f97316] text-white font-extrabold text-xs shadow-xs uppercase tracking-wider">
                #{userRank} PLACE
              </div>

              <div className="mt-2 mb-3 flex justify-center">
                <Avatar id={profile.avatarId} size="xl" />
              </div>

              <h2 className="font-heading font-extrabold text-xl text-black">
                {playerName}
              </h2>
              <div className="text-xs text-[#f97316] font-bold italic mb-6">
                "{profile.catchphrase || "Probably the smartest 😒"}"
              </div>

              {/* Metrics Grid matching Screenshot */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div>
                    <div className="text-[10px] font-extrabold uppercase text-slate-400">
                      SCORE
                    </div>
                    <div className="font-heading font-extrabold text-2xl text-[#f97316]">
                      {userScore}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-extrabold uppercase text-slate-400">
                      RANK
                    </div>
                    <div className="font-heading font-extrabold text-2xl text-black">
                      #{userRank}
                    </div>
                  </div>
                </div>

                <div className="pt-2 space-y-2 text-xs font-bold text-slate-600">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Streaks</span>
                    <span className="text-[#f97316]">{userStreaks} 🔥</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Hints used</span>
                    <span className="text-black">{userHintsUsed}/5</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Correct</span>
                    <span className="text-black">{userCorrectCount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Back to Home Button matching Screenshot EXACTLY */}
            {ggSession ? (
              <div className="flex flex-col gap-2.5 w-full items-center">
                {ggSession.isHost ? (
                  <button
                    onClick={() => closeGummyGumSession()}
                    className="w-full px-8 py-3.5 rounded-2xl bg-[#f97316] hover:bg-[#ea580c] text-black font-extrabold text-sm border-2 border-black shadow-[2px_2px_0px_#000000] transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Close Session & Return to GummyGum</span> →
                  </button>
                ) : (
                  <button
                    onClick={() => returnToGummyGum()}
                    className="w-full px-8 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-black font-extrabold text-sm border-2 border-black shadow-[2px_2px_0px_#000000] transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Return to GummyGum</span> →
                  </button>
                )}
                <button
                  onClick={() => navigate("/home")}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  Insync Home
                </button>
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
        </div>
      </div>
    </div>
  );
};

export default Results;
