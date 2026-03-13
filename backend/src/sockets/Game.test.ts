import { describe, it, expect, vi, beforeEach } from "vitest";
import { registerGameHandlers, games } from "./Game";
import { SOCKET_EVENTS } from "../../../shared/SocketEvents";
import { applyMove } from "../models/GameLogic";

// Game logic mock
vi.mock("../models/GameLogic", () => ({ applyMove: vi.fn() }));

// Socket
function sock(id = "socket1"){
  const handlers: any = {};
  return {
    id,
    on:(e: any, f: any) => handlers[e] = f,
    emit: vi.fn(),
    join: vi.fn(),
    _h: handlers
  };
}

let io: any, socket: any;

beforeEach(() => {
  io = { to: vi.fn(() => ({ emit: vi.fn() })) };
  socket = sock();
  registerGameHandlers(io, socket);
  games.clear();
});

// Tests

// When player joins a rooom, server connects it to the correct room and prepares game state
describe("Game.join", () => {
  it("join emits state", () => {
    games.set(
      "id", 
      { players: {} } as any
    );

    socket._h[SOCKET_EVENTS.ROOM_JOIN]({ roomId: "test" });
    expect(socket.join).toHaveBeenCalledWith("test");
  });
});

describe("Game.update", () => {
  // Checks that server ignores updates that dont specify room
  it("doesnt update if roomId is missing", () => {
    socket._h[SOCKET_EVENTS.GAME_UPDATE]({ roomId: null, clearedCells: [] });
  });

  // Checks that server warns if update is for a room that doesnt exist
  it("warns if no state", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    socket._h[SOCKET_EVENTS.GAME_UPDATE]({ roomId: "test", clearedCells: [] });

    expect(warnSpy).toHaveBeenCalledWith("No state found for room test.");

    warnSpy.mockRestore();
  });

  // Checks that server rejecs updates from socket not registered as a player in the room and warns
  it("rejects unauthorized player", () => {
    const rejectSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    games.set("test", { players: {} } as any);

    socket._h[SOCKET_EVENTS.GAME_UPDATE]({ roomId: "test", clearedCells: [] });

    expect(rejectSpy).toHaveBeenCalledWith("Unauthorized game update attempt socket1");

    rejectSpy.mockRestore();
  });

  // Ensures that a player's valid move is applied to the game state, which is emitted to all other players
  it("applies move + emits", () => {
    const state = { players: { socket1: { playerNumber: 1 } } };
    games.set("test", state as any);
    (applyMove as any).mockReturnValue(true);

    socket._h[SOCKET_EVENTS.GAME_UPDATE]({ roomId: "test", clearedCells: [1] });

    expect(applyMove).toHaveBeenCalled();
    expect(io.to).toHaveBeenCalledWith("test");
  });

});