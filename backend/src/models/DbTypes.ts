export type ProfileRow = {
  id: string;
  username: string;
  rating: number;
//   matches_played: number;
//   wins: number;
//   losses: number;
  created_at: string;
  updated_at: string;
};

export type MatchRow = {
  id: string;
  room_id: string | null;
  mode: string;
  status: "completed" | "draw" | "abandoned";
  winner_id: string | null;
  duration_seconds: number | null;
  created_at: string;
  finished_at: string;
};

export type MatchPlayerRow = {
  id: number;
  match_id: string;
  player_id: string;
  player_number: 1 | 2;
  score: number;
  result: "win" | "loss" | "draw";
  rating_before: number;
  rating_after: number;
  created_at: string;
};

export type RecordCompletedMatchParams = {
  p_match_id: string;
  p_room_id: string;
  p_player1_id: string;
  p_player2_id: string;
  p_player1_score: number;
  p_player2_score: number;
  p_duration_seconds?: number | null;
  p_mode?: string;
};