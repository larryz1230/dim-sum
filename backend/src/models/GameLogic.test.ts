import { describe, it, expect } from "vitest";
import * as GL from "./GameLogic";

// Template board for testing
const board = GL.createSampleBoard(2, 2);

// Tests 

// Either the cell in correct column and row is returned or undefined if out of bounds
describe("GameLogic.cell", () => {
    it("getCell returns cell or undefined", () => {
        expect(GL.getCell(board, 0, 0)).toBeDefined();
        expect(GL.getCell(board, 2, 2)).toBeUndefined();
    });
});

// The clearedCells of sumCell are totaled and returned 
describe("GameLogic.sum", () => {
    it("sumCells totals values", () => {
        // Let there be 2 cells in (0, 0), (1, 1)
        const cells = [{row:0, col:0},{row:1, col:1}];
        let total = (GL.getCell(board, 0, 0)?.value ?? 0) + (GL.getCell(board, 1, 1)?.value ?? 0);
        
        expect(GL.sumCells(board, cells)).toBe(total);
    });
});

describe("GameLogic.validity", () => {
    // If a cell is a duplicate (itself), return true.  Otherwise, return false.
    it("detects duplicate cells", () => {
        expect(GL.hasDuplicateCells([{row: 0, col: 0},{row: 0, col: 0}])).toBe(true);
        expect(GL.hasDuplicateCells([{row: 0, col: 0},{row: 0, col: 1}])).toBe(false);
    });

    // If cell doesn't exist, return false.  If it exists with a value greater than 0, return true.    
    it("validates cells", ()=>{
        const valids = [{row: 0, col: 0}];
        const invalids = [{row: 2, col: 2}];

        expect(GL.areCellsValid(board, valids)).toBe(true);
        expect(GL.areCellsValid(board, invalids)).toBe(false);
    });

    // If cell is duplicate or invalid, return false.  If cell isn't, return true;
    it("checks if a move is valid", ()=>{
        const goodCell={row: 0, col: 0};
        const badCell={row: 2, col: 2};
        const sum = GL.getCell(board, 0, 0)?.value ?? 0;

        expect(GL.isValidMove(board, [])).toBe(false);
        expect(GL.isValidMove(board, [goodCell, goodCell])).toBe(false);
        expect(GL.isValidMove(board, [badCell])).toBe(false);
        expect(GL.isValidMove(board, [goodCell])).toBe(sum === 10);
    });
});

// The clearCells function sets all cells values to 0
describe("GameLogic.clear", () => {
    it("clearCells zeroes values", ()=>{
        const boardCell = [[{
            id:'a',
            value:5,
            row:0,
            col:0
        }]];
        
        GL.clearCells(boardCell, [{row: 0, col: 0}]);
        expect(boardCell[0]![0]!.value).toBe(0);
    });
});

// The addScore function adds the number of cells cleared to the correct player
describe("GameLogic.score", () => {
    it("addScore updates correct player", ()=>{
        const state = {
            board:[],
            score1:0,
            score2:0,
            players:{},
            timer:0
        } as any;

        GL.addScore(state, 1, [{row: 0, col: 0}]);
        GL.addScore(state, 2, [{row: 0,col: 0},{row: 0, col: 1}]);
        expect(state.score1).toBe(1);
        expect(state.score2).toBe(2);
    });
});

// Upon a new game, applying a move will return false if invalid or true if valid
describe("GameLogic.move", () => {
    it("applyMove returns false on invalid, true on valid", ()=>{
        const state = GL.createInitialGameState(
            "room",
            {"player": {
                playerNumber:1
            }
        } as any);

        const cells = [{row: 0, col: 0}];
        const oldVal = state.board[0]![0]!.value;
        const result = GL.applyMove(state, 1, cells);

        if (oldVal !== 10){
            expect(result).toBe(false);
        } else {
            expect(result).toBe(true);
            expect(state.score1).toBe(1);
            expect(state.board[0]![0]!.value).toBe(0);
        }
    });
});