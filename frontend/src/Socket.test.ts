import { describe, it, expect, vi, beforeEach } from "vitest";
import SocketSingleton from "./Socket";
import { SOCKET_EVENTS } from "../../shared/SocketEvents";

// Mock socket
const mockOn = vi.fn();
const mockOff = vi.fn();
const mockConnect = vi.fn();

const mockSocket = {
  on: mockOn,
  off: mockOff,
  connect: mockConnect,
  connected: false,
  id: "socket123",
  auth: {},
};

// Mock socket.io-client
vi.mock("socket.io-client", () => ({
  io: vi.fn(() => mockSocket),
}));

// Mock supabase
const mockGetSession = vi.fn();

vi.mock("../services/supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
    },
  },
}));

beforeEach(() => {
    vi.clearAllMocks();
});

// Tests

// Singleton can only be one object
describe("SocketSingleton.create", () => {
    it("creates socket instance once", () => {
        const s1 = SocketSingleton.getSocket();
        const s2 = SocketSingleton.getSocket();

        expect(s1).toBe(s2);
    });
});

// The setAuthToken function sets the socket.auth member
describe("SocketSingleton.token", () => {
    it("sets auth token", () => {
        const socket = SocketSingleton.getSocket();

        SocketSingleton.setAuthToken("abc123");

        expect(socket.auth).toEqual({ token: "abc123" });
    });
});

// The ensure_connected function connects the socket
describe("SocketSingleton.connect", () => {
    it("connects socket", async () => {
        mockGetSession.mockResolvedValue({
            data: { session: { access_token: "token123" } },
            error: null,
        });

        const socket = SocketSingleton.getSocket();
        socket.connected = false;

        await SocketSingleton.ensureConnected();

        expect(mockConnect).toHaveBeenCalled();
    });
});

// The clearPlayerNumber function clears the player number set by setPlayerNumber
describe("SocketSingleton.clear", () => {
    it("clears player number", () => {
        SocketSingleton.setPlayerNumber(1);
        expect(SocketSingleton.getPlayerNumber()).toBe(1);

        SocketSingleton.clearPlayerNumber();
        expect(SocketSingleton.getPlayerNumber()).toBeNull();
    });
});

// Event subscription calls on for handlers while unsubscribe does the opposite
describe("SocketSingleton.subscribe", () => {
    it("subscribe registers handlers", () => {
        const handler = vi.fn();

        const unsubscribe = SocketSingleton.subscribe({
            [SOCKET_EVENTS.MATCH_FOUND]: handler,
        });

        expect(mockOn).toHaveBeenCalled();

        unsubscribe();

        expect(mockOff).toHaveBeenCalled();
    });
});