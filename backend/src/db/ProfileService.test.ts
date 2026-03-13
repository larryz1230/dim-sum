import { describe, it, expect, vi } from "vitest";
import { getProfilesByIds } from "./ProfileService";
import { supabaseAdmin } from "./SupabaseAdmin";

// Mock supabase admin
vi.mock("./SupabaseAdmin", () => ({ 
  supabaseAdmin: { 
    from: vi.fn() 
  } 
}));

// Mock for supabase request
const request = {
  select: vi.fn(), 
  in: vi.fn() 
};

const user = {
  id: "1", 
  username: "user", 
  rating: 1000, 
  wins: 1, 
  losses: 0 
}

// Tests

// Profile is successfully returned when searching by Id
describe("ProfileService.success", () => {
  it("returns profiles", async () => {
    request.in.mockResolvedValue({ 
      data: [user], 
      error: null 
    });

    request.select.mockReturnValue(request);
    (supabaseAdmin.from as any).mockReturnValue(request);

    const profile = await getProfilesByIds(["1"]);
    expect(profile[0]!.id).toBe("1");
  });
});

// When there is no data, return an empty list
describe("ProfileService.null", () => {
  it("returns [] when data null", async () => {
    request.in.mockResolvedValue({ 
      data: null, 
      error: null 
    });
    
    request.select.mockReturnValue(request);
    (supabaseAdmin.from as any).mockReturnValue(request);

    await expect(getProfilesByIds(["1"])).resolves.toEqual([]);
  });
});

// If supabaseAdmin throws an error, ProfileService will throw an error
describe("ProfileService.error", () => {
  it("throws on error", async () => {
    request.in.mockResolvedValue({  
      error: { message: "fail" } 
    });

    request.select.mockReturnValue(request);
    (supabaseAdmin.from as any).mockReturnValue(request);

    await expect(getProfilesByIds(["1"])).rejects.toThrow("Failed to fetch profiles: fail");
  });
});