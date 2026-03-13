import { describe, it, expect, vi } from "vitest";
import { recordCompletedMatch } from "./MatchService";
import { supabaseAdmin } from "./SupabaseAdmin";

// Mock supabase admin
vi.mock("./SupabaseAdmin", () => ({
  supabaseAdmin: { rpc: vi.fn() }
}));

// Match structure
const match = {
  p_match_id: "m1",
  p_room_id: "r1",
  p_player1_id: "p1",
  p_player2_id: "p2",
  p_player1_score: 5,
  p_player2_score: 3
};

// Match information is successfully recorded with no error
describe("MatchService.success", () => {
  it("calls rpc successfully", async () => {
    (supabaseAdmin.rpc as any).mockResolvedValue({ error: null });

    await expect(recordCompletedMatch(match)).resolves.toBeUndefined();

    expect(supabaseAdmin.rpc).toHaveBeenCalledWith("record_completed_match", {
      ...match,
      p_duration_seconds: null,
      p_mode: "ranked"
    });
  });
});

// Match service throws an error when it receives an error from rpc
describe("MatchService.error", () => {
  it("throws error when rpc returns error", async () => {
    (supabaseAdmin.rpc as any).mockResolvedValue({ error: { message: "fail" } });

    await expect(recordCompletedMatch(match)).rejects.toThrow(
      "Failed to record completed match: fail"
    );
  });
});