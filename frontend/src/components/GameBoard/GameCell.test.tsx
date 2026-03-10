import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import { GameCell } from "./GameCell.jsx";

// Tests
describe("GameCell.empty", () => {
    it("renders an empty cell when value is 0", () => {
        const emptyCell = { value: 0 };
        const { container } = render(<GameCell cell={emptyCell} isSelected={false}/>);
        const cell = container.firstChild;

        expect(cell).toHaveClass("game-cell");
        expect(cell).toHaveClass("game-cell--empty");
    });
});

describe("GameCell.nonempty", () => {
    it("renders a non-empty cell when value is not 0", () => {
        const emptyCell = { row: 1, col: 2, value: 5 };
        const { container } = render(<GameCell cell={emptyCell} isSelected={false}/>);
        const cell = container.firstChild;

        expect(cell!).not.toHaveClass("game-cell--empty");
        expect(cell!.firstChild).toHaveClass("game-cell__value");
        expect(screen.getByText("5")).toBeInTheDocument();
    });
});
