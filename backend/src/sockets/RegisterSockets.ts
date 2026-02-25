import type { Server, Socket } from "socket.io";
import { SocketEvents } from "../utils/SocketEvents";
import { randomUUID } from "crypto";
import { register } from "module";
import { registerGameHandlers, createSampleBoard, games } from "./Game";

// this module is very big. consider chopping
export function registerSockets(io : Server) {
    let waitingSocketId : string | null = null;

    io.on("connection", (socket : Socket) => {
        console.log("User connected: ", socket.id);

        registerGameHandlers(io, socket);

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
                socket.emit("matchmaking:queued", 1); // first player
                return;
            }

            waitingSocketId = null;

            const matchId = randomUUID();

            const board = createSampleBoard();

            games.set(matchId, {
                roomId: matchId,
                Board: board,
                score1: 0,
                score2: 0,
                timer: 120,
                players: {
                    [opponentSocket.id]: 1,
                    [socket.id]: 2,
                },
            });

            // join logic
            socket.join(matchId);
            opponentSocket.join(matchId);

            socket.emit("matchmaking:match_found", {
                matchId,
                playerNumber: 2,
            });

            opponentSocket.emit("matchmaking:match_found", {
                matchId,
                playerNumber: 1,
            });

            // timer init -- server holds true timer
            setInterval(() => {
                const state = games.get(matchId);
                if (!state) {
                    return;
                }

                state.timer -= 1;
                if (state.timer <= 0) {
                    // TODO: end game
                    state.timer = 0;
                }

                io.to(matchId).emit("game:state", state);
            }, 1000);
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