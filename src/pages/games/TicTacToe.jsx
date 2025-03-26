import { useState, useCallback } from "react";
import styled from "@emotion/styled";
import GameContainer from "../../components/GameContainer";
import { useGameSounds } from "../../utils/sound";

const Board = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${(props) => props.theme.spacing.sm};
  max-width: 400px;
  margin: 0 auto;
`;

const Cell = styled.button`
  aspect-ratio: 1;
  background-color: ${(props) => props.theme.colors.background};
  border: 2px solid ${(props) => props.theme.colors.primary};
  border-radius: ${(props) => props.theme.borderRadius.sm};
  font-size: 2rem;
  font-weight: bold;
  color: ${(props) => props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${(props) => props.theme.colors.secondary};
    color: ${(props) => props.theme.colors.white};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.8;
  }
`;

const Status = styled.div`
  text-align: center;
  margin-bottom: ${(props) => props.theme.spacing.lg};
  font-size: 1.5rem;
  font-weight: bold;
  color: ${(props) => props.theme.colors.primary};
`;

const Button = styled.button`
  background-color: ${(props) => props.theme.colors.accent};
  color: ${(props) => props.theme.colors.white};
  padding: ${(props) => props.theme.spacing.sm}
    ${(props) => props.theme.spacing.lg};
  border-radius: ${(props) => props.theme.borderRadius.sm};
  font-size: 1rem;
  margin-top: ${(props) => props.theme.spacing.lg};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${(props) => props.theme.colors.error};
  }
`;

const TicTacToe = () => {
  const { playClick, playWin } = useGameSounds();
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState(null);

  const calculateWinner = useCallback((squares) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[a] === squares[c]
      ) {
        return squares[a];
      }
    }
    return null;
  }, []);

  const handleClick = useCallback(
    (i) => {
      if (winner || board[i]) return;

      const newBoard = [...board];
      newBoard[i] = isXNext ? "X" : "O";
      setBoard(newBoard);
      setIsXNext(!isXNext);
      playClick();

      const gameWinner = calculateWinner(newBoard);
      if (gameWinner) {
        setWinner(gameWinner);
        playWin();
      }
    },
    [board, isXNext, winner, calculateWinner, playClick, playWin]
  );

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    playClick();
  };

  const status = winner
    ? `Winner: ${winner}`
    : board.every((square) => square)
    ? "Game Draw!"
    : `Next player: ${isXNext ? "X" : "O"}`;

  return (
    <GameContainer
      title="Tic Tac Toe"
      description="A classic game of X's and O's. Players take turns placing their marks in empty squares. The first player to get three of their marks in a row (horizontally, vertically, or diagonally) wins."
    >
      <Status>{status}</Status>
      <Board>
        {board.map((square, i) => (
          <Cell
            key={i}
            onClick={() => handleClick(i)}
            disabled={square !== null}
          >
            {square}
          </Cell>
        ))}
      </Board>
      <div style={{ textAlign: "center" }}>
        <Button onClick={resetGame}>Reset Game</Button>
      </div>
    </GameContainer>
  );
};

export default TicTacToe;
