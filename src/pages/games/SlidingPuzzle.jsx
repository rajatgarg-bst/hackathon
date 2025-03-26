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

const PuzzleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  width: 300px;
  height: 300px;
  margin: ${(props) => props.theme.spacing.lg} auto;
  background-color: ${(props) => props.theme.colors.primary};
  padding: 4px;
  border-radius: ${(props) => props.theme.borderRadius.md};
`;

const Tile = styled.div`
  background-color: ${(props) =>
    props.isEmpty ? "transparent" : props.theme.colors.white};
  color: ${(props) => props.theme.colors.primary};
  font-size: 2rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: ${(props) => props.theme.borderRadius.sm};
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
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
`;

const Moves = styled.div`
  font-size: 1.2rem;
  color: ${(props) => props.theme.colors.primary};
  margin-bottom: ${(props) => props.theme.spacing.md};
`;

const SlidingPuzzle = () => {
  const { playClick, playSlide, playPuzzleComplete } = useGameSounds();
  const [tiles, setTiles] = useState([]);
  const [moves, setMoves] = useState(0);
  const [isSolved, setIsSolved] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [bestMoves, setBestMoves] = useState(0);

  const initializePuzzle = () => {
    const numbers = Array.from({ length: 8 }, (_, i) => i + 1);
    numbers.push(null); // Empty tile
    const shuffled = [...numbers].sort(() => Math.random() - 0.5);
    setTiles(shuffled);
    setMoves(0);
    setIsSolved(false);
    setIsMoving(false);
  };

  const isSolvable = (arr) => {
    let inversions = 0;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === null) continue;
      for (let j = i + 1; j < arr.length; j++) {
        if (arr[j] === null) continue;
        if (arr[i] > arr[j]) inversions++;
      }
    }
    return inversions % 2 === 0;
  };

  const moveTile = useCallback(
    (index) => {
      if (isMoving) return;

      const emptyIndex = tiles.indexOf(null);
      const row = Math.floor(index / 3);
      const col = index % 3;
      const emptyRow = Math.floor(emptyIndex / 3);
      const emptyCol = emptyIndex % 3;

      if (
        (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
        (Math.abs(col - emptyCol) === 1 && row === emptyRow)
      ) {
        setIsMoving(true);
        playSlide();

        const newTiles = [...tiles];
        [newTiles[index], newTiles[emptyIndex]] = [
          newTiles[emptyIndex],
          newTiles[index],
        ];
        setTiles(newTiles);

        setTimeout(() => {
          setIsMoving(false);
          if (isSolved(newTiles)) {
            playPuzzleComplete();
            setMoves((prev) => prev + 1);
            setBestMoves((prev) => (moves + 1 < prev ? moves + 1 : prev));
            localStorage.setItem(
              "slidingPuzzleBestMoves",
              Math.min(moves + 1, bestMoves).toString()
            );
          } else {
            setMoves((prev) => prev + 1);
          }
        }, 300);
      }
    },
    [tiles, isMoving, moves, bestMoves, playSlide, playPuzzleComplete]
  );

  const resetGame = () => {
    setTiles(shuffleTiles());
    setMoves(0);
    setIsMoving(false);
    playClick();
  };

  useEffect(() => {
    let puzzle;
    do {
      puzzle = Array.from({ length: 8 }, (_, i) => i + 1);
      puzzle.push(null);
      puzzle.sort(() => Math.random() - 0.5);
    } while (!isSolvable(puzzle));
    setTiles(puzzle);
  }, []);

  return (
    <GameContainer
      title="Sliding Puzzle"
      description="Arrange the numbers in order by sliding the tiles. The empty space can be used to move adjacent tiles."
    >
      <GameArea>
        <Moves>Moves: {moves}</Moves>
        <PuzzleGrid>
          {tiles.map((tile, index) => (
            <Tile
              key={index}
              isEmpty={tile === null}
              onClick={() => moveTile(index)}
            >
              {tile}
            </Tile>
          ))}
        </PuzzleGrid>
        {isSolved && (
          <div
            style={{
              color: (props) => props.theme.colors.success,
              fontSize: "1.5rem",
              marginBottom: (props) => props.theme.spacing.md,
            }}
          >
            Congratulations! You solved the puzzle!
          </div>
        )}
        <Controls>
          <Button onClick={initializePuzzle}>New Game</Button>
        </Controls>
      </GameArea>
    </GameContainer>
  );
};

export default SlidingPuzzle;
