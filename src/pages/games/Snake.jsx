import { useState, useEffect, useCallback, useRef } from "react";
import styled from "@emotion/styled";
import GameWrapper from "../../components/GameContainer";
import { motion, AnimatePresence } from "framer-motion";
import { useGameSounds } from "../../utils/sound";

const GameContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  background: ${props => props.theme.colors.background};
  position: relative;
  overflow: hidden;

  @media (max-width: 480px) {
    padding: 0;
    height: 100dvh;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
`;

const GameArea = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
  background: linear-gradient(135deg, ${props => props.theme.colors.background} 0%, ${props => props.theme.colors.primary} 100%);
  padding: ${props => props.theme.spacing.xl};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;

  @media (max-width: 768px) {
    padding: ${props => props.theme.spacing.md};
    max-width: none;
    width: 100%;
  }

  @media (max-width: 480px) {
    padding: ${props => props.theme.spacing.sm};
    padding-bottom: calc(${props => props.theme.spacing.xl} * 6);
    border-radius: 0;
    margin: 0;
    height: 100%;
    width: 100%;
    max-width: none;
    justify-content: flex-start;
    overflow-x: hidden;
    box-shadow: none;
  }
`;

const Board = styled.div`
  display: grid;
  grid-template-columns: repeat(20, 1fr);
  gap: 2px;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.secondary} 100%);
  padding: 4px;
  margin: ${props => props.theme.spacing.md} auto;
  width: min(400px, 85vw);
  height: min(400px, 85vw);
  border-radius: ${props => props.theme.borderRadius.lg};
  position: relative;
  touch-action: none;
  box-shadow: 
    0 5px 15px rgba(0, 0, 0, 0.2),
    inset 0 0 20px rgba(0, 0, 0, 0.1);
  border: 4px solid ${props => props.theme.colors.secondary};
  overflow: hidden;

  @media (orientation: portrait) and (max-width: 480px) {
    width: 90vw;
    height: 90vw;
    margin: ${props => props.theme.spacing.sm} auto;
    gap: 1px;
    padding: 2px;
  }

  @media (orientation: landscape) and (max-height: 600px) {
    width: min(220px, 45vh);
    height: min(220px, 45vh);
    margin: ${props => props.theme.spacing.xs} auto;
  }
`;

const SnakeHead = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;

  .eye {
    position: absolute;
    width: 20%;
    height: 20%;
    background-color: #000;
    border-radius: 50%;
    top: 35%;
  }

  .eye.left {
    left: 25%;
  }

  .eye.right {
    right: 25%;
  }

  .nose {
    position: absolute;
    width: 15%;
    height: 15%;
    background-color: #FFA500;
    border-radius: 50%;
    top: 45%;
    left: 42.5%;
  }

  .mouth {
    position: absolute;
    width: 40%;
    height: 20%;
    background-color: #000;
    border-radius: 0 0 50% 50%;
    top: 75%;
    left: 30%;
  }
`;

const Cell = styled(motion.div)`
  background-color: ${(props) => {
    if (props.isSnake) {
      if (props.isHead) return props.theme.colors.success;
      return props.theme.colors.secondary;
    }
    if (props.isFood) return "#FF0000";
    if (props.isObstacle) return props.theme.colors.warning;
    return props.theme.colors.white;
  }};
  border-radius: ${(props) => props.isSnake 
    ? props.isHead 
      ? "50% 50% 0 0"
      : props.isTail 
        ? "0 0 50% 50%"
        : "0"
    : props.theme.borderRadius.sm};
  position: relative;
  overflow: hidden;
  transition: all 0.2s ease;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.1);

  ${props => props.isSnake && `
    box-shadow: 
      0 0 10px rgba(0, 0, 0, 0.2),
      inset 0 0 15px rgba(0, 0, 0, 0.1);
    transform: scale(0.95);
    &:hover {
      transform: scale(1);
    }
  `}

  ${props => props.isFood && `
    background: radial-gradient(circle at center, #FF0000 0%, #CC0000 100%);
    box-shadow: 
      0 0 20px rgba(255, 0, 0, 0.5),
      inset 0 0 15px rgba(255, 0, 0, 0.3);
    animation: pulse 1s infinite;
    
    &::before {
      content: "🍎";
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 1.5em;
      z-index: 1;
      animation: float 2s ease-in-out infinite;
      filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.3));
    }
    
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }

    @keyframes float {
      0% { transform: translate(-50%, -50%) rotate(0deg); }
      50% { transform: translate(-50%, -50%) rotate(10deg); }
      100% { transform: translate(-50%, -50%) rotate(0deg); }
    }
  `}

  ${props => props.isObstacle && `
    background: linear-gradient(45deg, ${props.theme.colors.warning}, ${props.theme.colors.danger});
    box-shadow: 
      0 0 15px rgba(255, 165, 0, 0.3),
      inset 0 0 10px rgba(255, 165, 0, 0.2);
    &::before {
      content: "⚠️";
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 1.2em;
      z-index: 1;
      filter: drop-shadow(0 0 3px rgba(0, 0, 0, 0.3));
    }
  `}

  ${props => !props.isSnake && !props.isFood && !props.isObstacle && `
    background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%);
    &:hover {
      background: linear-gradient(135deg, #f0f0f0 0%, #ffffff 100%);
    }
  `}
`;

const Score = styled.div`
  font-size: clamp(1.2rem, 3vw, 2rem);
  font-weight: bold;
  color: ${props => props.theme.colors.white};
  margin-bottom: ${props => props.theme.spacing.sm};
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  background: linear-gradient(45deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  width: 100%;
  max-width: 400px;

  @media (max-width: 480px) {
    margin-bottom: ${props => props.theme.spacing.xs};
    width: 95%;
    border-radius: ${props => props.theme.borderRadius.sm};
  }
`;

const HighScore = styled.div`
  font-size: clamp(1rem, 2.5vw, 1.5rem);
  color: ${props => props.theme.colors.white};
  margin-bottom: ${props => props.theme.spacing.md};
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
  background: rgba(255, 255, 255, 0.1);
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  width: 100%;
  max-width: 400px;

  @media (max-width: 480px) {
    margin-bottom: ${props => props.theme.spacing.sm};
    width: 95%;
    border-radius: ${props => props.theme.borderRadius.sm};
  }
`;

const PowerUpIndicator = styled.div`
  display: flex;
  justify-content: center;
  gap: ${(props) => props.theme.spacing.sm};
  margin-bottom: ${(props) => props.theme.spacing.md};
`;

const PowerUpBadge = styled(motion.div)`
  background-color: ${(props) => props.theme.colors.accent};
  color: ${(props) => props.theme.colors.white};
  padding: ${(props) => props.theme.spacing.xs}
    ${(props) => props.theme.spacing.sm};
  border-radius: ${(props) => props.theme.borderRadius.sm};
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.xs};
`;

const Controls = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.md};
  flex-wrap: wrap;
  width: 100%;
  max-width: 500px;
  padding: 0 ${props => props.theme.spacing.sm};

  @media (max-width: 480px) {
    gap: ${props => props.theme.spacing.xs};
    margin-top: ${props => props.theme.spacing.sm};
    padding-bottom: ${props => props.theme.spacing.xl};
    position: relative;
    z-index: 1100;
  }
`;

const Button = styled.button`
  background: linear-gradient(45deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
  color: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: clamp(0.9rem, 2.5vw, 1.1rem);
  border: none;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: bold;
  white-space: nowrap;
  transition: all 0.2s ease;

  @media (max-width: 480px) {
    padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
    font-size: 0.9rem;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

const DifficultySelect = styled.select`
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.sm};
  border: 2px solid ${props => props.theme.colors.primary};
  font-size: clamp(0.9rem, 2.5vw, 1rem);
  cursor: pointer;
  background: ${props => props.theme.colors.white};
  color: ${props => props.theme.colors.primary};
  font-weight: bold;
  transition: all 0.2s ease;

  @media (max-width: 480px) {
    padding: ${props => props.theme.spacing.xs};
    font-size: 0.9rem;
  }

  &:hover {
    border-color: ${props => props.theme.colors.secondary};
  }
`;

const MobileControls = styled.div`
  display: none;
  grid-template-columns: repeat(3, 1fr);
  gap: ${props => props.theme.spacing.sm};
  width: min(250px, 80vw);
  margin: 0 auto;

  @media (max-width: 768px) {
    display: grid;
  }

  @media (orientation: portrait) and (max-width: 480px) {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    background: rgba(0, 0, 0, 0.95);
    padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.sm};
    padding-bottom: max(${props => props.theme.spacing.xl}, env(safe-area-inset-bottom, 20px));
    border-radius: ${props => props.theme.borderRadius.xl} ${props => props.theme.borderRadius.xl} 0 0;
    backdrop-filter: blur(10px);
    z-index: 1000;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(2, 1fr);
    gap: ${props => props.theme.spacing.sm};
    max-width: 100%;
    box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.3);
  }

  @media (orientation: landscape) and (max-height: 600px) {
    position: fixed;
    bottom: ${props => props.theme.spacing.md};
    right: ${props => props.theme.spacing.md};
    width: 130px;
    background: rgba(0, 0, 0, 0.95);
    padding: ${props => props.theme.spacing.sm};
    border-radius: ${props => props.theme.borderRadius.lg};
    gap: ${props => props.theme.spacing.xs};
    grid-template-rows: repeat(2, 1fr);
  }
`;

const MobileButton = styled.button`
  background: linear-gradient(45deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
  color: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: clamp(1.2rem, 4vw, 1.8rem);
  border: none;
  cursor: pointer;
  touch-action: manipulation;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
  width: 100%;
  height: 100%;
  min-height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (orientation: portrait) and (max-width: 480px) {
    height: 48px;
    font-size: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  @media (orientation: landscape) and (max-height: 600px) {
    height: 38px;
    font-size: 1.3rem;
    min-height: 38px;
  }

  &:active {
    transform: scale(0.95);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    background: linear-gradient(45deg, ${props => props.theme.colors.secondary}, ${props => props.theme.colors.primary});
  }
`;

const MuteButton = styled.button`
  background: linear-gradient(45deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
  color: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: clamp(1.2rem, 3vw, 1.5rem);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);

  @media (max-width: 480px) {
    width: 35px;
    height: 35px;
    padding: ${props => props.theme.spacing.xs};
    font-size: 1.2rem;
  }

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }
`;

const GRID_SIZE = 20;
const INITIAL_SNAKE = [
  [0, 0], // head
  [0, 1],
  [0, 2],
  [0, 3],
  [0, 4]  // tail
];
const INITIAL_DIRECTION = "RIGHT";

// Define static obstacles with fixed positions - more spread out
const STATIC_OBSTACLES = [
  // Corner obstacles
  [0, 0], [0, 1], [0, 2], [0, 3],
  [19, 0], [19, 1], [19, 2], [19, 3],
  [0, 19], [1, 19], [2, 19], [3, 19],
  [19, 19], [18, 19], [17, 19], [16, 19],
  
  // Center obstacles - more spread out
  [10, 10], [10, 11],
  [11, 10], [11, 11],
  
  // Mid-section obstacles
  [5, 5], [5, 6],
  [6, 5], [6, 6],
  
  [15, 5], [15, 6],
  [16, 5], [16, 6],
  
  [5, 15], [5, 16],
  [6, 15], [6, 16],
  
  [15, 15], [15, 16],
  [16, 15], [16, 16]
];

// Change initial food position to a safe location
const INITIAL_FOOD = [2, 2]; // This position is not on any hurdle

const DIFFICULTY_SETTINGS = {
  easy: { speed: 200, points: 10 },
  medium: { speed: 150, points: 15 },
  hard: { speed: 100, points: 20 },
};

const Snake = () => {
  const { playClick, playMove, playEat, playLose, toggleSound, getSoundEnabled } = useGameSounds();
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState(INITIAL_FOOD);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(200);
  const [isPaused, setIsPaused] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem("snakeHighScore");
    return saved ? parseInt(saved) : 0;
  });
  const [difficulty, setDifficulty] = useState("easy");
  const gameLoopRef = useRef(null);

  useEffect(() => {
    const savedHighScore = localStorage.getItem("snakeHighScore");
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, []);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem("snakeHighScore", score.toString());
    }
  }, [score, highScore]);

  const generateFood = useCallback(() => {
    let newFood;
    let attempts = 0;
    const maxAttempts = 100; // Prevent infinite loop

    do {
      newFood = [
        Math.floor(Math.random() * GRID_SIZE),
        Math.floor(Math.random() * GRID_SIZE),
      ];
      attempts++;

      // Check if food is on snake
      const isOnSnake = snake.some(segment => segment[0] === newFood[0] && segment[1] === newFood[1]);
      
      // Check if food is on obstacle
      const isOnObstacle = STATIC_OBSTACLES.some(obs => obs[0] === newFood[0] && obs[1] === newFood[1]);
      
      // Check if food is accessible (not surrounded by obstacles)
      const isAccessible = checkFoodAccessibility(newFood);
      
      if (!isOnSnake && !isOnObstacle && isAccessible) {
        break;
      }
    } while (attempts < maxAttempts);

    // If we couldn't find a good position, use a fallback position
    if (attempts >= maxAttempts) {
      newFood = [5, 5]; // Fallback position
    }

    setFood(newFood);
  }, [snake]);

  // Helper function to check if food position is accessible
  const checkFoodAccessibility = (pos) => {
    const [x, y] = pos;
    const directions = [
      [0, 1],  // right
      [1, 0],  // down
      [0, -1], // left
      [-1, 0]  // up
    ];

    // Check if at least one direction is free of obstacles
    return directions.some(([dx, dy]) => {
      const newX = x + dx;
      const newY = y + dy;
      
      // Check if the new position is within bounds
      if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) {
        return false;
      }
      
      // Check if the new position is not an obstacle
      return !STATIC_OBSTACLES.some(obs => obs[0] === newX && obs[1] === newY);
    });
  };

  const checkCollision = useCallback(
    (head) => {
      // Check wall collision
      if (
        head[0] < 0 ||
        head[0] >= GRID_SIZE ||
        head[1] < 0 ||
        head[1] >= GRID_SIZE
      ) {
        return true;
      }

      // Check self collision
      if (snake.slice(1).some((segment) => segment[0] === head[0] && segment[1] === head[1])) {
        return true;
      }

      // Check obstacle collision
      if (STATIC_OBSTACLES.some((obs) => obs[0] === head[0] && obs[1] === head[1])) {
        return true;
      }

      return false;
    },
    [snake]
  );

  const moveSnake = useCallback(() => {
    if (isGameOver || isPaused) return;

    setSnake((prevSnake) => {
      const head = [...prevSnake[0]];
      switch (direction) {
        case "UP":
          head[1] -= 1;
          break;
        case "DOWN":
          head[1] += 1;
          break;
        case "LEFT":
          head[0] -= 1;
          break;
        case "RIGHT":
          head[0] += 1;
          break;
        default:
          break;
      }

      if (checkCollision(head)) {
        setIsGameOver(true);
        playLose();
        return prevSnake;
      }

      const newSnake = [head, ...prevSnake];

      if (head[0] === food[0] && head[1] === food[1]) {
        setTimeout(() => {
          playEat();
        }, 50);
        
        setScore((prev) => prev + DIFFICULTY_SETTINGS[difficulty].points);
        generateFood();
        return newSnake;
      }

      return newSnake.slice(0, -1);
    });

    playMove();
  }, [
    direction,
    food,
    isGameOver,
    isPaused,
    checkCollision,
    playMove,
    playEat,
    playLose,
    generateFood,
    difficulty,
  ]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (isGameOver) return;

      switch (e.key) {
        case "ArrowUp":
          if (direction !== "DOWN") setDirection("UP");
          break;
        case "ArrowDown":
          if (direction !== "UP") setDirection("DOWN");
          break;
        case "ArrowLeft":
          if (direction !== "RIGHT") setDirection("LEFT");
          break;
        case "ArrowRight":
          if (direction !== "LEFT") setDirection("RIGHT");
          break;
        case " ":
          setIsPaused((prev) => !prev);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [direction, isGameOver]);

  useEffect(() => {
    if (isGameOver) return;

    const gameLoop = setInterval(moveSnake, speed);
    gameLoopRef.current = gameLoop;

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [moveSnake, speed, isGameOver]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(INITIAL_FOOD);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setIsGameOver(false);
    setIsPaused(false);
    playClick();
  };

  const handleDifficultyChange = (e) => {
    const newDifficulty = e.target.value;
    setDifficulty(newDifficulty);
    setSpeed(DIFFICULTY_SETTINGS[newDifficulty].speed);
    playClick();
  };

  const handleSoundToggle = () => {
    const newState = toggleSound();
    setIsSoundEnabled(newState);
  };

  return (
    <GameWrapper
      title="Snake"
      description="Use arrow keys to control the snake. Collect food to grow and avoid obstacles. Press space to pause."
    >
      <GameContainer>
        <GameArea>
          <Score>Score: {score}</Score>
          <HighScore>High Score: {highScore}</HighScore>
          <Board>
            {Array.from({ length: GRID_SIZE }, (_, row) =>
              Array.from({ length: GRID_SIZE }, (_, col) => {
                const isSnake = snake.some(
                  (segment) => segment[0] === col && segment[1] === row
                );
                const isFood = food[0] === col && food[1] === row;
                const isHead = snake[0][0] === col && snake[0][1] === row;
                const isTail = snake[snake.length - 1][0] === col && snake[snake.length - 1][1] === row;
                const isObstacle = STATIC_OBSTACLES.some(obs => obs[0] === col && obs[1] === row);

                return (
                  <Cell
                    key={`${row}-${col}`}
                    isSnake={isSnake}
                    isFood={isFood}
                    isHead={isHead}
                    isTail={isTail}
                    isObstacle={isObstacle}
                    col={col}
                    row={row}
                  >
                    {isHead && (
                      <SnakeHead>
                        <div className="eye left" />
                        <div className="eye right" />
                        <div className="nose" />
                        <div className="mouth" />
                      </SnakeHead>
                    )}
                  </Cell>
                );
              })
            )}
          </Board>
          {isGameOver && (
            <div
              style={{
                color: props => props.theme.colors.danger,
                fontSize: "1.5rem",
                marginTop: props => props.theme.spacing.md,
                fontWeight: "bold",
                padding: props => props.theme.spacing.sm
              }}
            >
              Game Over! Final Score: {score}
            </div>
          )}
          {isPaused && (
            <div
              style={{
                color: props => props.theme.colors.warning,
                fontSize: "1.5rem",
                marginTop: props => props.theme.spacing.md,
                fontWeight: "bold",
                padding: props => props.theme.spacing.sm
              }}
            >
              Game Paused
            </div>
          )}
          <Controls>
            <Button onClick={resetGame}>Reset Game</Button>
            <DifficultySelect
              value={difficulty}
              onChange={handleDifficultyChange}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </DifficultySelect>
            <MuteButton onClick={handleSoundToggle} title={isSoundEnabled ? "Mute Sound" : "Unmute Sound"}>
              {isSoundEnabled ? "🔊" : "🔈"}
            </MuteButton>
          </Controls>
          <MobileControls>
            <MobileButton
              onClick={() => {
                if (direction !== "RIGHT") setDirection("LEFT");
              }}
            >
              ←
            </MobileButton>
            <MobileButton
              onClick={() => {
                if (direction !== "DOWN") setDirection("UP");
              }}
            >
              ↑
            </MobileButton>
            <MobileButton
              onClick={() => {
                if (direction !== "LEFT") setDirection("RIGHT");
              }}
            >
              →
            </MobileButton>
            <MobileButton
              onClick={() => setIsPaused((prev) => !prev)}
            >
              ⏸
            </MobileButton>
            <MobileButton
              onClick={() => {
                if (direction !== "UP") setDirection("DOWN");
              }}
            >
              ↓
            </MobileButton>
            <div />
          </MobileControls>
        </GameArea>
      </GameContainer>
    </GameWrapper>
  );
};

export default Snake;
