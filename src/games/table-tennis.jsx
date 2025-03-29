import React, { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { FaTrophy, FaVolumeUp, FaVolumeMute, FaRedo, FaPlay, FaPause } from 'react-icons/fa';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
  position: relative;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 1rem;
  color: #FF5722;
`;

const GameHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  background-color: #f0f0f0;
  border-radius: 8px;
  
  @media (max-width: 600px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const StatsItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: bold;
  color: #333;
  
  svg {
    color: #FF5722;
  }
`;

const GameArea = styled.div`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background-color: #000;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
  
  canvas {
    display: block;
    background-color: #222;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 1rem 0;
`;

const FreePointButton = styled.button`
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 100;
  background-color: #4CAF50;
  color: white;
  border-radius: 4px;
  padding: 0.5rem;
  font-size: 0.8rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #388E3C;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  background-color: ${props => props.primary ? '#FF5722' : '#f0f0f0'};
  color: ${props => props.primary ? 'white' : '#333'};
  border: 2px solid ${props => props.primary ? '#FF5722' : '#ddd'};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background-color: ${props => props.primary ? '#E64A19' : '#e0e0e0'};
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: default;
  }
`;

const SoundButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 100;
  background-color: #f0f0f0;
  border-radius: 50%;
  padding: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: #666;
  
  &:hover {
    background-color: #e0e0e0;
    color: #FF5722;
  }
`;

const DifficultySelector = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const DifficultyButton = styled.button`
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  background-color: ${props => props.isSelected ? '#FF5722' : '#f0f0f0'};
  color: ${props => props.isSelected ? 'white' : '#333'};
  border: 2px solid ${props => props.isSelected ? '#FF5722' : '#ddd'};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.isSelected ? '#E64A19' : '#e0e0e0'};
  }
`;

const Instructions = styled.div`
  background-color: #f0f0f0;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  
  h3 {
    color: #FF5722;
    margin-bottom: 0.5rem;
  }
  
  ul {
    padding-left: 1.5rem;
  }
  
  li {
    margin-bottom: 0.5rem;
  }
`;

// Game constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;
const PADDLE_HEIGHT = 100;
const PADDLE_WIDTH = 15;
const BALL_RADIUS = 10;
const PADDLE_SPEED = 10;

// Different difficulty settings
const DIFFICULTY_SETTINGS = {
  easy: {
    aiSpeed: 3,
    ballSpeedX: 4,
    ballSpeedY: 4
  },
  medium: {
    aiSpeed: 5,
    ballSpeedX: 6,
    ballSpeedY: 6
  },
  hard: {
    aiSpeed: 8,
    ballSpeedX: 7,
    ballSpeedY: 7
  }
};

// Level speed multipliers
const LEVEL_MULTIPLIERS = [1, 1.2, 1.4, 1.6, 1.8];

const POINTS_TO_WIN = 5;

const TableTennis = () => {
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const contextRef = useRef(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [difficulty, setDifficulty] = useState('easy');
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [pointScored, setPointScored] = useState(false);
  const pointDelayRef = useRef(null);
  
  // Ball speed multiplier to increase speed with each hit
  const speedMultiplierRef = useRef(1);
  const [hitCounter, setHitCounter] = useState(0);
  const MAX_SPEED_MULTIPLIER = 2.5; // Maximum speed multiplier
  
  // Game state
  const playerRef = useRef({
    y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    height: PADDLE_HEIGHT + 20
  });
  
  const aiRef = useRef({
    y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    height: PADDLE_HEIGHT
  });
  
  const ballRef = useRef({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    speedX: DIFFICULTY_SETTINGS[difficulty].ballSpeedX,
    speedY: DIFFICULTY_SETTINGS[difficulty].ballSpeedY,
    radius: BALL_RADIUS
  });
  
  const keysRef = useRef({
    ArrowUp: false,
    ArrowDown: false
  });
  
  // Sound references
  const paddleHitSoundRef = useRef(null);
  const scoreSoundRef = useRef(null);
  const wallHitSoundRef = useRef(null);
  
  // Initialize the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set the canvas dimensions
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    
    // Get the context
    const context = canvas.getContext('2d');
    contextRef.current = context;
    
    // Make the canvas responsive
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (!container) return;
      
      const containerWidth = container.clientWidth;
      const scale = containerWidth / CANVAS_WIDTH;
      
      canvas.style.width = `${containerWidth}px`;
      canvas.style.height = `${CANVAS_HEIGHT * scale}px`;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Initialize sounds
    try {
      paddleHitSoundRef.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-game-ball-tap-2073.mp3');
      scoreSoundRef.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-beep-221.mp3');
      wallHitSoundRef.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-ball-bouncing-in-the-floor-2077.mp3');
      
      paddleHitSoundRef.current.volume = 0.3;
      scoreSoundRef.current.volume = 0.3;
      wallHitSoundRef.current.volume = 0.2;
      
      // Check if there's a saved mute preference
      const savedMuteState = localStorage.getItem('tableTennisSoundMuted');
      if (savedMuteState !== null) {
        setIsMuted(savedMuteState === 'true');
      }
    } catch (error) {
      console.error("Error initializing sounds:", error);
    }
    
    // Initial rendering
    drawGame();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      
      // Clean up animation frame
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);
  
  // Update difficulty settings when difficulty changes
  useEffect(() => {
    ballRef.current.speedX = DIFFICULTY_SETTINGS[difficulty].ballSpeedX * (ballRef.current.speedX < 0 ? -1 : 1);
    ballRef.current.speedY = DIFFICULTY_SETTINGS[difficulty].ballSpeedY * (ballRef.current.speedY < 0 ? -1 : 1);
  }, [difficulty]);
  
  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        // Prevent default browser scrolling behavior
        e.preventDefault();
        keysRef.current[e.key] = true;
      }
    };
    
    const handleKeyUp = (e) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        // Prevent default browser scrolling behavior
        e.preventDefault();
        keysRef.current[e.key] = false;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  
  // Handle touch input for mobile
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const handleTouchMove = (e) => {
      if (!isGameRunning) return;
      
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const scale = CANVAS_HEIGHT / rect.height;
      
      // Calculate touch position relative to canvas
      const touchY = (touch.clientY - rect.top) * scale;
      
      // Move paddle to touch position
      playerRef.current.y = touchY - playerRef.current.height / 2;
      
      // Keep paddle within canvas boundaries
      if (playerRef.current.y < 0) {
        playerRef.current.y = 0;
      }
      if (playerRef.current.y + playerRef.current.height > CANVAS_HEIGHT) {
        playerRef.current.y = CANVAS_HEIGHT - playerRef.current.height;
      }
      
      // Prevent scrolling
      e.preventDefault();
    };
    
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    return () => {
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isGameRunning]);
  
  // Game loop
  useEffect(() => {
    const gameLoop = () => {
      if (!isGameRunning) return;
      
      updateGame();
      drawGame();
      
      requestRef.current = requestAnimationFrame(gameLoop);
    };
    
    if (isGameRunning) {
      requestRef.current = requestAnimationFrame(gameLoop);
    } else if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isGameRunning]);
  
  // Play sound function
  const playSound = (soundRef) => {
    if (isMuted || !soundRef.current) return;
    
    try {
      soundRef.current.currentTime = 0;
      soundRef.current.play().catch(error => {
        console.log('Sound playback prevented:', error);
      });
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };
  
  // Toggle mute function
  const toggleMute = () => {
    setIsMuted(prev => {
      const newState = !prev;
      localStorage.setItem('tableTennisSoundMuted', newState.toString());
      return newState;
    });
  };
  
  // Update game state
  const updateGame = () => {
    if (gameOver || pointScored) return;
    
    // Move player paddle based on key inputs
    if (keysRef.current.ArrowUp) {
      playerRef.current.y = Math.max(0, playerRef.current.y - PADDLE_SPEED);
    }
    if (keysRef.current.ArrowDown) {
      playerRef.current.y = Math.min(CANVAS_HEIGHT - playerRef.current.height, playerRef.current.y + PADDLE_SPEED);
    }
    
    // Move AI paddle towards the ball with some randomness to make it less perfect
    const aiCenter = aiRef.current.y + aiRef.current.height / 2;
    const aiSpeed = DIFFICULTY_SETTINGS[difficulty].aiSpeed;
    
    // Add some randomness to AI movement to make it miss sometimes
    const shouldMove = Math.random() > 0.2; // 20% chance AI won't move
    
    if (shouldMove) {
      if (ballRef.current.y < aiCenter - 15) {
        aiRef.current.y = Math.max(0, aiRef.current.y - aiSpeed);
      } else if (ballRef.current.y > aiCenter + 15) {
        aiRef.current.y = Math.min(CANVAS_HEIGHT - aiRef.current.height, aiRef.current.y + aiSpeed);
      }
    }
    
    // Move the ball
    ballRef.current.x += ballRef.current.speedX;
    ballRef.current.y += ballRef.current.speedY;
    
    // Collision with top/bottom
    if (ballRef.current.y - ballRef.current.radius < 0 || 
        ballRef.current.y + ballRef.current.radius > CANVAS_HEIGHT) {
      ballRef.current.speedY = -ballRef.current.speedY;
      playSound(wallHitSoundRef);
    }
    
    // Collision with player paddle
    if (ballRef.current.x - ballRef.current.radius < PADDLE_WIDTH &&
        ballRef.current.y > playerRef.current.y &&
        ballRef.current.y < playerRef.current.y + playerRef.current.height &&
        ballRef.current.speedX < 0) {
      
      // Calculate angle based on where the ball hits the paddle
      const hitPosition = (ballRef.current.y - (playerRef.current.y + playerRef.current.height / 2)) / (playerRef.current.height / 2);
      
      // Extremely increased angle multiplier from 1.2 to 1.8 for very dramatic angles
      // Math.pow(hitPosition, 3) makes the angle change more dramatically at the corners
      // Maximum angle is now very extreme for corner hits
      const angle = Math.pow(hitPosition, 3) * 1.8;
      
      // Flash the paddle on corner hits for visual feedback
      const isCornerHit = Math.abs(hitPosition) > 0.8;
      
      ballRef.current.speedX = -ballRef.current.speedX;
      ballRef.current.speedY = Math.abs(ballRef.current.speedX) * angle;
      
      // Increase ball speed with each hit
      increaseSpeed();
      
      // Add extra speed boost for corner hits
      if (isCornerHit) {
        ballRef.current.speedX *= 1.1;
        ballRef.current.speedY *= 1.1;
      }
      
      playSound(paddleHitSoundRef);
    }
    
    // Collision with AI paddle
    if (ballRef.current.x + ballRef.current.radius > CANVAS_WIDTH - PADDLE_WIDTH &&
        ballRef.current.y > aiRef.current.y &&
        ballRef.current.y < aiRef.current.y + aiRef.current.height &&
        ballRef.current.speedX > 0) {
      
      // Calculate angle based on where the ball hits the paddle
      const hitPosition = (ballRef.current.y - (aiRef.current.y + aiRef.current.height / 2)) / (aiRef.current.height / 2);
      
      // Extremely increased angle multiplier from 1.2 to 1.8 for very dramatic angles
      // Math.pow(hitPosition, 3) makes the angle change more dramatically at the corners
      // Maximum angle is now very extreme for corner hits
      const angle = Math.pow(hitPosition, 3) * 1.8;
      
      // Flash the paddle on corner hits for visual feedback
      const isCornerHit = Math.abs(hitPosition) > 0.8;
      
      ballRef.current.speedX = -ballRef.current.speedX;
      ballRef.current.speedY = Math.abs(ballRef.current.speedX) * angle;
      
      // Increase ball speed with each hit
      increaseSpeed();
      
      // Add extra speed boost for corner hits
      if (isCornerHit) {
        ballRef.current.speedX *= 1.1;
        ballRef.current.speedY *= 1.1;
      }
      
      playSound(paddleHitSoundRef);
    }
    
    // Ball out of bounds - scoring
    if (ballRef.current.x < 0) {
      handleScoring('AI');
    } else if (ballRef.current.x > CANVAS_WIDTH) {
      handleScoring('Player');
    }
  };
  
  // Increase ball speed with each hit
  const increaseSpeed = () => {
    // Increase hit counter
    const newHitCount = hitCounter + 1;
    setHitCounter(newHitCount);
    
    // Calculate new speed multiplier (increases more slowly as hits accumulate)
    const newMultiplier = Math.min(1 + (newHitCount * 0.1), MAX_SPEED_MULTIPLIER);
    speedMultiplierRef.current = newMultiplier;
    
    // Apply multiplier to ball speed (preserving direction)
    const baseSpeedX = DIFFICULTY_SETTINGS[difficulty].ballSpeedX;
    const newSpeedX = baseSpeedX * newMultiplier;
    
    // Preserve direction but update magnitude
    ballRef.current.speedX = ballRef.current.speedX > 0 
      ? newSpeedX 
      : -newSpeedX;
  };
  
  // New function to handle scoring
  const handleScoring = (scorer) => {
    // Pause the game briefly
    setPointScored(true);
    
    // Play sound
    playSound(scoreSoundRef);
    
    // Do NOT reset ball speed multiplier when point is scored
    // Keep the current speed multiplier to maintain increasing difficulty
    // speedMultiplierRef.current = 1;
    // setHitCounter(0);
    
    // Update scores
    if (scorer === 'AI') {
      setAiScore(prev => {
        const newScore = prev + 1;
        
        // Check for game over
        if (newScore >= POINTS_TO_WIN) {
          setGameOver(true);
          setWinner('AI');
          setIsGameRunning(false);
        }
        
        return newScore;
      });
    } else {
      setPlayerScore(prev => {
        const newScore = prev + 1;
        
        // Check for game over
        if (newScore >= POINTS_TO_WIN) {
          setGameOver(true);
          setWinner('Player');
          setIsGameRunning(false);
        }
        
        return newScore;
      });
    }
    
    // Reset ball position immediately
    ballRef.current.x = CANVAS_WIDTH / 2;
    ballRef.current.y = CANVAS_HEIGHT / 2;
    
    // Get the total score to determine level
    const totalScore = playerScore + aiScore;
    // Use the level to get a speed multiplier (max index is POINTS_TO_WIN - 1)
    const levelIndex = Math.min(totalScore, POINTS_TO_WIN - 1);
    const levelMultiplier = LEVEL_MULTIPLIERS[levelIndex];
    
    // Set ball direction based on who scored and apply level multiplier
    if (scorer === 'AI') {
      ballRef.current.speedX = -DIFFICULTY_SETTINGS[difficulty].ballSpeedX * levelMultiplier;
    } else {
      ballRef.current.speedX = DIFFICULTY_SETTINGS[difficulty].ballSpeedX * levelMultiplier;
    }
    
    // Add some randomness to Y speed but also increase with level
    ballRef.current.speedY = DIFFICULTY_SETTINGS[difficulty].ballSpeedY * levelMultiplier * (Math.random() * 2 - 1);
    
    // Clear any existing timeout
    if (pointDelayRef.current) {
      clearTimeout(pointDelayRef.current);
    }
    
    // Resume game after a short delay (1 second)
    pointDelayRef.current = setTimeout(() => {
      if (!gameOver) {
        setPointScored(false);
      }
    }, 1000);
  };
  
  // Clean up timeout when component unmounts
  useEffect(() => {
    return () => {
      if (pointDelayRef.current) {
        clearTimeout(pointDelayRef.current);
      }
    };
  }, []);
  
  // Draw the game
  const drawGame = () => {
    if (!contextRef.current) return;
    
    const ctx = contextRef.current;
    
    // Clear canvas
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw net
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 0);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw player paddle
    ctx.fillStyle = '#FF5722';
    ctx.fillRect(0, playerRef.current.y, PADDLE_WIDTH, playerRef.current.height);
    
    // Draw AI paddle
    ctx.fillStyle = '#2196F3';
    ctx.fillRect(CANVAS_WIDTH - PADDLE_WIDTH, aiRef.current.y, PADDLE_WIDTH, aiRef.current.height);
    
    // Draw ball
    ctx.beginPath();
    ctx.arc(ballRef.current.x, ballRef.current.y, ballRef.current.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.closePath();
    
    // Draw scores only if they're not zero
    ctx.font = '48px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    
    // Only show scores if they're not zero
    if (playerScore > 0) {
      ctx.fillText(playerScore.toString(), CANVAS_WIDTH / 4, 60);
    }
    
    if (aiScore > 0) {
      ctx.fillText(aiScore.toString(), CANVAS_WIDTH * 3 / 4, 60);
    }
  };
  
  // Start or pause the game
  const toggleGame = () => {
    setIsGameRunning(prev => !prev);
  };
  
  // Reset the game
  const resetGame = () => {
    // Clear any pending point delay
    if (pointDelayRef.current) {
      clearTimeout(pointDelayRef.current);
    }
    
    setPlayerScore(0);
    setAiScore(0);
    setGameOver(false);
    setWinner(null);
    setPointScored(false);
    setHitCounter(0);
    speedMultiplierRef.current = 1;
    
    playerRef.current.y = CANVAS_HEIGHT / 2 - playerRef.current.height / 2;
    aiRef.current.y = CANVAS_HEIGHT / 2 - aiRef.current.height / 2;
    
    ballRef.current.x = CANVAS_WIDTH / 2;
    ballRef.current.y = CANVAS_HEIGHT / 2;
    ballRef.current.speedX = DIFFICULTY_SETTINGS[difficulty].ballSpeedX;
    ballRef.current.speedY = DIFFICULTY_SETTINGS[difficulty].ballSpeedY;
    
    drawGame();
    
    // If game was running before game over, start it again
    if (!isGameRunning) {
      setIsGameRunning(true);
    }
  };
  
  // Change difficulty
  const changeDifficulty = (newDifficulty) => {
    setDifficulty(newDifficulty);
    resetGame();
  };
  
  return (
    <Container>
      <Title>Table Tennis</Title>
      
      <SoundButton onClick={toggleMute} title={isMuted ? "Unmute Sounds" : "Mute Sounds"}>
        {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
      </SoundButton>
      
      {/* Only show difficulty selector when game is not running */}
      {!isGameRunning && (
        <DifficultySelector>
          <DifficultyButton 
            onClick={() => changeDifficulty('easy')}
            isSelected={difficulty === 'easy'}
          >
            Easy
          </DifficultyButton>
          <DifficultyButton 
            onClick={() => changeDifficulty('medium')}
            isSelected={difficulty === 'medium'}
          >
            Medium
          </DifficultyButton>
          <DifficultyButton 
            onClick={() => changeDifficulty('hard')}
            isSelected={difficulty === 'hard'}
          >
            Hard
          </DifficultyButton>
        </DifficultySelector>
      )}
      
      <GameHeader>
        <StatsItem>
          <FaTrophy /> Player: {playerScore > 0 ? playerScore : '-'}
        </StatsItem>
        <StatsItem>
          <FaTrophy /> AI: {aiScore > 0 ? aiScore : '-'}
        </StatsItem>
        {hitCounter > 0 && (
          <StatsItem style={{ color: '#FF5722' }}>
            Hits: {hitCounter} | Speed: {Math.round(speedMultiplierRef.current * 100)}%
          </StatsItem>
        )}
      </GameHeader>
      
      {gameOver && (
        <div style={{
          textAlign: 'center',
          margin: '1rem 0',
          padding: '1rem',
          backgroundColor: winner === 'Player' ? '#4CAF50' : '#F44336',
          color: 'white',
          borderRadius: '8px',
          fontWeight: 'bold',
          fontSize: '1.2rem'
        }}>
          {winner === 'Player' ? 'You Won!' : 'AI Won!'} First to {POINTS_TO_WIN} points!
        </div>
      )}
      
      <GameArea>
        <canvas 
          ref={canvasRef} 
          tabIndex={0}
        />
      </GameArea>
      
      <ButtonContainer>
        <Button onClick={toggleGame} primary disabled={gameOver}>
          {isGameRunning ? <><FaPause /> Pause</> : <><FaPlay /> Start</>}
        </Button>
        <Button onClick={resetGame}>
          <FaRedo /> {gameOver ? "Play Again" : "Reset"}
        </Button>
      </ButtonContainer>
      
      <Instructions>
        <h3>How to Play:</h3>
        <ul>
          <li>Use the <strong>Up</strong> and <strong>Down</strong> arrow keys to move your paddle.</li>
          <li>On mobile devices, touch and drag on the game area to control your paddle.</li>
          <li>Try to hit the ball past your opponent's paddle to score a point.</li>
          <li>The angle the ball bounces depends on where it hits your paddle.</li>
          <li>Each hit makes the ball move faster! Be ready for increasing challenge.</li>
          <li>First to score {POINTS_TO_WIN} points wins the game!</li>
        </ul>
      </Instructions>
    </Container>
  );
};

export default TableTennis; 