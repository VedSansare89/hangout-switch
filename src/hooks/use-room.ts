"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { heartbeat, reclaimHost } from "@/lib/room-actions";
import { PlayerRow, RoomRow } from "@/lib/room-types";

const HEARTBEAT_INTERVAL_MS = 12_000;
const HOST_STALE_CHECK_MS = 15_000;

interface UseRoomOptions {
  roomCode: string;
  playerId: string;
  enabled: boolean;
}

export interface UseRoomResult {
  room: RoomRow | null;
  players: PlayerRow[];
  connected: boolean;
  isHost: boolean;
}

export function useRoom({ roomCode, playerId, enabled }: UseRoomOptions): UseRoomResult {
  const [room, setRoom] = useState<RoomRow | null>(null);
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!enabled || !roomCode) {
      setRoom(null);
      setPlayers([]);
      setConnected(false);
      return;
    }

    let active = true;

    async function refetchPlayers() {
      const { data } = await supabase
        .from("players")
        .select("*")
        .eq("room_code", roomCode)
        .order("joined_at", { ascending: true });
      if (active) setPlayers((data as PlayerRow[]) ?? []);
    }

    async function loadInitial() {
      const { data: roomData } = await supabase
        .from("rooms")
        .select("*")
        .eq("code", roomCode)
        .maybeSingle();
      if (active) setRoom(roomData as RoomRow | null);
      await refetchPlayers();
    }

    loadInitial();

    const channel = supabase
      .channel(`room:${roomCode}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rooms", filter: `code=eq.${roomCode}` },
        (payload) => {
          if (!active) return;
          if (payload.eventType === "DELETE") setRoom(null);
          else setRoom(payload.new as RoomRow);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "players", filter: `room_code=eq.${roomCode}` },
        () => {
          refetchPlayers();
        }
      )
      .subscribe((status) => {
        if (active) setConnected(status === "SUBSCRIBED");
      });

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [roomCode, enabled]);

  // Heartbeat so other players can tell we're still here, plus a watchdog
  // that reclaims the host role if the current host has gone silent
  // (closed tab, lost connection) without explicitly leaving.
  useEffect(() => {
    if (!enabled || !roomCode || !playerId) return;

    heartbeat(roomCode, playerId);
    const hbTimer = setInterval(() => heartbeat(roomCode, playerId), HEARTBEAT_INTERVAL_MS);

    const watchdog = setInterval(() => {
      setRoom((currentRoom) => {
        if (currentRoom && currentRoom.host_id !== playerId) {
          reclaimHost(roomCode, playerId).catch(() => {});
        }
        return currentRoom;
      });
    }, HOST_STALE_CHECK_MS);

    return () => {
      clearInterval(hbTimer);
      clearInterval(watchdog);
    };
  }, [roomCode, playerId, enabled]);

  const isHost = !!room && room.host_id === playerId;

  return { room, players, connected, isHost };
}
