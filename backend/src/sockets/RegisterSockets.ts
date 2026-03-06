import type { Server, Socket } from "socket.io";
import { registerGameHandlers } from "./Game";
import { registerMatchmakingHandlers } from "./Matchmaking";

export function registerSockets(io : Server) {
    io.on("connection", (socket: Socket) => {
        console.log(`User connected: ${socket.id}`);

        registerGameHandlers(io, socket);
        registerMatchmakingHandlers(io, socket);
    })
}