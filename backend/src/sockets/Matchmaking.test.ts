import { describe,it,expect,vi,beforeEach } from "vitest";
import { registerMatchmakingHandlers } from "./Matchmaking";
import { SOCKET_EVENTS } from "../../../shared/SocketEvents";

// Mock for user ID
vi.mock("crypto", () => ({ randomUUID: () => "m1" }));

// Profile service mock
vi.mock("../db/ProfileService", () => ({
  getProfilesByIds: vi.fn(async (ids) => [{ id: ids[0], username: "user1", rating: 1000, wins: 1, losses: 0 }])
}));

// Game logic mock
vi.mock("../models/GameLogic", () => ({
  createInitialGameState: vi.fn(() => ({ players: {}, timer: 1, score1: 0, score2: 0 }))
}));

// Match service mock
vi.mock("../db/MatchService", () => ({ recordCompletedMatch: vi.fn() }));

// Socket
function socket(id = "sock1") {
  const h: any = {};
  return {
    id,
    emit: vi.fn(),
    join: vi.fn(),
    data: { userId: id },
    on: (e: string, f: Function) => h[e] = f,
    _: h,
  };
}

// Server
function io() {
  const m = new Map();
  return {
    sockets: { sockets: m },
    to: vi.fn(() => ({ emit: vi.fn() }))
  };
}

let socket1: any, socket2: any, server: any;

beforeEach(() => {
    // Mock players and server
    socket1 = socket("socket1");
    socket2 = socket("socket2");
    server = io();

    server.sockets.sockets.set("socket1", socket1);
    server.sockets.sockets.set("socket2", socket2);

    registerMatchmakingHandlers(server, socket1);
    registerMatchmakingHandlers(server, socket2);
});

// A player can queue for a match and cancel it before being matched
describe("Matchmaking.cancel", () => {
  it("queues then cancels", async () => {
    await socket1._[SOCKET_EVENTS.MATCH_START]();
    socket1._[SOCKET_EVENTS.MATCH_CANCEL]();

    expect(socket1.emit).toHaveBeenCalledWith(SOCKET_EVENTS.MATCH_CANCELED);
  });
});

// Confirm that two queued players are matched and joined into a game
describe("Matchmaking.match", () => {
  it("creates match when opponent exists", async () => {
    await socket1._[SOCKET_EVENTS.MATCH_START]();
    await socket2._[SOCKET_EVENTS.MATCH_START]();

    await new Promise(resolve => setTimeout(resolve, 0));

    expect(socket1.join.mock.calls.length + socket2.join.mock.calls.length).toBeGreaterThan(0);
  });
});