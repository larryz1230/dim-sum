import { io, type Socket } from "socket.io-client";
import { SOCKET_EVENTS } from "../../shared/SocketEvents";
import { MatchFoundPayload } from "../../shared/SocketTypes";

const SOCKET_URL = 'https://cs130-group4.onrender.com';

// (optional) type your server->client events here
type ServerToClientEvents = {
  [SOCKET_EVENTS.MATCH_QUEUED]: () => void;
  [SOCKET_EVENTS.MATCH_FOUND]: (payload: MatchFoundPayload) => void;
  [SOCKET_EVENTS.MATCH_CANCELED]: () => void;
  [SOCKET_EVENTS.MATCH_ERROR]: (msg: string) => void;

  [SOCKET_EVENTS.ROOM_GAME_STATE]: (state: any) => void;
  [SOCKET_EVENTS.ROOM_MESSAGE]: (msg: string) => void;
  [SOCKET_EVENTS.ROOM_COUNT]: (count: number) => void;
};

type ClientToServerEvents = {
  [SOCKET_EVENTS.MATCH_START]: () => void;
  [SOCKET_EVENTS.MATCH_CANCEL]: () => void;

  [SOCKET_EVENTS.ROOM_JOIN]: (p: { roomId: string }) => void;
  [SOCKET_EVENTS.ROOM_LEAVE]: (p: { roomId: string }) => void;
  "room:increment": (p: { roomId: string }) => void; // ???

  [SOCKET_EVENTS.GAME_UPDATE]: (p: { roomId: string; clearedCells: { row: number; col: number }[] }) => void;
};

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export type SocketHandlers = Partial<{
  connect: (id: string) => void;
  disconnect: () => void;
  connect_error: (msg: string) => void;

  [SOCKET_EVENTS.MATCH_QUEUED]: () => void;
  [SOCKET_EVENTS.MATCH_FOUND]: (p: MatchFoundPayload) => void;
  [SOCKET_EVENTS.MATCH_CANCELED]: () => void;
  [SOCKET_EVENTS.MATCH_ERROR]: (msg: string) => void;

  [SOCKET_EVENTS.ROOM_GAME_STATE]: (state: any) => void;
  [SOCKET_EVENTS.ROOM_MESSAGE]: (msg: string) => void;
  [SOCKET_EVENTS.ROOM_COUNT]: (count: number) => void;
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

      this.socket.on(SOCKET_EVENTS.MATCH_FOUND, (p) => {
        this.playerNumber = p.playerNumber;
      });

      // optional: clear on disconnect
      this.socket.on(SOCKET_EVENTS.DISCONNECT, () => {
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

    on(SOCKET_EVENTS.CONNECT, handlers.connect ? (() => handlers.connect!(s.id ?? "")) : undefined);
    on(SOCKET_EVENTS.DISCONNECT, handlers.disconnect);
    on(SOCKET_EVENTS.CONNECT_ERROR, handlers.connect_error ? ((errMsg: any) =>
      handlers.connect_error!(errMsg?.message ?? "Connection failed")
    ) : undefined);

    on(SOCKET_EVENTS.MATCH_QUEUED, handlers[SOCKET_EVENTS.MATCH_QUEUED]);
    on(SOCKET_EVENTS.MATCH_FOUND, handlers[SOCKET_EVENTS.MATCH_FOUND]);
    on(SOCKET_EVENTS.MATCH_CANCELED, handlers[SOCKET_EVENTS.MATCH_CANCELED]);
    on(SOCKET_EVENTS.MATCH_ERROR, handlers[SOCKET_EVENTS.MATCH_ERROR]);

    on(SOCKET_EVENTS.ROOM_GAME_STATE, handlers[SOCKET_EVENTS.ROOM_GAME_STATE]);
    on(SOCKET_EVENTS.ROOM_MESSAGE, handlers[SOCKET_EVENTS.ROOM_MESSAGE]);
    on(SOCKET_EVENTS.ROOM_COUNT, handlers[SOCKET_EVENTS.ROOM_COUNT]);

    return () => ons.forEach((off) => off());
  }
}