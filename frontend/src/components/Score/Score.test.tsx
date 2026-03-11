import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import { Score } from "./Score.jsx";

// Tests
describe("Score.singleplayer", () => {
    it("renders singleplayer score panel", () => {
        render(
            <Score
                gameMode={'singleplayer'}
                me={{}}
                opponent={{}}
                score={15} 
            />
        );

        expect(screen.getByText("Score")).toBeInTheDocument();
        expect(screen.getByText("You")).toBeInTheDocument();
        expect(screen.getByText("15")).toBeInTheDocument();
    });

    it ("becomes me.score if score is not provided", () => {
        render(
            <Score
                gameMode={'singleplayer'}
                me={{}}
                opponent={{}}
                score={20} 
            />
        );
        expect(screen.getByText("20")).toBeInTheDocument();
    });

    it ("defaults to 0 if no score is provided", () => {
        render(
            <Score />
        );

        expect(screen.getByText("0")).toBeInTheDocument();
    });
});

describe("Score.multiplayer", () => {
    const me = {
        name: "Joe",
        score: 21,
        rating: 2100,
        wins: 31,
        losses: 6
    }

    const opponent = {
        name: "Jane",
        score: 13,
        rating: 750,
        wins: 4,
        losses: 1
    }

    it("renders multiplayer match panel", () => {
        render(
            <Score
                gameMode="multiplayer"
                me={me}
                opponent={opponent}
            />
        );

        expect(screen.getByText("Match")).toBeInTheDocument();
        expect(screen.getByText("vs")).toBeInTheDocument();
    });

    it("renders players' names", () => {
        render(
            <Score
                gameMode="multiplayer"
                me={me}
                opponent={opponent}
            />
        );

        expect(screen.getByText("Joe")).toBeInTheDocument();
        expect(screen.getByText("Jane")).toBeInTheDocument();
    });

    it("renders player rating", () => {
        render(
            <Score
                gameMode="multiplayer"
                me={me}
                opponent={opponent}
            />
        );

        expect(screen.getByText("2100")).toBeInTheDocument();
        expect(screen.getByText("750")).toBeInTheDocument();
    })

    it("renders win-loss records", () => {
        render(
        <Score
            gameMode="multiplayer"
            me={me}
            opponent={opponent}
        />
        );

        expect(screen.getByText("31-6")).toBeInTheDocument();
        expect(screen.getByText("4-1")).toBeInTheDocument();
    });

    it("defaults to opponentScore if opponent.score is not provided", () => {
        render(
        <Score
            gameMode="multiplayer"
            me={me}
            opponent={{ name: "Bob" }}
            opponentScore={12}
        />
        );

        expect(screen.getByText("12")).toBeInTheDocument();
    });

});