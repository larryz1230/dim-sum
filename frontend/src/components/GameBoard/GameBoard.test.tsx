import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GameBoard } from "./GameBoard.jsx";

// Mock for GameCell component
vi.mock("./GameCell", () => ({
  GameCell: ({ cell, isSelected }: 
            { cell: any; isSelected: boolean }) => (
    <div
      data-testid="game-cell"
      data-id={cell.id}
      data-selected={isSelected}
    >
      {cell.value}
    </div>
  )
}));

const createBoard = () => [
  [
    { id: "c1", value: 5, row: 0, col: 0 },
    { id: "c2", value: 5, row: 0, col: 1 }
  ]
];

beforeEach(() => {
  // Store rects per element
  const mockRects: Map<HTMLElement, DOMRect> = new Map();
  
  HTMLElement.prototype.getBoundingClientRect = vi.fn(function(this: HTMLElement) {
    // Create rectangle for element if it doesnt exist
    if (!mockRects.has(this)) {
      const isBoard = this.className?.includes('game-board') && !this.className?.includes('__');
      const isGrid = this.className?.includes('game-board__grid');
      
      if (isBoard || isGrid) {
        mockRects.set(this, new DOMRect(0, 0, 250, 150));
      } else {
        mockRects.set(this, new DOMRect(0, 0, 100, 100));
      }
    }
    return mockRects.get(this)!;
  });

  Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
    configurable: true,
    value: 100
  });

  Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
    configurable: true,
    value: 100
  });

  Object.defineProperty(HTMLElement.prototype, "offsetTop", {
    configurable: true,
    value: 0
  });
});

// Tests
describe("GameBoard.empty", () => {
    it("renders a loading state when there are no cells", () => {
        render(
            <GameBoard
                cells={[]}
                selectedCellIds={new Set()}
                onCellClick={() => {}}
                onSelectionChange={() => {}}
                onCellsUpdate={() => {}}
            />
        );

        expect(screen.getByText("Loading game board...")).toBeInTheDocument();
    });
});

describe("GameBoard.nonempty", () => {
    it("renders game cells when the board is nonempty", () => {
        render(
            <GameBoard 
                cells={createBoard()} 
                selectedCellIds={new Set()}
                onCellClick={() => {}}
                onSelectionChange={() => {}}
                onCellsUpdate={() => {}}
            />
        );

        const cells = screen.getAllByTestId("game-cell");

        expect(cells.length).toBe(2);
    });
});

describe("GameBoard.disabled", () => {
    it("applies disabled class when disabled", () => {
        const { container } = render(
            <GameBoard 
                cells={createBoard()}
                disabled
                selectedCellIds={new Set()}
                onCellClick={() => {}}
                onSelectionChange={() => {}}
                onCellsUpdate={() => {}}
            />
        );

        expect(container.querySelector(".game-board")).toHaveClass("game-board--disabled");
    });
});

describe("GameBoard.selection", () => {
    it("shows selection box when dragging", () => {
        const { container } = render(
            <GameBoard 
                cells={createBoard()} 
                selectedCellIds={new Set()}
                onCellClick={() => {}}
                onSelectionChange={() => {}}
                onCellsUpdate={() => {}}
            />
        );

        const board = container.querySelector(".game-board");

        fireEvent.mouseDown(board!, { clientX: 10, clientY: 10, button: 0 });
        fireEvent.mouseMove(document, { clientX: 50, clientY: 50, buttons: 1 });

        const box = container.querySelector(".game-board__selection-box");

        expect(box).toBeInTheDocument();
    });
});

describe("GameBoard.clear", () => {
    it("clears cells when selected sum equals target sum", () => {
        const onCellsUpdate = vi.fn();
        const onSelectionChange = vi.fn();
        const { container } = render(
            <GameBoard
            cells={createBoard()}
            selectedCellIds={new Set()}
            onCellClick={() => {}}
            onSelectionChange={onSelectionChange}
            onCellsUpdate={onCellsUpdate}
            targetSum={10}
            isSinglePlayer
            />
        );

        const board = container.querySelector(".game-board");

        fireEvent.mouseDown(board!, { clientX: 0, clientY: 0, button: 0 });
        fireEvent.mouseMove(document, { clientX: 50, clientY: 50, buttons: 1 });
        fireEvent.mouseMove(document, { clientX: 220, clientY: 100, buttons: 1 });
        fireEvent.mouseUp(document, { button: 0 });

        expect(onCellsUpdate).toHaveBeenCalled();
        expect(onSelectionChange).toHaveBeenCalledWith(new Set());
    });
});

describe("GameBoard.multiplayer", () => {
    it("emits socket update in multiplayer", () => {
        const emit = vi.fn();

        const socketRef = { current: { emit, id: "player1" }} as any;

        const { container } = render(
            <GameBoard
            cells={createBoard()}
            selectedCellIds={new Set()}
            onCellClick={() => {}}
            onSelectionChange={() => {}}
            onCellsUpdate={() => {}}
            targetSum={10}
            socketRef={socketRef}
            matchId={"room1" as any}
            />
        );

        const board = container.querySelector(".game-board");

        fireEvent.mouseDown(board!, { clientX: 10, clientY: 10, button: 0 });
        fireEvent.mouseMove(document, { clientX: 100, clientY: 100, buttons: 1 });
        fireEvent.mouseUp(document, { button: 0 });

        expect(emit).toHaveBeenCalledWith(
            "game:update",
            expect.objectContaining({roomId: "room1"})
        );
    });
});

