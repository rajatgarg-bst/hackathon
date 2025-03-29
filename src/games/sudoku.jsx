import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 2rem;
  color: #009688;
`;

const GameBoard = styled.div`
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: 1px;
  background-color: #333;
  padding: 2px;
  border: 2px solid #333;
  margin-bottom: 2rem;

  @media (max-width: 500px) {
    gap: 0.5px;
    padding: 1px;
  }
`;

const Cell = styled.div`
  width: 100%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.isSelected ? '#e0f2f1' : 'white'};
  font-size: 1.5rem;
  font-weight: ${props => props.isPrefilled ? 'bold' : 'normal'};
  color: ${props => props.isPrefilled ? '#333' : props.isInvalid ? 'red' : '#009688'};
  cursor: ${props => props.isPrefilled ? 'not-allowed' : 'pointer'};
  border: ${props => props.isSelected ? '2px solid #009688' : 'none'};
  position: relative;

  &:after {
    content: '';
    position: absolute;
    right: 0;
    bottom: 0;
    width: ${props => (props.x + 1) % 3 === 0 && props.x !== 8 ? '2px' : '0'};
    height: 100%;
    background-color: #333;
  }

  &:before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    height: ${props => (props.y + 1) % 3 === 0 && props.y !== 8 ? '2px' : '0'};
    width: 100%;
    background-color: #333;
  }

  @media (max-width: 500px) {
    font-size: 1rem;
  }
`;

const Controls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const NumberSelector = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const NumberButton = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  background-color: ${props => props.isSelected ? '#009688' : '#e0f2f1'};
  color: ${props => props.isSelected ? 'white' : '#009688'};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.isSelected ? '#00796b' : '#b2dfdb'};
  }

  @media (max-width: 500px) {
    width: 30px;
    height: 30px;
    font-size: 1rem;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  background-color: ${props => props.primary ? '#009688' : '#e0f2f1'};
  color: ${props => props.primary ? 'white' : '#009688'};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.primary ? '#00796b' : '#b2dfdb'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: red;
  text-align: center;
  margin: 1rem 0;
`;

const SuccessMessage = styled.div`
  color: #009688;
  text-align: center;
  margin: 1rem 0;
  font-weight: bold;
  font-size: 1.2rem;
`;

const DifficultySelector = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const DifficultyButton = styled.button`
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  background-color: ${props => props.isSelected ? '#009688' : '#e0f2f1'};
  color: ${props => props.isSelected ? 'white' : '#009688'};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.isSelected ? '#00796b' : '#b2dfdb'};
  }
`;

// Utility function to check if a Sudoku board is valid
const isValidSudoku = (board) => {
  // Check rows
  for (let i = 0; i < 9; i++) {
    const row = new Set();
    for (let j = 0; j < 9; j++) {
      const cell = board[i][j];
      if (cell !== 0 && row.has(cell)) return false;
      if (cell !== 0) row.add(cell);
    }
  }

  // Check columns
  for (let j = 0; j < 9; j++) {
    const col = new Set();
    for (let i = 0; i < 9; i++) {
      const cell = board[i][j];
      if (cell !== 0 && col.has(cell)) return false;
      if (cell !== 0) col.add(cell);
    }
  }

  // Check 3x3 sub-grids
  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const box = new Set();
      for (let i = boxRow * 3; i < boxRow * 3 + 3; i++) {
        for (let j = boxCol * 3; j < boxCol * 3 + 3; j++) {
          const cell = board[i][j];
          if (cell !== 0 && box.has(cell)) return false;
          if (cell !== 0) box.add(cell);
        }
      }
    }
  }

  return true;
};

// Utility function to check if a Sudoku board is complete
const isBoardComplete = (board) => {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (board[i][j] === 0) return false;
    }
  }
  return true;
};

// Generate a valid Sudoku puzzle
const generateSudoku = (difficulty = 'medium') => {
  // Start with an empty board
  const board = Array(9).fill().map(() => Array(9).fill(0));
  
  // Solve the empty board (creates a full valid solution)
  solveSudoku(board);
  
  // Create a copy of the solved board
  const solvedBoard = JSON.parse(JSON.stringify(board));
  
  // Remove numbers based on difficulty
  let cellsToRemove;
  switch (difficulty) {
    case 'easy':
      cellsToRemove = 40; // Leave ~41 numbers
      break;
    case 'medium':
      cellsToRemove = 50; // Leave ~31 numbers
      break;
    case 'hard':
      cellsToRemove = 60; // Leave ~21 numbers
      break;
    default:
      cellsToRemove = 50;
  }
  
  const positions = [];
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      positions.push([i, j]);
    }
  }
  
  // Shuffle positions
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  
  // Remove numbers
  for (let i = 0; i < cellsToRemove && i < positions.length; i++) {
    const [row, col] = positions[i];
    board[row][col] = 0;
  }
  
  return { puzzle: board, solution: solvedBoard };
};

// Solve a Sudoku board using backtracking
const solveSudoku = (board) => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        // Try each number 1-9
        const shuffledNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
        for (const num of shuffledNumbers) {
          if (isValidPlacement(board, row, col, num)) {
            board[row][col] = num;
            if (solveSudoku(board)) {
              return true;
            }
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
};

// Check if a number can be placed at the specified position
const isValidPlacement = (board, row, col, num) => {
  // Check row
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num) return false;
  }
  
  // Check column
  for (let i = 0; i < 9; i++) {
    if (board[i][col] === num) return false;
  }
  
  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[boxRow + i][boxCol + j] === num) return false;
    }
  }
  
  return true;
};

const Sudoku = () => {
  const [difficulty, setDifficulty] = useState('medium');
  const [board, setBoard] = useState([]);
  const [originalBoard, setOriginalBoard] = useState([]);
  const [solution, setSolution] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [invalidCells, setInvalidCells] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  // Initialize the game
  useEffect(() => {
    newGame();
  }, [difficulty]);

  const handleDifficultyChange = (newDifficulty) => {
    setDifficulty(newDifficulty);
  };

  const newGame = () => {
    const { puzzle, solution } = generateSudoku(difficulty);
    setBoard(JSON.parse(JSON.stringify(puzzle)));
    setOriginalBoard(JSON.parse(JSON.stringify(puzzle)));
    setSolution(solution);
    setSelectedCell(null);
    setSelectedNumber(null);
    setInvalidCells([]);
    setErrorMessage('');
    setIsComplete(false);
  };

  const handleCellClick = (rowIndex, colIndex) => {
    // Can't select prefilled cells
    if (originalBoard[rowIndex][colIndex] !== 0) return;
    
    setSelectedCell([rowIndex, colIndex]);
  };

  const handleNumberClick = (number) => {
    setSelectedNumber(number);
    
    if (selectedCell) {
      const [rowIndex, colIndex] = selectedCell;
      
      // Update board
      const newBoard = [...board];
      newBoard[rowIndex][colIndex] = number === 0 ? 0 : number;
      setBoard(newBoard);
      
      // Check for completeness and validity
      if (isBoardComplete(newBoard)) {
        if (isValidSudoku(newBoard)) {
          setIsComplete(true);
          setErrorMessage('');
        } else {
          setErrorMessage('There are some mistakes in your solution.');
        }
      } else {
        setErrorMessage('');
      }
      
      // Check for validity of current placement
      checkValidity(newBoard, rowIndex, colIndex, number);
    }
  };

  const checkValidity = (board, row, col, num) => {
    const newInvalidCells = [];
    
    // Check if this value causes any conflicts
    if (num !== 0) {
      // Check row
      for (let i = 0; i < 9; i++) {
        if (i !== col && board[row][i] === num) {
          newInvalidCells.push([row, col]);
          break;
        }
      }
      
      // Check column
      for (let i = 0; i < 9; i++) {
        if (i !== row && board[i][col] === num) {
          if (!newInvalidCells.some(([r, c]) => r === row && c === col)) {
            newInvalidCells.push([row, col]);
          }
          break;
        }
      }
      
      // Check 3x3 box
      const boxRow = Math.floor(row / 3) * 3;
      const boxCol = Math.floor(col / 3) * 3;
      
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const r = boxRow + i;
          const c = boxCol + j;
          if (r !== row || c !== col) {
            if (board[r][c] === num) {
              if (!newInvalidCells.some(([r2, c2]) => r2 === row && c2 === col)) {
                newInvalidCells.push([row, col]);
              }
              break;
            }
          }
        }
      }
    }
    
    setInvalidCells(newInvalidCells);
  };

  const handleHint = () => {
    if (!selectedCell) {
      setErrorMessage('Please select a cell first');
      return;
    }
    
    const [rowIndex, colIndex] = selectedCell;
    if (originalBoard[rowIndex][colIndex] !== 0) {
      setErrorMessage('Cannot get hint for prefilled cells');
      return;
    }
    
    const hintValue = solution[rowIndex][colIndex];
    const newBoard = [...board];
    newBoard[rowIndex][colIndex] = hintValue;
    setBoard(newBoard);
    
    // Check for completeness
    if (isBoardComplete(newBoard)) {
      setIsComplete(true);
    }
    
    setInvalidCells(invalidCells.filter(([r, c]) => !(r === rowIndex && c === colIndex)));
  };

  const handleReset = () => {
    setBoard(JSON.parse(JSON.stringify(originalBoard)));
    setSelectedCell(null);
    setSelectedNumber(null);
    setInvalidCells([]);
    setErrorMessage('');
    setIsComplete(false);
  };

  const handleSolve = () => {
    setBoard(JSON.parse(JSON.stringify(solution)));
    setIsComplete(true);
    setErrorMessage('');
    setInvalidCells([]);
  };

  return (
    <Container>
      <Title>Sudoku</Title>
      
      <DifficultySelector>
        <DifficultyButton 
          onClick={() => handleDifficultyChange('easy')}
          isSelected={difficulty === 'easy'}
        >
          Easy
        </DifficultyButton>
        <DifficultyButton 
          onClick={() => handleDifficultyChange('medium')}
          isSelected={difficulty === 'medium'}
        >
          Medium
        </DifficultyButton>
        <DifficultyButton 
          onClick={() => handleDifficultyChange('hard')}
          isSelected={difficulty === 'hard'}
        >
          Hard
        </DifficultyButton>
      </DifficultySelector>
      
      {board.length > 0 && (
        <>
          <GameBoard>
            {board.map((row, rowIndex) => 
              row.map((cell, colIndex) => {
                const isPrefilled = originalBoard[rowIndex][colIndex] !== 0;
                const isSelected = selectedCell && 
                  selectedCell[0] === rowIndex && 
                  selectedCell[1] === colIndex;
                const isInvalid = invalidCells.some(([r, c]) => r === rowIndex && c === colIndex);
                
                return (
                  <Cell 
                    key={`${rowIndex}-${colIndex}`}
                    isPrefilled={isPrefilled}
                    isSelected={isSelected}
                    isInvalid={isInvalid}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    x={colIndex}
                    y={rowIndex}
                  >
                    {cell !== 0 ? cell : ''}
                  </Cell>
                );
              })
            )}
          </GameBoard>
          
          <Controls>
            <NumberSelector>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
                <NumberButton 
                  key={number}
                  onClick={() => handleNumberClick(number)}
                  isSelected={selectedNumber === number}
                >
                  {number}
                </NumberButton>
              ))}
              <NumberButton 
                onClick={() => handleNumberClick(0)}
                isSelected={selectedNumber === 0}
              >
                ✕
              </NumberButton>
            </NumberSelector>
            
            {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
            {isComplete && <SuccessMessage>Congratulations! You've completed the puzzle!</SuccessMessage>}
            
            <ActionButtons>
              <Button onClick={handleHint}>Hint</Button>
              <Button onClick={handleReset}>Reset</Button>
              <Button onClick={newGame}>New Game</Button>
              <Button onClick={handleSolve} primary>Solve</Button>
            </ActionButtons>
          </Controls>
        </>
      )}
    </Container>
  );
};

export default Sudoku; 