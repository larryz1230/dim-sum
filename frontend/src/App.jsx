import React, { useEffect, useState } from 'react';
import { GameBoard } from './components/GameBoard';
import { io } from 'socket.io-client';
import './App.css';

// Create a sample game board
const createSampleBoard = (rows = 12, cols = 10) => {
  const cells = [];
  
  for (let row = 0; row < rows; row++) {
    const rowCells = [];
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

function App() {
  const [cells, setCells] = useState(createSampleBoard(12, 10));
  const [selectedCellIds, setSelectedCellIds] = useState(new Set());
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    const socket = io("http://localhost:8080");

    socket.on("connect", () => {
      console.log("socket connected", socket.id);
      socket.emit("ping");
    });

    socket.on("pong", () => {
      console.log("pong received from server");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSelectionChange = (newSelection) => {
    setSelectedCellIds(newSelection);
  };

  const handleCellsUpdate = (updatedCells) => {
    setCells(updatedCells);
  };

  return (
    <div className="app">
      <div className="app__game-container">
        <GameBoard
          cells={cells}
          selectedCellIds={selectedCellIds}
          onSelectionChange={handleSelectionChange}
          onCellsUpdate={handleCellsUpdate}
          disabled={disabled}
          targetSum={10}
        />
      </div>
    </div>
  );
}

export default App;

