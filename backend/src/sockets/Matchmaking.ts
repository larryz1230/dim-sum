import type { Server, Socket } from "socket.io";
import { randomUUID } from "crypto";
import { createInitialGameState } from "../models/GameLogic";
import { recordCompletedMatch } from "../db/MatchService";
import { games } from "./Game";
import { SOCKET_EVENTS } from "../../../shared/SocketEvents";
import { getProfilesByIds } from "../db/ProfileService";
import { QueueEntry } from "../models/GameTypes";

let matchmakingQueue : QueueEntry[] = [];
const activeGameTimers = new Map<string, NodeJS.Timeout>();

//TODO: move to constants
const INITIAL_RANGE = 300;

async function generateQueueEntry(socket: Socket) : Promise<QueueEntry> {
    const userId = socket.data.userId;

    if (!userId) {
        throw new Error("Missing authentication.");
    }

    const profiles = await getProfilesByIds([userId]);
    const profile = profiles.find((p) => p.id === userId);

    if (!profile) {
        throw new Error("Profile not found.");
    }

    return {
        socketId: socket.id,
        userId,
        username: profile?.username,
        rating: profile?.rating,
        wins: profile?.wins,
        losses: profile?.losses,
        joinedAt: Date.now(),
    };
}

function queuePlayer(entry: QueueEntry, socket: Socket) : void {
    matchmakingQueue.push(entry);
    socket.emit(SOCKET_EVENTS.MATCH_QUEUED);
    console.log("Plugged player into queue, current queue: ", matchmakingQueue);
}

function clearWaitingPlayerIfMatch(socketId: string) : void {
    const index = matchmakingQueue.findIndex((qEntry) => qEntry.socketId === socketId);
    if (index > -1) {
        matchmakingQueue.splice(index, 1);
    }
}

function canPlayersMatch(a: QueueEntry, b: QueueEntry) : boolean {
    const diff = Math.abs(a.rating - b.rating);
    return diff <= getRankRange(a) && diff <= getRankRange(b);
}

function getRankRange(entry: QueueEntry) : number {
    // todo: do more?
    return INITIAL_RANGE;
}

function pruneQueue(io: Server) : void {
    let new_queue : QueueEntry[] = [];
    for (const qEntry of matchmakingQueue) {
        if (!io.sockets.sockets.has(qEntry.socketId)) {
            continue;
        }
        new_queue.push(qEntry);
    } 
    if (new_queue.length !== 0) {
        matchmakingQueue = new_queue;
    }
}

function findOpponent(io: Server, searchingEntry: QueueEntry) : QueueEntry | undefined {
    pruneQueue(io);
    let bestMatch : QueueEntry | undefined;

    for (const qEntry of matchmakingQueue) {
        // not possible, but just in case
        if (qEntry.socketId === searchingEntry.socketId) {
            continue;
        }

        // no same user mm
        if (qEntry.userId === searchingEntry.userId) {
            continue;
        }

        if (!canPlayersMatch(searchingEntry, qEntry)) {
            continue;
        }
        bestMatch = qEntry;
        break;
    }
    return bestMatch;
}

async function createMatch(io: Server, player1Socket: Socket, player2Socket: Socket, player1Entry: QueueEntry, player2Entry: QueueEntry) : Promise<string> {
    const matchId = randomUUID();

    const initialState = createInitialGameState(matchId, {
        [player1Socket.id]: {
            playerNumber: 1,
            userId: player1Entry.userId,
            username: player1Entry.username,
            rating: player1Entry.rating,
            wins: player1Entry.wins,
            losses: player1Entry.losses,
        },
        [player2Socket.id]: {
            playerNumber: 2,
            userId: player2Entry.userId,
            username: player2Entry.username,
            rating: player2Entry.rating,
            wins: player2Entry.wins,
            losses: player2Entry.losses,
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

async function handleMatchmakingStart(io: Server, socket: Socket) : Promise<void> {
    const ind = matchmakingQueue.findIndex((qEntry) => qEntry.socketId === socket.id);
    if (ind > -1) {
        return;  // already in queue
    }

    const searchEntry = await generateQueueEntry(socket);
    const opponentEntry = findOpponent(io, searchEntry);

    // no valid opponent
    if (!opponentEntry) {
        queuePlayer(searchEntry, socket);
        return;
    }

    const opponentSocket = io.sockets.sockets.get(opponentEntry.socketId);

    const oppInd = matchmakingQueue.findIndex((qEntry) => qEntry.socketId === opponentEntry.socketId);
    matchmakingQueue.splice(oppInd, 1);
    if (!opponentSocket) {
        queuePlayer(searchEntry, socket);
        return;
    }

    await createMatch(io, opponentSocket, socket, opponentEntry, searchEntry);
}

function handleMatchmakingCancel(socket: Socket) : void {
    clearWaitingPlayerIfMatch(socket.id);
    socket.emit(SOCKET_EVENTS.MATCH_CANCELED);
}

function handleDisconnect(socket: Socket) : void {
    clearWaitingPlayerIfMatch(socket.id);
}

export function registerMatchmakingHandlers(io: Server, socket: Socket) : void {
    socket.on(SOCKET_EVENTS.MATCH_START, async () => {
        handleMatchmakingStart(io, socket);
    });

    socket.on(SOCKET_EVENTS.MATCH_CANCEL, () => {
        handleMatchmakingCancel(socket);
    });

    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
        handleDisconnect(socket);
    });
}