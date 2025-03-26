import { useState, useEffect, useCallback, useRef } from "react";
import styled from "@emotion/styled";
import GameContainer from "../../components/GameContainer";
import { motion, AnimatePresence } from "framer-motion";
import { useGameSounds } from "../../utils/sound";

const GameArea = styled.div`
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
`;

const Board = styled.div`
  display: grid;
  grid-template-columns: repeat(20, 1fr);
  gap: 1px;
  background-color: ${(props) => props.theme.colors.primary};
  padding: 1px;
  margin: ${(props) => props.theme.spacing.lg} auto;
  width: 400px;
  height: 400px;
  border-radius: ${(props) => props.theme.borderRadius.md};
  position: relative;
  touch-action: none;
`;

const Cell = styled(motion.div)`
  background-color: ${(props) => {
    if (props.isSnake) return props.theme.colors.success;
    if (props.isFood) return "#FF0000"; // Bright red for food
    if (props.isObstacle) return props.theme.colors.warning;
    return props.theme.colors.white;
  }};
  border-radius: ${(props) => props.theme.borderRadius.sm};
  position: relative;
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(
      circle at center,
      transparent 0%,
      rgba(0, 0, 0, 0.1) 100%
    );
    opacity: ${(props) => (props.isSnake ? 1 : 0)};
  }

  ${(props) =>
    props.isFood &&
    `
    box-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
    animation: pulse 1s infinite;
    
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }
  `}
`;

const Score = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${(props) => props.theme.colors.primary};
  margin-bottom: ${(props) => props.theme.spacing.md};
`;

const HighScore = styled.div`
  font-size: 1.2rem;
  color: ${(props) => props.theme.colors.secondary};
  margin-bottom: ${(props) => props.theme.spacing.md};
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
  gap: ${(props) => props.theme.spacing.md};
  margin-top: ${(props) => props.theme.spacing.lg};
  flex-wrap: wrap;
`;

const Button = styled.button`
  background-color: ${(props) => props.theme.colors.primary};
  color: ${(props) => props.theme.colors.white};
  padding: ${(props) => props.theme.spacing.sm}
    ${(props) => props.theme.spacing.lg};
  border-radius: ${(props) => props.theme.borderRadius.sm};
  font-size: 1rem;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${(props) => props.theme.colors.secondary};
  }
`;

const DifficultySelect = styled.select`
  padding: ${(props) => props.theme.spacing.sm};
  border-radius: ${(props) => props.theme.borderRadius.sm};
  border: 1px solid ${(props) => props.theme.colors.primary};
  margin-left: ${(props) => props.theme.spacing.sm};
`;

const MobileControls = styled.div`
  display: none;
  grid-template-columns: repeat(3, 1fr);
  gap: ${(props) => props.theme.spacing.sm};
  margin-top: ${(props) => props.theme.spacing.lg};
  width: 200px;
  margin-left: auto;
  margin-right: auto;

  @media (max-width: 768px) {
    display: grid;
  }
`;

const MobileButton = styled.button`
  background-color: ${(props) => props.theme.colors.primary};
  color: ${(props) => props.theme.colors.white};
  padding: ${(props) => props.theme.spacing.md};
  border-radius: ${(props) => props.theme.borderRadius.sm};
  font-size: 1.5rem;
  border: none;
  cursor: pointer;
  touch-action: manipulation;

  &:active {
    background-color: ${(props) => props.theme.colors.secondary};
  }
`;

const GRID_SIZE = 20;
const INITIAL_SNAKE = [[0, 0]];
const INITIAL_DIRECTION = "RIGHT";

const DIFFICULTY_SETTINGS = {
  easy: { speed: 200, points: 10 },
  medium: { speed: 150, points: 15 },
  hard: { speed: 100, points: 20 },
};

const Snake = () => {
  const { playClick, playMove, playEat, playLose } = useGameSounds();

  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState([5, 5]);
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
    const newFood = [
      Math.floor(Math.random() * GRID_SIZE),
      Math.floor(Math.random() * GRID_SIZE),
    ];
    setFood(newFood);
  }, []);

  const checkCollision = useCallback(
    (head) => {
      if (
        head[0] < 0 ||
        head[0] >= GRID_SIZE ||
        head[1] < 0 ||
        head[1] >= GRID_SIZE
      ) {
        return true;
      }

      return snake
        .slice(1)
        .some((segment) => segment[0] === head[0] && segment[1] === head[1]);
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
        playEat();
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
    setFood([5, 5]);
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

  return (
    <GameContainer
      title="Snake"
      description="Use arrow keys to control the snake. Collect food to grow and avoid obstacles. Press space to pause."
    >
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

              return (
                <Cell
                  key={`${row}-${col}`}
                  isSnake={isSnake}
                  isFood={isFood}
                  isHead={isHead}
                />
              );
            })
          )}
        </Board>
        {isGameOver && (
          <div
            style={{
              color: (props) => props.theme.colors.danger,
              fontSize: "1.5rem",
              marginBottom: (props) => props.theme.spacing.md,
            }}
          >
            Game Over! Final Score: {score}
          </div>
        )}
        {isPaused && (
          <div
            style={{
              color: (props) => props.theme.colors.warning,
              fontSize: "1.5rem",
              marginBottom: (props) => props.theme.spacing.md,
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
        </Controls>
        <MobileControls>
          <div />
          <MobileButton
            onClick={() => {
              if (direction !== "DOWN") setDirection("UP");
            }}
          >
            ↑
          </MobileButton>
          <div />
          <MobileButton
            onClick={() => {
              if (direction !== "UP") setDirection("DOWN");
            }}
          >
            ↓
          </MobileButton>
          <MobileButton onClick={() => setIsPaused((prev) => !prev)}>
            ⏸
          </MobileButton>
          <MobileButton
            onClick={() => {
              if (direction !== "LEFT") setDirection("RIGHT");
            }}
          >
            →
          </MobileButton>
        </MobileControls>
      </GameArea>
    </GameContainer>
  );
};

export default Snake;
