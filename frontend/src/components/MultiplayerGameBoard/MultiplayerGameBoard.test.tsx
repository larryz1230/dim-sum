import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MultiplayerGameBoard } from "./MultiplayerGameBoard.jsx";

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

// Board template for testing
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
      const isBoard = this.className?.includes("game-board") && !this.className?.includes("__");
      const isGrid = this.className?.includes("game-board__grid");
      
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

// The state is loading when the cells are empty
describe("MultiplayerGameBoard.empty", () => {
  it("renders a loading state when there are no cells", () => {
    render(
      <MultiplayerGameBoard
        cells={[]}
        selectedCellIds={new Set()}
        onSelectionChange={() => {}}
        onSelectionEnd={() => {}}
      />
    );

    expect(screen.getByText("Loading game board...")).toBeInTheDocument();
  });
});

// The game cells are rendered when their length is greater than 0
describe("MultiplayerGameBoard.nonempty", () => {
  it("renders game cells when the board is nonempty", () => {
    render(
      <MultiplayerGameBoard
        cells={createBoard()}
        selectedCellIds={new Set()}
        onSelectionChange={() => {}}
        onSelectionEnd={() => {}}
      />
    );

    const cells = screen.getAllByTestId("game-cell");
    expect(cells.length).toBe(2);
  });
});

// The disabled class is applied when the game board is disabled
describe("MultiplayerGameBoard.disabled", () => {
  it("applies disabled class when disabled", () => {
    const { container } = render(
      <MultiplayerGameBoard
        cells={createBoard()}
        disabled
        selectedCellIds={new Set()}
        onSelectionChange={() => {}}
        onSelectionEnd={() => {}}
      />
    );

    expect(container.querySelector(".game-board")).toHaveClass("game-board--disabled");
  });
});

// The selection box is rendered when the player clicks down and drags the mouse
describe("MultiplayerGameBoard.selection", () => {
  it("shows selection box when dragging", () => {
    const { container } = render(
      <MultiplayerGameBoard
        cells={createBoard()}
        selectedCellIds={new Set()}
        onSelectionChange={() => {}}
        onSelectionEnd={() => {}}
      />
    );

    const board = container.querySelector(".game-board");

    fireEvent.mouseDown(board!, { clientX: 10, clientY: 10, button: 0 });
    fireEvent.mouseMove(document, { clientX: 50, clientY: 50, buttons: 1 });

    const box = container.querySelector(".game-board__selection-box");
    expect(box).toBeInTheDocument();
  });
});

// The game board is updated when the sum within the selection box is equivalent to the target sum
describe("MultiplayerGameBoard.clear", () => {
  it("clears cells when selected sum equals target sum", () => {
    const onSelectionEnd = vi.fn();
    const { container } = render(
      <MultiplayerGameBoard
        cells={createBoard()}
        selectedCellIds={new Set()}
        onSelectionChange={() => {}}
        onSelectionEnd={onSelectionEnd}
        targetSum={10}
      />
    );

    const board = container.querySelector(".game-board");

    fireEvent.mouseDown(board!, { clientX: 0, clientY: 0, button: 0 });
    fireEvent.mouseMove(document, { clientX: 50, clientY: 50, buttons: 1 });
    fireEvent.mouseMove(document, { clientX: 220, clientY: 100, buttons: 1 });
    fireEvent.mouseUp(document, { button: 0 });

    expect(onSelectionEnd).toHaveBeenCalledWith(["c1", "c2"]);
  });
});