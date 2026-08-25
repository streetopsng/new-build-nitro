// src/pages/Lobby.tsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../lib/firebase";
import { ref, onValue, update, remove, push } from "firebase/database";
import { Avatar } from "../components/Avatar";
import SoundToggle from "../components/SoundToggle";
import { JoiningLobby } from "../components/JoiningLobby";
import { useProfile } from "../contexts/ProfileContext";
import { BackgroundDoodles } from "../components/BackgroundDoodles";

interface LocationState {
  roomCode: string;
  playerId: string;
  isHost: boolean;
  playerName: string;
  lobbyName?: string;
  catchphrase?: string;
}

interface Player {
  id: string;
  name: string;
  avatarId?: string;
  ready?: boolean;
  score?: number;
  isHost?: boolean;
  catchphrase?: string;
}

interface ChatMessage {
  id: string;
  sender: string;
  avatarId?: string;
  text: string;
  isSelf?: boolean;
  timestamp?: number;
}

const Lobby: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  const { profile } = useProfile();

  const roomCode = state?.roomCode || "DEFAULT";
  const isHost = state?.isHost ?? false;
  const currentUserPlayerName = state?.playerName || profile.username || "Player";
  const currentUserId = state?.playerId || "player_" + (profile.username || "me");

  const [players, setPlayers] = useState<Player[]>([]);
  const [lobbyTitle, setLobbyTitle] = useState(state?.lobbyName || "Game Lobby");
  const [isLocked, setIsLocked] = useState(false);
  const [statusText, setStatusText] = useState("Waiting for host to start");
  const [isStarting, setIsStarting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSelfReady, setIsSelfReady] = useState(true);

  // Chat State
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");

  const [playerToRemove, setPlayerToRemove] = useState<Player | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Real-time Firebase Listener for Room Players, Messages, and Status
  useEffect(() => {
    if (!roomCode) return;

    const roomRef = ref(db, `rooms/${roomCode}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const room = snapshot.val();
        setLobbyTitle(room.name || "Game Lobby");
        setIsLocked(!!room.locked);

        if (room.status === "playing") {
          setStatusText("Game is starting...");
          setIsStarting(true);
          setTimeout(() => {
            navigate("/game", {
              state: {
                roomCode,
                playerId: currentUserId,
                isHost,
                playerName: currentUserPlayerName,
                isMultiplayer: true,
              },
            });
          }, 1800);
        } else {
          setStatusText(room.locked ? "Lobby locked" : "Waiting for host to start");
        }

        // Real-Time Players
        if (room.players) {
          const playerList = Object.values(room.players) as Player[];
          setPlayers(playerList);

          const me = playerList.find((p) => p.id === currentUserId || p.name === currentUserPlayerName);
          if (me) {
            setIsSelfReady(me.ready !== false);
          }
        } else {
          setPlayers([{
            id: currentUserId,
            name: currentUserPlayerName,
            avatarId: profile.avatarId,
            ready: true,
            catchphrase: state?.catchphrase || "Ready for the game!",
            isHost,
          }]);
        }

        // Real-Time Chat Messages
        if (room.messages) {
          const rawMsgs = Object.entries(room.messages).map(([id, val]: [string, any]) => ({
            id,
            ...val,
            isSelf: val.sender === currentUserPlayerName,
          }));
          setChatMessages(rawMsgs);
        }
      } else {
        // Fallback for local session testing
        setPlayers([
          {
            id: currentUserId,
            name: currentUserPlayerName,
            avatarId: profile.avatarId || "av-1",
            ready: true,
            catchphrase: state?.catchphrase || "Probably the smartest 😒",
            isHost,
          },
        ]);
      }
    });

    return () => unsubscribe();
  }, [roomCode, currentUserId, currentUserPlayerName, profile.avatarId, state?.catchphrase, isHost, navigate]);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleReadyState = async () => {
    const nextReady = !isSelfReady;
    setIsSelfReady(nextReady);

    if (roomCode && roomCode !== "DEFAULT") {
      try {
        await update(ref(db, `rooms/${roomCode}/players/${currentUserId}`), {
          ready: nextReady,
        });
      } catch (err) {
        console.error("Failed to update ready state:", err);
      }
    }
  };

  const toggleLockLobby = async () => {
    const newLockState = !isLocked;
    setIsLocked(newLockState);
    if (roomCode && roomCode !== "DEFAULT") {
      await update(ref(db, `rooms/${roomCode}`), { locked: newLockState });
    }
  };

  const handleStartGame = async () => {
    if (isStarting) return;
    setIsStarting(true);
    setStatusText("Game is starting...");

    if (roomCode && roomCode !== "DEFAULT") {
      try {
        await update(ref(db, `rooms/${roomCode}`), {
          status: "playing",
          currentWordIndex: 0,
          startTime: Date.now(),
        });
      } catch (err) {
        console.error("Failed to start game:", err);
      }
    } else {
      setTimeout(() => {
        navigate("/game", {
          state: {
            roomCode,
            isHost: true,
            isMultiplayer: true,
            playerName: currentUserPlayerName,
          },
        });
      }, 1800);
    }
  };

  const confirmRemovePlayer = async () => {
    if (!playerToRemove) return;

    if (roomCode && roomCode !== "DEFAULT") {
      try {
        await remove(ref(db, `rooms/${roomCode}/players/${playerToRemove.id}`));
      } catch (err) {
        console.error("Failed to remove player:", err);
      }
    }

    setPlayers((prev) => prev.filter((p) => p.id !== playerToRemove.id));
    setToastMessage(`✓ ${playerToRemove.name} removed`);
    setPlayerToRemove(null);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const sendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const msgText = chatInput.trim();
    setChatInput("");

    const newMsg = {
      sender: currentUserPlayerName,
      avatarId: profile.avatarId || "av-1",
      text: msgText,
      timestamp: Date.now(),
    };

    if (roomCode && roomCode !== "DEFAULT") {
      try {
        await push(ref(db, `rooms/${roomCode}/messages`), newMsg);
      } catch (err) {
        console.error("Failed to send chat message:", err);
      }
    } else {
      setChatMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), ...newMsg, isSelf: true },
      ]);
    }
  };

  const totalJoined = players.length;
  const markedReady = players.filter((p) => (p.id === currentUserId ? isSelfReady : p.ready !== false)).length;

  /* --------------------------------------------------------------------- */
  /* LOADING TRANSITION: Host is starting the game... 🚀                   */
  /* --------------------------------------------------------------------- */
  if (isStarting) {
    return <JoiningLobby message="Host is starting the game... 🚀" />;
  }

  /* --------------------------------------------------------------------- */
  /* PLAYER LOBBY VIEW                                                     */
  /* --------------------------------------------------------------------- */
  if (!isHost) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-900 p-6 md:p-12 flex flex-col items-center select-none relative overflow-hidden">
        {/* Background Line-Art Vector Doodles */}
        <BackgroundDoodles opacity="opacity-20" />

        <div className="max-w-5xl w-full z-10">
          {/* Top Header */}
          <div className="flex items-center justify-between mb-6 pb-2">
            <div className="text-left flex items-center gap-3">
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  LOBBY
                </div>
                <h1 className="font-heading font-extrabold text-2xl text-black">
                  {lobbyTitle}
                </h1>
              </div>

              {isLocked && (
                <span className="px-3 py-1 rounded-full bg-pink-50 border border-pink-300 text-pink-600 font-extrabold text-xs flex items-center gap-1.5 shadow-xs">
                  <span>🔒</span> Lobby locked
                </span>
              )}
            </div>

            <div className="px-5 py-2 rounded-full bg-white border border-slate-300 font-extrabold text-xs text-black flex items-center gap-2 shadow-xs">
              <span className="text-[#f97316]">🕒</span> {statusText}
            </div>
          </div>

          {/* Top Status Card */}
          <div className="rounded-3xl bg-white border border-slate-300 p-6 shadow-sm mb-6 flex items-center justify-between">
            <button
              onClick={toggleReadyState}
              className={`px-8 py-3 rounded-2xl font-extrabold text-base transition-all cursor-pointer flex items-center gap-2 ${
                isSelfReady
                  ? "bg-[#f97316] text-black border-2 border-black shadow-[2px_2px_0px_#000000]"
                  : "bg-white border-2 border-slate-400 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>{isSelfReady ? "✓ I'm ready" : "Unready"}</span>
            </button>

            <div className="flex items-center gap-6 font-heading">
              <div className="text-right">
                <div className="text-xs font-bold text-slate-400">Players</div>
                <div className="font-extrabold text-xl text-black">{totalJoined}</div>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div className="text-left">
                <div className="text-xs font-bold text-slate-400">Ready</div>
                <div className="font-extrabold text-xl text-[#f97316]">{markedReady}</div>
              </div>
            </div>
          </div>

          {/* Main 2 Columns Grid: Players vs Chat */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left Column: PLAYERS Grid */}
            <div className="md:col-span-7 rounded-3xl bg-white border border-slate-300 p-5 shadow-sm text-left">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <h2 className="font-heading font-extrabold text-xs uppercase tracking-wider text-black flex items-center gap-2">
                  <span>👥</span> PLAYERS ({totalJoined})
                </h2>
                <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
                  scroll for more ↓
                </span>
              </div>

              {/* Grid of Player Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[360px] overflow-y-auto pr-1 mb-4">
                {players.map((player) => {
                  const isSelf = player.name === currentUserPlayerName || player.id === currentUserId;
                  const isReady = isSelf ? isSelfReady : player.ready !== false;
                  return (
                    <div
                      key={player.id}
                      className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-between min-h-[140px] transition-all ${
                        isSelf
                          ? "border-2 border-[#f97316] bg-white shadow-xs"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="mt-1">
                        <Avatar id={player.avatarId || profile.avatarId || "av-1"} size="md" />
                      </div>

                      <div className="my-1">
                        <div className="font-extrabold text-xs text-black truncate max-w-[100px] mx-auto">
                          {player.name} {isSelf && <span className="text-[#f97316]">(You)</span>}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium italic line-clamp-1 max-w-[100px] mx-auto mt-0.5">
                          "{player.catchphrase || "Ready and prepared"}"
                        </div>
                      </div>

                      <div className="mb-1 text-xs">
                        {isReady ? (
                          <span className="text-emerald-600 font-bold">✓</span>
                        ) : (
                          <span className="text-slate-400 font-bold">⌛</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Readiness Progress Bar */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex justify-between items-center text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                  <span className="text-[#f97316]">READINESS PROGRESS</span>
                  <span>{markedReady} / {totalJoined} ready</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="h-full bg-[#f97316] rounded-full transition-all duration-500"
                    style={{ width: `${(markedReady / Math.max(totalJoined, 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Right Column: CHAT Panel */}
            <div className="md:col-span-5 rounded-3xl bg-white border border-slate-300 p-5 shadow-sm text-left flex flex-col h-[480px]">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                <h2 className="font-heading font-extrabold text-xs uppercase tracking-wider text-black flex items-center gap-2">
                  <span>💬</span> CHAT
                </h2>
              </div>

              {/* Messages list */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {chatMessages.length === 0 ? (
                  <div className="text-xs text-slate-400 italic text-center py-10">
                    No messages yet. Be the first to say hi! 👋
                  </div>
                ) : (
                  chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-2.5 ${msg.isSelf ? "justify-end" : "justify-start"}`}
                    >
                      {!msg.isSelf && <Avatar id={msg.avatarId || "av-1"} size="sm" />}
                      <div
                        className={`rounded-2xl p-2.5 text-xs max-w-[80%] ${
                          msg.isSelf
                            ? "bg-slate-200 text-black border border-slate-300"
                            : "bg-slate-100 text-slate-800 border border-slate-200"
                        }`}
                      >
                        <div className="font-extrabold mb-0.5">
                          {msg.sender} {msg.isSelf && <span className="text-[#f97316]">(you)</span>}
                        </div>
                        <div className="font-medium text-slate-700">{msg.text}</div>
                      </div>
                      {msg.isSelf && <Avatar id={msg.avatarId || "av-1"} size="sm" />}
                    </div>
                  ))
                )}
              </div>

              {/* Message Input Box */}
              <form onSubmit={sendChatMessage} className="pt-3 border-t border-slate-200 relative">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Message..."
                  className="w-full bg-white border border-slate-300 focus:border-[#f97316] rounded-2xl px-4 py-3 text-xs text-black font-semibold focus:outline-none transition-colors"
                />
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* --------------------------------------------------------------------- */
  /* HOST LOBBY VIEW                                                      */
  /* --------------------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 p-6 md:p-12 flex flex-col items-center select-none relative overflow-hidden">
      {/* Background Line-Art Vector Doodles */}
      <BackgroundDoodles opacity="opacity-20" />

      <div className="max-w-5xl w-full z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/mp-entry")}
              className="w-9 h-9 rounded-full bg-white border border-slate-300 text-slate-700 flex items-center justify-center font-bold hover:bg-slate-50 cursor-pointer shadow-sm"
            >
              ←
            </button>
            <div className="text-left">
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                HOSTING
              </div>
              <h1 className="font-heading font-extrabold text-2xl text-black">
                {lobbyTitle}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <SoundToggle className="p-2 bg-white rounded-full border border-slate-300 text-slate-700 cursor-pointer shadow-sm" />
            <button
              onClick={copyRoomCode}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border-2 border-black font-mono font-extrabold text-base tracking-wider text-black shadow-sm hover:bg-slate-50 transition-all cursor-pointer"
            >
              <span>{roomCode}</span>
              <span className="text-xs font-sans font-bold px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-300 text-slate-700">
                {copied ? "copied!" : "📋 copy"}
              </span>
            </button>
          </div>
        </div>

        {/* 3 Top Summary Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-left">
          <div className="rounded-2xl bg-white border border-slate-300 p-4 shadow-sm">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              TOTAL JOINED
            </div>
            <div className="font-heading font-extrabold text-3xl text-black mt-1 flex items-baseline gap-1">
              <span className="text-[#f97316]">👥 {totalJoined}</span>
              <span className="text-sm text-slate-400 font-semibold">/200</span>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-300 p-4 shadow-sm">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              MARKED READY
            </div>
            <div className="font-heading font-extrabold text-3xl text-[#f97316] mt-1 flex items-center gap-1.5">
              <span>✓</span> {markedReady}
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-300 p-4 shadow-sm">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              SESSION STATUS
            </div>
            <div className="font-heading font-extrabold text-xl text-black mt-1 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f97316] animate-pulse" />
              {statusText}
            </div>
          </div>
        </div>

        {/* Main Grid: Participants vs Session Controls / Chat */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left Column: Participants */}
          <div className="md:col-span-7 rounded-3xl bg-white border border-slate-300 p-5 shadow-sm text-left">
            {toastMessage && (
              <div className="mb-3 px-4 py-2.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold text-xs flex items-center gap-2 animate-slide-in">
                <span>{toastMessage}</span>
              </div>
            )}

            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h2 className="font-heading font-extrabold text-xs uppercase tracking-wider text-black flex items-center gap-2">
                <span>👥</span> PARTICIPANTS
              </h2>
              <span className="text-xs text-slate-400 font-bold">
                {totalJoined} Active
              </span>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <Avatar id={player.avatarId || "av-1"} size="md" />
                    <span className="font-bold text-sm text-black">
                      {player.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {player.ready !== false ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center gap-1 border border-emerald-200">
                        <span>✓</span> Ready
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 font-bold text-xs flex items-center gap-1 border border-slate-200">
                        <span>⏳</span> Waiting
                      </span>
                    )}

                    <button
                      onClick={() => setPlayerToRemove(player)}
                      title="Remove player"
                      className="p-1.5 rounded-full hover:bg-red-100 text-slate-400 hover:text-red-600 transition-colors cursor-pointer text-xs font-bold"
                    >
                      👤×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Controls or Chat */}
          <div className="md:col-span-5">
            {!showChat ? (
              <div className="rounded-3xl bg-white border border-slate-300 p-6 shadow-sm text-left space-y-6">
                <h2 className="font-heading font-extrabold text-xs uppercase tracking-wider text-black">
                  SESSION CONTROLS
                </h2>

                <div
                  onClick={() => setShowChat(true)}
                  className="p-3.5 rounded-xl border border-slate-300 hover:border-[#f97316] bg-white flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <span>💬</span> View chat
                  </div>
                  <span className="text-slate-400 text-sm">👁</span>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-300 bg-white flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <span>🔒</span> Lock lobby
                  </div>
                  <button
                    type="button"
                    onClick={toggleLockLobby}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      isLocked ? "bg-[#f97316]" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        isLocked ? "translate-x-6" : ""
                      }`}
                    />
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleStartGame}
                    disabled={isStarting}
                    className="w-full py-4 rounded-2xl bg-[#f97316] hover:bg-[#ea580c] text-black font-extrabold text-lg border-2 border-black shadow-[3px_3px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isStarting ? "••••" : "Start Game ▷"}
                  </button>
                  <div className="text-[11px] text-slate-400 font-semibold text-center mt-3">
                    ⓘ HOST CANNOT JOIN AS A PLAYER
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl bg-white border border-slate-300 p-5 shadow-sm text-left flex flex-col h-[400px]">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                  <button
                    onClick={() => setShowChat(false)}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-black cursor-pointer"
                  >
                    <span>←</span> 💬 CHAT
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className="flex items-start gap-2.5">
                      <Avatar id={msg.avatarId || "av-1"} size="sm" />
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs max-w-[80%]">
                        <div className="font-extrabold text-black mb-0.5">
                          {msg.sender}
                        </div>
                        <div className="text-slate-700 font-medium">{msg.text}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={sendChatMessage} className="pt-3 border-t border-slate-200 flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type message..."
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-black focus:outline-none focus:border-[#f97316]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#f97316] text-black font-bold text-xs border border-black"
                  >
                    Send
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Remove Player Modal */}
      {playerToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-card-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#71717a] border border-slate-600 p-6 text-center text-white shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-pink-400/30 text-pink-300 border border-pink-400/40 flex items-center justify-center text-2xl mx-auto mb-3">
              👤×
            </div>
            <h3 className="font-heading font-extrabold text-xl mb-1">
              Remove {playerToRemove.name}?
            </h3>
            <p className="text-xs text-slate-200 mb-6">
              They'll be disconnected immediately.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setPlayerToRemove(null)}
                className="flex-1 py-3 rounded-xl bg-black text-white font-bold text-sm hover:bg-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemovePlayer}
                className="flex-1 py-3 rounded-xl bg-[#ef4444] text-white font-bold text-sm hover:bg-red-600 cursor-pointer shadow-md"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lobby;
