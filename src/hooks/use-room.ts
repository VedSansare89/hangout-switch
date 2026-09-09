"use client";

import { useCallback, useState } from "react";
import usePartySocket from "partysocket/react";
import { ClientMessage, RoomSnapshot } from "@/lib/room-types";

const DEFAULT_HOST = "127.0.0.1:1999";

function getPartyKitHost(): string {
  return process.env.NEXT_PUBLIC_PARTYKIT_HOST || DEFAULT_HOST;
}

interface UseRoomOptions {
  roomCode: string;
  playerId: string;
  name: string;
  avatarId: string;
  passcode?: string;
  enabled: boolean;
}

export interface UseRoomResult {
  snapshot: RoomSnapshot | null;
  connected: boolean;
  error: string | null;
  isHost: boolean;
  send: (message: ClientMessage) => void;
}

export function useRoom({
  roomCode,
  playerId,
  name,
  avatarId,
  passcode,
  enabled,
}: UseRoomOptions): UseRoomResult {
  const [snapshot, setSnapshot] = useState<RoomSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const socket = usePartySocket({
    host: getPartyKitHost(),
    room: roomCode.toLowerCase(),
    id: playerId,
    query: { name, avatarId, passcode: passcode ?? "" },
    enabled,
    onOpen() {
      setConnected(true);
      setError(null);
    },
    onMessage(event: MessageEvent<string>) {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "state") {
          setSnapshot({ room: data.room, players: data.players });
          setError(null);
        } else if (data.type === "error") {
          setError(data.message);
        }
      } catch {
        // ignore malformed frames
      }
    },
    onClose(event: CloseEvent) {
      setConnected(false);
      if (event.code === 4001) {
        setError("Incorrect passcode.");
      }
    },
  });

  const send = useCallback(
    (message: ClientMessage) => {
      socket.send(JSON.stringify(message));
    },
    [socket]
  );

  const isHost = !!snapshot && !!playerId && snapshot.room.hostId === playerId;

  return { snapshot, connected, error, isHost, send };
}
