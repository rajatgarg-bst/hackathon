import { useState, useEffect, useCallback } from "react";
import styled from "@emotion/styled";
import GameContainer from "../../components/GameContainer";
import { motion } from "framer-motion";
import { useGameSounds } from "../../utils/sound";

const GameArea = styled.div`
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
`;

const Problem = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: ${(props) => props.theme.colors.primary};
  margin: ${(props) => props.theme.spacing.xl} 0;
`;

const Input = styled.input`
  font-size: 1.5rem;
  padding: ${(props) => props.theme.spacing.sm};
  width: 150px;
  text-align: center;
  border: 2px solid ${(props) => props.theme.colors.primary};
  border-radius: ${(props) => props.theme.borderRadius.sm};
  margin-bottom: ${(props) => props.theme.spacing.md};

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.colors.secondary};
  }
`;

const Score = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${(props) => props.theme.colors.primary};
  margin-bottom: ${(props) => props.theme.spacing.md};
`;

const Timer = styled.div`
  font-size: 1.5rem;
  color: ${(props) => props.theme.colors.primary};
  margin-bottom: ${(props) => props.theme.spacing.md};
`;

const Controls = styled.div`
  display: flex;
  justify-content: center;
  gap: ${(props) => props.theme.spacing.md};
  margin-top: ${(props) => props.theme.spacing.lg};
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

  &:disabled {
    background-color: ${(props) => props.theme.colors.gray};
    cursor: not-allowed;
  }
`;

const DifficultySelect = styled.div`
  display: flex;
  justify-content: center;
  gap: ${(props) => props.theme.spacing.md};
  margin-bottom: ${(props) => props.theme.spacing.lg};
`;

const DifficultyButton = styled(Button)`
  background-color: ${(props) =>
    props.isSelected
      ? props.theme.colors.secondary
      : props.theme.colors.primary};
`;

const GAME_DURATION = 60; // seconds
const DIFFICULTY_SETTINGS = {
  easy: { range: 10, operations: ["+", "-"] },
  medium: { range: 20, operations: ["+", "-", "×"] },
  hard: { range: 50, operations: ["+", "-", "×", "÷"] },
};

const generateProblem = (difficulty) => {
  const { range, operations } = DIFFICULTY_SETTINGS[difficulty];
  const operation = operations[Math.floor(Math.random() * operations.length)];
  let num1, num2, answer;

  switch (operation) {
    case "+":
      num1 = Math.floor(Math.random() * range) + 1;
      num2 = Math.floor(Math.random() * range) + 1;
      answer = num1 + num2;
      break;
    case "-":
      num1 = Math.floor(Math.random() * range) + 1;
      num2 = Math.floor(Math.random() * num1) + 1;
      answer = num1 - num2;
      break;
    case "×":
      num1 = Math.floor(Math.random() * Math.sqrt(range)) + 1;
      num2 = Math.floor(Math.random() * Math.sqrt(range)) + 1;
      answer = num1 * num2;
      break;
    case "÷":
      num2 = Math.floor(Math.random() * Math.sqrt(range)) + 1;
      answer = Math.floor(Math.random() * Math.sqrt(range)) + 1;
      num1 = num2 * answer;
      break;
    default:
      num1 = 1;
      num2 = 1;
      answer = 1;
  }

  return { num1, num2, operation, answer };
};

const MathChallenge = () => {
  const { playClick, playMathCorrect, playMathWrong, playMathLevelUp } =
    useGameSounds();

  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isGameActive, setIsGameActive] = useState(false);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    let timer;
    if (isGameActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsGameActive(false);
    }
    return () => clearInterval(timer);
  }, [isGameActive, timeLeft]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setIsGameActive(true);
    setCurrentProblem(generateProblem(difficulty));
    setUserAnswer("");
  };

  const handleAnswerSubmit = (e) => {
    e.preventDefault();
    if (!isGameActive || !currentProblem) return;

    const answer = parseInt(userAnswer);
    const isCorrect = answer === currentProblem.answer;

    if (isCorrect) {
      playMathCorrect();
      setScore((prev) => prev + 10);
      setStreak((prev) => prev + 1);

      if (streak + 1 >= 5) {
        playMathLevelUp();
        setLevel((prev) => prev + 1);
        setStreak(0);
      }
    } else {
      playMathWrong();
      setStreak(0);
    }

    setUserAnswer("");
    generateProblem(difficulty);
  };

  const resetGame = () => {
    setIsGameActive(false);
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setCurrentProblem(null);
    setUserAnswer("");
    setStreak(0);
    setLevel(1);
    generateProblem(difficulty);
    playClick();
  };

  return (
    <GameContainer
      title="Math Challenge"
      description="Solve math problems as quickly as you can! Choose your difficulty level and try to get the highest score."
    >
      <GameArea>
        <DifficultySelect>
          {Object.keys(DIFFICULTY_SETTINGS).map((level) => (
            <DifficultyButton
              key={level}
              isSelected={difficulty === level}
              onClick={() => setDifficulty(level)}
              disabled={isGameActive}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </DifficultyButton>
          ))}
        </DifficultySelect>

        <Score>Score: {score}</Score>
        <Timer>Time Left: {timeLeft}s</Timer>

        {currentProblem && (
          <Problem>
            {currentProblem.num1} {currentProblem.operation}{" "}
            {currentProblem.num2} = ?
          </Problem>
        )}

        <form onSubmit={handleAnswerSubmit}>
          <Input
            type="number"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Enter answer"
            disabled={!isGameActive}
          />
        </form>

        <Controls>
          <Button onClick={startGame} disabled={isGameActive}>
            Start Game
          </Button>
          <Button onClick={resetGame}>Reset Game</Button>
        </Controls>
      </GameArea>
    </GameContainer>
  );
};

export default MathChallenge;
