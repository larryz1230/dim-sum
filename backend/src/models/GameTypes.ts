export type PlayerNumber = 1 | 2;

export type PlayerInfo = {
  playerNumber: 1 | 2;
  userId: string;
  username: string;
  rating: number;
  wins: number;
  losses: number;
};

export type PlayersBySocketId = Record<string, PlayerInfo>;

export type ClearedCell = {
  row: number;
  col: number;
};

export type Cell = {
  id: string;
  value: number; // 0 means cleared
  row: number;
  col: number;
};

export type Board = Cell[][];

export type GameStateEmit = { 
  roomId: string; 
  board: Board, 
  score1: number, 
  score2: number, 
  timer: number,
  players: PlayersBySocketId, 
};

export type JoinPayload = { roomId: string };

export type GameUpdatePayload = {
  roomId: string;
  clearedCells: {
    row: number,
    col: number
  }[];
};
