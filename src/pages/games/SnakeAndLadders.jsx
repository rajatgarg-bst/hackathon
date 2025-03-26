import { useState, useCallback } from "react";
import styled from "@emotion/styled";
import GameContainer from "../../components/GameContainer";

const Board = styled.div`
  width: 600px;
  height: 600px;
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  grid-template-rows: repeat(10, 1fr);
  gap: 2px;
  background-color: ${(props) => props.theme.colors.primary};
  padding: 2px;
  border-radius: ${(props) => props.theme.borderRadius.md};
  margin: 0 auto;
`;

const Cell = styled.div`
  background-color: ${(props) => props.theme.colors.white};
  border-radius: ${(props) => props.theme.borderRadius.sm};
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2rem;
  font-weight: bold;
  position: relative;
  color: ${(props) => props.theme.colors.primary};
`;

const Player = styled.div`
  width: 20px;
  height: 20px;
  background-color: ${(props) => props.color};
  border: 2px solid #000;
  border-radius: 50%;
  position: absolute;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 1;

  &:hover {
    transform: scale(1.2);
  }
`;

const Dice = styled.div`
  width: 60px;
  height: 60px;
  background-color: ${(props) => props.theme.colors.white};
  border: 2px solid ${(props) => props.theme.colors.primary};
  border-radius: ${(props) => props.theme.borderRadius.sm};
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2rem;
  font-weight: bold;
  cursor: pointer;
  user-select: none;
  margin: 0 auto;
`;

const GameInfo = styled.div`
  text-align: center;
  margin-bottom: ${(props) => props.theme.spacing.md};
  font-size: 1.2rem;
  color: ${(props) => props.theme.colors.primary};
`;

const Button = styled.button`
  background-color: ${(props) => props.theme.colors.primary};
  color: ${(props) => props.theme.colors.white};
  padding: ${(props) => props.theme.spacing.sm}
    ${(props) => props.theme.spacing.lg};
  border-radius: ${(props) => props.theme.borderRadius.sm};
  font-size: 1rem;
  margin-top: ${(props) => props.theme.spacing.md};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${(props) => props.theme.colors.secondary};
  }
`;

const SNAKES = {
  16: 6,
  47: 26,
  49: 11,
  56: 53,
  62: 19,
  64: 60,
  87: 24,
  93: 73,
  95: 75,
  98: 78,
};

const LADDERS = {
  1: 38,
  4: 14,
  9: 31,
  21: 42,
  28: 84,
  36: 44,
  51: 67,
  71: 91,
  80: 100,
};

const createBoard = () => {
  const board = Array(10)
    .fill()
    .map(() => Array(10).fill(null));
  let number = 100;
  let direction = -1;

  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      board[i][j] = number;
      number += direction;
    }
    direction *= -1;
  }

  return board;
};

const SnakeAndLadders = () => {
  const [board, setBoard] = useState(createBoard());
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [diceValue, setDiceValue] = useState(null);
  const [players, setPlayers] = useState({
    1: { position: 1, color: "#ff4444" },
    2: { position: 1, color: "#33b5e5" },
  });

  const rollDice = () => {
    const value = Math.floor(Math.random() * 6) + 1;
    setDiceValue(value);
  };

  const movePlayer = (playerId) => {
    if (playerId !== currentPlayer || !diceValue) return;

    const player = players[playerId];
    let newPosition = player.position + diceValue;

    // Check for snakes
    if (SNAKES[newPosition]) {
      newPosition = SNAKES[newPosition];
    }
    // Check for ladders
    else if (LADDERS[newPosition]) {
      newPosition = LADDERS[newPosition];
    }

    // Keep player within bounds
    newPosition = Math.min(100, newPosition);

    setPlayers((prev) => ({
      ...prev,
      [playerId]: { ...prev[playerId], position: newPosition },
    }));

    // Switch to next player
    setCurrentPlayer((prev) => (prev === 1 ? 2 : 1));
    setDiceValue(null);
  };

  const resetGame = () => {
    setBoard(createBoard());
    setCurrentPlayer(1);
    setDiceValue(null);
    setPlayers({
      1: { position: 1, color: "#ff4444" },
      2: { position: 1, color: "#33b5e5" },
    });
  };

  const getCellPosition = (number) => {
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        if (board[i][j] === number) {
          return { row: i, col: j };
        }
      }
    }
    return null;
  };

  return (
    <GameContainer
      title="Snake & Ladders"
      description="Roll the dice and move your token. Watch out for snakes and climb the ladders to reach 100 first!"
    >
      <GameInfo>Current Player: {currentPlayer}</GameInfo>
      <Dice onClick={rollDice}>{diceValue || "?"}</Dice>
      <Board>
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <Cell key={`${rowIndex}-${colIndex}`}>
              {cell}
              {Object.entries(players).map(([id, player]) => {
                const position = getCellPosition(player.position);
                return position?.row === rowIndex &&
                  position?.col === colIndex ? (
                  <Player
                    key={id}
                    color={player.color}
                    onClick={() => movePlayer(parseInt(id))}
                  />
                ) : null;
              })}
            </Cell>
          ))
        )}
      </Board>
      <div style={{ textAlign: "center" }}>
        <Button onClick={resetGame}>Reset Game</Button>
      </div>
    </GameContainer>
  );
};

export default SnakeAndLadders;
