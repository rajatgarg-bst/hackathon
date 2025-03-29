import { useState, useEffect, useCallback } from "react";
import styled from "@emotion/styled";
import GameContainer from "../../components/GameContainer";
import { motion, AnimatePresence } from "framer-motion";
import { useGameSounds } from "../../utils/sound";

const GameArea = styled.div`
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
  position: relative;
  padding: 20px;
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
  position: relative;
`;

const Tile = styled(motion.div)`
  background-color: ${(props) =>
    props.isEmpty ? "transparent" : props.theme.colors.white};
  color: ${(props) => props.theme.colors.primary};
  font-size: 2rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${props => props.isEmpty ? "default" : "pointer"};
  border-radius: ${(props) => props.theme.borderRadius.sm};
  box-shadow: ${props => 
    props.isEmpty ? "none" : "0 2px 4px rgba(0, 0, 0, 0.2)"};
  user-select: none;
  width: 100%;
  height: 100%;
  transition: transform 0.2s ease;

  &:hover {
    transform: ${props => props.isEmpty ? "none" : "scale(1.05)"};
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
  padding: ${(props) => props.theme.spacing.sm} ${(props) => props.theme.spacing.lg};
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

const SoundToggle = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: ${props => props.theme.colors.primary};
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.white};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  
  &:hover {
    transform: scale(1.1);
    background: ${props => props.theme.colors.secondary};
  }
`;

const SlidingPuzzle = () => {
  const { playClick, playMove, playPuzzleComplete } = useGameSounds() || {};
  const [tiles, setTiles] = useState([]);
  const [moves, setMoves] = useState(0);
  const [isSolved, setIsSolved] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(() => {
    const saved = localStorage.getItem("slidingPuzzleSoundEnabled");
    return saved ? JSON.parse(saved) : true;
  });
  const [bestMoves, setBestMoves] = useState(() => {
    const saved = localStorage.getItem("slidingPuzzleBestMoves");
    return saved ? parseInt(saved) : Infinity;
  });

  // Save sound preference
  useEffect(() => {
    localStorage.setItem("slidingPuzzleSoundEnabled", JSON.stringify(isSoundEnabled));
  }, [isSoundEnabled]);

  const toggleSound = () => {
    setIsSoundEnabled(prev => !prev);
  };

  // Check if the puzzle configuration is solvable
  const isSolvable = (arr) => {
    let inversions = 0;
    const emptyPosition = arr.indexOf(null);
    const emptyRow = Math.floor(emptyPosition / 3);

    // Count inversions
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] === null) continue;
      for (let j = i + 1; j < arr.length; j++) {
        if (arr[j] === null) continue;
        if (arr[i] > arr[j]) {
          inversions++;
        }
      }
    }

    // For a 3x3 puzzle:
    // If empty tile is in an even row (0-based), inversions must be odd
    // If empty tile is in an odd row (0-based), inversions must be even
    return (emptyRow % 2 === 0) ? (inversions % 2 === 1) : (inversions % 2 === 0);
  };

  const moveTile = useCallback(
    (index) => {
      if (isMoving || isSolved) return;

      const emptyIndex = tiles.indexOf(null);
      
      const row = Math.floor(index / 3);
      const col = index % 3;
      const emptyRow = Math.floor(emptyIndex / 3);
      const emptyCol = emptyIndex % 3;

      const isValidMove = 
        (row === emptyRow && Math.abs(col - emptyCol) === 1) || 
        (col === emptyCol && Math.abs(row - emptyRow) === 1);

      if (isValidMove) {
        setIsMoving(true);
        if (isSoundEnabled && playMove) {
          playMove();
        }

        const newTiles = [...tiles];
        const temp = newTiles[index];
        newTiles[index] = null;
        newTiles[emptyIndex] = temp;
        setTiles(newTiles);

        setTimeout(() => {
          setIsMoving(false);
          setMoves(prev => prev + 1);

          if (checkIsSolved(newTiles)) {
            setIsSolved(true);
            if (isSoundEnabled && playPuzzleComplete) {
              playPuzzleComplete();
            }
            const newMoves = moves + 1;
            if (newMoves < bestMoves) {
              setBestMoves(newMoves);
              localStorage.setItem("slidingPuzzleBestMoves", newMoves.toString());
            }
          }
        }, 200);
      }
    },
    [tiles, isMoving, isSolved, moves, bestMoves, playMove, playPuzzleComplete, isSoundEnabled]
  );

  const initializePuzzle = () => {
    let puzzle;
    do {
      puzzle = Array.from({ length: 8 }, (_, i) => i + 1);
      puzzle.push(null);

      for (let i = puzzle.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [puzzle[i], puzzle[j]] = [puzzle[j], puzzle[i]];
      }
    } while (!isSolvable(puzzle));

    setTiles(puzzle);
    setMoves(0);
    setIsSolved(false);
    setIsMoving(false);
    if (isSoundEnabled && playClick) {
      playClick();
    }
  };

  // Check if the puzzle is solved
  const checkIsSolved = (tiles) => {
    // Check if all numbers are in ascending order
    for (let i = 0; i < tiles.length - 1; i++) {
      if (tiles[i] !== i + 1) return false;
    }
    // Check if empty tile is at the end
    return tiles[tiles.length - 1] === null;
  };

  // Load best moves on mount
  useEffect(() => {
    const savedBestMoves = localStorage.getItem("slidingPuzzleBestMoves");
    if (savedBestMoves) {
      setBestMoves(parseInt(savedBestMoves));
    }
  }, []);

  // Initialize puzzle on mount
  useEffect(() => {
    initializePuzzle();
  }, []);

  return (
    <GameContainer
      title="Sliding Puzzle"
      description="Arrange the numbers in order by sliding the tiles. The empty space can be used to move adjacent tiles."
    >
      <GameArea>
        <SoundToggle onClick={toggleSound} aria-label="Toggle sound">
          {isSoundEnabled ? "🔊" : "🔈"}
        </SoundToggle>
        <Moves>Moves: {moves}</Moves>
        {bestMoves !== Infinity && (
          <Moves>Best: {bestMoves} moves</Moves>
        )}
        <PuzzleGrid>
          {tiles.map((tile, index) => (
            <Tile
              key={tile || 'empty'}
              isEmpty={tile === null}
              onClick={() => !isMoving && moveTile(index)}
              animate={{ 
                scale: isMoving ? 0.95 : 1,
              }}
              transition={{
                duration: 0.2,
                ease: "easeOut"
              }}
            >
              {tile}
            </Tile>
          ))}
        </PuzzleGrid>
        {isSolved && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              color: (props) => props.theme.colors.success,
              fontSize: "1.5rem",
              marginBottom: (props) => props.theme.spacing.md,
              fontWeight: "bold",
              padding: "1rem"
            }}
          >
            🎉 Congratulations! Puzzle solved in {moves} moves! 🎉
          </motion.div>
        )}
        <Controls>
          <Button onClick={initializePuzzle} disabled={isMoving}>
            New Game
          </Button>
        </Controls>
      </GameArea>
    </GameContainer>
  );
};

export default SlidingPuzzle;
