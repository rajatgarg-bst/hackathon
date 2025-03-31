import React, { useState } from "react";
import styled from "@emotion/styled";
import GameContainer from "../../components/GameContainer";
import { useSound } from "use-sound";
import diceRollSound from "../../../public/sounds/dice-roll.mp3";

// Game constants
const BOARD_SIZE = 10;
const TOTAL_SQUARES = 100;
const SNAKES = {
  97: 78,
  95: 75,
  87: 73,
  62: 18,
  36: 15,
  31: 10,
};
const LADDERS = {
  4: 56, // first ladder
  12: 50, // second ladder
  27: 53, // third ladder
  22: 58, // fourth ladder
  41: 79, // fifth ladder
  54: 88, // sixth ladder
};

// Styled components
const Board = styled.div`
  width: 600px;
  height: 600px;
  display: grid;
  grid-template-columns: repeat(${BOARD_SIZE}, 1fr);
  grid-template-rows: repeat(${BOARD_SIZE}, 1fr);
  gap: 0px;
  background-color: #fff;
  padding: 0px;
  border: 2px solid #000;
  margin: 0 auto;
  position: relative;
`;

const Cell = styled.div`
  background-color: ${(props) =>
    (props.row + props.col) % 2 === 0 ? "#fff" : "#ff6b6b"};
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.4rem;
  font-weight: bold;
  position: relative;
  color: #000;
  z-index: 1;
  cursor: ${(props) => (props.isValidMove ? "pointer" : "default")};
  transition: background-color 0.3s ease;
  ${(props) =>
    props.isValidMove &&
    `
    background-color: ${
      props.currentPlayer === 1 ? "#90EE90" : "#87CEEB"
    } !important;
    box-shadow: 0 0 10px ${
      props.currentPlayer === 1
        ? "rgba(144, 238, 144, 0.5)"
        : "rgba(135, 206, 235, 0.5)"
    };
    &:hover {
      background-color: ${
        props.currentPlayer === 1 ? "#7CCD7C" : "#5F9EA0"
      } !important;
    }
  `}
`;

const Player = styled.img`
  width: 30px;
  height: 30px;
  position: absolute;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 3;
  transform: ${(props) => props.playerOffset};

  &:hover {
    transform: ${(props) => props.playerOffset} scale(1.2);
  }
`;

const Dice = styled.div`
  width: 60px;
  height: 60px;
  background-color: white;
  border: 2px solid #000;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2rem;
  font-weight: bold;
  cursor: pointer;
  user-select: none;
  margin: 1rem auto;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

const GameInfo = styled.div`
  text-align: center;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  color: #000;
`;

const Button = styled.button`
  background-color: #ff6b6b;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 1rem;
  margin-top: 1rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #ff5252;
    transform: translateY(-2px);
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
    transform: none;
  }
`;

const SnakeImage = styled.img`
  position: absolute;
  width: auto;
  height: 35px;
  z-index: 2;
  pointer-events: none;
  transform-origin: center left;
  filter: drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.3));
`;

const LadderContainer = styled.div`
  position: absolute;
  width: 20px;
  z-index: 2;
  pointer-events: none;
`;

const LadderSide = styled.div`
  position: absolute;
  width: 4px;
  background-color: #4169e1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const LadderRung = styled.div`
  position: absolute;
  width: 20px;
  height: 3px;
  background-color: #4169e1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const WinnerMessage = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: ${(props) => props.theme.colors.white};
  padding: 2rem;
  border-radius: ${(props) => props.theme.borderRadius.md};
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translate(-50%, -60%);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -50%);
    }
  }
`;

// Game logic functions
const createBoard = () => {
  const board = Array(BOARD_SIZE)
    .fill()
    .map(() => Array(BOARD_SIZE).fill(null));
  let number = TOTAL_SQUARES;

  // Create board from top to bottom
  for (let row = 0; row < BOARD_SIZE; row++) {
    if (row % 2 === 0) {
      // Even rows (go left to right)
      for (let col = 0; col < BOARD_SIZE; col++) {
        board[row][col] = number--;
      }
    } else {
      // Odd rows (go right to left)
      for (let col = BOARD_SIZE - 1; col >= 0; col--) {
        board[row][col] = number--;
      }
    }
  }

  // Log the board for verification
  console.log("Board Layout:");
  board.forEach((row) => console.log(row.join("\t")));

  return board;
};

const getCellPosition = (number, board) => {
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      if (board[i][j] === number) {
        return { row: i, col: j };
      }
    }
  }
  return null;
};

const SnakeAndLadders = () => {
  const [board, setBoard] = useState(createBoard());
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [diceValue, setDiceValue] = useState(null);
  const [players, setPlayers] = useState({
    1: { position: 1, name: "Player 1", image: "/images/player1.svg" },
    2: { position: 1, name: "Player 2", image: "/images/player2.svg" },
  });
  const [winner, setWinner] = useState(null);
  const [consecutiveSixes, setConsecutiveSixes] = useState(0);
  const [playDiceRoll] = useSound(diceRollSound);

  const isValidMove = (cellNumber) => {
    if (!diceValue) return false;
    const currentPosition = players[currentPlayer].position;
    return cellNumber === currentPosition + diceValue;
  };

  const handleCellClick = (cellNumber) => {
    if (!isValidMove(cellNumber) || winner) return;

    let newPosition = cellNumber;

    // Check for snakes
    if (SNAKES[newPosition]) {
      newPosition = SNAKES[newPosition];
    }
    // Check for ladders
    else if (LADDERS[newPosition]) {
      newPosition = LADDERS[newPosition];
    }

    setPlayers((prev) => ({
      ...prev,
      [currentPlayer]: { ...prev[currentPlayer], position: newPosition },
    }));

    // Check for winner
    if (newPosition === TOTAL_SQUARES) {
      setWinner(currentPlayer);
      return;
    }

    // Handle consecutive sixes
    if (diceValue === 6 && consecutiveSixes < 2) {
      setDiceValue(null);
    } else {
      setCurrentPlayer((prev) => (prev === 1 ? 2 : 1));
      setDiceValue(null);
    }
  };

  const rollDice = () => {
    if (winner || diceValue) return;

    const value = Math.floor(Math.random() * 6) + 1;
    setDiceValue(value);
    playDiceRoll();

    if (value === 6) {
      setConsecutiveSixes((prev) => prev + 1);
    } else {
      setConsecutiveSixes(0);
    }
  };

  const resetGame = () => {
    setBoard(createBoard());
    setCurrentPlayer(1);
    setDiceValue(null);
    setWinner(null);
    setConsecutiveSixes(0);
    setPlayers({
      1: { position: 1, name: "Player 1", image: "/images/player1.svg" },
      2: { position: 1, name: "Player 2", image: "/images/player2.svg" },
    });
  };

  const renderSnakesAndLadders = () => {
    const snakes = Object.entries(SNAKES).map(([start, end]) => {
      const startPos = getCellPosition(parseInt(start), board);
      const endPos = getCellPosition(end, board);
      if (!startPos || !endPos) return null;

      const startX = startPos.col * 60 + 30;
      const startY = startPos.row * 60 + 30;
      const endX = endPos.col * 60 + 30;
      const endY = endPos.row * 60 + 30;

      const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);
      const length = Math.sqrt(
        Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
      );

      return (
        <SnakeImage
          key={`snake-${start}-${end}`}
          src="/images/snake.svg"
          alt={`Snake from ${start} to ${end}`}
          style={{
            left: `${startX - 20}px`,
            top: `${startY - 20}px`,
            width: `${length}px`,
            transform: `rotate(${angle}deg) translateY(-50%)`,
          }}
        />
      );
    });

    const ladders = Object.entries(LADDERS).map(([start, end]) => {
      const startPos = getCellPosition(parseInt(start), board);
      const endPos = getCellPosition(parseInt(end), board);
      if (!startPos || !endPos) return null;

      // Calculate positions based on the cell centers
      const cellSize = 60;
      const startX = startPos.col * cellSize + cellSize / 2;
      const startY = startPos.row * cellSize + cellSize / 2;
      const endY = endPos.row * cellSize + cellSize / 2;

      // Calculate the height based on vertical distance
      // Only reduce height for ladder at square 14
      const height =
        parseInt(start) === 14
          ? Math.abs(endY - startY) * 0.8
          : Math.abs(endY - startY);

      // Calculate number of rungs based on height
      const numRungs = Math.floor(height / 30); // One rung every 30px for better spacing

      // Determine if ladder goes up or down
      const isGoingUp = endY < startY;

      return (
        <LadderContainer
          key={`ladder-${start}-${end}`}
          style={{
            left: `${startX - 10 + 30}px`, // Center the ladder horizontally (20px width / 2) and move right by 30px (20px + 10px shift)
            top: `${isGoingUp ? endY : startY}px`, // Start from the lower position
            height: `${height}px`,
            transform: `rotate(15deg)`, // Changed from 20deg to 15deg
            transformOrigin: "center", // Rotate around the center point
          }}
        >
          {/* Left side */}
          <LadderSide
            style={{
              left: "0",
              height: "100%",
            }}
          />
          {/* Right side */}
          <LadderSide
            style={{
              right: "0",
              height: "100%",
            }}
          />
          {/* Rungs */}
          {[...Array(numRungs)].map((_, index) => (
            <LadderRung
              key={`rung-${index}`}
              style={{
                top: `${(index + 1) * (100 / (numRungs + 1))}%`,
              }}
            />
          ))}
        </LadderContainer>
      );
    });

    return (
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: "none",
          zIndex: 2,
        }}
      >
        {ladders}
        {snakes}
      </div>
    );
  };

  return (
    <GameContainer
      title="Snake & Ladders"
      description="Roll the dice and click on the correct square to move your token. Watch out for snakes and climb the ladders to reach 100 first!"
    >
      <GameInfo>
        Current Player: {players[currentPlayer].name}
        {diceValue &&
          ` - Move to square ${players[currentPlayer].position + diceValue}`}
        {consecutiveSixes > 0 &&
          ` (Rolled ${consecutiveSixes} six${
            consecutiveSixes > 1 ? "es" : ""
          }!)`}
      </GameInfo>
      <Dice
        onClick={rollDice}
        style={{ cursor: winner || diceValue ? "not-allowed" : "pointer" }}
      >
        {diceValue || "?"}
      </Dice>
      <Board>
        {renderSnakesAndLadders()}
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              row={rowIndex}
              col={colIndex}
              isValidMove={isValidMove(cell)}
              currentPlayer={currentPlayer}
              onClick={() => handleCellClick(cell)}
            >
              {cell}
              {Object.entries(players).map(([id, player]) => {
                const position = getCellPosition(player.position, board);
                return position?.row === rowIndex &&
                  position?.col === colIndex ? (
                  <Player
                    key={id}
                    src={player.image}
                    alt={player.name}
                    playerOffset={
                      // Only offset if both players are on the same cell
                      Object.values(players).filter(
                        (p) => p.position === player.position
                      ).length > 1
                        ? id === "1"
                          ? "translate(-10px, 0)"
                          : "translate(10px, 0)"
                        : "translate(0, 0)"
                    }
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
      {winner && (
        <WinnerMessage>
          <h2>🎉 {players[winner].name} Wins! 🎉</h2>
          <p>Congratulations on reaching square 100!</p>
          <Button onClick={resetGame}>Play Again</Button>
        </WinnerMessage>
      )}
    </GameContainer>
  );
};

export default SnakeAndLadders;
