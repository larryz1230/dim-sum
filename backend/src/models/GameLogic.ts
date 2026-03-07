import type { 
    Cell, 
    Board, 
    ClearedCell,
    PlayerNumber,
    GameStateEmit, 
    PlayersBySocketId,
} from "../models/GameTypes";

export function createInitialGameState(
    roomId: string,
    players: PlayersBySocketId,
    rows = 12,
    cols = 10
) : GameStateEmit {
    return {
        roomId,
        board: createSampleBoard(rows, cols),
        score1: 0,
        score2: 0,
        timer: 60,
        players,
    };
}

export const createSampleBoard = (rows = 12, cols = 10): Board => {
  const cells: Board = [];

  for (let row = 0; row < rows; row++) {
    const rowCells: Cell[] = [];
    for (let col = 0; col < cols; col++) {
      rowCells.push({
        id: `cell-${row}-${col}`,
        value: Math.floor(Math.random() * 9) + 1, // Random 1-9
        row,
        col,
      });
    }
    cells.push(rowCells);
  }

  return cells;
};

export function getCell(board: Board, row: number, col: number) : Cell | undefined {
    return board[row]?.[col];
}

export function sumCells(board: Board, clearedCells: ClearedCell[]) : number {
    let total = 0;

    for (const {row, col} of clearedCells) {
        total += getCell(board, row, col) ?.value ?? 0;
    }

    return total;
}

export function hasDuplicateCells(clearedCells: ClearedCell[]) : boolean {
    const seen = new Set<string>();

    for (const {row, col} of clearedCells) {
        const key = `${row},${col}`;
        if (seen.has(key)) {
            return true;
        }
        seen.add(key);
    }

    return false;
}

export function areCellsValid(board: Board, clearedCells: ClearedCell[]) : boolean {
    for (const {row, col} of clearedCells) {
        const cell = getCell(board, row, col);

        if (!cell) {
            return false;
        }

        if (cell.value === 0) {
            return false;
        }
    }

    return true;
}

export function isValidMove(board: Board, clearedCells: ClearedCell[]) : boolean {
    if (clearedCells.length === 0) {
        return false;
    }

    if (hasDuplicateCells(clearedCells)) {
        return false;
    }

    if (!areCellsValid(board, clearedCells)) {
        return false;
    }

    return sumCells(board, clearedCells) === 10;
}

export function clearCells(board: Board, clearedCells: ClearedCell[]) : void {
    for (const {row, col} of clearedCells) {
        const cell = getCell(board, row, col);
        if (cell) {
            cell.value = 0;
        }
    }
}

export function addScore(state: GameStateEmit, player: PlayerNumber, clearedCells: ClearedCell[]) : void {
    const points = clearedCells.length;

    if (player === 1) {
        state.score1 += points;
    } else {
        state.score2 += points;
    }
}

export function applyMove(state: GameStateEmit, player: PlayerNumber, clearedCells: ClearedCell[]) : boolean {
    if (!isValidMove(state.board, clearedCells)) {
        return false;
    }
    addScore(state, player, clearedCells);
    clearCells(state.board, clearedCells);

    return true;
}