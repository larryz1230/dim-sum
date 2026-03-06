export const SOCKET_EVENTS = {
    // connection
    CONNECT:        "connect",
    DISCONNECT:     "disconnect",
    CONNECT_ERROR:  "connect_error",

    // matchmaking
    MATCH_START:    "matchmaking:start",
    MATCH_CANCEL:   "matchmaking:cancel",
    MATCH_CANCELED: "matchmaking:canceled",
    MATCH_QUEUED:   "matchmaking:queued",
    MATCH_FOUND:    "matchmaking:match_found",
    MATCH_ERROR:    "matchmaking:error",

    // room
    ROOM_JOIN:      "room:join",
    ROOM_LEAVE:     "room:leave",
    ROOM_GAME_STATE:"room:game_state",
    ROOM_MESSAGE:   "room:message",
    ROOM_COUNT:     "room:count",

    // gameplay
    GAME_UPDATE:    "game:update",
} as const;

export type SocketEvent = typeof SOCKET_EVENTS[keyof typeof SOCKET_EVENTS];