import { describe, it, expect, vi } from "vitest";
import { registerSockets } from "./RegisterSockets";
import { supabaseAdmin } from "../db/SupabaseAdmin";
import * as GameModule from "./Game";
import * as MatchModule from "./Matchmaking";

// Mock Supabase Admin client
vi.mock("../db/SupabaseAdmin", () => ({
  supabaseAdmin: {
    auth: { getUser: vi.fn() }
  }
}));

// Spy on game and matchmaking handler registration functions
vi.spyOn(GameModule, "registerGameHandlers").mockImplementation(() => {});
vi.spyOn(MatchModule, "registerMatchmakingHandlers").mockImplementation(() => {});

// Tests

// Invalid
describe("registerSockets.invalid", () => {
  // Rejects connection if no auth token is provided
  it("auth middleware rejects missing token", async () => {
    const io: any = { use: vi.fn(), on: vi.fn() };
    registerSockets(io);

    const middleware = io.use.mock.calls[0][0];

    let called = false;
    await middleware({ handshake: {} }, (err: any) => { called = !!err; });

    expect(called).toBe(true);
  });

  // Rejects connection if supabase token is invalid
  it("auth middleware rejects invalid token", async () => {
    (supabaseAdmin.auth.getUser as any).mockResolvedValue({ data: {}, error: true });

    const io: any = { use: vi.fn(), on: vi.fn() };
    registerSockets(io);

    const middleware = io.use.mock.calls[0][0];

    let error: any;
    await middleware({ handshake: { auth: { token: "t" } }, data: {} }, (e: any) => { error = e; });

    expect(error).toBeInstanceOf(Error);
  });
});

// Valid
describe("registerSockets.valid", () => {
  // Accepts connection with valid token and triggers handler registration
  it("auth middleware accepts valid token and connection calls handlers", async () => {
    (supabaseAdmin.auth.getUser as any).mockResolvedValue({
      data: { user: { id: "user1", email: "user@email.com" } },
      error: null
    });

    const socket: any = {
      id: "socket1",
      data: {},
      handshake: { auth: { token: "token1" } }
    };
    
    const io: any = { 
      use: vi.fn(), 
      on: vi.fn() 
    };

    registerSockets(io);

    // Run the middleware with the valid token
    const middleware = io.use.mock.calls[0][0];
    let calledNext: any;
    await middleware(socket, (err: any) => { calledNext = err; });

    // Middleware should pass (no error)
    expect(calledNext).toBeUndefined();
    expect(socket.data.userId).toBe("user1");
    expect(socket.data.email).toBe("user@email.com");

    // Verify connection handlers are registered
    const connectionCb = io.on.mock.calls[0][1];
    connectionCb(socket);
    expect(GameModule.registerGameHandlers).toHaveBeenCalledWith(io, socket);
    expect(MatchModule.registerMatchmakingHandlers).toHaveBeenCalledWith(io, socket);
  });
});