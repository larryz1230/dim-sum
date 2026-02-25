export const SocketEvents = {
    Ping: "ping",
    Pong: "pong",
} as const;

export type SocketEvent = typeof SocketEvents[keyof typeof SocketEvents];