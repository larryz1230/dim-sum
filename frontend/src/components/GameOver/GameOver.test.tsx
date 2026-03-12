import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom";
import { GameOver } from "./GameOver";

// Mock
const navigateMock = vi.fn();
const onClose = vi.fn();

// React-router mock
vi.mock("react-router-dom", () => ({
    useNavigate: () => navigateMock,
}));

beforeEach(() => {
    vi.clearAllMocks();
});

//Tests

// Singleplayer score is rendered
describe("GameOver.singleplayer", () => {
    it("renders singleplayer score", () => {
        render(
            <GameOver 
                player1={0} 
                player2={undefined} 
                score={120} 
                onClose={onClose} 
            />
        );

        expect(screen.getByText(/you scored/i)).toBeInTheDocument();
        expect(screen.getByText("120")).toBeInTheDocument();
    });
});

// Win, lose, and tie all render a different state by comparing player1 and player2 scores
describe("GameOver.multiplayer", () => {
  it("renders multiplayer win state", () => {
    render(
        <GameOver 
            player1={10} 
            player2={5} 
            score={undefined} 
            onClose={onClose} 
        />
    );

    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText(/you win/i)).toBeInTheDocument();
  });

  it("renders multiplayer lose state", () => {
    render(
        <GameOver 
            player1={3} 
            player2={8} 
            score={undefined} 
            onClose={onClose} 
        />
    );

    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText(/you lose/i)).toBeInTheDocument();
  });

  it("renders multiplayer tie state", () => {
    render(
        <GameOver 
            player1={7} 
            player2={7} 
            score={undefined} 
            onClose={onClose} 
        />
    );

    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText(/tie/i)).toBeInTheDocument();
  });
});

// Clicking return button navigates back to the dashboard
describe("GameOver.return", () => {
  it("navigates back to dashboard when clicking return button", () => {
    render(
        <GameOver 
            player1={10} 
            player2={5} 
            score={undefined} 
            onClose={onClose} 
        />
    );

    fireEvent.click(screen.getByRole("button", { name: /return to lobby/i }));

    expect(navigateMock).toHaveBeenCalledWith("/dashboard");
  });
});

// Clicking the overlay around the game over box closes it
describe("GameOver.close", () => {
  it("closes popup when overlay is clicked", () => {
    const { container } = render(
        <GameOver
            player1={10} 
            player2={5}
            score={undefined} 
            onClose={onClose} 
        />
    );

    const overlay = container.querySelector(".game-over-overlay")!;

    fireEvent.click(overlay);

    expect(onClose).toHaveBeenCalled();
  });
});