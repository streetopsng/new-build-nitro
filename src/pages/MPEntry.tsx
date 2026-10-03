import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGummyGum } from "../contexts/GummyGumContext";
import { GummyGumLockedScreen } from "../components/GummyGumGateModal";
import { JoiningLobby } from "../components/JoiningLobby";
import { findPlayerByEmail, isRoomReadyForLaunch, launchRoomKey, prepareHostRoom } from "../lib/roomStatus";
import { db, ref, get } from "../lib/firebase";

const MPEntry: React.FC = () => {
  const navigate = useNavigate();
  const { ggSession, ggAccessState } = useGummyGum();

  // When launched from GummyGum with a roomCode:
  // - Participants who already joined or have saved avatar/name go straight to /lobby
  // - First-time participants go straight to /profile-setup
  // - Hosts go straight to /lobby
  useEffect(() => {
    if (!ggSession || !ggSession.roomCode) return;
    const roomCode = ggSession.roomCode;
    const email = (ggSession.player?.email || "").toLowerCase().trim();

    if (ggSession.isHost) {
      let cancelled = false;
      const hostName = ggSession.player?.name || "Host";
      prepareHostRoom(roomCode, ggSession.hostedSessionId, { name: hostName, email: ggSession.player?.email || null })
        .catch((err) => console.error("Failed to prepare room:", err))
        .then(() => {
          if (cancelled) return;
          navigate("/lobby", {
            replace: true,
            state: {
              roomCode,
              playerId: "host_" + Date.now(),
              isHost: true,
              playerName: hostName,
              lobbyName: `${ggSession.player?.name || "Insync"} session`,
            },
          });
        });
      return () => {
        cancelled = true;
      };
    }

    // Participant flow
    const savedAvatar = email ? localStorage.getItem(`nitro_avatar_${email}`) : null;
    const savedName = ggSession.player?.name || (email ? localStorage.getItem(`nitro_name_${email}`) : null);
    const roomKey = launchRoomKey(roomCode, ggSession.hostedSessionId);
    const alreadyJoined = email ? localStorage.getItem(`nitro_joined_${roomKey}_${email}`) === "true" : false;
    const savedPlayerId = email ? localStorage.getItem(`nitro_player_id_${roomKey}_${email}`) : null;

    let cancelled = false;
    (async () => {
      if (email) {
        try {
          const room = (await get(ref(db, `rooms/${roomCode}`))).val();
          const existing = isRoomReadyForLaunch(room, ggSession.hostedSessionId) ? findPlayerByEmail(room?.players, email) : null;
          if (cancelled) return;
          if (existing) {
            const name = existing.name || savedName || "Contestant";
            const avatarId = existing.avatarId || savedAvatar || "av-1";
            localStorage.setItem(`nitro_joined_${roomKey}_${email}`, "true");
            localStorage.setItem(`nitro_player_id_${roomKey}_${email}`, existing.id);
            localStorage.setItem(`nitro_avatar_${email}`, avatarId);
            localStorage.setItem(`nitro_name_${email}`, name);
            navigate("/lobby", {
              replace: true,
              state: {
                roomCode,
                playerId: existing.id,
                isHost: false,
                playerName: name,
                avatarId,
                catchphrase: existing.catchphrase,
                email,
                lobbyName: `${name} session`,
              },
            });
            return;
          }
        } catch (err) {
          console.warn("Could not look up an existing player for this invite:", err);
        }
      }
      if (cancelled) return;
      if (alreadyJoined && savedAvatar) {
        navigate("/lobby", {
          replace: true,
          state: {
            roomCode,
            playerId: savedPlayerId || "player_" + Date.now(),
            isHost: false,
            playerName: savedName || "Contestant",
            avatarId: savedAvatar,
            email,
            lobbyName: `${savedName || "Insync"} session`,
          },
        });
      } else {
        navigate("/profile-setup", {
          replace: true,
          state: {
            roomCode,
            playerName: savedName || "Contestant",
            email,
            playerId: savedPlayerId || "player_" + Date.now(),
          },
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ggSession, navigate]);

  if (ggAccessState === "checking" || ggSession?.roomCode) {
    return <JoiningLobby connecting />;
  }

  return <GummyGumLockedScreen />;
};

export default MPEntry;
