import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import { MatchPlayersInfo } from "./MatchPlayersInfo";

const me = {
    name: "Michael",
    rating: 1500,
    wins: 10,
    losses: 5,
    score: 42,
};

const opponent = {
    name: "Samantha",
    rating: 1400,
    wins: 8,
    losses: 7,
    score: 35,
};

// Information renders players labels, names, scores, ratings, records, and cards
describe("MatchPlayersInfo.render", () => {
    it("renders both player labels", () => {
        render(
            <MatchPlayersInfo 
                me={me} 
                opponent={opponent} 
            />
        );

        expect(screen.getByText("You")).toBeInTheDocument();
        expect(screen.getByText("Opponent")).toBeInTheDocument();
    });

    it("renders player names", () => {
        render(
            <MatchPlayersInfo 
                me={me} 
                opponent={opponent} 
            />
        );

        expect(screen.getByText("Michael")).toBeInTheDocument();
        expect(screen.getByText("Samantha")).toBeInTheDocument();
    });

    it("renders scores", () => {
        render(
            <MatchPlayersInfo 
                me={me} 
                opponent={opponent} 
            />
        );

        expect(screen.getByText("Score: 42")).toBeInTheDocument();
        expect(screen.getByText("Score: 35")).toBeInTheDocument();
    });

    it("renders ratings", () => {
        render(
            <MatchPlayersInfo 
                me={me} 
                opponent={opponent} 
            />
        );

        expect(screen.getByText("Elo: 1500")).toBeInTheDocument();
        expect(screen.getByText("Elo: 1400")).toBeInTheDocument();
    });

    it("renders win-loss records", () => {
        render(
            <MatchPlayersInfo 
                me={me} 
                opponent={opponent} 
            />
        );

        expect(screen.getByText("W-L: 10-5")).toBeInTheDocument();
        expect(screen.getByText("W-L: 8-7")).toBeInTheDocument();
    });

    it("renders two player cards", () => {
        const { container } = render(
            <MatchPlayersInfo 
                me={me} 
                opponent={opponent} 
            />
        );

        const cards = container.querySelectorAll(".match-players-info__card");

        expect(cards).toHaveLength(2);
    });
});

// The default display is You and Opponent if names are empty
describe("MatchPlayersInfo.default", () => {
    it("sets to default names when empty", () => {
        render(
            <MatchPlayersInfo
            me={{ ...me, name: "" }}
            opponent={{ ...opponent, name: "" }}
            />
        );

        const names = screen.getAllByText(/You|Opponent/);

        expect(names.length).toBeGreaterThanOrEqual(2);
    });
});