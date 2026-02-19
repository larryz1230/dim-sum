import type { Server, Socket } from "socket.io";
import { SocketEvents } from "../utils/SocketEvents";
import { randomUUID } from "crypto";
import { register } from "module";
import { registerGameHandlers } from "./Game";

// this module is very big. consider chopping
export function registerSockets(io : Server) {
    let waitingSocketId : string | null = null;

    io.on("connection", (socket : Socket) => {
        console.log("User connected: ", socket.id);

        registerGameHandlers(io, socket);

        socket.on(SocketEvents.Ping, () => {
            socket.emit(SocketEvents.Pong);
        })

        socket.on("matchmaking:start", () => {
            if (waitingSocketId === socket.id) {
                return;
            }

            if (waitingSocketId === null) {
                waitingSocketId = socket.id;
                socket.emit("matchmaking:queued");
                return;
            }

            const opponentId = waitingSocketId;
            const opponentSocket = io.sockets.sockets.get(opponentId);

            if (!opponentSocket) {
                waitingSocketId = socket.id;
                socket.emit("matchmaking:queued");
                return;
            }

            waitingSocketId = null;

            const matchId = randomUUID();

            // join logic
            socket.join(matchId);
            opponentSocket.join(matchId);
            socket.emit("matchmaking:match_found", {
                matchId,
                opponentSocketId: opponentId,
            });

            opponentSocket.emit("matchmaking:match_found", {
                matchId,
                opponentSocketId: socket.id,
            });
        });

        socket.on("matchmaking:cancel", () => {
            if (waitingSocketId === socket.id) {
                waitingSocketId = null;
            }
            socket.emit("matchmaking:canceled");
        });


        socket.on("disconnect", () => {
            if (waitingSocketId === socket.id) {
                waitingSocketId = null;
            }
        });
    });
}