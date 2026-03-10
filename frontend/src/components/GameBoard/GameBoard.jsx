/**
 * GameBoard Component
 * Main game grid that displays cells and handles cell selection
 * Based on Figma design: 12 rows x 10 columns grid
 */

import React, { useState, useCallback, useRef } from 'react';
import { GameCell } from './GameCell';
import './GameBoard.css';

export const GameBoard = ({
  cells,
  selectedCellIds: externalSelectedCellIds,
  onCellClick,
  onSelectionChange,
  onCellsUpdate,
  isSinglePlayer = false,
  socketRef = null  , // Socket for multiplayer updates
  matchId = null, // Match ID for multiplayer
  disabled = false,
  targetSum = 10,
}) => {
  // Internal state if not controlled externally
  const [internalSelectedCellIds, setInternalSelectedCellIds] = useState(new Set());
  
  // Box selection state
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState(null); // {x, y} in grid coordinates
  const [endPos, setEndPos] = useState(null); // {x, y} in grid coordinates
  const gridRef = useRef(null);
  const boardRef = useRef(null);
  const startPosRef = useRef(null);
  const endPosRef = useRef(null);
  
  // Use external or internal state
  const selectedCellIds = externalSelectedCellIds ?? internalSelectedCellIds;
  const isControlled = externalSelectedCellIds !== undefined;

  // Get grid position from mouse event (relative to grid, accounting for board padding)
  const getGridPosition = useCallback((e) => {
    if (!gridRef.current || !boardRef.current) return null;
    const boardRect = boardRef.current.getBoundingClientRect();
    const gridRect = gridRef.current.getBoundingClientRect();
    
    // Calculate position relative to grid, accounting for grid's position within board
    return {
      x: e.clientX - gridRect.left,
      y: e.clientY - gridRect.top
    };
  }, []);

  // Convert grid position to cell coordinates (clamps to valid range).
  // Reads actual DOM dimensions so it works when CSS changes (e.g. @media max-width: 768px).
  const positionToCell = useCallback((pos) => {
    if (!pos || !gridRef.current || !cells.length || !cells[0]?.length) return null;

    const firstRow = gridRef.current.children[0];
    if (!firstRow?.children?.[0]) return null;

    const firstCell = firstRow.children[0];
    const cellWidth = firstCell.offsetWidth;
    const cellHeight = firstCell.offsetHeight;

    let colGap = 6;
    if (firstRow.children[1]) {
      const r0 = firstRow.children[0].getBoundingClientRect();
      const r1 = firstRow.children[1].getBoundingClientRect();
      colGap = r1.left - r0.right;
    }

    let rowGap = 6;
    if (gridRef.current.children[1]) {
      const row0 = gridRef.current.children[0];
      const row1 = gridRef.current.children[1];
      rowGap = row1.offsetTop - row0.offsetTop - row0.offsetHeight;
    }

    const cellSizeX = cellWidth + colGap;
    const cellSizeY = cellHeight + rowGap;

    const rowWidth = firstRow.offsetWidth;
    const totalCellsWidth = cells[0].length * cellSizeX - colGap;
    const centeringOffset = Math.max(0, (rowWidth - totalCellsWidth) / 2);

    const adjustedX = pos.x - centeringOffset;
    const col = Math.floor(adjustedX / cellSizeX);
    const row = Math.floor(pos.y / cellSizeY);

    const clampedCol = Math.max(0, Math.min(col, cells[0].length - 1));
    const clampedRow = Math.max(0, Math.min(row, cells.length - 1));

    return { row: clampedRow, col: clampedCol };
  }, [cells]);

  // Get pixel bounds of a cell relative to the grid (for 80% coverage check)
  const getCellBoundsInGrid = useCallback((row, col) => {
    if (!gridRef.current || !cells.length || !cells[0]?.length) return null;
    const firstRow = gridRef.current.children[0];
    if (!firstRow?.children?.[0]) return null;
    const firstCell = firstRow.children[0];
    const cellWidth = firstCell.offsetWidth;
    const cellHeight = firstCell.offsetHeight;
    let colGap = 6;
    if (firstRow.children[1]) {
      const r0 = firstRow.children[0].getBoundingClientRect();
      const r1 = firstRow.children[1].getBoundingClientRect();
      colGap = r1.left - r0.right;
    }
    let rowGap = 6;
    if (gridRef.current.children[1]) {
      const row0 = gridRef.current.children[0];
      const row1 = gridRef.current.children[1];
      rowGap = row1.offsetTop - row0.offsetTop - row0.offsetHeight;
    }
    const cellSizeX = cellWidth + colGap;
    const cellSizeY = cellHeight + rowGap;
    const rowWidth = firstRow.offsetWidth;
    const totalCellsWidth = cells[0].length * cellSizeX - colGap;
    const centeringOffset = Math.max(0, (rowWidth - totalCellsWidth) / 2);
    return {
      left: centeringOffset + col * cellSizeX,
      top: row * cellSizeY,
      width: cellWidth,
      height: cellHeight,
    };
  }, [cells]);

  // Check if at least 80% of a cell is covered by the selection box
  const isCellAtLeast80PercentCovered = useCallback((cell, boxStartPos, boxEndPos) => {
    if (!boxStartPos || !boxEndPos) return false;
    const cellBounds = getCellBoundsInGrid(cell.row, cell.col);
    if (!cellBounds) return false;
    const boxLeft = Math.min(boxStartPos.x, boxEndPos.x);
    const boxTop = Math.min(boxStartPos.y, boxEndPos.y);
    const boxRight = Math.max(boxStartPos.x, boxEndPos.x);
    const boxBottom = Math.max(boxStartPos.y, boxEndPos.y);
    const overlapLeft = Math.max(boxLeft, cellBounds.left);
    const overlapTop = Math.max(boxTop, cellBounds.top);
    const overlapRight = Math.min(boxRight, cellBounds.left + cellBounds.width);
    const overlapBottom = Math.min(boxBottom, cellBounds.top + cellBounds.height);
    const overlapWidth = Math.max(0, overlapRight - overlapLeft);
    const overlapHeight = Math.max(0, overlapBottom - overlapTop);
    const overlapArea = overlapWidth * overlapHeight;
    const cellArea = cellBounds.width * cellBounds.height;
    if (cellArea <= 0) return false;
    return overlapArea / cellArea >= 0.5;
  }, [getCellBoundsInGrid]);

  // Calculate cells in box selection from positions (80% coverage rule)
  const getCellsInBoxFromPositions = useCallback((startPos, endPos) => {
    if (!startPos || !endPos) return [];
    const cellsInBox = [];
    for (let row = 0; row < cells.length; row++) {
      for (let col = 0; col < (cells[row]?.length ?? 0); col++) {
        const cell = cells[row][col];
        if (cell && cell.value !== 0 && isCellAtLeast80PercentCovered(cell, startPos, endPos)) {
          cellsInBox.push(cell.id);
        }
      }
    }
    return cellsInBox;
  }, [cells, isCellAtLeast80PercentCovered]);

  // Handle mouse down - start box selection (left button only).
  // Attach document listeners immediately here, not in useEffect. Otherwise a fast click
  // (mousedown then quick mouseup) can fire mouseup before useEffect runs, and we miss it.
  const handleMouseDown = useCallback((e) => {
    if (disabled || e.button !== 0) return;
    const pos = getGridPosition(e);
    if (!pos) return;

    startPosRef.current = pos;
    endPosRef.current = pos;
    setIsDragging(true);
    setStartPos(pos);
    setEndPos(pos);

    const opts = { capture: true };

    const onDocumentMouseUp = (upE) => {
      if (upE.button !== 0) return;
      document.removeEventListener('mouseup', onDocumentMouseUp, opts);
      document.removeEventListener('mousemove', onDocumentMouseMove, opts);

      const s = startPosRef.current;
      const ep = endPosRef.current;
      if (s && ep) {
        const cellsInBox = getCellsInBoxFromPositions(s, ep);

        let sum = 0;
        for (const cellId of cellsInBox) {
          for (const row of cells) {
            for (const cell of row) {
              if (cell.id === cellId) {
                sum += cell.value;
                break;
              }
            }
          }
        }
        if (sum === targetSum) {
          if (isSinglePlayer && onCellsUpdate) {
            const updatedCells = cells.map(row =>
              row.map(cell =>
                cellsInBox.includes(cell.id) ? { ...cell, value: 0 } : cell
              )
            );
            onCellsUpdate([...updatedCells]);
          } else if (!isSinglePlayer && socketRef?.current && matchId) {
            socketRef.current.emit("game:update", {
              roomId: matchId,
              player: socketRef.current.id,
              cells: cellsInBox,
            });
          }
        }

        if (onSelectionChange) onSelectionChange(new Set());
        else if (!isControlled) setInternalSelectedCellIds(new Set());
      }

      startPosRef.current = null;
      endPosRef.current = null;
      setIsDragging(false);
      setStartPos(null);
      setEndPos(null);
    };

    const onDocumentMouseMove = (moveE) => {
      if (!(moveE.buttons & 1)) {
        onDocumentMouseUp(moveE);
        return;
      }
      if (!boardRef.current) return;
      const rect = boardRef.current.getBoundingClientRect();
      const { clientX: x, clientY: y } = moveE;
      if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) return;
      const p = getGridPosition(moveE);
      if (p) {
        endPosRef.current = p;
        setEndPos(p);
      }
    };

    document.addEventListener('mouseup', onDocumentMouseUp, opts);
    document.addEventListener('mousemove', onDocumentMouseMove, opts);
  }, [
    disabled,
    getGridPosition,
    getCellsInBoxFromPositions,
    isSinglePlayer,
    cells,
    onCellsUpdate,
    socketRef,
    matchId,
    onSelectionChange,
    isControlled,
    targetSum,
  ]);

  // Calculate sum of selected cells
  const selectedSum = Array.from(selectedCellIds).reduce((sum, cellId) => {
    for (const row of cells) {
      for (const cell of row) {
        if (cell.id === cellId) {
          return sum + cell.value;
        }
      }
    }
    return sum;
  }, 0);

  if (!cells || cells.length === 0) {
    return (
      <div className="game-board game-board--empty">
        <p>Loading game board...</p>
      </div>
    );
  }

  // Check if cell is in current box selection (80% coverage rule)
  const isCellInBox = useCallback((cell) => {
    if (!isDragging || !startPos || !endPos) return false;
    return isCellAtLeast80PercentCovered(cell, startPos, endPos);
  }, [isDragging, startPos, endPos, isCellAtLeast80PercentCovered]);

  // Calculate selection box position and size
  const getSelectionBoxStyle = () => {
    if (!isDragging || !startPos || !endPos) return { display: 'none' };
    
    const left = Math.min(startPos.x, endPos.x);
    const top = Math.min(startPos.y, endPos.y);
    const width = Math.abs(endPos.x - startPos.x);
    const height = Math.abs(endPos.y - startPos.y);
    
    return {
      position: 'absolute',
      top: `${top}px`,
      left: `${left}px`,
      width: `${width}px`,
      height: `${height}px`,
      border: '2px dashed #E7BC9B',
      backgroundColor: 'rgba(231, 188, 155, 0.1)',
      pointerEvents: 'none',
      zIndex: 10,
    };
  };

  return (
    <div 
      ref={boardRef}
      className={`game-board ${disabled ? 'game-board--disabled' : ''}`}
      onMouseDown={handleMouseDown}
      style={{ cursor: isDragging ? 'crosshair' : 'default', userSelect: 'none' }}
    >
      <div 
        ref={gridRef}
        className="game-board__grid"
      >
        {cells.map((row, rowIndex) => (
          <div key={rowIndex} className="game-board__row">
            {row.map((cell) => (
              <GameCell
                key={cell.id}
                cell={cell}
                isSelected={isDragging && isCellInBox(cell)}
                disabled={disabled}
              />
            ))}
          </div>
        ))}
        {/* Selection box overlay */}
        {isDragging && (
          <div className="game-board__selection-box" style={getSelectionBoxStyle()} />
        )}
      </div>
    </div>
  );
};

