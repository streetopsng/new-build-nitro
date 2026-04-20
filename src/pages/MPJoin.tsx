// src/pages/MPJoin.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../lib/firebase";
import { ref, get } from "firebase/database";
import { genPlayerId, PLAYER_COLORS } from "../utils/helpers";

const MPJoin: React.FC = () => {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const joinRoom = async () => {
    if (!playerName.trim()) {
      setError("Please enter your name");
      return;
    }
    if (roomCode.length !== 4) {
      setError("Please enter a valid 4-letter room code");
      return;
    }

    setLoading(true);
    const code = roomCode.toUpperCase();

    try {
      const roomRef = ref(db, `rooms/${code}`);
      const snapshot = await get(roomRef);

      if (!snapshot.exists()) {
        setError("Room not found. Check your code.");
        setLoading(false);
        return;
      }

      const room = snapshot.val();
      const playerCount = Object.keys(room.players || {}).length;
      const color = PLAYER_COLORS[playerCount % PLAYER_COLORS.length];
      const playerId = genPlayerId();

      // Add player to room
      const { ref: updateRef, set } = await import("firebase/database");
      await set(updateRef(db, `rooms/${code}/players/${playerId}`), {
        id: playerId,
        name: playerName,
        color,
        score: 0,
        streak: 0,
        answered: false,
        outcome: "",
        pts: 0,
        connected: true,
      });

      // Navigate to lobby
      navigate("/lobby", {
        state: {
          roomCode: code,
          playerId,
          isHost: false,
          playerName,
          hostPlays: true,
          words: room.wordList,
        },
      });
    } catch (err) {
      setError("Failed to join room. Check your connection.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a120d] p-6 text-[#ffe9dc]">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-7">
          <button
            onClick={() => navigate("/mp-entry")}
            className="w-10 h-10 rounded-full bg-[#2e1b14] border border-[rgba(255,255,255,0.1)] text-white text-xl cursor-pointer flex items-center justify-center hover:bg-[#231510]"
          >
            ←
          </button>
          <div className="font-barlow font-black text-[28px] uppercase tracking-wide text-[#ffe9dc]">
            Join Room
          </div>
        </div>

        <div className="mb-6">
          <div className="text-[11px] tracking-[3px] uppercase text-[rgba(255,255,255,0.4)] mb-2.5">
            Your Name
          </div>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full p-3.5 px-4 bg-[#2e1b14] border border-[rgba(255,255,255,0.12)] rounded-lg text-white text-base outline-none focus:border-[#ff4d00] transition-colors"
            placeholder="Enter your name"
            maxLength={20}
            onKeyDown={(e) => e.key === "Enter" && joinRoom()}
          />
        </div>

        <div className="mb-6">
          <div className="text-[11px] tracking-[3px] uppercase text-[rgba(255,255,255,0.4)] mb-2.5">
            Room Code
          </div>
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            className="w-full p-3.5 px-4 bg-[#2e1b14] border border-[rgba(255,255,255,0.12)] rounded-lg text-white font-barlow text-[32px] font-black tracking-[10px] text-center outline-none focus:border-[#ff4d00] transition-colors uppercase"
            placeholder="XXXX"
            maxLength={4}
            onKeyDown={(e) => e.key === "Enter" && joinRoom()}
          />
        </div>

        {error && <div className="text-sm text-[#d64545] mb-4">{error}</div>}

        <button
          onClick={joinRoom}
          disabled={loading}
          className={`w-full py-4 rounded-2xl bg-[#ff4d00] text-white font-barlow font-bold text-xl tracking-[1px] uppercase transition-all hover:bg-[#e04400] active:scale-97 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {loading ? "Joining..." : "Join Game"}
        </button>
      </div>
    </div>
  );
};

export default MPJoin;
