export type MatchFoundPayload = {
  matchId: string;
  playerNumber: 1 | 2;
};

export type JoinPayload = {
  roomId: string;
};

export type GameUpdatePayload = {
  roomId: string;
  clearedCells: { row: number; col: number }[];
};