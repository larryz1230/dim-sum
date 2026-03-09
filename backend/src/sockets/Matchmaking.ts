import type { Server, Socket } from "socket.io";
import { randomUUID } from "crypto";
import { createInitialGameState } from "../models/GameLogic";
import { recordCompletedMatch } from "../db/MatchService";
import { games } from "./Game";
import { SOCKET_EVENTS } from "../../../shared/SocketEvents";

let waitingSocketId: string | null = null;
const activeGameTimers = new Map<string, NodeJS.Timeout>();

function queuePlayer(socket: Socket) : void {
    waitingSocketId = socket.id;
    socket.emit(SOCKET_EVENTS.MATCH_QUEUED);
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

    const player1UserId = player1Socket.data.userId;
    const player2UserId = player2Socket.data.userId;

    if (!player1UserId  || !player2UserId) {
        throw new Error("Missing authenticated userId on socket");
    }

    const initialState = createInitialGameState(matchId, {
        [player1Socket.id]: {
            playerNumber: 1,
            userId: player1UserId,
        },
        [player2Socket.id]: {
            playerNumber: 2,
            userId: player2UserId,
        },
    });
    
    games.set(matchId, initialState);
    player1Socket.join(matchId);
    player2Socket.join(matchId);

    player1Socket.emit(SOCKET_EVENTS.MATCH_FOUND, {
        matchId,
        playerNumber: 1,
    });

    player2Socket.emit(SOCKET_EVENTS.MATCH_FOUND, {
        matchId,
        playerNumber: 2,
    });

    startGameTimer(io, matchId);
    
    return matchId;
}

function startGameTimer(io: Server, matchId: string) : void {
    const timer = setInterval(async () => {
        const state = games.get(matchId);

        if (!state) {
            stopGameTimer(matchId);
            return;
        }

        state.timer -= 1;

        if (state.timer <= 0) {
            state.timer = 0;

            try {
                const playerEntries = Object.entries(state.players);

                const player1Entry = playerEntries.find(
                    ([, info]) => info.playerNumber === 1
                );
                const player2Entry = playerEntries.find(
                    ([, info]) => info.playerNumber === 2
                );

                if (!player1Entry || !player2Entry) {
                    throw new Error(`Missing player info for match ${matchId}`);
                }

                const [, player1Info] = player1Entry;
                const [, player2Info] = player2Entry;

                await recordCompletedMatch({
                    p_match_id: matchId,
                    p_room_id: matchId,
                    p_player1_id: player1Info.userId,
                    p_player2_id: player2Info.userId,
                    p_player1_score: state.score1,
                    p_player2_score: state.score2,
                    p_duration_seconds: 60,
                    p_mode: "ranked",
                });
            } catch (error) {
                console.error(`Failed to persist match ${matchId}:`, error);
            }

            io.to(matchId).emit(SOCKET_EVENTS.ROOM_GAME_STATE, state);

            // TODO: end game logic
            stopGameTimer(matchId);
            return;
        }

        io.to(matchId).emit(SOCKET_EVENTS.ROOM_GAME_STATE, state);
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
    socket.emit(SOCKET_EVENTS.MATCH_CANCELED);
}

function handleDisconnect(socket: Socket) : void {
    clearWaitingPlayerIfMatch(socket.id);
}

export function registerMatchmakingHandlers(io: Server, socket: Socket) : void {
    socket.on(SOCKET_EVENTS.MATCH_START, () => {
        handleMatchmakingStart(io, socket);
    });

    socket.on(SOCKET_EVENTS.MATCH_CANCEL, () => {
        handleMatchmakingCancel(socket);
    });

    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
        handleDisconnect(socket);
    });
}