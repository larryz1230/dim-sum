import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom/vitest';
import { Leaderboard } from "./Leaderboard";

// Mock images
vi.mock("../../imgs/Gold Bun.png", () => ({ default: "gold.png" }));
vi.mock("../../imgs/Silver Bun.png", () => ({ default: "silver.png" }));
vi.mock("../../imgs/Bronze Bun.png", () => ({ default: "bronze.png" }));

// Supabase mock
const mockSelect = vi.fn();
const mockOrder = vi.fn();
const mockLimit = vi.fn();

vi.mock("../../services/supabaseClient", () => ({
    supabase: {
    from: () => ({
        select: mockSelect,
        order: mockOrder,
        limit: mockLimit,
    }),
    },
}));

// Reset mocks before each test
beforeEach(() => {
    vi.clearAllMocks();
});

// Tests

// Initial loading state
describe("Leaderboard.loading", () => {
    it("renders loading state initially", () => {
        mockSelect.mockReturnValue({
            order: () => ({
            limit: () => new Promise(() => {}),
            }),
        });

        render(<Leaderboard gameMode="classic" />);
        expect(screen.getByText("Loading scores...")).toBeInTheDocument();
    });
});

// Error is caught, and leaderboard fails to load
describe("Leaderboard.error", () => {
    it("renders error message when supabase fails", async () => {
        mockSelect.mockReturnValue({
            order: () => ({
            limit: () =>
                Promise.resolve({
                    data: null,
                    error: new Error("DB error"),
                }),
            }),
        });

        render(<Leaderboard gameMode="classic" />);

        await waitFor(() => {
            expect(screen.getByText("Failed to load leaderboard.")).toBeInTheDocument();
        });
    });
});

// Leaderboard data is empty, so no scores should be rendered
describe("Leaderboard.empty", () => {
    it("renders empty state when no scores exist", async () => {
        mockSelect.mockReturnValue({
            order: () => ({
            limit: () =>
                Promise.resolve({
                    data: [],
                    error: null,
                }),
            }),
        });

        render(<Leaderboard gameMode="classic" />);

        await waitFor(() => {
            expect(screen.getByText("No scores yet!")).toBeInTheDocument();
        });
    });
});

// Leaderboard has player data, so render the leaderboard with player names
describe("Leaderboard.nonempty", () => {
    it("renders leaderboard entries", async () => {
        const fakePlayers = [
            { id: 1, username: "Alice", rating: 2000 },
            { id: 2, username: "Bob", rating: 1800 },
            { id: 3, username: "Charlie", rating: 1600 },
            { id: 4, username: "Dave", rating: 1400 },
        ];

        mockSelect.mockReturnValue({
            order: () => ({
            limit: () =>
                Promise.resolve({
                    data: fakePlayers,
                    error: null,
                }),
            }),
        });

        render(<Leaderboard gameMode="classic" />);

        await waitFor(() => {
            expect(screen.getByText("Alice")).toBeInTheDocument();
            expect(screen.getByText("Bob")).toBeInTheDocument();
            expect(screen.getByText("Charlie")).toBeInTheDocument();
            expect(screen.getByText("Dave")).toBeInTheDocument();
        });
    });
});
