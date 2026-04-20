// src/pages/Lobby.tsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../lib/firebase";
import { ref, onValue, update } from "firebase/database";

interface LocationState {
  roomCode: string;
  playerId: string;
  isHost: boolean;
  playerName: string;
  hostPlays: boolean;
  words: string[];
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

const Lobby: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;

  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    if (!state) {
      navigate("/mp-entry");
      return;
    }

    const playersRef = ref(db, `rooms/${state.roomCode}/players`);
    const unsubscribe = onValue(playersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setPlayers(data);
      }
    });

    // Listen for game start
    const statusRef = ref(db, `rooms/${state.roomCode}/status`);
    const statusUnsubscribe = onValue(statusRef, (snapshot) => {
      if (snapshot.val() === "playing") {
        navigate("/game", {
          state: {
            roomCode: state.roomCode,
            playerId: state.playerId,
            isHost: state.isHost,
            playerName: state.playerName,
            isMultiplayer: true,
            mode: "round",
            difficulty: "easy",
            themes: [],
          },
        });
      }
    });

    return () => {
      unsubscribe();
      statusUnsubscribe();
    };
  }, [state, navigate]);

  const startGame = async () => {
    if (!state.isHost || isStarting) return;

    const playerCount = Object.keys(players).length;
    const minNeeded = state.hostPlays ? 2 : 1;

    if (playerCount < minNeeded) return;

    setIsStarting(true);

    try {
      await update(ref(db, `rooms/${state.roomCode}`), {
        status: "playing",
        currentWordIndex: 0,
        currentWordStartTime: Date.now(),
      });
    } catch (err) {
      console.error("Failed to start game:", err);
      setIsStarting(false);
    }
  };

  const leaveRoom = async () => {
    if (state.playerId) {
      const playerRef = ref(
        db,
        `rooms/${state.roomCode}/players/${state.playerId}`,
      );
      const { remove } = await import("firebase/database");
      await remove(playerRef);
    }
    navigate("/mp-entry");
  };

  const playerList = Object.values(players);
  const playerCount = playerList.length;
  const minNeeded = state?.hostPlays ? 2 : 1;
  const canStart = state?.isHost && playerCount >= minNeeded && !isStarting;

  if (!state) return null;

  return (
    <div className="min-h-screen bg-[#1a120d] p-6 text-[#ffe9dc]">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-7">
          <button
            onClick={leaveRoom}
            className="w-10 h-10 rounded-full bg-[#2e1b14] border border-[rgba(255,255,255,0.1)] text-white text-xl cursor-pointer flex items-center justify-center hover:bg-[#231510]"
          >
            ←
          </button>
          <div className="font-barlow font-black text-[28px] uppercase tracking-wide text-[#ffe9dc]">
            Lobby
          </div>
        </div>

        <div className="bg-[#2e1b14] rounded-2xl p-5 text-center mb-5 border border-[rgba(255,77,0,0.2)]">
          <div className="text-[11px] tracking-[3px] uppercase text-[rgba(255,255,255,0.4)] mb-1">
            Room Code
          </div>
          <div className="font-barlow text-[56px] font-black tracking-[12px] text-[#ff4d00] shadow-[0_0_30px_rgba(255,77,0,0.4)]">
            {state.roomCode}
          </div>
          <div className="text-sm text-[rgba(255,255,255,0.4)] mt-2">
            Share this with friends
          </div>
        </div>

        <div className="text-[11px] tracking-[3px] uppercase text-[rgba(255,255,255,0.4)] mb-2.5">
          Players
        </div>
        <div className="space-y-2 mb-5">
          {playerList.map((player) => (
            <div
              key={player.id}
              className="flex items-center gap-3 p-3 px-4 bg-[#2e1b14] rounded-lg border border-[rgba(255,255,255,0.06)] animate-slide-in"
            >
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: player.color }}
              ></div>
              <div className="text-base font-medium flex-1">{player.name}</div>
              {player.id === state.playerId && state.isHost && (
                <div className="text-[10px] tracking-[2px] uppercase text-[#ff9a00] bg-[rgba(255,154,0,0.15)] px-2 py-0.5 rounded-full">
                  YOU (HOST)
                </div>
              )}
              {player.id === state.playerId && !state.isHost && (
                <div className="text-[10px] tracking-[2px] uppercase text-[#ff9a00] bg-[rgba(255,154,0,0.15)] px-2 py-0.5 rounded-full">
                  YOU
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-sm text-[rgba(255,255,255,0.4)] text-center mb-4">
          {playerCount} player{playerCount !== 1 ? "s" : ""} in the room
        </div>

        {state.isHost ? (
          <>
            <button
              onClick={startGame}
              disabled={!canStart}
              className={`w-full py-4 rounded-2xl bg-[#ff4d00] text-white font-barlow font-bold text-xl tracking-[1px] uppercase transition-all ${canStart ? "hover:bg-[#e04400] active:scale-97" : "opacity-40 cursor-not-allowed"}`}
            >
              {isStarting ? "Starting..." : "Start Game"}
            </button>
            <div className="text-xs text-[rgba(255,255,255,0.4)] text-center mt-2">
              Need at least {minNeeded} player{minNeeded !== 1 ? "s" : ""} to
              start
            </div>
          </>
        ) : (
          <div className="text-center text-[rgba(255,255,255,0.4)] py-4">
            Waiting for host to start...
          </div>
        )}
      </div>
    </div>
  );
};

export default Lobby;
