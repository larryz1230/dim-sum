import type { Server, Socket } from "socket.io";
import type { GameStateEmit, JoinPayload, GameUpdatePayload } from "../models/GameTypes";
import { applyMove } from "../models/GameLogic";
import { SOCKET_EVENTS } from "../../../shared/SocketEvents";

// currently a map of ALL matchIds and the state of their games
// very confusing but matchId and roomId are synonymous?
export const games = new Map<string, GameStateEmit>();

export function registerGameHandlers(io: Server, socket: Socket) {
  console.log("Registering game handlers for socket:", socket.id);

  socket.on(SOCKET_EVENTS.ROOM_JOIN, ({ roomId }: JoinPayload) => {
    if (!roomId) return;

    socket.join(roomId);
    
    const state = games.get(roomId);
    socket.emit(SOCKET_EVENTS.ROOM_GAME_STATE, games.get(roomId));
  });

  socket.on(SOCKET_EVENTS.GAME_UPDATE, ({roomId, clearedCells }: GameUpdatePayload) => {
    if (!roomId) return;
    console.log(`Received game update for room ${roomId} from socket ${socket.id}:`, clearedCells);

    const state = games.get(roomId);
    if (!state) {
      console.warn(`No state found for room ${roomId}.`);
      return;
    }

    const playerInfo = state.players[socket.id];
    if (!playerInfo) {
      console.warn(`Unauthorized game update attempt ${socket.id}`);
      return;
    }

    const moveAccepted = applyMove(state, playerInfo.playerNumber, clearedCells);
    if (!moveAccepted) {
      console.log(`Rejected move from socket ${socket.id} in room ${roomId}.`);
    }

    io.to(roomId).emit(SOCKET_EVENTS.ROOM_GAME_STATE, state);
  });
}
