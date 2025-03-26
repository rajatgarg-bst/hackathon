import { useState, useCallback } from "react";
import styled from "@emotion/styled";
import GameContainer from "../../components/GameContainer";
import { motion } from "framer-motion";
import { useGameSounds } from "../../utils/sound";

const Board = styled.div`
  width: 600px;
  height: 600px;
  display: grid;
  grid-template-columns: repeat(15, 1fr);
  grid-template-rows: repeat(15, 1fr);
  gap: 2px;
  background-color: ${(props) => props.theme.colors.primary};
  padding: 2px;
  border-radius: ${(props) => props.theme.borderRadius.md};
  margin: 0 auto;
`;

const Cell = styled.div`
  background-color: ${(props) => {
    if (props.isHome) return props.color;
    if (props.isSafe) return "#ffffff";
    if (props.isPath) return "#f0f0f0";
    return "#ffffff";
  }};
  border-radius: ${(props) => props.theme.borderRadius.sm};
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
`;

const Token = styled.div`
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

const COLORS = {
  red: "#ff4444",
  green: "#00C851",
  yellow: "#ffbb33",
  blue: "#33b5e5",
};

const createBoard = () => {
  const board = Array(15)
    .fill()
    .map(() => Array(15).fill(null));

  // Set up home bases
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 6; j++) {
      board[i][j] = { type: "home", color: COLORS.red };
      board[i][j + 9] = { type: "home", color: COLORS.green };
      board[i + 9][j] = { type: "home", color: COLORS.yellow };
      board[i + 9][j + 9] = { type: "home", color: COLORS.blue };
    }
  }

  // Set up paths
  // Red path
  for (let i = 6; i < 9; i++) {
    board[6][i] = { type: "path", color: COLORS.red };
  }
  for (let i = 7; i < 9; i++) {
    board[i][8] = { type: "path", color: COLORS.red };
  }

  // Green path
  for (let i = 6; i < 9; i++) {
    board[i][8] = { type: "path", color: COLORS.green };
  }
  for (let i = 7; i < 9; i++) {
    board[8][i] = { type: "path", color: COLORS.green };
  }

  // Yellow path
  for (let i = 6; i < 9; i++) {
    board[8][i] = { type: "path", color: COLORS.yellow };
  }
  for (let i = 7; i < 9; i++) {
    board[i][6] = { type: "path", color: COLORS.yellow };
  }

  // Blue path
  for (let i = 6; i < 9; i++) {
    board[i][6] = { type: "path", color: COLORS.blue };
  }
  for (let i = 7; i < 9; i++) {
    board[6][i] = { type: "path", color: COLORS.blue };
  }

  // Set up safe spots
  board[6][6] = { type: "safe", color: "#ffffff" };
  board[6][7] = { type: "safe", color: "#ffffff" };
  board[6][8] = { type: "safe", color: "#ffffff" };
  board[7][6] = { type: "safe", color: "#ffffff" };
  board[7][8] = { type: "safe", color: "#ffffff" };
  board[8][6] = { type: "safe", color: "#ffffff" };
  board[8][7] = { type: "safe", color: "#ffffff" };
  board[8][8] = { type: "safe", color: "#ffffff" };

  return board;
};

const Ludo = () => {
  const { playClick, playLudoDice, playLudoMove, playLudoCapture } =
    useGameSounds();

  const [board, setBoard] = useState(createBoard());
  const [currentPlayer, setCurrentPlayer] = useState("red");
  const [diceValue, setDiceValue] = useState(null);
  const [tokens, setTokens] = useState({
    red: Array(4)
      .fill()
      .map(() => ({ row: 0, col: 0 })),
    green: Array(4)
      .fill()
      .map(() => ({ row: 0, col: 9 })),
    yellow: Array(4)
      .fill()
      .map(() => ({ row: 9, col: 0 })),
    blue: Array(4)
      .fill()
      .map(() => ({ row: 9, col: 9 })),
  });

  const [isRolling, setIsRolling] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [canMove, setCanMove] = useState(false);
  const [canRollAgain, setCanRollAgain] = useState(false);

  const rollDice = useCallback(() => {
    if (isRolling) return;

    setIsRolling(true);
    playLudoDice();

    const roll = Math.floor(Math.random() * 6) + 1;
    setDiceValue(roll);

    setTimeout(() => {
      setIsRolling(false);
      if (roll === 6) {
        setCanRollAgain(true);
      } else {
        setCurrentPlayer((prev) => (prev === "red" ? "blue" : "red"));
      }
    }, 1000);
  }, [isRolling, playLudoDice]);

  const moveToken = (color, index) => {
    if (color !== currentPlayer || !diceValue) return;

    const token = tokens[color][index];
    const newTokens = { ...tokens };
    const newToken = { ...token };

    // Simple movement logic (can be expanded)
    if (color === "red") {
      newToken.col += diceValue;
    } else if (color === "green") {
      newToken.row += diceValue;
    } else if (color === "yellow") {
      newToken.col -= diceValue;
    } else if (color === "blue") {
      newToken.row -= diceValue;
    }

    // Keep tokens within bounds
    newToken.row = Math.max(0, Math.min(14, newToken.row));
    newToken.col = Math.max(0, Math.min(14, newToken.col));

    newTokens[color][index] = newToken;
    setTokens(newTokens);

    // Switch to next player
    const players = ["red", "green", "yellow", "blue"];
    const currentIndex = players.indexOf(currentPlayer);
    setCurrentPlayer(players[(currentIndex + 1) % 4]);
    setDiceValue(null);
  };

  const resetGame = () => {
    setBoard(createBoard());
    setCurrentPlayer("red");
    setDiceValue(null);
    setTokens({
      red: Array(4)
        .fill()
        .map(() => ({ row: 0, col: 0 })),
      green: Array(4)
        .fill()
        .map(() => ({ row: 0, col: 9 })),
      yellow: Array(4)
        .fill()
        .map(() => ({ row: 9, col: 0 })),
      blue: Array(4)
        .fill()
        .map(() => ({ row: 9, col: 9 })),
    });
    setIsRolling(false);
    setIsMoving(false);
    setCanMove(false);
    setCanRollAgain(false);
    playClick();
  };

  return (
    <GameContainer
      title="Ludo"
      description="Roll the dice and move your tokens around the board. First player to get all tokens to the center wins!"
    >
      <GameInfo>Current Player: {currentPlayer}</GameInfo>
      <Dice onClick={rollDice}>{diceValue || "?"}</Dice>
      <Board>
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              isHome={cell?.type === "home"}
              isSafe={cell?.type === "safe"}
              isPath={cell?.type === "path"}
              color={cell?.color}
            >
              {tokens[currentPlayer].map((token, index) =>
                token.row === rowIndex && token.col === colIndex ? (
                  <Token
                    key={index}
                    color={COLORS[currentPlayer]}
                    onClick={() => moveToken(currentPlayer, index)}
                  />
                ) : null
              )}
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

export default Ludo;
