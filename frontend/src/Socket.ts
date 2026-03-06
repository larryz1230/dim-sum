import { io, type Socket } from "socket.io-client";

const SOCKET_URL = "http://localhost:9090";

export type MatchFoundPayload = {
  matchId: string;
  playerNumber: 1 | 2;
};

// (optional) type your server->client events here
type ServerToClientEvents = {
  "matchmaking:queued": () => void;
  "matchmaking:match_found": (payload: MatchFoundPayload) => void;
  "matchmaking:canceled": () => void;
  "matchmaking:error": (msg: string) => void;

  "room:game_state": (state: any) => void;
  "room:message": (msg: string) => void;
  "room:count": (count: number) => void;
};

type ClientToServerEvents = {
  "matchmaking:start": () => void;
  "matchmaking:cancel": () => void;

  "room:join": (p: { roomId: string }) => void;
  "room:leave": (p: { roomId: string }) => void;
  "room:increment": (p: { roomId: string }) => void;

  "game:update": (p: { roomId: string; clearedCells: { row: number; col: number }[] }) => void;
};

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export type SocketHandlers = Partial<{
  connect: (id: string) => void;
  disconnect: () => void;
  connect_error: (msg: string) => void;

  "matchmaking:queued": () => void;
  "matchmaking:match_found": (p: MatchFoundPayload) => void;
  "matchmaking:canceled": () => void;
  "matchmaking:error": (msg: string) => void;

  "room:game_state": (state: any) => void;
  "room:message": (msg: string) => void;
  "room:count": (count: number) => void;
}>;

export default class SocketSingleton {
  private static socket: TypedSocket | null = null;

  private static playerNumber: 1 | 2 | null = null;

  static getPlayerNumber() {
    return this.playerNumber;
  }

  static setPlayerNumber(n: 1 | 2 | null) {
    this.playerNumber = n;
  }

  static clearPlayerNumber() {
    this.playerNumber = null;
  }

  static getSocket(): TypedSocket {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        autoConnect: false,
        transports: ["websocket"],
      });

      this.socket.on("matchmaking:match_found", (p) => {
        this.playerNumber = p.playerNumber;
      });

      // optional: clear on disconnect
      this.socket.on("disconnect", () => {
        this.playerNumber = null;
      });
    }
    return this.socket;
  }

  static ensureConnected() {
    const s = this.getSocket();
    if (!s.connected) s.connect();
  }

  static subscribe(handlers: SocketHandlers) {
    const s = this.getSocket();
    const ons: Array<() => void> = [];

    const on = <K extends keyof SocketHandlers>(event: K, fn?: SocketHandlers[K]) => {
      if (!fn) return;
      s.on(event as any, fn as any);
      ons.push(() => s.off(event as any, fn as any));
    };

    on("connect", handlers.connect ? (() => handlers.connect!(s.id ?? "")) : undefined);
    on("disconnect", handlers.disconnect);
    on("connect_error", handlers.connect_error ? ((errMsg: any) =>
      handlers.connect_error!(errMsg?.message ?? "Connection failed")
    ) : undefined);

    // if page wants to handle match_found too, still call it
    on("matchmaking:queued", handlers["matchmaking:queued"]);
    on("matchmaking:match_found", handlers["matchmaking:match_found"]);
    on("matchmaking:canceled", handlers["matchmaking:canceled"]);
    on("matchmaking:error", handlers["matchmaking:error"]);

    on("room:game_state", handlers["room:game_state"]);
    on("room:message", handlers["room:message"]);
    on("room:count", handlers["room:count"]);

    return () => ons.forEach((off) => off());
  }
}