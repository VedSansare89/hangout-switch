import type * as Party from "partykit/server";
import { getQuestionPool, pickRandomQuestion } from "../src/lib/questions";
import { Intensity, MiniGameId, Mode } from "../src/lib/types";
import { ClientMessage, RoomPlayer, RoomState } from "../src/lib/room-types";

const ROOM_KEY = "room-state";
const PLAYERS_KEY = "players";
const PASSCODE_KEY = "passcode";

const VALID_MODES: Mode[] = ["friends", "couples"];
const VALID_INTENSITIES: Intensity[] = ["low", "medium", "high"];

function defaultRoomState(code: string): RoomState {
  return {
    code,
    mode: "friends",
    intensity: "low",
    currentMiniGame: null,
    currentQuestion: null,
    round: 0,
    playedQuestions: [],
    hostId: null,
    locked: false,
    createdAt: Date.now(),
  };
}

export default class HangoutRoomServer implements Party.Server {
  room: RoomState;
  players: Map<string, RoomPlayer> = new Map();
  passcode: string | null = null;
  private loaded = false;

  constructor(readonly party: Party.Room) {
    this.room = defaultRoomState(party.id);
  }

  private async ensureLoaded() {
    if (this.loaded) return;
    const [savedRoom, savedPlayers, savedPasscode] = await Promise.all([
      this.party.storage.get<RoomState>(ROOM_KEY),
      this.party.storage.get<[string, RoomPlayer][]>(PLAYERS_KEY),
      this.party.storage.get<string | null>(PASSCODE_KEY),
    ]);
    if (savedRoom) this.room = savedRoom;
    if (savedPlayers) this.players = new Map(savedPlayers);
    if (savedPasscode !== undefined) this.passcode = savedPasscode;
    this.loaded = true;
  }

  private async persist() {
    await Promise.all([
      this.party.storage.put(ROOM_KEY, this.room),
      this.party.storage.put(PLAYERS_KEY, Array.from(this.players.entries())),
      this.party.storage.put(PASSCODE_KEY, this.passcode),
    ]);
  }

  private broadcastState() {
    const snapshot = JSON.stringify({
      type: "state",
      room: this.room,
      players: Array.from(this.players.values()),
    });
    this.party.broadcast(snapshot);
  }

  private drawQuestion(miniGame: MiniGameId) {
    const pool = getQuestionPool(this.room.mode, miniGame, this.room.intensity);
    const question = pickRandomQuestion(pool, this.room.playedQuestions);
    this.room.currentMiniGame = miniGame;
    this.room.currentQuestion = question;
    if (question) this.room.playedQuestions.push(question);
  }

  async onConnect(connection: Party.Connection, ctx: Party.ConnectionContext) {
    await this.ensureLoaded();

    const url = new URL(ctx.request.url);
    const name = (url.searchParams.get("name") || "Guest").slice(0, 24);
    const avatarId = url.searchParams.get("avatarId") || "fox";
    const passcode = url.searchParams.get("passcode") || "";

    if (this.room.locked && this.passcode && passcode !== this.passcode) {
      connection.send(JSON.stringify({ type: "error", message: "Incorrect passcode." }));
      connection.close(4001, "wrong-passcode");
      return;
    }

    const isFirstEver = this.players.size === 0 && !this.room.hostId;

    this.players.set(connection.id, {
      id: connection.id,
      name,
      avatarId,
      connected: true,
    });

    if (isFirstEver || !this.room.hostId) {
      this.room.hostId = connection.id;
    }

    await this.persist();
    this.broadcastState();
  }

  async onClose(connection: Party.Connection) {
    await this.ensureLoaded();
    const player = this.players.get(connection.id);
    if (player) player.connected = false;

    if (this.room.hostId === connection.id) {
      const nextHost = Array.from(this.players.values()).find(
        (p) => p.connected && p.id !== connection.id
      );
      this.room.hostId = nextHost ? nextHost.id : null;
    }

    await this.persist();
    this.broadcastState();
  }

  async onMessage(message: string | ArrayBuffer | ArrayBufferView, sender: Party.Connection) {
    await this.ensureLoaded();
    if (typeof message !== "string") return;

    let parsed: ClientMessage;
    try {
      parsed = JSON.parse(message);
    } catch {
      return;
    }

    const isHost = sender.id === this.room.hostId;

    switch (parsed.type) {
      case "update-profile": {
        const player = this.players.get(sender.id);
        if (player) {
          player.name = String(parsed.name).slice(0, 24);
          player.avatarId = String(parsed.avatarId);
        }
        break;
      }
      case "set-mode": {
        if (!isHost || !VALID_MODES.includes(parsed.mode)) return;
        this.room.mode = parsed.mode;
        this.room.currentMiniGame = null;
        this.room.currentQuestion = null;
        this.room.playedQuestions = [];
        this.room.round = 0;
        break;
      }
      case "set-intensity": {
        if (!isHost || !VALID_INTENSITIES.includes(parsed.intensity)) return;
        this.room.intensity = parsed.intensity;
        if (this.room.currentMiniGame) this.drawQuestion(this.room.currentMiniGame);
        break;
      }
      case "pick-mini-game": {
        if (!isHost) return;
        this.room.round += 1;
        this.drawQuestion(parsed.miniGame);
        break;
      }
      case "next-question": {
        if (!isHost || !this.room.currentMiniGame) return;
        this.room.round += 1;
        this.drawQuestion(this.room.currentMiniGame);
        break;
      }
      case "skip-question": {
        if (!isHost || !this.room.currentMiniGame) return;
        this.drawQuestion(this.room.currentMiniGame);
        break;
      }
      case "reset-session": {
        if (!isHost) return;
        this.room.playedQuestions = [];
        break;
      }
      case "set-lock": {
        if (!isHost) return;
        this.room.locked = parsed.locked;
        this.passcode = parsed.locked ? (parsed.passcode ?? null) : null;
        break;
      }
      default:
        return;
    }

    await this.persist();
    this.broadcastState();
  }
}
