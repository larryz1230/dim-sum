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
type GameUpdatePayload = {
  roomId: string;
  cells: any;
  player: number;
};

type Board = Cell[][];

type GameStateEmit = { roomId: string; Board: Board, score1: number, score2: number, timer: number };

const roomCounts = new Map<string, number>();
let gamestate: GameStateEmit;

type GameMode = "singleplayer" | "multiplayer";
type GameResult = "win" | "lose" | null;


// Create a sample game board
const createSampleBoard = (rows = 12, cols = 10): Board => {
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
  socket.on("room:join", ({ roomId }: JoinPayload) => {
    if (!roomId) return;

    socket.join(roomId);

    // init count if needed
    if (!roomCounts.has(roomId)) roomCounts.set(roomId, 0);

    socket.emit("room:joined");
    socket.emit("room:count", roomCounts.get(roomId)!);

    if (io.sockets.adapter.rooms.get(roomId)?.size === 2) {
      console.log(`Room ${roomId} is full. Starting game...`);
      const board = createSampleBoard();
      gamestate = {
        roomId,
        Board: board,
        score1: 0,  
        score2: 0,
        timer: 120, // 2 minutes
      }
      io.to(roomId).emit("room:game_state", gamestate);
    }
  });

  socket.on("game:update", ({roomId, cells, player}: GameUpdatePayload) => {
    if (!roomId) return;
    console.log(`Updating game state for room ${roomId} and player ${player} with cells: ${JSON.stringify(cells)}`);

  });

  
}
