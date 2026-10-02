import { db, ref, update, get, set, onValue } from "./firebase";

const LOBBY_IDLE_MS = 20 * 60 * 1000;

// `cancelled` is the legacy lobby-cancel flag; still honoured for rooms written by older builds.
export function isRoomEnded(room: any): boolean {
  return !!room && (room.status === "ended" || room.status === "cancelled" || !!room.cancelled);
}

export function markRoomEnded(roomCode: string, completed = false): Promise<void> {
  return update(ref(db, `rooms/${roomCode}`), {
    status: "ended",
    cancelled: !completed,
    completed,
    locked: true,
    endedAt: Date.now(),
  });
}

function isIdleLobby(room: any): boolean {
  const inLobby = !room.status || room.status === "waiting" || room.status === "lobby";
  return inLobby && !!room.createdAt && Date.now() - room.createdAt >= LOBBY_IDLE_MS;
}

// The hub reuses a PIN when a session is re-run, so the room under it may belong to an earlier hosted session.
export function isFromEarlierRoom(room: any, hostedSessionId?: string | null): boolean {
  if (!room || !hostedSessionId) return false;
  if (room.hostedSessionId) return room.hostedSessionId !== hostedSessionId;
  return isRoomEnded(room) || room.status === "expired" || isIdleLobby(room);
}

export function isRoomReadyForLaunch(room: any, hostedSessionId?: string | null): boolean {
  if (!hostedSessionId) return true;
  return !!room && !isFromEarlierRoom(room, hostedSessionId);
}

// Resolves once the host has (re)created the room for this hosted session.
export function waitForLaunchRoom(roomCode: string, hostedSessionId?: string | null): Promise<void> {
  return new Promise((resolve) => {
    const status = { done: false };
    const unsubscribe = onValue(ref(db, `rooms/${roomCode}`), (snapshot) => {
      if (status.done || !isRoomReadyForLaunch(snapshot.val(), hostedSessionId)) return;
      status.done = true;
      resolve();
      setTimeout(() => unsubscribe(), 0);
    });
  });
}

// Host launch: reset a room left over from an earlier hosted session to a fresh lobby, keeping the hub-supplied setup.
export async function prepareHostRoom(
  roomCode: string,
  hostedSessionId: string | null | undefined,
  host: { name: string; email: string | null }
): Promise<void> {
  if (!hostedSessionId) return;
  const roomRef = ref(db, `rooms/${roomCode}`);
  const snapshot = await get(roomRef);
  const room = snapshot.val();

  if (room && !isFromEarlierRoom(room, hostedSessionId)) {
    if (!room.hostedSessionId) await update(roomRef, { hostedSessionId });
    return;
  }

  await set(roomRef, {
    name: room?.name || `${host.name} session`,
    code: roomCode,
    hostedSessionId,
    hostId: room?.hostId || "host_" + Date.now(),
    hostName: room?.hostName || host.name,
    hostEmail: room?.hostEmail || host.email,
    status: "waiting",
    locked: false,
    createdAt: Date.now(),
    settings: room?.settings || { difficulty: "easy", themes: ["General", "Corporate"], maxPlayers: 200 },
    ...(room?.customWords ? { customWords: room.customWords } : {}),
  });
}

// The GummyGum invite email is a participant's identity, so a rejoin from any device reclaims the same slot.
export function findPlayerByEmail(players: Record<string, any> | null | undefined, email?: string | null): any | null {
  const target = (email || "").toLowerCase().trim();
  if (!target || !players) return null;
  return Object.values(players).find((p: any) => p?.id && (p.email || "").toLowerCase().trim() === target) || null;
}

// Per-hosted-session key so "already joined" flags from an earlier run of the same PIN don't carry over.
export function launchRoomKey(roomCode: string, hostedSessionId?: string | null): string {
  return hostedSessionId ? `${roomCode}_${hostedSessionId}` : roomCode;
}
