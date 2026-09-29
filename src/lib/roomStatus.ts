import { ref, update } from "firebase/database";
import { db } from "./firebase";

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
