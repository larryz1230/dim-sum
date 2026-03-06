import type { Server, Socket } from "socket.io";
import { randomUUID } from "crypto";
import { createInitialGameState } from "../models/GameLogic";
import { games } from "./Game";

let waitingSocketId: string | null = null;
const activeGameTimers = new Map<string, NodeJS.Timeout>();

function queuePlayer(socket: Socket) : void {
    waitingSocketId = socket.id;
    socket.emit("matchmaking:queued");
}

function clearWaitingPlayerIfMatch(socketId: string) : void {
    if (waitingSocketId === socketId) {
        waitingSocketId = null;
    }
}

function getWaitingOpponent(io: Server) : Socket | undefined {
    if (!waitingSocketId) {
        return undefined;
    }

    return io.sockets.sockets.get(waitingSocketId);
}

function createMatch(io: Server, player1Socket: Socket, player2Socket: Socket) : string {
    const matchId = randomUUID();

    const initialState = createInitialGameState(matchId, {
        [player1Socket.id]: 1,
        [player2Socket.id]: 2,
    });
    games.set(matchId, initialState);
    player1Socket.join(matchId);
    player2Socket.join(matchId);

    player1Socket.emit("matchmaking:match_found", {
        matchId,
        playerNumber: 1,
    });

    player2Socket.emit("matchmaking:match_found", {
        matchId,
        playerNumber: 2,
    });

    startGameTimer(io, matchId);
    
    return matchId;
}

function startGameTimer(io: Server, matchId: string) : void {
    const timer = setInterval(() => {
        const state = games.get(matchId);

        if (!state) {
            stopGameTimer(matchId);
            return;
        }

        state.timer -= 1;

        if (state.timer <= 0) {
            state.timer = 0;
            io.to(matchId).emit("room:game_state", state);

            // TODO: end game logic
            stopGameTimer(matchId);
            return;
        }

        io.to(matchId).emit("room:game_state", state);
    }, 1000);

    activeGameTimers.set(matchId, timer);
}

function stopGameTimer(matchId: string) : void {
    const timer = activeGameTimers.get(matchId);

    if (timer) {
        clearInterval(timer);
        activeGameTimers.delete(matchId);
    }
}

function handleMatchmakingStart(io: Server, socket: Socket) : void {
    if (waitingSocketId === socket.id) {
        return;  // same socket
    }

    if (waitingSocketId === null) {
        queuePlayer(socket); // no player in queue
        return;
    }

    const opponentSocket = getWaitingOpponent(io);

    if (!opponentSocket) {
        queuePlayer(socket);
        return;
    }

    waitingSocketId = null;
    createMatch(io, opponentSocket, socket);
}

function handleMatchmakingCancel(socket: Socket) : void {
    clearWaitingPlayerIfMatch(socket.id);
    socket.emit("matchmaking:canceled");
}

function handleDisconnect(socket: Socket) : void {
    clearWaitingPlayerIfMatch(socket.id);
}

export function registerMatchmakingHandlers(io: Server, socket: Socket) : void {
    socket.on("matchmaking:start", () => {
        handleMatchmakingStart(io, socket);
    });

    socket.on("matchmaking:cancel", () => {
        handleMatchmakingCancel(socket);
    });

    socket.on("disconnect", () => {
        handleDisconnect(socket);
    });
}