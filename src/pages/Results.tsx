// src/pages/Results.tsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface LocationState {
  score: number;
  wordLog: Array<{
    word: string;
    outcome: string;
    pts: number;
  }>;
  isMultiplayer?: boolean;
  players?: Record<string, any>;
  roomCode?: string;
  playerId?: string;
  playerName?: string;
}

const Results: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;

  if (!state) {
    navigate("/");
    return null;
  }

  const { score: rawScore, wordLog, isMultiplayer, players } = state;
  const wordLogValue = wordLog || [];
  const currentPlayerId = state.playerId || localStorage.getItem("playerId");
  const sortedPlayers = players
    ? Object.values(players).sort((a: any, b: any) => b.score - a.score)
    : [];
  const currentPlayer = sortedPlayers.find(
    (p: any) => p.id === currentPlayerId,
  );
  const scoreValue =
    rawScore ??
    currentPlayer?.score ??
    wordLogValue.reduce((sum, item) => sum + (item.pts || 0), 0);
  const correct = wordLogValue.filter((w) => w.outcome === "correct").length;
  const total = wordLogValue.length;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  const dotColors: Record<string, string> = {
    correct: "#2fb36d",
    almost: "#ffb020",
    timeout: "#d64545",
    skipped: "rgba(255,255,255,0.3)",
    wrong: "#d64545",
  };

  const medals = ["🥇", "🥈", "🥉"];

  // Find current player's rank
  let playerRank =
    sortedPlayers.findIndex((p: any) => p.id === currentPlayerId) + 1;

  // Fallback: if not found by id, try by name
  if (playerRank === 0 && state.playerName) {
    const playerByName = sortedPlayers.find(
      (p: any) => p.name === state.playerName,
    );
    if (playerByName) {
      playerRank = sortedPlayers.indexOf(playerByName) + 1;
    }
  }

  const placementLabel = isMultiplayer
    ? playerRank > 0
      ? `You placed #${playerRank} of ${sortedPlayers.length}`
      : sortedPlayers.length > 0
        ? `Final standings`
        : `Here's how you did`
    : "Here's how you did";

  return (
    <div className="min-h-screen bg-[#1a120d] p-6 flex flex-col items-center overflow-y-auto text-[#ffe9dc]">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <div className="font-barlow text-[56px] font-black uppercase bg-gradient-to-br from-white via-[#ff9a00] to-[#ff4d00] bg-clip-text text-transparent leading-[0.9]">
            {isMultiplayer ? "Game Over!" : "Game Over!"}
          </div>
          <div className="text-[13px] text-[rgba(255,255,255,0.4)] mt-1.5">
            {placementLabel}
          </div>
        </div>

        {/* Score Cards */}
        <div className="grid grid-cols-2 gap-2.5 w-full mb-5">
          <div className="bg-[#2e1b14] rounded-2xl p-4 text-center border border-[rgba(255,255,255,0.06)]">
            <div className="font-barlow text-[40px] font-black text-white leading-none">
              {scoreValue}
            </div>
            <div className="text-[11px] tracking-[2px] uppercase text-[rgba(255,255,255,0.4)] mt-1">
              Total Score
            </div>
          </div>
          <div className="bg-[#2e1b14] rounded-2xl p-4 text-center border border-[rgba(255,255,255,0.06)]">
            <div className="font-barlow text-[40px] font-black text-white leading-none">
              {correct}
            </div>
            <div className="text-[11px] tracking-[2px] uppercase text-[rgba(255,255,255,0.4)] mt-1">
              Correct
            </div>
          </div>
          <div className="bg-[#2e1b14] rounded-2xl p-4 text-center border border-[rgba(255,255,255,0.06)]">
            <div className="font-barlow text-[40px] font-black text-white leading-none">
              {accuracy}%
            </div>
            <div className="text-[11px] tracking-[2px] uppercase text-[rgba(255,255,255,0.4)] mt-1">
              Accuracy
            </div>
          </div>
          <div className="bg-[#2e1b14] rounded-2xl p-4 text-center border border-[rgba(255,255,255,0.06)]">
            <div className="font-barlow text-[40px] font-black text-white leading-none">
              {total}
            </div>
            <div className="text-[11px] tracking-[2px] uppercase text-[rgba(255,255,255,0.4)] mt-1">
              Played
            </div>
          </div>
        </div>

        {/* Multiplayer Podium */}
        {isMultiplayer && sortedPlayers.length > 0 && (
          <div className="mb-6">
            <div className="text-[11px] tracking-[3px] uppercase text-[rgba(255,255,255,0.4)] mb-3 text-center">
              Final Standings
            </div>

            {/* Podium for top 3 */}
            <div className="flex items-end justify-center gap-3 mb-4">
              {[sortedPlayers[1], sortedPlayers[0], sortedPlayers[2]]
                .filter(Boolean)
                .map((displayPlayer: any) => {
                  const playerRank =
                    sortedPlayers.findIndex(
                      (p: any) => p.id === displayPlayer.id,
                    ) + 1;
                  const heights =
                    playerRank === 1
                      ? "h-40"
                      : playerRank === 2
                        ? "h-32"
                        : "h-28";
                  const medal = medals[playerRank - 1] || "";

                  return (
                    <div
                      key={displayPlayer.id}
                      className="flex flex-col items-center justify-end"
                    >
                      <div className="text-2xl mb-2">{medal}</div>
                      <div
                        className="w-3 h-3 rounded-full mb-2"
                        style={{ background: displayPlayer.color }}
                      ></div>
                      <div className="text-xs font-medium text-center mb-1">
                        {displayPlayer.name}
                        {displayPlayer.id === currentPlayerId && " (you)"}
                      </div>
                      <div
                        className={`${heights} w-20 bg-[#2e1b14] rounded-t-xl flex items-center justify-center border border-[rgba(255,255,255,0.06)] ${
                          playerRank === 1 ? "border-[rgba(255,215,0,0.3)]" : ""
                        }`}
                      >
                        <div className="font-barlow text-2xl font-black text-white">
                          {displayPlayer.score}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Rest of players list */}
            {sortedPlayers.slice(3).map((player: any, index: number) => (
              <div
                key={player.id}
                className={`flex items-center gap-3 p-3 bg-[#2e1b14] rounded-lg border mb-2 ${
                  player.id === currentPlayerId
                    ? "border-[rgba(255,77,0,0.4)] bg-[rgba(255,77,0,0.08)]"
                    : "border-[rgba(255,255,255,0.06)]"
                }`}
              >
                <div className="font-barlow text-lg font-black w-8 text-[rgba(255,255,255,0.4)]">
                  #{index + 4}
                </div>
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: player.color }}
                ></div>
                <div className="text-base flex-1">
                  {player.name}
                  {player.id === currentPlayerId && " (you)"}
                </div>
                <div className="font-barlow text-xl font-black text-white">
                  {player.score}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Solo Mode Word Log */}
        {!isMultiplayer && wordLog.length > 0 && (
          <div className="w-full mb-6">
            <div className="text-[11px] tracking-[3px] uppercase text-[rgba(255,255,255,0.4)] mb-2.5">
              Word by word
            </div>
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {wordLog.map((log, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 p-2.5 px-3.5 bg-[#2e1b14] rounded-lg border border-[rgba(255,255,255,0.05)]"
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: dotColors[log.outcome] || "#fff" }}
                  ></div>
                  <div className="text-base font-medium flex-1">{log.word}</div>
                  <div
                    className={`font-barlow text-lg font-bold ${log.pts > 0 ? "text-[#2fb36d]" : "text-[rgba(255,255,255,0.4)]"}`}
                  >
                    {log.pts > 0 ? `+${log.pts}` : "—"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() =>
              navigate(isMultiplayer ? "/multiplayer" : "/solo-setup")
            }
            className="w-full py-4 rounded-2xl bg-[#ff4d00] text-white font-barlow font-bold text-xl tracking-[1px] uppercase transition-all hover:bg-[#e04400] active:scale-97"
          >
            {isMultiplayer ? "New Game" : "Play Again"}
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full py-4 rounded-2xl bg-transparent text-white font-barlow font-bold text-base tracking-[1px] uppercase transition-all border border-[rgba(255,255,255,0.15)] hover:bg-[rgba(255,255,255,0.05)]"
          >
            Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Results;
