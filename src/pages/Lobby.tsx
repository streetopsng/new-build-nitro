import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../lib/firebase";
import { ref, onValue, update, remove, push } from "firebase/database";
import { Avatar } from "../components/Avatar";
import SoundToggle from "../components/SoundToggle";
import { JoiningLobby } from "../components/JoiningLobby";
import { SessionExpiredModal } from "../components/SessionExpiredModal";
import { useProfile } from "../contexts/ProfileContext";
import { useGummyGum } from "../contexts/GummyGumContext";
import { closeGummyGumSession, returnToGummyGum } from "../lib/gummygumSession";
import { isRoomEnded, markRoomEnded } from "../lib/roomStatus";
import {
  IconPowerOff,
  IconArrowLeft,
  IconCheck,
  IconClock,
  IconLock,
  IconUsers,
  IconChat,
  IconChevronRight,
  IconClose,
  IconUserX,
  IconInfo,
  IconPlay,
} from "../components/icons";
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
  const { ggSession } = useGummyGum();

  const searchParams = new URLSearchParams(location.search);
  const queryRoomCode = searchParams.get("roomCode") || searchParams.get("pin") || searchParams.get("code");
  const queryIsHost = searchParams.get("host") === "true" || searchParams.get("isHost") === "true";

  const roomCode = state?.roomCode || queryRoomCode || ggSession?.roomCode || "DEFAULT";
  const isHost = state?.isHost ?? (ggSession ? (ggSession.isHost ?? false) : queryIsHost);
  const currentUserPlayerName = state?.playerName || ggSession?.player?.name || profile.username || (isHost ? "Host Admin" : "Player");
  const currentUserId = state?.playerId || (isHost ? "host_admin" : ("player_" + (profile.username || "me")));

  const queryInvited = searchParams.get("invitedCount");
  const targetInvited = ggSession?.invitedCount || (queryInvited ? parseInt(queryInvited, 10) : null);

  const [players, setPlayers] = useState<Player[]>([]);
  const [lobbyTitle, setLobbyTitle] = useState(state?.lobbyName || "Onboarding Lobby");
  const [isLocked, setIsLocked] = useState(false);
  const [statusText, setStatusText] = useState("Waiting for host to start");
  const [isStarting, setIsStarting] = useState(false);
  const [isSelfReady, setIsSelfReady] = useState(true);

  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");

  const [playerToRemove, setPlayerToRemove] = useState<Player | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showHostCancelModal, setShowHostCancelModal] = useState(false);
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const roomCreatedAtRef = useRef<number | null>(null);
  const cancelledHandledRef = useRef(false);
  const roomExistedRef = useRef(false);
  const hostExitInProgressRef = useRef(false);
  const [isEndingSession, setIsEndingSession] = useState(false);
  const hasSeenSelfRef = useRef(false);
  const [wasRemoved, setWasRemoved] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      if (roomCreatedAtRef.current && Date.now() - roomCreatedAtRef.current >= 20 * 60 * 1000) {
        setIsSessionExpired(true);
      }
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!roomCode) return;

    const roomRef = ref(db, `rooms/${roomCode}`);
    const handleRoomEnded = (completed: boolean) => {
      if (cancelledHandledRef.current || hostExitInProgressRef.current) return;
      cancelledHandledRef.current = true;
      if (isHost) {
        if (ggSession) returnToGummyGum();
        else navigate("/home", { replace: true });
      } else {
        navigate("/session-ended", { replace: true, state: { completed } });
      }
    };

    const unsubscribe = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        roomExistedRef.current = true;
        const room = snapshot.val();
        if (room.createdAt) {
          roomCreatedAtRef.current = room.createdAt;
        }

        if (isRoomEnded(room)) {
          handleRoomEnded(!!room.completed);
          return;
        }

        // Real-time idle lobby expiration check (20 mins idle in lobby)
        if (room.status === "expired") {
          setIsSessionExpired(true);
          return;
        }
        if (
          (room.status === "lobby" || !room.status || room.status === "waiting") &&
          room.createdAt &&
          Date.now() - room.createdAt >= 20 * 60 * 1000
        ) {
          setIsSessionExpired(true);
          return;
        }

        setLobbyTitle(room.name || "Onboarding Lobby");
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
          }, 1600);
        } else {
          setStatusText(room.locked ? "Lobby locked" : "Waiting for host to start");
        }

        if (room.players) {
          const playerList = Object.values(room.players) as Player[];
          setPlayers(playerList);

          const me = playerList.find((p) => p.id === currentUserId || p.name === currentUserPlayerName);
          if (me) {
            setIsSelfReady(me.ready !== false);
            hasSeenSelfRef.current = true;
          } else if (!isHost && hasSeenSelfRef.current) {
            setWasRemoved(true);
          }
        } else if (isHost) {
          setPlayers([]);
        } else {
          setPlayers([
            {
              id: currentUserId,
              name: currentUserPlayerName,
              avatarId: profile.avatarId,
              ready: true,
              catchphrase: state?.catchphrase || "Probably the smartest 😒",
              isHost,
            },
          ]);
        }

        if (room.messages) {
          const rawMsgs = Object.entries(room.messages).map(([id, val]: [string, any]) => ({
            id,
            ...val,
            isSelf: val.sender === currentUserPlayerName,
          }));
          setChatMessages(rawMsgs);
        }
      } else if (roomExistedRef.current || (!isHost && roomCode !== "DEFAULT")) {
        // Deleted (GummyGum dashboard force-end). A participant only reaches the
        // lobby after the join flow saw the room, so a missing room is never the
        // host-creation race for them.
        handleRoomEnded(false);
      } else if (isHost) {
        // Fallback local — host is never a player.
        setPlayers([]);
      } else {
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
  }, [roomCode, currentUserId, currentUserPlayerName, profile.avatarId, state?.catchphrase, isHost, navigate, ggSession]);

  const sessionEnded = () => cancelledHandledRef.current || hostExitInProgressRef.current;

  const toggleReadyState = async () => {
    if (sessionEnded()) return;
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
    if (sessionEnded()) return;
    const newLockState = !isLocked;
    setIsLocked(newLockState);
    if (roomCode && roomCode !== "DEFAULT") {
      await update(ref(db, `rooms/${roomCode}`), { locked: newLockState });
    }
  };

  const handleStartGame = async () => {
    if (isStarting || !canStart || sessionEnded()) return;
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
      }, 1600);
    }
  };

  const confirmRemovePlayer = async () => {
    if (!playerToRemove || sessionEnded()) return;

    if (roomCode && roomCode !== "DEFAULT") {
      try {
        await remove(ref(db, `rooms/${roomCode}/players/${playerToRemove.id}`));
      } catch (err) {
        console.error("Failed to remove player:", err);
      }
    }

    setPlayers((prev) => prev.filter((p) => p.id !== playerToRemove.id));
    setToastMessage(`${playerToRemove.name} removed`);
    setPlayerToRemove(null);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const sendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || sessionEnded()) return;

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
  const MIN_PARTICIPANTS = 2;
  const participantCount = players.filter((p) => !p.isHost).length;
  const canStart = participantCount >= MIN_PARTICIPANTS;
  const markedReady = players.filter((p) => (p.id === currentUserId ? isSelfReady : p.ready !== false)).length;

  // LOADING TRANSITION: Game start loading screen matching Figma #1375:3083
  if (isStarting) {
    return <JoiningLobby message="Game is starting... Get ready!" />;
  }

  // EMPLOYEE WAITING LOBBY VIEW matching Figma #1505:1524
  if (!isHost) {
    return (
      <div className="min-h-screen bg-white text-slate-900 p-6 md:px-12 md:py-8 flex flex-col items-center select-none relative overflow-x-hidden">
        <div className="max-w-6xl w-full z-10 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-black/10">
            <div className="flex items-center gap-3">
              {!ggSession && (
                <button
                  onClick={() => navigate("/home")}
                  className="w-10 h-10 rounded-xl bg-white border border-black/20 text-black flex items-center justify-center hover:bg-slate-50 cursor-pointer shadow-xs"
                  title="Go Home"
                >
                  <IconArrowLeft className="w-4 h-4" />
                </button>
              )}
              <div className="text-left">
                <div className="text-xs font-semibold uppercase tracking-wider text-black/50">
                  LOBBY
                </div>
                <h1 className="font-heading font-black text-2xl md:text-3xl text-black">
                  {lobbyTitle}
                </h1>
              </div>
              {isLocked && (
                <span className="px-3 py-1 rounded-lg bg-orange-50 text-[#FF8E37] font-bold text-xs flex items-center gap-1.5 border border-[#FF8E37]/40">
                  <IconLock className="w-3.5 h-3.5" /> Lobby locked
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-xl bg-white border border-black/20 font-bold text-xs text-black flex items-center gap-2 shadow-xs">
                <IconClock className="w-3.5 h-3.5 text-[#FF8E37]" /> {statusText}
              </div>
              <SoundToggle className="p-2 bg-white rounded-xl border border-black/20 text-black cursor-pointer shadow-xs" />
            </div>
          </div>

          <div className="card-insync bg-[#FFFBF7] p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={toggleReadyState}
              className={`px-7 py-3 rounded-xl font-heading font-black text-base border transition-colors cursor-pointer flex items-center gap-2 shadow-xs ${
                isSelfReady
                  ? "bg-[#FF8E37] border-[#FF8E37] text-black"
                  : "bg-white border-black/20 text-black/60 hover:bg-slate-50"
              }`}
            >
              {isSelfReady && <IconCheck className="w-4 h-4" />}
              <span>{isSelfReady ? "Ready" : "Click to Ready"}</span>
            </button>

            <div className="flex items-center gap-8 font-heading">
              <div className="text-right">
                <div className="text-xs font-semibold text-black/50">Total Joined</div>
                <div className="font-black text-2xl text-black">{totalJoined}{targetInvited ? ` / ${targetInvited}` : ''}</div>
              </div>
              <div className="h-8 w-px bg-black/20" />
              <div className="text-left">
                <div className="text-xs font-semibold text-black/50">Marked Ready</div>
                <div className="font-black text-2xl text-[#FF8E37]">{markedReady}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-7 card-insync bg-[#FFFBF7] p-6 shadow-xs text-left space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-black/10">
                <h2 className="font-heading font-black text-sm uppercase tracking-wider text-black flex items-center gap-2">
                  <IconUsers className="w-4 h-4 text-[#FF8E37]" /> PLAYERS ({totalJoined}{targetInvited ? ` / ${targetInvited}` : ''})
                </h2>
                <span className="text-xs text-black/40 font-semibold">
                  Host will start the session
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[380px] overflow-y-auto pr-1">
                {players.map((player) => {
                  const isSelf = player.name === currentUserPlayerName || player.id === currentUserId;
                  const isReady = isSelf ? isSelfReady : player.ready !== false;
                  return (
                    <div
                      key={player.id}
                      className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-between min-h-[140px] bg-white transition-all ${
                        isSelf
                          ? "border-2 border-[#FF8E37] shadow-xs"
                          : "border-black/20"
                      }`}
                    >
                      <div className="mt-1">
                        <Avatar id={player.avatarId || profile.avatarId || "av-1"} size="md" />
                      </div>

                      <div className="my-1">
                        <div className="font-bold text-xs text-black truncate max-w-[110px] mx-auto">
                          {player.name} {isSelf && <span className="text-[#FF8E37]">(You)</span>}
                        </div>
                        <div className="text-[10px] text-black/50 font-medium italic line-clamp-1 max-w-[110px] mx-auto mt-0.5">
                          "{player.catchphrase || "Ready and prepared"}"
                        </div>
                      </div>

                      <div className="mb-1 text-xs">
                        {isReady ? (
                          <span className="text-emerald-600 font-black flex items-center gap-1">
                            <IconCheck className="w-3 h-3" /> Ready
                          </span>
                        ) : (
                          <span className="text-black/40 font-semibold flex items-center gap-1">
                            <IconClock className="w-3 h-3" /> Waiting
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2">
                <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider text-black/50 mb-1.5">
                  <span className="text-[#FF8E37]">Readiness</span>
                  <span>{markedReady} / {totalJoined} ready</span>
                </div>
                <div className="w-full bg-white h-3 rounded-full overflow-hidden border border-black/20">
                  <div
                    className="h-full bg-[#FF8E37] rounded-full transition-all duration-500"
                    style={{ width: `${(markedReady / Math.max(totalJoined, 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="md:col-span-5 card-insync bg-[#FFFBF7] p-6 shadow-xs text-left flex flex-col h-[500px]">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-black/10">
                <h2 className="font-heading font-black text-sm uppercase tracking-wider text-black flex items-center gap-2">
                  <IconChat className="w-4 h-4 text-[#FF8E37]" /> CHAT
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {chatMessages.length === 0 ? (
                  <div className="text-xs text-black/40 italic text-center py-12">
                    No messages yet. Say hi to your team!
                  </div>
                ) : (
                  chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-2.5 ${msg.isSelf ? "justify-end" : "justify-start"}`}
                    >
                      {!msg.isSelf && <Avatar id={msg.avatarId || "av-1"} size="sm" />}
                      <div
                        className={`rounded-2xl p-3 text-xs max-w-[80%] ${
                          msg.isSelf
                            ? "bg-[#FF8E37]/15 text-black border border-[#FF8E37]/40"
                            : "bg-white text-black border border-black/20"
                        }`}
                      >
                        <div className="font-bold mb-0.5">
                          {msg.sender} {msg.isSelf && <span className="text-[#FF8E37]">(you)</span>}
                        </div>
                        <div className="font-normal text-black/80">{msg.text}</div>
                      </div>
                      {msg.isSelf && <Avatar id={msg.avatarId || "av-1"} size="sm" />}
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={sendChatMessage} className="pt-3 border-t border-black/10">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Message the lobby..."
                  className="w-full bg-white border border-black/30 focus:border-[#FF8E37] rounded-2xl px-4 py-3 text-sm text-black font-medium focus:outline-none transition-colors"
                />
              </form>
            </div>
          </div>
        </div>

        {wasRemoved && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs px-5">
            <div className="w-full max-w-sm rounded-2xl bg-[#FFFBF7] border border-black/15 p-7 text-center shadow-xl">
              <h3 className="font-heading font-black text-xl text-black mb-2">Removed from lobby</h3>
              <p className="text-sm text-black/60 mb-6">The host has removed you from this session.</p>
              {ggSession ? (
                <button
                  type="button"
                  onClick={() => returnToGummyGum()}
                  className="w-full py-3 bg-[#FF8E37] hover:bg-[#EA580C] text-black font-heading font-black text-base border border-black/20 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Return to GummyGum
                </button>
              ) : (
                <p className="text-xs text-black/40">You can close this tab now.</p>
              )}
            </div>
          </div>
        )}

        {isSessionExpired && <SessionExpiredModal isHost={false} />}
      </div>
    );
  }

  // HOST LOBBY VIEW matching Figma #1489:3336
  return (
    <div className="min-h-screen bg-white text-slate-900 p-6 md:px-12 md:py-8 flex flex-col items-center select-none relative overflow-x-hidden">
      <div className="max-w-6xl w-full z-10 space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-black/10">
          <div className="flex items-center gap-3">
            {!ggSession && (
              <button
                onClick={() => navigate("/home")}
                className="w-10 h-10 rounded-xl bg-white border border-black/20 text-black flex items-center justify-center hover:bg-slate-50 cursor-pointer shadow-xs"
                title="Go Home"
              >
                <IconArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="text-left">
              <div className="text-xs font-semibold uppercase tracking-wider text-black/50">
                HOSTING
              </div>
              <h1 className="font-heading font-black text-2xl md:text-3xl text-black">
                {lobbyTitle}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowHostCancelModal(true)}
              className="px-4 py-2 rounded-xl bg-white border border-black/20 hover:bg-red-50 hover:text-red-600 hover:border-red-300 text-xs font-bold text-black flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
              title="End session"
            >
              <IconPowerOff className="w-3.5 h-3.5" />
              <span>End session</span>
            </button>
            <SoundToggle className="p-2 bg-white rounded-xl border border-black/20 text-black cursor-pointer shadow-xs" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          <div className="card-insync bg-[#FFFBF7] p-5 shadow-xs">
            <div className="text-xs font-black uppercase tracking-wider text-black/50">
              TOTAL JOINED
            </div>
            <div className="font-heading font-black text-3xl text-black mt-1 flex items-baseline gap-1.5">
              <span className="text-[#FF8E37] flex items-center gap-1.5"><IconUsers className="w-5 h-5" /> {totalJoined}</span>
              {targetInvited ? (
                <span className="text-sm text-black/40 font-normal">/ {targetInvited}</span>
              ) : null}
            </div>
          </div>

          <div className="card-insync bg-[#FFFBF7] p-5 shadow-xs">
            <div className="text-xs font-black uppercase tracking-wider text-black/50">
              MARKED READY
            </div>
            <div className="font-heading font-black text-3xl text-[#FF8E37] mt-1 flex items-center gap-1.5">
              <IconCheck className="w-5 h-5" /> {markedReady}
            </div>
          </div>

          <div className="card-insync bg-[#FFFBF7] p-5 shadow-xs">
            <div className="text-xs font-black uppercase tracking-wider text-black/50">
              SESSION STATUS
            </div>
            <div className="font-heading font-black text-xl text-black mt-2 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FF8E37] animate-pulse" />
              {statusText}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-7 card-insync bg-[#FFFBF7] p-6 shadow-xs text-left space-y-4">
            {toastMessage && (
              <div className="px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold text-xs flex items-center gap-2 animate-slide-in">
                <IconCheck className="w-3.5 h-3.5" />
                <span>{toastMessage}</span>
              </div>
            )}

            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <h2 className="font-heading font-black text-sm uppercase tracking-wider text-black flex items-center gap-2">
                <IconUsers className="w-4 h-4 text-[#FF8E37]" /> PARTICIPANTS ({totalJoined})
              </h2>
              <span className="text-xs text-black/40 font-semibold">
                {totalJoined} Active
              </span>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-black/20 bg-white hover:bg-slate-50 transition-colors shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <Avatar id={player.avatarId || "av-1"} size="md" />
                    <div>
                      <div className="font-bold text-sm text-black">
                        {player.name}
                      </div>
                      <div className="text-xs text-black/50 italic">
                        "{player.catchphrase || "Ready and prepared"}"
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {player.ready !== false ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center gap-1 border border-emerald-200">
                        <IconCheck className="w-3 h-3" /> Ready
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-slate-50 text-slate-500 font-bold text-xs flex items-center gap-1 border border-slate-200">
                        <IconClock className="w-3 h-3" /> Waiting
                      </span>
                    )}

                    {!player.isHost && (
                      <button
                        onClick={() => setPlayerToRemove(player)}
                        title="Remove player"
                        className="p-1.5 rounded-full hover:bg-red-100 text-black/40 hover:text-red-600 transition-colors cursor-pointer"
                      >
                        <IconClose className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-5">
            {!showChat ? (
              <div className="card-insync bg-[#FFFBF7] p-6 shadow-xs text-left space-y-6">
                <h2 className="font-heading font-black text-sm uppercase tracking-wider text-black">
                  SESSION CONTROLS
                </h2>

                <div
                  onClick={() => setShowChat(true)}
                  className="p-4 rounded-2xl border border-black/20 hover:border-[#FF8E37] bg-white flex items-center justify-between cursor-pointer transition-colors shadow-2xs"
                >
                  <div className="flex items-center gap-2 text-sm font-bold text-black">
                    <IconChat className="w-4 h-4 text-[#FF8E37]" /> View chat ({chatMessages.length})
                  </div>
                  <IconChevronRight className="w-4 h-4 text-black/40" />
                </div>

                <div className="p-4 rounded-2xl border border-black/20 bg-white flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-2 text-sm font-bold text-black">
                    <IconLock className="w-4 h-4 text-[#FF8E37]" /> Lock lobby
                  </div>
                  <button
                    type="button"
                    onClick={toggleLockLobby}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      isLocked ? "bg-[#FF8E37]" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        isLocked ? "translate-x-6" : ""
                      }`}
                    />
                  </button>
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    onClick={handleStartGame}
                    disabled={isStarting || !canStart}
                    className={`w-full py-3.5 bg-[#FF8E37] text-black font-heading font-black text-lg border border-black/20 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 ${canStart ? "hover:bg-[#EA580C] cursor-pointer" : "opacity-50 cursor-not-allowed"}`}
                  >
                    {isStarting ? "Starting..." : (
                      <>
                        Start Game <IconPlay className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  {!canStart && (
                    <div className="text-xs text-black/60 font-semibold text-center">
                      Waiting for at least {MIN_PARTICIPANTS} participants ({participantCount} joined)
                    </div>
                  )}
                  <div className="text-xs text-black/40 font-semibold text-center flex items-center justify-center gap-1.5">
                    <IconInfo className="w-3.5 h-3.5" /> HOST RUNS THE SESSION (NO PARTICIPATION)
                  </div>
                </div>
              </div>
            ) : (
              <div className="card-insync bg-[#FFFBF7] p-6 shadow-xs text-left flex flex-col h-[480px]">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-black/10">
                  <button
                    onClick={() => setShowChat(false)}
                    className="flex items-center gap-1.5 text-xs font-bold text-black hover:text-[#FF8E37] cursor-pointer"
                  >
                    <IconArrowLeft className="w-3.5 h-3.5" /> <IconChat className="w-3.5 h-3.5" /> CHAT PANEL
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className="flex items-start gap-2.5">
                      <Avatar id={msg.avatarId || "av-1"} size="sm" />
                      <div className="bg-white border border-black/20 rounded-2xl p-2.5 text-xs max-w-[80%]">
                        <div className="font-bold text-black mb-0.5">
                          {msg.sender}
                        </div>
                        <div className="text-black/80 font-normal">{msg.text}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={sendChatMessage} className="pt-3 border-t border-black/10 flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type message..."
                    className="flex-1 bg-white border border-black/30 rounded-xl px-3 py-2 text-xs text-black focus:outline-none focus:border-[#FF8E37]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#FF8E37] text-black font-bold text-xs border border-black cursor-pointer"
                  >
                    Send
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Remove Player Modal matching Figma #1493:2980 */}
      {playerToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-card-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-[#FFFBF7] border border-black/15 p-7 text-center text-slate-900 shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto">
              <IconUserX className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-black text-xl text-black">
              Remove {playerToRemove.name}?
            </h3>
            <p className="text-sm text-black/60 leading-relaxed">
              They'll be disconnected from the lobby immediately.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setPlayerToRemove(null)}
                className="flex-1 py-3 rounded-xl bg-white border border-black/20 text-black font-bold text-sm hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemovePlayer}
                className="flex-1 py-3 rounded-xl bg-[#EF4444] text-white font-bold text-sm hover:bg-red-600 cursor-pointer shadow-xs"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
      {showHostCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs px-5">
          <div className="w-full max-w-sm rounded-2xl bg-[#FFFBF7] border border-black/15 p-7 text-center shadow-xl">
            <h3 className="font-heading font-black text-xl text-black mb-2">End this session?</h3>
            <p className="text-sm text-black/60 mb-6">
              Everyone will be removed{ggSession ? " and the session will close in GummyGum." : "."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowHostCancelModal(false)}
                disabled={isEndingSession}
                className="flex-1 py-3 rounded-xl bg-white border border-black/20 font-bold text-black cursor-pointer hover:bg-slate-50 disabled:opacity-50"
              >
                Stay
              </button>
              <button
                onClick={async () => {
                  if (hostExitInProgressRef.current) return;
                  hostExitInProgressRef.current = true;
                  setIsEndingSession(true);
                  if (roomCode && roomCode !== "DEFAULT") {
                    try {
                      await markRoomEnded(roomCode);
                    } catch (err) {
                      console.error("Failed to mark room ended:", err);
                    }
                  }
                  if (ggSession) {
                    await closeGummyGumSession();
                  } else {
                    navigate("/home");
                  }
                }}
                disabled={isEndingSession}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold shadow-xs cursor-pointer hover:bg-red-600 disabled:opacity-60"
              >
                {isEndingSession ? "Ending…" : "End session"}
              </button>
            </div>
          </div>
        </div>
      )}
      {isSessionExpired && <SessionExpiredModal isHost={true} />}
    </div>
  );
};

export default Lobby;
