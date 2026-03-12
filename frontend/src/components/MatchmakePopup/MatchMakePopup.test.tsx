import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom";
import MatchmakePopup from "./MatchmakePopup";
import SocketSingleton from "../../Socket";
import { SOCKET_EVENTS } from "../../../../shared/SocketEvents";

// Mocks
const navigateMock = vi.fn();
const emitMock = vi.fn();
const onClose = vi.fn();

let handlers: Record<string, any> = {};

// React-router mock
vi.mock("react-router-dom", () => ({
    useNavigate: () => navigateMock,
}));

// Socket mock
vi.mock("../../Socket", () => ({
  default: {
    getSocket: () => ({
      emit: emitMock,
      connected: true,
    }),
    ensureConnected: vi.fn(() => Promise.resolve()),
    subscribe: (h: any) => {
      handlers = h;
      return vi.fn(); // unsubscribe
    },
  },
}));

beforeEach(() => {
    vi.clearAllMocks();
    handlers = {};
});

// In the idle state, render a button that starts matchmaking
describe("MatchmakePopup.idle", () => {
    it("renders idle state", () => {
        render(<MatchmakePopup onClose={onClose} />);

        expect(screen.getByText("Matchmaking")).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /start matchmaking/i })
        ).toBeInTheDocument();
    });
});

// Upon clicking the start matchmaking button, connect to a socket
describe("MatchmakePopup.start", () => {
    it("starts matchmaking", async () => {
        render(<MatchmakePopup onClose={onClose} />);

        fireEvent.click(screen.getByRole("button", { name: /start matchmaking/i }));

        await waitFor(() => {
            expect(SocketSingleton.ensureConnected).toHaveBeenCalled();
            expect(emitMock).toHaveBeenCalledWith(SOCKET_EVENTS.MATCH_START);
        });
    });
});

// When queued up, render text that indicates player is searching for a match
describe("MatchmakePopup.search", () => {
    it("shows searching state when queued event fires", async () => {
        render(<MatchmakePopup onClose={onClose} />);

        handlers[SOCKET_EVENTS.MATCH_QUEUED]();

        expect(
            await screen.findByText(/searching for an opponent/i)
        ).toBeInTheDocument();
    });
});

// In queue state, clicking the cancel button cancels the matchmaking process and socket
describe("MatchmakePopup.cancel", () => {
    it("can cancel matchmaking", async () => {
        render(<MatchmakePopup onClose={onClose} />);

        handlers[SOCKET_EVENTS.MATCH_QUEUED]();

        const cancelBtn = await screen.findByRole("button", { name: /cancel/i });

        fireEvent.click(cancelBtn);

        expect(emitMock).toHaveBeenCalledWith(SOCKET_EVENTS.MATCH_CANCEL);
    });
});

// When a match is found, a room with a matchId is generated and navigated to
describe("MatchmakePopup.room", () => {
    it("navigates to a room when match is found", () => {
        render(<MatchmakePopup onClose={onClose} />);

        handlers[SOCKET_EVENTS.MATCH_FOUND]({
            matchId: "abc123",
            playerNumber: 1,
        });

        expect(navigateMock).toHaveBeenCalledWith(
            "/room/abc123?player=1"
        );
    });
});

// A match error renders an error state, and the back button resets to start matchmaking
describe("MatchmakePopup.error", () => {
    it("shows error state on socket error", async () => {
        render(<MatchmakePopup onClose={onClose} />);

        handlers[SOCKET_EVENTS.MATCH_ERROR]("server down");

        expect(await screen.findByText(/error/i)).toBeInTheDocument();
        expect(await screen.findByText("server down")).toBeInTheDocument();
    });

    it("back button resets error state", async () => {
        render(<MatchmakePopup onClose={onClose} />);

        handlers[SOCKET_EVENTS.MATCH_ERROR]("server down");

        const backBtn = await screen.findByRole("button", { name: /back/i });

        fireEvent.click(backBtn);

        expect(
            await screen.findByRole("button", { name: /start matchmaking/i })
        ).toBeInTheDocument();
    });
});

// Clicking the overlay around the popup box closes it
describe("MatchmakePopup.close", () => {
    it("clicking overlay closes popup", () => {
        const { container } = render(<MatchmakePopup onClose={onClose} />);

        const overlay = container.querySelector(".matchmake-overlay")!;

        fireEvent.click(overlay);

        expect(onClose).toHaveBeenCalled();
    });
});