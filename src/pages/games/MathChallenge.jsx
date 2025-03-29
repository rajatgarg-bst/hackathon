import { useState, useEffect } from "react";
import styled from "@emotion/styled";
import GameContainer from "../../components/GameContainer";
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

const MaxScore = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${(props) => props.theme.colors.secondary};
  margin-bottom: ${(props) => props.theme.spacing.md};
`;

const QuestionTimer = styled.div`
  font-size: 1.2rem;
  color: ${(props) => props.theme.colors.warning};
  margin-bottom: ${(props) => props.theme.spacing.sm};
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
  padding: ${(props) => props.theme.spacing.sm} ${(props) => props.theme.spacing.lg};
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

const SubmitButton = styled(Button)`
  background-color: ${(props) => props.theme.colors.success};
  margin-top: ${(props) => props.theme.spacing.sm};

  &:hover {
    background-color: ${(props) => props.theme.colors.success}dd;
  }

  &:disabled {
    background-color: ${(props) => props.theme.colors.gray};
  }
`;

const GameOver = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: ${(props) => props.theme.colors.danger};
  margin: ${(props) => props.theme.spacing.xl} 0;
  padding: ${(props) => props.theme.spacing.lg};
  border: 2px solid ${(props) => props.theme.colors.danger};
  border-radius: ${(props) => props.theme.borderRadius.md};
  background-color: ${(props) => props.theme.colors.danger}10;
  animation: fadeIn 0.5s ease;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const FinalScore = styled.div`
  font-size: 1.5rem;
  color: ${(props) => props.theme.colors.text};
  margin-top: ${(props) => props.theme.spacing.md};
`;

const GAME_DURATION = 60; // seconds
const QUESTION_DURATION = 5; // seconds
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
  const { 
    playClick, 
    playMathCorrect, 
    playMathWrong, 
    playMathLevelUp, 
    playWin, 
    playLose 
  } = useGameSounds();

  const [score, setScore] = useState(0);
  const [maxScore, setMaxScore] = useState(() => {
    const saved = localStorage.getItem("mathMaxScore");
    return saved ? parseInt(saved) : 0;
  });
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(QUESTION_DURATION);
  const [isGameActive, setIsGameActive] = useState(false);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [difficulty, setDifficulty] = useState("easy");

  useEffect(() => {
    let timer;
    if (isGameActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 3 && prev > 0) {
            playClick(); // Countdown beep for last 3 seconds
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      setIsGameActive(false);
      playLose(); // Play lose sound when time runs out
    }
    return () => clearInterval(timer);
  }, [isGameActive, timeLeft, playClick, playLose]);

  useEffect(() => {
    const savedMaxScore = localStorage.getItem("mathMaxScore");
    if (savedMaxScore) {
      setMaxScore(parseInt(savedMaxScore));
    }
  }, []);

  useEffect(() => {
    if (!isGameActive && score > maxScore && score > 0) {
      setMaxScore(score);
      localStorage.setItem("mathMaxScore", score.toString());
      playWin(); // Play win sound for new high score
      playMathLevelUp(); // Additional celebration sound
    }
  }, [isGameActive, score, maxScore, playWin, playMathLevelUp]);

  useEffect(() => {
    let timer;
    if (isGameActive && questionTimeLeft > 0) {
      timer = setInterval(() => {
        setQuestionTimeLeft((prev) => {
          if (prev <= 3 && prev > 0) {
            playClick(); // Countdown beep for last 3 seconds of question
          }
          if (prev <= 1) {
            playMathWrong();
            setIsGameActive(false);
            playLose(); // Play lose sound when question time runs out
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isGameActive, questionTimeLeft, playMathWrong, playClick, playLose]);

  const startGame = () => {
    playClick();
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setQuestionTimeLeft(QUESTION_DURATION);
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
      setUserAnswer("");
      setCurrentProblem(generateProblem(difficulty));
      setQuestionTimeLeft(QUESTION_DURATION);
    } else {
      playMathWrong();
      setIsGameActive(false);
      playLose(); // Play lose sound for wrong answer
    }
  };

  const resetGame = () => {
    playClick();
    setIsGameActive(false);
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setCurrentProblem(null);
    setUserAnswer("");
    generateProblem(difficulty);
  };

  const handleDifficultyChange = (level) => {
    playClick();
    setDifficulty(level);
  };

  return (
    <GameContainer
      title="Math Challenge"
      description="Solve math problems within 5 seconds! One wrong answer ends the game. Choose your difficulty level and try to beat your highest score."
    >
      <GameArea>
        <DifficultySelect>
          {Object.keys(DIFFICULTY_SETTINGS).map((level) => (
            <DifficultyButton
              key={level}
              isSelected={difficulty === level}
              onClick={() => handleDifficultyChange(level)}
              disabled={isGameActive}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </DifficultyButton>
          ))}
        </DifficultySelect>

        <Score>Score: {score}</Score>
        <MaxScore>Best Score: {maxScore}</MaxScore>
        {isGameActive && <QuestionTimer>Time Left: {questionTimeLeft}s</QuestionTimer>}

        {isGameActive ? (
          <>
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
              <SubmitButton type="submit" disabled={!isGameActive || !userAnswer}>
                Submit Answer
              </SubmitButton>
            </form>
          </>
        ) : (
          score > 0 && (
            <GameOver>
              Game Over!
              <FinalScore>Final Score: {score}</FinalScore>
              {score === maxScore && score > 0 && (
                <FinalScore>🎉 New High Score! 🎉</FinalScore>
              )}
            </GameOver>
          )
        )}

        <Controls>
          <Button onClick={startGame} disabled={isGameActive}>
            {score > 0 ? "Play Again" : "Start Game"}
          </Button>
          <Button onClick={resetGame}>Reset Game</Button>
        </Controls>
      </GameArea>
    </GameContainer>
  );
};

export default MathChallenge;
