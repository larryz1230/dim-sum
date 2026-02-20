import type { Server, Socket } from "socket.io";

type JoinPayload = { roomId: string };
type MessagePayload = { roomId: string; message: string };
type GameStatePayload = {
  roomId: string; selectedCells: Set<string>; player: number;};
type Cell = {
  id: string;
  value: number; // 0 means cleared
  row: number;
  col: number;
};


 // currently assuming that a game only updates with cleared cells
 // client sends intent -- server validates
type GameUpdatePayload = {
  roomId: string;
  clearedCells: {
    row: number,
    col: number
  }[];
};

type Board = Cell[][];

type GameStateEmit = { 
  roomId: string; 
  Board: Board, 
  score1: number, 
  score2: number, 
  timer: number,
  players: Record<string, 1 | 2>, 
};

const roomCounts = new Map<string, number>();

// currently a map of ALL matchIds and the state of their games
// very confusing but matchId and roomId are synonymous?
export const games = new Map<string, GameStateEmit>(); // change to DB?

type GameMode = "singleplayer" | "multiplayer";
type GameResult = "win" | "lose" | null;


// Create a sample game board
export const createSampleBoard = (rows = 12, cols = 10): Board => {
  const cells: Board = [];

  for (let row = 0; row < rows; row++) {
    const rowCells: Cell[] = [];
    for (let col = 0; col < cols; col++) {
      rowCells.push({
        id: `cell-${row}-${col}`,
        value: Math.floor(Math.random() * 9) + 1, // Random 1-9
        row,
        col,
      });
    }
    cells.push(rowCells);
  }

  return cells;
};

export function registerGameHandlers(io: Server, socket: Socket) {
  console.log("Registering game handlers for socket:", socket.id);

  // modified to read only
  socket.on("room:join", ({ roomId }: JoinPayload) => {
    if (!roomId) return;

    const state = games.get(roomId);
    if (!state) {
      console.warn(`Room ${roomId} has no game state`);
      return;
    }

    socket.join(roomId);
    socket.emit("room:game_state", state);
  });

  socket.on("game:update", ({roomId, clearedCells }: GameUpdatePayload) => {
    if (!roomId) return;

    const state = games.get(roomId);
    if (!state) {
      return;
    }

    const player = state.players[socket.id];
    if (!player) {
      console.warn("Unauthorized game update attempt");
      return;
    }

    // parse cells
    for (const {row, col} of clearedCells) {
      const cell = state.Board[row]?.[col];
      if (!cell) {
        continue;
      }

      if (cell.value !== 0) {
        cell.value = 0;

        // add 1 to score per cell
        if (player === 1) {
          state.score1 += 1;
        } else {
          state.score2 += 1;
        }
      }
    }

    // notify corresponding roomId
    io.to(roomId).emit("game:state", state);
  });

  
}
