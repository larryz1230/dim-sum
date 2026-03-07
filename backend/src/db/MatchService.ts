import { supabaseAdmin } from "./SupabaseAdmin";
import type { RecordCompletedMatchParams } from "../models/DbTypes";

export async function recordCompletedMatch(
  params: RecordCompletedMatchParams
): Promise<void> {
  const { error } = await supabaseAdmin.rpc("record_completed_match", {
    p_match_id: params.p_match_id,
    p_room_id: params.p_room_id,
    p_player1_id: params.p_player1_id,
    p_player2_id: params.p_player2_id,
    p_player1_score: params.p_player1_score,
    p_player2_score: params.p_player2_score,
    p_duration_seconds: params.p_duration_seconds ?? null,
    p_mode: params.p_mode ?? "ranked",
  });

  if (error) {
    throw new Error(`Failed to record completed match: ${error.message}`);
  }
}