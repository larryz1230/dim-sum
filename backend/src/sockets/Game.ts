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
    socket.emit("room:game_state", games.get(roomId));
  });

  socket.on("game:update", ({roomId, clearedCells }: GameUpdatePayload) => {
    if (!roomId) return;
    console.log(`Received game update for room ${roomId} from socket ${socket.id}:`, clearedCells);

    
    const state = games.get(roomId);
    if (!state) {
      return;
    }
    const player = state.players[socket.id];
    if (!player) {
      console.warn("Unauthorized game update attempt");
      return;
    }

    console.log(`Current game state for room ${roomId}:`, state);

    let sum = 0;
    for (const cell of clearedCells) {
      sum  += state?.Board[cell.row]?.[cell.col]?.value ?? 0;
    }
    if (sum === 10) {
      console.log("Cleared cells sum to 10! Awarding point.");
      const player = state.players[socket.id];
      if (player === 1) {
        state.score1 += clearedCells.length; // or +1 per cell, depending on scoring rules
      } else if (player === 2) {
        state.score2 += clearedCells.length; // or +1 per cell
      }
      for (const { row, col } of clearedCells) {
        state.Board[row]![col]!.value = 0;
      }
    }
    // notify corresponding roomId
    io.to(roomId).emit("room:game_state", state);
  });

  
}
