import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import Room from "./Room";
import { SOCKET_EVENTS } from "../../../shared/SocketEvents";

// React-router mock
vi.mock("react-router-dom", () => ({
  useParams: () => ({ matchId: "xyz987" }),
}));

// Sound mock
vi.mock("../hooks/useSound", () => ({
  useSound: () => ({ soundOn: false }),
}));

vi.mock("../utils/sound", () => ({
  playBunSound: vi.fn(),
}));

// Multiplayer Game Board mock
vi.mock("../components/MultiplayerGameBoard", () => ({
  MultiplayerGameBoard: () => <div data-testid="game-board" />,
}));

// Settings mock
vi.mock("../components/Settings", () => ({
  Settings: ({ onClose }: any) => (
    <div data-testid="settings">
      Settings
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

// Login mock
vi.mock("../components/Login", () => ({
  Login: () => <div data-testid="login" />,
}));

// Timer mock
vi.mock("../components/Timer", () => ({
  Timer: () => <div data-testid="timer" />,
}));

// Game over mock
vi.mock("../components/GameOver", () => ({
  GameOver: () => <div data-testid="game-over" />,
}));

// Score mock
vi.mock("../components/Score", () => ({
  Score: () => <div data-testid="score" />,
}));

// Leaderboard mock
vi.mock("../components/Leaderboard", () => ({
  Leaderboard: () => <div data-testid="leaderboard" />,
}));

// MatchPlayersInfo mock
vi.mock("../components/MatchPlayersInfo/MatchPlayersInfo", () => ({
  MatchPlayersInfo: () => <div />,
}));

// Back to dashboard button mock
vi.mock("../components/BackToDashboard/BackToDashboard", () => ({
  default: () => <div data-testid="back-dashboard" />,
}));

// Socket mock
const emitMock = vi.fn();

const socketMock = {
  connected: true,
  emit: emitMock,
};

const subscribeMock = vi.fn();

vi.mock("../Socket", () => ({
  default: {
    getSocket: () => socketMock,
    subscribe: (handlers: any) => {
      subscribeMock(handlers);
      setTimeout(() => {
        handlers[SOCKET_EVENTS.ROOM_GAME_STATE]?.({
          roomId: "xyz987",
          timer: 30,
          board: [[{ value: 1 }]],
          score1: 5,
          score2: 3,
          players: {
            a: {
              playerNumber: 1,
              username: "me",
              rating: 1000,
              wins: 1,
              losses: 0,
            },
            b: {
              playerNumber: 2,
              username: "opponent",
              rating: 900,
              wins: 0,
              losses: 1,
            },
          },
        });
      }, 0);

      return () => {};
    },
    ensureConnected: () => Promise.resolve(),
    getPlayerNumber: () => 1,
  },
}));

// Mock ResizeObserver
beforeAll(() => {
    global.ResizeObserver = class {
        observe = vi.fn();
        unobserve = vi.fn();
        disconnect = vi.fn();
    } as any;
    vi.clearAllMocks();
});

// Tests

// Room initially is in loading state
describe("Room.loading", () => {
    it("shows loading before board loads", () => {
        render(<Room />);
        expect(screen.getByText("Loading game...")).toBeInTheDocument();
    });
});

// Game board, leaderboard, and score components are rendered
describe("Room.render", () => {
    it("renders game board", async () => {
        render(<Room />);

        await waitFor(() => {
            expect(screen.getByTestId("game-board")).toBeInTheDocument();
        });
    });

    it("renders leaderboard and score", async () => {
        render(<Room />);

        await waitFor(() => {
            expect(screen.getByTestId("leaderboard")).toBeInTheDocument();
            expect(screen.getByTestId("score")).toBeInTheDocument();
        });
    });
});

// Clicking on the settings button opens the settings popup
describe("Room.settings", () => {
    it("opens settings when clicking settings button", async () => {
        render(<Room />);

        await waitFor(() => screen.getByTestId("game-board"));

        const settingsButton = screen.getByRole("button");
        fireEvent.click(settingsButton);

        expect(screen.getByTestId("settings")).toBeInTheDocument();
    });
});

// When the socket connects, emit that a room is joined with a roomId
describe("Room.socket", () => {
    it("joins room when socket connects", async () => {
        render(<Room />);

        await waitFor(() => {
            expect(emitMock).toHaveBeenCalledWith(
                SOCKET_EVENTS.ROOM_JOIN,
                { roomId: "xyz987" }
            );
        });
    });
});