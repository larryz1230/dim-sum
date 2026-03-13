import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeAll } from "vitest";
import Game from "./Game";
import { MemoryRouter } from "react-router-dom";

// Mocks
const navigate = vi.fn();

// React-router mock
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
        return {
        ...actual,
        useNavigate: () => navigate
    };
});

// Sound mocks
vi.mock("../hooks/useSound", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../hooks/useSound")>();
        return {
        ...actual,
        useSound: () => ({ soundOn: false }),
    };
});

vi.mock("../utils/sound", () => ({
    playBunSound: vi.fn()
}));

// Gameboard mock
vi.mock("../components/GameBoard", () => ({
    GameBoard: () => <div className="game-board">GameBoard</div>
}));

// Timer mock
vi.mock("../components/Timer", () => ({
    Timer: ({ onTimeUp }: any) => (
        <div>
            Timer
            <button onClick={onTimeUp}>Trigger TimeUp</button>
        </div>
    )
}));

// Score mock
vi.mock("../components/Score", () => ({
    Score: ({ score }: any) => <div>Score: {score}</div>
}));

// Leaderboard mock
vi.mock("../components/Leaderboard", () => ({
    Leaderboard: () => <div>Leaderboard</div>
}));

// Settings mock
vi.mock("../components/Settings", () => ({
    Settings: ({ onClose, onLoginClick }: any) => (
        <div>
            Settings
            <button onClick={onLoginClick}>Login</button>
            <button onClick={onClose}>Close Settings</button>
        </div>
    )
}));

// Login mock
vi.mock("../components/Login", () => ({
    Login: ({ onClose }: any) => (
    <div>
        Login
        <button onClick={onClose}>Close Login</button>
    </div>
    )
}));

// Gameover mock
vi.mock("../components/GameOver", () => ({
    GameOver: ({ onReplay }: any) => (
        <div>
            GameOver
            <button onClick={onReplay}>Replay</button>
        </div>
    )
}));

// Back to dashboard button mock
vi.mock("../components/BackToDashboard/BackToDashboard", () => ({
    default: () => <div>BackToDashboard</div>
}));

// Mock ResizeObserver
beforeAll(() => {
    global.ResizeObserver = class {
        observe = vi.fn();
        unobserve = vi.fn();
        disconnect = vi.fn();
    } as any;
});

// Tests

// The components of the game page (GameBoard, Leaderboard, Score) are rendered
describe("Game.render", () => {
  it("renders game UI", () => {
    render(
        <MemoryRouter>
            <Game />
        </MemoryRouter>
    );

    expect(screen.getByText("GameBoard")).toBeInTheDocument();
    expect(screen.getByText("Leaderboard")).toBeInTheDocument();
    expect(screen.getByText(/Score:/)).toBeInTheDocument();
  });
});

// The settings button opens up the settings popup
describe("Game.settings", () => {
    it("opens settings when clicking settings button", () => {
        render(
            <MemoryRouter>
                <Game />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByAltText("Settings"));

        expect(screen.getByText("Settings")).toBeInTheDocument();
    });

    // Player can interact with settings buttons such as login, which navigates to login page
    it("opens login from settings", () => {
        render(
            <MemoryRouter>
                <Game />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByAltText("Settings"));
        fireEvent.click(screen.getByText("Login"));

        expect(screen.getByText("Login")).toBeInTheDocument();
    });
});

// Timer causes game over popup when it ends
describe("Game.timer", () => {
    it("shows game over when timer ends", async () => {
        render(
            <MemoryRouter>
                <Game />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Trigger TimeUp")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText("Trigger TimeUp"));

        expect(screen.getByText("GameOver")).toBeInTheDocument();
    });
});

// Replay button restarts the game and resets the game over state
describe("Game.replay", () => {
    it("restarts game when replay clicked", async () => {
        render(
            <MemoryRouter>
                <Game />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Trigger TimeUp")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText("Trigger TimeUp"));

        fireEvent.click(screen.getByText("Replay"));

        expect(screen.queryByText("GameOver")).not.toBeInTheDocument();
    });
});