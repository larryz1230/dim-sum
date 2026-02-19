/**
 * GameBoard Component
 * Main game grid that displays cells and handles cell selection
 * Based on Figma design: 12 rows x 10 columns grid
 */

import React, { useState, useCallback, useRef } from 'react';
import { GameCell } from './GameCell';
import './GameBoard.css';
import tryUpdate from '../../pages/Room.tsx'

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

  // Convert grid position to cell coordinates (clamps to valid range)
  const positionToCell = useCallback((pos) => {
    if (!pos || !gridRef.current || !cells.length || !cells[0]?.length) return null;
    
    const cellWidth = 40;
    const gap = 6;
    const cellSize = cellWidth + gap;
    
    const firstRow = gridRef.current.children[0];
    if (!firstRow) return null;
    
    const rowWidth = firstRow.offsetWidth;
    const totalCellsWidth = cells[0].length * cellSize - gap;
    const centeringOffset = (rowWidth - totalCellsWidth) / 2;
    
    const adjustedX = pos.x - centeringOffset;
    const col = Math.floor(adjustedX / cellSize);
    const row = Math.floor(pos.y / cellSize);
    
    // Clamp to valid range - allows positions outside grid to map to edge cells
    const clampedCol = Math.max(0, Math.min(col, cells[0].length - 1));
    const clampedRow = Math.max(0, Math.min(row, cells.length - 1));
    
    return { row: clampedRow, col: clampedCol };
  }, [cells]);

  // Calculate cells in box selection from positions
  const getCellsInBoxFromPositions = useCallback((startPos, endPos) => {
    if (!startPos || !endPos) return [];
    
    const startCell = positionToCell(startPos);
    const endCell = positionToCell(endPos);
    if (!startCell || !endCell) return [];
    
    const minRow = Math.min(startCell.row, endCell.row);
    const maxRow = Math.max(startCell.row, endCell.row);
    const minCol = Math.min(startCell.col, endCell.col);
    const maxCol = Math.max(startCell.col, endCell.col);
    
    const cellsInBox = [];
    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        if (cells[row] && cells[row][col] && cells[row][col].value !== 0) {
          cellsInBox.push(cells[row][col].id);
        }
      }
    }
    return cellsInBox;
  }, [cells, positionToCell]);

  // Handle mouse down - start box selection
  const handleMouseDown = useCallback((e) => {
    if (disabled) return;
    const pos = getGridPosition(e);
    if (pos) {
      // Allow starting anywhere within the grid container
      setIsDragging(true);
      setStartPos(pos);
      setEndPos(pos);
    }
  }, [disabled, getGridPosition]);

  // Handle mouse move - update box selection
  const handleMouseMove = useCallback((e) => {
    if (!isDragging || disabled) return;
    const pos = getGridPosition(e);
    if (pos) {
      setEndPos(pos);
    }
  }, [isDragging, disabled, getGridPosition]);

  // Handle mouse up - finalize box selection
  const handleMouseUp = useCallback(() => {
    if (!isDragging || disabled) return;
    
    if (startPos && endPos) {
      const cellsInBox = getCellsInBoxFromPositions(startPos, endPos);
      console.log('Cells in box:', cellsInBox);
      
      if (isSinglePlayer) {
        // Calculate sum
        let sum = 0;
        cellsInBox.forEach((cellId) => {
          for (const row of cells) {
            for (const cell of row) {
              if (cell.id === cellId) {
                sum += cell.value;
                break;
              }
            }
          }
        });
        
        // If sum equals 10, remove those cells (all at once)
        if (sum === 10 && onCellsUpdate) {
          const updatedCells = cells.map(row => 
            row.map(cell => 
              cellsInBox.includes(cell.id) ? { ...cell, value: 0 } : cell
            )
          );
          // Update all cells simultaneously
          onCellsUpdate([...updatedCells]);
        }
      } else {
        console.log("here");
        console.log(socketRef.current);
        console.log(matchId);
        socketRef.current.emit("game:update", {
          roomId: matchId,
          player: socketRef.current.id, // Send player ID for multiplayer updates
          cells: cellsInBox,
        });
        
      }
      // Clear selection
      if (onSelectionChange) {
        onSelectionChange(new Set());
      } else if (!isControlled) {
        setInternalSelectedCellIds(new Set());
      }
    }
    
    setIsDragging(false);
    setStartPos(null);
    setEndPos(null);
  }, [isDragging, startPos, endPos, getCellsInBoxFromPositions, disabled, onSelectionChange, isControlled, cells, onCellsUpdate]);

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

  // Check if cell is in current box selection
  const isCellInBox = useCallback((cell) => {
    if (!isDragging || !startPos || !endPos) return false;
    const startCell = positionToCell(startPos);
    const endCell = positionToCell(endPos);
    if (!startCell || !endCell) return false;
    
    const minRow = Math.min(startCell.row, endCell.row);
    const maxRow = Math.max(startCell.row, endCell.row);
    const minCol = Math.min(startCell.col, endCell.col);
    const maxCol = Math.max(startCell.col, endCell.col);
    return cell.row >= minRow && cell.row <= maxRow && 
           cell.col >= minCol && cell.col <= maxCol;
  }, [isDragging, startPos, endPos, positionToCell]);

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
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
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

