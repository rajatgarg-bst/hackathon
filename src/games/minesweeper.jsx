import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from '@emotion/styled';
import { FaBomb, FaFlag, FaRegClock, FaSmile, FaSadTear, FaGrinStars, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  position: relative;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 2rem;
  color: #673AB7;
`;

const Controls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.5rem 1rem;
  background-color: #f0f0f0;
  border-radius: 8px;
  border: 2px solid #ddd;
`;

const StatusDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.2rem;
  font-weight: bold;
  color: ${props => props.color || '#333'};
`;

const IconButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.isActive ? '#673AB7' : '#666'};
  
  &:hover {
    color: #673AB7;
  }
`;

const GameBoard = styled.div`
  display: grid;
  grid-template-columns: repeat(${props => props.cols}, 1fr);
  gap: 1px;
  background-color: #ddd;
  padding: 2px;
  border: 2px solid #aaa;
  width: fit-content;
  margin: 0 auto;
`;

const Cell = styled.div`
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => 
    props.isRevealed 
      ? (props.isMine && props.isExploded ? '#ff4d4d' : '#f0f0f0') 
      : '#ccc'};
  border: ${props => 
    props.isRevealed 
      ? '1px solid #ddd' 
      : '1px solid #aaa'};
  cursor: pointer;
  font-weight: bold;
  user-select: none;
  position: relative;
  color: ${props => {
    if (props.count === 1) return 'blue';
    if (props.count === 2) return 'green';
    if (props.count === 3) return 'red';
    if (props.count === 4) return 'purple';
    if (props.count === 5) return 'maroon';
    if (props.count === 6) return 'turquoise';
    if (props.count === 7) return 'black';
    if (props.count === 8) return 'gray';
    return 'black';
  }};

  &:hover {
    background-color: ${props => props.isRevealed ? (props.isMine && props.isExploded ? '#ff4d4d' : '#f0f0f0') : '#bbb'};
  }
`;

const DifficultySelector = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const DifficultyButton = styled.button`
  padding: 0.5rem 1rem;
  font-size: 1rem;
  background-color: ${props => props.isSelected ? '#673AB7' : '#f0f0f0'};
  color: ${props => props.isSelected ? 'white' : '#333'};
  border: 2px solid ${props => props.isSelected ? '#673AB7' : '#ddd'};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.isSelected ? '#5e35b1' : '#e0e0e0'};
  }
`;

const GameInfo = styled.div`
  margin-top: 2rem;
  text-align: center;
  font-size: 1.2rem;
  color: ${props => props.isWin ? 'green' : props.isLost ? 'red' : '#673AB7'};
  font-weight: bold;
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  background-color: ${props => props.primary ? '#673AB7' : '#f0f0f0'};
  color: ${props => props.primary ? 'white' : '#333'};
  border: 2px solid ${props => props.primary ? '#673AB7' : '#ddd'};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.primary ? '#5e35b1' : '#e0e0e0'};
  }
`;

const SoundButton = styled(IconButton)`
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 100;
  background-color: #f0f0f0;
  border-radius: 50%;
  padding: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const difficulties = {
  easy: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard: { rows: 16, cols: 30, mines: 99 }
};

const Minesweeper = () => {
  const [difficulty, setDifficulty] = useState('easy');
  const [board, setBoard] = useState([]);
  const [gameState, setGameState] = useState('ready'); // ready, playing, won, lost
  const [minesLeft, setMinesLeft] = useState(0);
  const [flagMode, setFlagMode] = useState(false);
  const [time, setTime] = useState(0);
  const timerRef = useRef(null);
  const [config, setConfig] = useState(difficulties.easy);
  const [isMuted, setIsMuted] = useState(false);
  
  // Audio refs
  const clickSoundRef = useRef(null);
  const flagSoundRef = useRef(null);
  const explosionSoundRef = useRef(null);
  const winSoundRef = useRef(null);

  // Initialize sounds
  useEffect(() => {
    try {
      // Create audio elements with more reliable URLs
      clickSoundRef.current = new Audio('https://www.soundjay.com/buttons/sounds/button-09.mp3');
      flagSoundRef.current = new Audio('https://www.soundjay.com/buttons/sounds/button-10.mp3');
      explosionSoundRef.current = new Audio('https://www.soundjay.com/mechanical/sounds/explosion-01.mp3');
      winSoundRef.current = new Audio('https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3');
      
      // Preload sounds
      clickSoundRef.current.load();
      flagSoundRef.current.load();
      explosionSoundRef.current.load();
      winSoundRef.current.load();
      
      // Set volumes
      clickSoundRef.current.volume = 0.3;
      flagSoundRef.current.volume = 0.3;
      explosionSoundRef.current.volume = 0.5;
      winSoundRef.current.volume = 0.5;
      
      // Check if there's a saved mute preference
      const savedMuteState = localStorage.getItem('minesweeperSoundMuted');
      if (savedMuteState !== null) {
        setIsMuted(savedMuteState === 'true');
      }
    } catch (error) {
      console.error("Error initializing sounds:", error);
    }
    
    // Cleanup
    return () => {
      [clickSoundRef, flagSoundRef, explosionSoundRef, winSoundRef].forEach(ref => {
        if (ref.current) {
          ref.current.pause();
          ref.current.currentTime = 0;
        }
      });
    };
  }, []);

  // Play sound function
  const playSound = useCallback((soundRef) => {
    if (isMuted || !soundRef.current) return;
    
    try {
      // Reset sound to beginning if it's already playing
      soundRef.current.pause();
      soundRef.current.currentTime = 0;
      
      // Play with proper error handling
      const playPromise = soundRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          // Handle autoplay policy errors gracefully
          console.log('Sound playback prevented:', error);
        });
      }
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  }, [isMuted]);

  // Toggle mute function
  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newState = !prev;
      localStorage.setItem('minesweeperSoundMuted', newState.toString());
      return newState;
    });
  }, []);

  // Initialize the game board
  const initializeBoard = useCallback(() => {
    const { rows, cols, mines } = config;
    const newBoard = Array(rows).fill().map(() => 
      Array(cols).fill().map(() => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        isExploded: false,
        count: 0
      }))
    );
    
    // Place mines randomly
    let minesPlaced = 0;
    while (minesPlaced < mines) {
      const row = Math.floor(Math.random() * rows);
      const col = Math.floor(Math.random() * cols);
      
      if (!newBoard[row][col].isMine) {
        newBoard[row][col].isMine = true;
        minesPlaced++;
      }
    }
    
    // Calculate adjacent mines
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (newBoard[row][col].isMine) continue;
        
        // Check all 8 adjacent cells
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            
            const r = row + dr;
            const c = col + dc;
            
            if (r >= 0 && r < rows && c >= 0 && c < cols && newBoard[r][c].isMine) {
              count++;
            }
          }
        }
        
        newBoard[row][col].count = count;
      }
    }
    
    setBoard(newBoard);
    setMinesLeft(mines);
    setGameState('ready');
    setTime(0);
    
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [config]);

  // Handle difficulty change
  const handleDifficultyChange = (newDifficulty) => {
    setDifficulty(newDifficulty);
    setConfig(difficulties[newDifficulty]);
    setGameState('ready');
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTime(0);
  };

  // Start the timer
  const startTimer = useCallback(() => {
    if (timerRef.current) return;
    
    timerRef.current = setInterval(() => {
      setTime(prevTime => prevTime + 1);
    }, 1000);
  }, []);

  // Stop the timer
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Initialize game when difficulty changes
  useEffect(() => {
    initializeBoard();
    
    // Clean up timer on component unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [difficulty, initializeBoard]);

  // Handle cell click (reveal) with sound
  const handleCellClick = (rowIndex, colIndex) => {
    // Start timer on first click
    if (gameState === 'ready') {
      setGameState('playing');
      startTimer();
    }
    
    // Do nothing if game over or cell is already revealed
    if (gameState === 'won' || gameState === 'lost' || board[rowIndex][colIndex].isRevealed) {
      return;
    }
    
    // Toggle flag if in flag mode
    if (flagMode) {
      handleRightClick(rowIndex, colIndex);
      return;
    }
    
    // Don't reveal flagged cells with left click
    if (board[rowIndex][colIndex].isFlagged) {
      return;
    }
    
    const newBoard = [...board];
    
    // If clicking on a mine, game over
    if (newBoard[rowIndex][colIndex].isMine) {
      newBoard[rowIndex][colIndex].isExploded = true;
      revealAllMines(newBoard);
      setBoard(newBoard);
      setGameState('lost');
      stopTimer();
      playSound(explosionSoundRef);
      return;
    }
    
    // Reveal the clicked cell and adjacent empty cells recursively
    revealCell(newBoard, rowIndex, colIndex);
    setBoard(newBoard);
    playSound(clickSoundRef);
    
    // Check for win condition
    if (checkWinCondition(newBoard)) {
      setGameState('won');
      flagAllMines(newBoard);
      setBoard(newBoard);
      setMinesLeft(0);
      stopTimer();
      playSound(winSoundRef);
    }
  };

  // Handle right click (flag) with sound
  const handleRightClick = (rowIndex, colIndex) => {
    // Prevent context menu when called from event
    if (typeof event !== 'undefined') {
      event.preventDefault();
    }
    
    // Do nothing if game over or cell is already revealed
    if (gameState === 'won' || gameState === 'lost' || board[rowIndex][colIndex].isRevealed) {
      return;
    }
    
    // Start timer on first flag
    if (gameState === 'ready') {
      setGameState('playing');
      startTimer();
    }
    
    const newBoard = [...board];
    newBoard[rowIndex][colIndex].isFlagged = !newBoard[rowIndex][colIndex].isFlagged;
    setBoard(newBoard);
    playSound(flagSoundRef);
    
    // Update mines left counter
    if (newBoard[rowIndex][colIndex].isFlagged) {
      setMinesLeft(prevMinesLeft => prevMinesLeft - 1);
    } else {
      setMinesLeft(prevMinesLeft => prevMinesLeft + 1);
    }
  };

  // Reveal cell and adjacent empty cells recursively
  const revealCell = (board, rowIndex, colIndex) => {
    // Base case: out of bounds, already revealed, or flagged
    if (
      rowIndex < 0 || 
      rowIndex >= config.rows || 
      colIndex < 0 || 
      colIndex >= config.cols || 
      board[rowIndex][colIndex].isRevealed || 
      board[rowIndex][colIndex].isFlagged
    ) {
      return;
    }
    
    // Reveal this cell
    board[rowIndex][colIndex].isRevealed = true;
    
    // If it's a mine, don't continue (though this shouldn't happen in this function)
    if (board[rowIndex][colIndex].isMine) {
      return;
    }
    
    // If it's an empty cell (no adjacent mines), reveal adjacent cells
    if (board[rowIndex][colIndex].count === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          revealCell(board, rowIndex + dr, colIndex + dc);
        }
      }
    }
  };

  // Reveal all mines when the game is lost
  const revealAllMines = (board) => {
    for (let row = 0; row < config.rows; row++) {
      for (let col = 0; col < config.cols; col++) {
        if (board[row][col].isMine) {
          board[row][col].isRevealed = true;
        }
      }
    }
  };

  // Flag all mines when the game is won
  const flagAllMines = (board) => {
    for (let row = 0; row < config.rows; row++) {
      for (let col = 0; col < config.cols; col++) {
        if (board[row][col].isMine) {
          board[row][col].isFlagged = true;
        }
      }
    }
  };

  // Check if the player has won
  const checkWinCondition = (board) => {
    for (let row = 0; row < config.rows; row++) {
      for (let col = 0; col < config.cols; col++) {
        // If there's any non-mine cell that is not revealed, player hasn't won yet
        if (!board[row][col].isMine && !board[row][col].isRevealed) {
          return false;
        }
      }
    }
    return true;
  };

  // Reset the game
  const resetGame = () => {
    initializeBoard();
  };

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Get face icon based on game state
  const getFaceIcon = () => {
    if (gameState === 'won') return <FaGrinStars size={24} />;
    if (gameState === 'lost') return <FaSadTear size={24} />;
    return <FaSmile size={24} />;
  };

  return (
    <Container>
      <Title>Minesweeper</Title>
      
      <SoundButton 
        onClick={toggleMute}
        title={isMuted ? "Unmute Sounds" : "Mute Sounds"}
      >
        {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
      </SoundButton>
      
      <DifficultySelector>
        <DifficultyButton 
          onClick={() => handleDifficultyChange('easy')}
          isSelected={difficulty === 'easy'}
        >
          Easy (9x9)
        </DifficultyButton>
        <DifficultyButton 
          onClick={() => handleDifficultyChange('medium')}
          isSelected={difficulty === 'medium'}
        >
          Medium (16x16)
        </DifficultyButton>
        <DifficultyButton 
          onClick={() => handleDifficultyChange('hard')}
          isSelected={difficulty === 'hard'}
        >
          Hard (16x30)
        </DifficultyButton>
      </DifficultySelector>
      
      <Controls>
        <StatusDisplay color="#f44336">
          <FaBomb /> {minesLeft}
        </StatusDisplay>
        
        <IconButton onClick={resetGame}>
          {getFaceIcon()}
        </IconButton>
        
        <StatusDisplay>
          <FaRegClock /> {formatTime(time)}
        </StatusDisplay>
      </Controls>
      
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
        <IconButton 
          onClick={() => setFlagMode(!flagMode)}
          isActive={flagMode}
          title={flagMode ? "Flag Mode Active (Click to toggle)" : "Reveal Mode Active (Click to toggle)"}
        >
          <FaFlag />
        </IconButton>
      </div>
      
      <GameBoard cols={config.cols}>
        {board.map((row, rowIndex) => 
          row.map((cell, colIndex) => (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              isRevealed={cell.isRevealed}
              isMine={cell.isMine}
              isFlagged={cell.isFlagged}
              isExploded={cell.isExploded}
              count={cell.count}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              onContextMenu={(e) => handleRightClick(rowIndex, colIndex, e)}
            >
              {cell.isRevealed ? (
                cell.isMine ? (
                  <FaBomb />
                ) : (
                  cell.count > 0 ? cell.count : ''
                )
              ) : cell.isFlagged ? (
                <FaFlag style={{ color: 'red' }} />
              ) : ''}
            </Cell>
          ))
        )}
      </GameBoard>
      
      {(gameState === 'won' || gameState === 'lost') && (
        <GameInfo isWin={gameState === 'won'} isLost={gameState === 'lost'}>
          {gameState === 'won' 
            ? `Congratulations! You've found all mines in ${formatTime(time)}!` 
            : 'Game Over! You hit a mine.'}
        </GameInfo>
      )}
      
      <ActionButtons>
        <Button onClick={resetGame}>New Game</Button>
      </ActionButtons>
    </Container>
  );
};

export default Minesweeper; 