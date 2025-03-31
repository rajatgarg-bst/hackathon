import { useState, useCallback } from "react";
import styled from "@emotion/styled";
import GameContainer from "../../components/GameContainer";
import { motion } from "framer-motion";
import { useGameSounds } from "../../utils/sound";

const GameArea = styled.div`
  max-width: 800px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: ${(props) => props.theme.spacing.lg};
  padding: ${(props) => props.theme.spacing.md};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 1px;
  background-color: ${(props) => props.theme.colors.primary};
  padding: 1px;
  border-radius: ${(props) => props.theme.borderRadius.md};
`;

const Cell = styled.input`
  width: 40px;
  height: 40px;
  text-align: center;
  font-size: 1.2rem;
  font-weight: bold;
  border: none;
  background-color: ${(props) =>
    props.isBlack ? props.theme.colors.black : props.theme.colors.white};
  color: ${(props) => props.theme.colors.primary};
  padding: 0;
  text-transform: uppercase;

  &:focus {
    outline: none;
    background-color: ${(props) => props.theme.colors.secondary};
    color: ${(props) => props.theme.colors.white};
  }

  &:disabled {
    background-color: ${(props) =>
      props.isBlack ? props.theme.colors.black : props.theme.colors.gray};
    cursor: not-allowed;
  }
`;

const Clues = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.md};
`;

const ClueSection = styled.div`
  h3 {
    color: ${(props) => props.theme.colors.primary};
    margin-bottom: ${(props) => props.theme.spacing.sm};
  }
`;

const Clue = styled.div`
  margin-bottom: ${(props) => props.theme.spacing.sm};
  cursor: pointer;
  padding: ${(props) => props.theme.spacing.sm};
  border-radius: ${(props) => props.theme.borderRadius.sm};
  background-color: ${(props) =>
    props.isActive ? props.theme.colors.secondary : "transparent"};
  color: ${(props) =>
    props.isActive ? props.theme.colors.white : props.theme.colors.text};

  &:hover {
    background-color: ${(props) => props.theme.colors.secondary};
    color: ${(props) => props.theme.colors.white};
  }
`;

const Controls = styled.div`
  display: flex;
  justify-content: center;
  gap: ${(props) => props.theme.spacing.md};
  margin-top: ${(props) => props.theme.spacing.lg};
  grid-column: 1 / -1;
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
`;

const crosswordData = {
  grid: [
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
    ["11", "12", "13", "14", "15", "16", "17", "18", "19", "20"],
    ["21", "22", "23", "24", "25", "26", "27", "28", "29", "30"],
    ["31", "32", "33", "34", "35", "36", "37", "38", "39", "40"],
    ["41", "42", "43", "44", "45", "46", "47", "48", "49", "50"],
    ["51", "52", "53", "54", "55", "56", "57", "58", "59", "60"],
    ["61", "62", "63", "64", "65", "66", "67", "68", "69", "70"],
    ["71", "72", "73", "74", "75", "76", "77", "78", "79", "80"],
    ["81", "82", "83", "84", "85", "86", "87", "88", "89", "90"],
    ["91", "92", "93", "94", "95", "96", "97", "98", "99", "100"],
  ],
  words: {
    across: [
      {
        number: 1,
        clue: "React is a JavaScript _____ for building user interfaces",
        answer: "LIBRARY",
      },
      {
        number: 5,
        clue: "A component that wraps other components",
        answer: "CONTAINER",
      },
      { number: 10, clue: "A way to manage state in React", answer: "CONTEXT" },
      { number: 15, clue: "A function that returns JSX", answer: "COMPONENT" },
      { number: 20, clue: "A hook that manages state", answer: "USESTATE" },
    ],
    down: [
      {
        number: 1,
        clue: "A way to style components in React",
        answer: "EMOTION",
      },
      { number: 2, clue: "A hook that runs after render", answer: "USEEFFECT" },
      { number: 3, clue: "A way to handle events", answer: "HANDLER" },
      {
        number: 4,
        clue: "A way to pass data between components",
        answer: "PROPS",
      },
      { number: 5, clue: "A way to navigate between pages", answer: "ROUTING" },
    ],
  },
};

const Crossword = () => {
  const {
    playClick,
    playCrosswordCorrect,
    playCrosswordWrong,
    playCrosswordComplete,
  } = useGameSounds();

  const [answers, setAnswers] = useState({});
  const [activeCell, setActiveCell] = useState(null);
  const [direction, setDirection] = useState("across");
  const [grid, setGrid] = useState(crosswordData.grid);
  const [completedWords, setCompletedWords] = useState([]);

  const isEditable = useCallback((row, col) => {
    // Check if the cell is within grid bounds
    if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length) {
      return false;
    }
    // Check if the cell is a valid cell in the crossword
    return grid[row][col] !== null;
  }, [grid]);

  const getCurrentWord = useCallback((row, col) => {
    const cell = grid[row][col];
    return direction === "across" 
      ? crosswordData.words.across.find(w => w.number === parseInt(cell))
      : crosswordData.words.down.find(w => w.number === parseInt(cell));
  }, [grid, direction]);

  const isWordComplete = useCallback((word) => {
    if (!word) return false;
    const cells = word.answer.split('').map((_, i) => {
      const number = word.number + i;
      return answers[number];
    });
    return cells.every(cell => cell && cell.length === 1);
  }, [answers]);

  const checkWord = useCallback((word) => {
    if (!word) return false;
    const userAnswer = word.answer.split('').map((_, i) => {
      const number = word.number + i;
      return answers[number];
    }).join('');
    return userAnswer.toUpperCase() === word.answer.toUpperCase();
  }, [answers]);

  const isPuzzleComplete = useCallback(() => {
    return [...crosswordData.words.across, ...crosswordData.words.down].every(word => {
      return isWordComplete(word) && checkWord(word);
    });
  }, [isWordComplete, checkWord]);

  const handleCellChange = useCallback(
    (row, col, value) => {
      if (!isEditable(row, col)) return;

      const newGrid = [...grid];
      newGrid[row][col] = value.toUpperCase();
      setGrid(newGrid);

      // Check if the word is complete
      const currentWord = getCurrentWord(row, col);
      if (currentWord && isWordComplete(currentWord)) {
        const isCorrect = checkWord(currentWord);
        if (isCorrect) {
          playCrosswordCorrect();
          setCompletedWords((prev) => [...prev, currentWord]);
        } else {
          playCrosswordWrong();
        }
      }

      // Check if puzzle is complete
      if (isPuzzleComplete()) {
        playCrosswordComplete();
      }
    },
    [
      grid,
      isEditable,
      getCurrentWord,
      isWordComplete,
      checkWord,
      isPuzzleComplete,
      playCrosswordCorrect,
      playCrosswordWrong,
      playCrosswordComplete,
    ]
  );

  const handleClueClick = (number, dir) => {
    setDirection(dir);
    setActiveCell(number);
  };

  const checkAnswer = () => {
    const allCorrect = Object.entries(answers).every(([cell, value]) => {
      const word = crosswordData.words[direction].find(
        (w) => w.number === parseInt(cell)
      );
      return word && word.answer.includes(value);
    });
    alert(
      allCorrect ? "Congratulations! You solved the puzzle!" : "Keep trying!"
    );
  };

  const resetPuzzle = () => {
    setGrid(crosswordData.grid);
    setCompletedWords([]);
    setActiveCell(null);
    setDirection("across");
    playClick();
  };

  return (
    <GameContainer
      title="Crossword Puzzle"
      description="Solve the crossword puzzle by filling in the correct letters. Click on a clue to start solving in that direction."
    >
      <GameArea>
        <Grid>
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <Cell
                key={`${rowIndex}-${colIndex}`}
                type="text"
                maxLength={1}
                value={answers[cell] || ""}
                onChange={(e) =>
                  handleCellChange(rowIndex, colIndex, e.target.value)
                }
                isBlack={false}
                disabled={false}
              />
            ))
          )}
        </Grid>

        <Clues>
          <ClueSection>
            <h3>Across</h3>
            {crosswordData.words.across.map((word) => (
              <Clue
                key={`across-${word.number}`}
                onClick={() => handleClueClick(word.number, "across")}
                isActive={activeCell === word.number && direction === "across"}
              >
                {word.number}. {word.clue}
              </Clue>
            ))}
          </ClueSection>

          <ClueSection>
            <h3>Down</h3>
            {crosswordData.words.down.map((word) => (
              <Clue
                key={`down-${word.number}`}
                onClick={() => handleClueClick(word.number, "down")}
                isActive={activeCell === word.number && direction === "down"}
              >
                {word.number}. {word.clue}
              </Clue>
            ))}
          </ClueSection>
        </Clues>

        <Controls>
          <Button onClick={checkAnswer}>Check Answer</Button>
          <Button onClick={resetPuzzle}>Reset Puzzle</Button>
        </Controls>
      </GameArea>
    </GameContainer>
  );
};

export default Crossword;
