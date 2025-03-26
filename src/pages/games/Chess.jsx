import { useState, useCallback } from "react";
import styled from "@emotion/styled";
import GameContainer from "../../components/GameContainer";
import { motion } from "framer-motion";
import { useGameSounds } from "../../utils/sound";

const Board = styled.div`
  width: 560px;
  height: 560px;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(8, 1fr);
  border: 2px solid #333;
  margin: 0 auto;
`;

const Square = styled.div`
  width: 70px;
  height: 70px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${(props) => (props.isLight ? "#f0d9b5" : "#b58863")};
  cursor: pointer;
  position: relative;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${(props) =>
      props.isSelected ? "#7b61ff" : props.isLight ? "#f0d9b5" : "#b58863"};
  }
`;

const Piece = styled.div`
  width: 60px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 40px;
  user-select: none;
  position: relative;
  z-index: 1;
`;

const ValidMove = styled.div`
  position: absolute;
  width: 20px;
  height: 20px;
  background-color: rgba(0, 255, 0, 0.3);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const GameInfo = styled.div`
  text-align: center;
  margin-bottom: 20px;
  font-size: 1.2rem;
  color: #333;
`;

const Button = styled.button`
  background-color: #333;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  font-size: 1rem;
  margin-top: 20px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #555;
  }
`;

const initialBoard = [
  ["♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"],
  ["♟", "♟", "♟", "♟", "♟", "♟", "♟", "♟"],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["♙", "♙", "♙", "♙", "♙", "♙", "♙", "♙"],
  ["♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"],
];

const isWhitePiece = (piece) => {
  return ["♔", "♕", "♖", "♗", "♘", "♙"].includes(piece);
};

const isBlackPiece = (piece) => {
  return ["♚", "♛", "♜", "♝", "♞", "♟"].includes(piece);
};

const isValidMove = (board, from, to) => {
  const piece = board[from.row][from.col];
  const target = board[to.row][to.col];

  // Can't capture your own pieces
  if (isWhitePiece(piece) && isWhitePiece(target)) return false;
  if (isBlackPiece(piece) && isBlackPiece(target)) return false;

  // Basic movement rules (simplified for demo)
  if (piece === "♙" || piece === "♟") {
    const direction = isWhitePiece(piece) ? -1 : 1;
    const startRow = isWhitePiece(piece) ? 6 : 1;

    // Forward move
    if (from.col === to.col && !target) {
      if (to.row === from.row + direction) return true;
      if (from.row === startRow && to.row === from.row + 2 * direction)
        return true;
    }

    // Diagonal capture
    if (Math.abs(to.col - from.col) === 1 && to.row === from.row + direction) {
      return target !== "";
    }
  }

  // Add more piece movement rules here
  return true;
};

const Chess = () => {
  const { playClick, playChessMove, playChessCapture, playChessCheck } =
    useGameSounds();
  const [board, setBoard] = useState(initialBoard);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [isWhiteTurn, setIsWhiteTurn] = useState(true);
  const [validMoves, setValidMoves] = useState([]);

  const getValidMoves = useCallback(
    (row, col, piece) => {
      const moves = [];
      const isWhite = isWhitePiece(piece);

      // Pawn moves
      if (piece === "♙" || piece === "♟") {
        const direction = isWhite ? -1 : 1;
        const startRow = isWhite ? 6 : 1;

        // Forward move
        if (!board[row + direction]?.[col]) {
          moves.push([row + direction, col]);
          // First move can be 2 squares
          if ((isWhite && row === 6) || (!isWhite && row === 1)) {
            if (!board[row + 2 * direction]?.[col]) {
              moves.push([row + 2 * direction, col]);
            }
          }
        }
        // Diagonal captures
        if (
          board[row + direction]?.[col - 1] &&
          (isWhite
            ? isBlackPiece(board[row + direction][col - 1])
            : isWhitePiece(board[row + direction][col - 1]))
        ) {
          moves.push([row + direction, col - 1]);
        }
        if (
          board[row + direction]?.[col + 1] &&
          (isWhite
            ? isBlackPiece(board[row + direction][col + 1])
            : isWhitePiece(board[row + direction][col + 1]))
        ) {
          moves.push([row + direction, col + 1]);
        }
      }

      // Rook moves
      if (piece === "♖" || piece === "♜") {
        const directions = [
          [0, 1],
          [0, -1],
          [1, 0],
          [-1, 0],
        ];
        for (const [dx, dy] of directions) {
          let x = row + dx;
          let y = col + dy;
          while (
            x >= 0 &&
            x < 8 &&
            y >= 0 &&
            y < 8 &&
            (!board[x][y] ||
              (isWhite ? isBlackPiece(board[x][y]) : isWhitePiece(board[x][y])))
          ) {
            moves.push([x, y]);
            if (board[x][y]) break;
            x += dx;
            y += dy;
          }
        }
      }

      // Bishop moves
      if (piece === "♗" || piece === "♝") {
        const directions = [
          [1, 1],
          [1, -1],
          [-1, 1],
          [-1, -1],
        ];
        for (const [dx, dy] of directions) {
          let x = row + dx;
          let y = col + dy;
          while (
            x >= 0 &&
            x < 8 &&
            y >= 0 &&
            y < 8 &&
            (!board[x][y] ||
              (isWhite ? isBlackPiece(board[x][y]) : isWhitePiece(board[x][y])))
          ) {
            moves.push([x, y]);
            if (board[x][y]) break;
            x += dx;
            y += dy;
          }
        }
      }

      // Queen moves (combination of rook and bishop)
      if (piece === "♕" || piece === "♛") {
        const directions = [
          [0, 1],
          [0, -1],
          [1, 0],
          [-1, 0],
          [1, 1],
          [1, -1],
          [-1, 1],
          [-1, -1],
        ];
        for (const [dx, dy] of directions) {
          let x = row + dx;
          let y = col + dy;
          while (
            x >= 0 &&
            x < 8 &&
            y >= 0 &&
            y < 8 &&
            (!board[x][y] ||
              (isWhite ? isBlackPiece(board[x][y]) : isWhitePiece(board[x][y])))
          ) {
            moves.push([x, y]);
            if (board[x][y]) break;
            x += dx;
            y += dy;
          }
        }
      }

      // King moves
      if (piece === "♔" || piece === "♚") {
        const directions = [
          [0, 1],
          [0, -1],
          [1, 0],
          [-1, 0],
          [1, 1],
          [1, -1],
          [-1, 1],
          [-1, -1],
        ];
        for (const [dx, dy] of directions) {
          const x = row + dx;
          const y = col + dy;
          if (
            x >= 0 &&
            x < 8 &&
            y >= 0 &&
            y < 8 &&
            (!board[x][y] ||
              (isWhite ? isBlackPiece(board[x][y]) : isWhitePiece(board[x][y])))
          ) {
            moves.push([x, y]);
          }
        }
      }

      // Knight moves
      if (piece === "♘" || piece === "♞") {
        const possibleMoves = [
          [-2, -1],
          [-2, 1],
          [-1, -2],
          [-1, 2],
          [1, -2],
          [1, 2],
          [2, -1],
          [2, 1],
        ];

        for (const [dx, dy] of possibleMoves) {
          const newRow = row + dx;
          const newCol = col + dy;

          if (
            newRow >= 0 &&
            newRow < 8 &&
            newCol >= 0 &&
            newCol < 8 &&
            (!board[newRow][newCol] ||
              (isWhite
                ? isBlackPiece(board[newRow][newCol])
                : isWhitePiece(board[newRow][newCol])))
          ) {
            moves.push([newRow, newCol]);
          }
        }
      }

      return moves;
    },
    [board]
  );

  const handleSquareClick = useCallback(
    (row, col) => {
      const piece = board[row][col];

      if (!selectedPiece) {
        // Selecting a piece
        if (piece && isWhitePiece(piece) === isWhiteTurn) {
          setSelectedPiece({ row, col });
          const moves = getValidMoves(row, col, piece);
          setValidMoves(moves);
          playClick();
        }
      } else {
        // Moving a piece
        const isValidMove = validMoves.some(([r, c]) => r === row && c === col);

        if (isValidMove) {
          const newBoard = [...board];
          const targetPiece = newBoard[row][col];
          newBoard[row][col] = newBoard[selectedPiece.row][selectedPiece.col];
          newBoard[selectedPiece.row][selectedPiece.col] = "";
          setBoard(newBoard);

          // Play appropriate sound
          if (targetPiece) {
            playChessCapture();
          } else {
            playChessMove();
          }

          // Check for check
          if (targetPiece === "♔" || targetPiece === "♚") {
            playChessCheck();
          }

          setSelectedPiece(null);
          setValidMoves([]);
          setIsWhiteTurn((prev) => !prev);
        } else {
          setSelectedPiece(null);
          setValidMoves([]);
          playClick();
        }
      }
    },
    [
      board,
      selectedPiece,
      isWhiteTurn,
      validMoves,
      getValidMoves,
      playClick,
      playChessMove,
      playChessCapture,
      playChessCheck,
    ]
  );

  const resetGame = () => {
    setBoard(initialBoard);
    setSelectedPiece(null);
    setValidMoves([]);
    setIsWhiteTurn(true);
    playClick();
  };

  return (
    <GameContainer
      title="Chess"
      description="A classic game of strategy. White moves first. Click a piece to select it and click a valid square to move."
    >
      <GameInfo>{isWhiteTurn ? "White's Turn" : "Black's Turn"}</GameInfo>
      <Board>
        {board.map((row, rowIndex) =>
          row.map((piece, colIndex) => (
            <Square
              key={`${rowIndex}-${colIndex}`}
              isLight={(rowIndex + colIndex) % 2 === 0}
              isSelected={
                selectedPiece &&
                selectedPiece.row === rowIndex &&
                selectedPiece.col === colIndex
              }
              onClick={() => handleSquareClick(rowIndex, colIndex)}
            >
              {piece && <Piece>{piece}</Piece>}
              {validMoves.some(
                ([r, c]) => r === rowIndex && c === colIndex
              ) && <ValidMove />}
            </Square>
          ))
        )}
      </Board>
      <div style={{ textAlign: "center" }}>
        <Button onClick={resetGame}>Reset Game</Button>
      </div>
    </GameContainer>
  );
};

export default Chess;
