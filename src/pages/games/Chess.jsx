import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useGameSounds } from "../../utils/sound";

const Chess = () => {
  const [board, setBoard] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [isWhiteTurn, setIsWhiteTurn] = useState(true);
  const [moveHistory, setMoveHistory] = useState([]);
  const [gameStatus, setGameStatus] = useState("playing");
  const [fiftyMoveCounter, setFiftyMoveCounter] = useState(0);
  const [positionHistory, setPositionHistory] = useState([]);
  const [invalidMoveAttempted, setInvalidMoveAttempted] = useState(false);
  const { playChessMove, playChessCapture, playChessCheck } = useGameSounds();

  // Initialize the board
  useEffect(() => {
    const initialBoard = createInitialBoard();
    setBoard(initialBoard);
    setPositionHistory([JSON.stringify(initialBoard)]);
  }, []);

  const createInitialBoard = () => {
    const board = Array(8)
      .fill()
      .map(() => Array(8).fill(""));

    // Set up pawns (White: a2-h2, Black: a7-h7)
    for (let i = 0; i < 8; i++) {
      board[1][i] = "♙"; // White pawns on rank 2
      board[6][i] = "♟"; // Black pawns on rank 7
    }

    // Set up other pieces
    // White pieces (ranks 1 and 2)
    board[0][0] = "♖"; // a1
    board[0][1] = "♘"; // b1
    board[0][2] = "♗"; // c1
    board[0][3] = "♕"; // d1
    board[0][4] = "♔"; // e1
    board[0][5] = "♗"; // f1
    board[0][6] = "♘"; // g1
    board[0][7] = "♖"; // h1

    // Black pieces (ranks 7 and 8)
    board[7][0] = "♜"; // a8
    board[7][1] = "♞"; // b8
    board[7][2] = "♝"; // c8
    board[7][3] = "♛"; // d8
    board[7][4] = "♚"; // e8
    board[7][5] = "♝"; // f8
    board[7][6] = "♞"; // g8
    board[7][7] = "♜"; // h8

    return board;
  };

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

    // Pawn movement
    if (piece === "♙" || piece === "♟") {
      const direction = isWhitePiece(piece) ? 1 : -1; // White moves down (positive), Black moves up (negative)
      const startRow = isWhitePiece(piece) ? 1 : 6; // White starts at 1, Black at 6

      // Forward move
      if (from.col === to.col && !target) {
        if (to.row === from.row + direction) return true;
        if (from.row === startRow && to.row === from.row + 2 * direction) {
          // Check if the path is clear
          const intermediateRow = from.row + direction;
          return !board[intermediateRow][from.col];
        }
      }

      // Diagonal capture
      if (
        Math.abs(to.col - from.col) === 1 &&
        to.row === from.row + direction
      ) {
        return target !== "";
      }

      // En passant
      const lastMove = moveHistory[moveHistory.length - 1];
      if (
        lastMove &&
        lastMove.piece === (isWhitePiece(piece) ? "♟" : "♙") &&
        Math.abs(lastMove.endRow - lastMove.startRow) === 2 &&
        lastMove.endRow === from.row &&
        lastMove.endCol === to.col
      ) {
        return true;
      }
    }

    // Rook movement
    if (piece === "♖" || piece === "♜") {
      if (from.row === to.row || from.col === to.col) {
        return isPathClear(board, from, to);
      }
    }

    // Knight movement
    if (piece === "♘" || piece === "♞") {
      const rowDiff = Math.abs(to.row - from.row);
      const colDiff = Math.abs(to.col - from.col);
      return (
        (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)
      );
    }

    // Bishop movement
    if (piece === "♗" || piece === "♝") {
      if (Math.abs(to.row - from.row) === Math.abs(to.col - from.col)) {
        return isPathClear(board, from, to);
      }
    }

    // Queen movement
    if (piece === "♕" || piece === "♛") {
      if (
        from.row === to.row ||
        from.col === to.col ||
        Math.abs(to.row - from.row) === Math.abs(to.col - from.col)
      ) {
        return isPathClear(board, from, to);
      }
    }

    // King movement
    if (piece === "♔" || piece === "♚") {
      const rowDiff = Math.abs(to.row - from.row);
      const colDiff = Math.abs(to.col - from.col);

      // Normal move
      if (rowDiff <= 1 && colDiff <= 1) return true;

      // Castling
      if (rowDiff === 0 && colDiff === 2) {
        const rookCol = to.col > from.col ? 7 : 0;
        const rook = board[from.row][rookCol];

        // Check if king and rook are in their starting positions
        const isWhiteKing = piece === "♔";
        const isWhiteRook = rook === "♖";
        const isBlackKing = piece === "♚";
        const isBlackRook = rook === "♜";

        if ((isWhiteKing && isWhiteRook) || (isBlackKing && isBlackRook)) {
          return isPathClear(board, from, { row: from.row, col: rookCol });
        }
      }
    }

    return false;
  };

  const isPathClear = (board, from, to) => {
    const rowStep =
      from.row === to.row
        ? 0
        : (to.row - from.row) / Math.abs(to.row - from.row);
    const colStep =
      from.col === to.col
        ? 0
        : (to.col - from.col) / Math.abs(to.col - from.col);

    let currentRow = from.row + rowStep;
    let currentCol = from.col + colStep;

    while (currentRow !== to.row || currentCol !== to.col) {
      if (board[currentRow][currentCol]) return false;
      currentRow += rowStep;
      currentCol += colStep;
    }

    return true;
  };

  const isInCheck = (color, board) => {
    // Find the king
    let kingRow, kingCol;
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (
          (color === "white" && board[i][j] === "♔") ||
          (color === "black" && board[i][j] === "♚")
        ) {
          kingRow = i;
          kingCol = j;
          break;
        }
      }
      if (kingRow !== undefined) break;
    }

    // Check if any opponent piece can attack the king
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = board[i][j];
        if (
          piece &&
          ((color === "white" && isBlackPiece(piece)) ||
            (color === "black" && isWhitePiece(piece)))
        ) {
          if (
            isValidMove(
              board,
              { row: i, col: j },
              { row: kingRow, col: kingCol }
            )
          ) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const isCheckmate = (color) => {
    if (!isInCheck(color, board)) return false;

    // Try all possible moves for all pieces
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = board[i][j];
        if (
          piece &&
          ((color === "white" && isWhitePiece(piece)) ||
            (color === "black" && isBlackPiece(piece)))
        ) {
          for (let endRow = 0; endRow < 8; endRow++) {
            for (let endCol = 0; endCol < 8; endCol++) {
              if (
                isValidMove(
                  board,
                  { row: i, col: j },
                  { row: endRow, col: endCol }
                )
              ) {
                // Try the move
                const tempBoard = JSON.parse(JSON.stringify(board));
                tempBoard[endRow][endCol] = piece;
                tempBoard[i][j] = "";

                // Check if the move gets out of check
                if (!isInCheck(color, tempBoard)) {
                  return false; // Found a legal move that gets out of check
                }
              }
            }
          }
        }
      }
    }
    return true; // No legal moves found to get out of check
  };

  const isStalemate = (color) => {
    if (isInCheck(color, board)) return false;

    // Try all possible moves for all pieces
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = board[i][j];
        if (
          piece &&
          ((color === "white" && isWhitePiece(piece)) ||
            (color === "black" && isBlackPiece(piece)))
        ) {
          for (let endRow = 0; endRow < 8; endRow++) {
            for (let endCol = 0; endCol < 8; endCol++) {
              if (
                isValidMove(
                  board,
                  { row: i, col: j },
                  { row: endRow, col: endCol }
                )
              ) {
                // Try the move
                const tempBoard = JSON.parse(JSON.stringify(board));
                tempBoard[endRow][endCol] = piece;
                tempBoard[i][j] = "";

                // Check if the move is legal
                const moveIsLegal = !isInCheck(color, tempBoard);
                if (moveIsLegal) return false;
              }
            }
          }
        }
      }
    }
    return true;
  };

  const isDraw = () => {
    // Don't check for draw until at least 10 moves have been made
    if (moveHistory.length < 10) return false;

    // Check for insufficient material
    const pieces = [];
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (board[i][j]) pieces.push(board[i][j]);
      }
    }

    // Only check for insufficient material if there are 2 or fewer pieces
    if (pieces.length <= 2) {
      if (pieces.length === 1) return true; // King vs nothing
      if (pieces.length === 2) {
        const [piece1, piece2] = pieces;
        // King vs King
        if (
          (piece1 === "♔" && piece2 === "♚") ||
          (piece1 === "♚" && piece2 === "♔")
        )
          return true;
        // King vs Bishop
        if (
          (piece1 === "♔" && piece2 === "♝") ||
          (piece1 === "♝" && piece2 === "♔") ||
          (piece1 === "♚" && piece2 === "♗") ||
          (piece1 === "♗" && piece2 === "♚")
        )
          return true;
        // King vs Knight
        if (
          (piece1 === "♔" && piece2 === "♞") ||
          (piece1 === "♞" && piece2 === "♔") ||
          (piece1 === "♚" && piece2 === "♘") ||
          (piece1 === "♘" && piece2 === "♚")
        )
          return true;
      }
    }

    // Check for threefold repetition
    const currentPosition = JSON.stringify(board);
    const positionCount = positionHistory.filter(
      (pos) => pos === currentPosition
    ).length;
    if (positionCount >= 3) return true;

    // Check for fifty-move rule
    if (fiftyMoveCounter >= 50) return true;

    return false;
  };

  const handleMove = (startRow, startCol, endRow, endCol) => {
    const piece = board[startRow][startCol];
    if (!piece) return;

    // Check if it's the correct player's turn
    if (
      (isWhiteTurn && !isWhitePiece(piece)) ||
      (!isWhiteTurn && !isBlackPiece(piece))
    ) {
      return;
    }

    // Check if the move is valid
    if (
      !isValidMove(
        board,
        { row: startRow, col: startCol },
        { row: endRow, col: endCol }
      )
    ) {
      return;
    }

    // Create a copy of the board
    const newBoard = JSON.parse(JSON.stringify(board));
    const capturedPiece = newBoard[endRow][endCol];

    // Handle special moves
    if (piece === "♙" || piece === "♟") {
      // En passant
      if (Math.abs(endCol - startCol) === 1 && !capturedPiece) {
        newBoard[startRow][endCol] = "";
      }
      // Pawn promotion
      if ((piece === "♙" && endRow === 0) || (piece === "♟" && endRow === 7)) {
        newBoard[endRow][endCol] = piece === "♙" ? "♕" : "♛";
      }
    }

    // Castling
    if ((piece === "♔" || piece === "♚") && Math.abs(endCol - startCol) === 2) {
      const rookCol = endCol > startCol ? 7 : 0;
      const rookEndCol = endCol > startCol ? endCol - 1 : endCol + 1;
      newBoard[startRow][rookEndCol] = newBoard[startRow][rookCol];
      newBoard[startRow][rookCol] = "";
    }

    // Make the move
    newBoard[endRow][endCol] = piece;
    newBoard[startRow][startCol] = "";

    // Check if the move puts/leaves the king in check on the new board
    const color = isWhitePiece(piece) ? "white" : "black";
    if (isInCheck(color, newBoard)) {
      setInvalidMoveAttempted(true);
      setTimeout(() => setInvalidMoveAttempted(false), 500);
      return; // Invalid move that puts/leaves the king in check
    }

    // Update move history
    const newMoveHistory = [
      ...moveHistory,
      {
        piece,
        startRow,
        startCol,
        endRow,
        endCol,
        capturedPiece,
      },
    ];
    setMoveHistory(newMoveHistory);

    // Update position history
    const newPositionHistory = [...positionHistory, JSON.stringify(newBoard)];
    setPositionHistory(newPositionHistory);

    // Update fifty-move counter
    if (capturedPiece || piece === "♙" || piece === "♟") {
      setFiftyMoveCounter(0);
    } else {
      setFiftyMoveCounter((prev) => prev + 1);
    }

    // Update the board state
    setBoard(newBoard);
    setSelectedPiece(null);

    // Play appropriate sound
    if (capturedPiece) {
      playChessCapture();
    } else if (isInCheck(isWhiteTurn ? "black" : "white", newBoard)) {
      playChessCheck();
    } else {
      playChessMove();
    }

    // Check game status
    const nextPlayer = isWhiteTurn ? "black" : "white";
    setIsWhiteTurn(!isWhiteTurn);

    // Check for checkmate first using the new board state
    if (isInCheck(nextPlayer, newBoard)) {
      // Check if it's checkmate by trying all possible moves on the new board
      let isCheckmated = true;
      for (let i = 0; i < 8 && isCheckmated; i++) {
        for (let j = 0; j < 8 && isCheckmated; j++) {
          const piece = newBoard[i][j];
          if (
            piece &&
            ((nextPlayer === "white" && isWhitePiece(piece)) ||
              (nextPlayer === "black" && isBlackPiece(piece)))
          ) {
            for (let endRow = 0; endRow < 8 && isCheckmated; endRow++) {
              for (let endCol = 0; endCol < 8 && isCheckmated; endCol++) {
                if (
                  isValidMove(
                    newBoard,
                    { row: i, col: j },
                    { row: endRow, col: endCol }
                  )
                ) {
                  // Try the move
                  const tempBoard = JSON.parse(JSON.stringify(newBoard));
                  tempBoard[endRow][endCol] = piece;
                  tempBoard[i][j] = "";

                  // If this move gets out of check, it's not checkmate
                  if (!isInCheck(nextPlayer, tempBoard)) {
                    isCheckmated = false;
                    break;
                  }
                }
              }
            }
          }
        }
      }

      if (isCheckmated) {
        // The winner is the current player (the one who just moved)
        const winner = isWhiteTurn ? "White" : "Black";
        setGameStatus(`checkmate-${winner}`);
        return;
      }
    } else if (isStalemate(nextPlayer)) {
      setGameStatus("stalemate");
    } else if (isDraw()) {
      setGameStatus("draw");
    }
  };

  const handleSquareClick = (row, col) => {
    if (gameStatus !== "playing") return;

    const piece = board[row][col];

    if (selectedPiece) {
      // If clicking on a valid move square
      if (isValidMove(board, selectedPiece, { row, col })) {
        handleMove(selectedPiece.row, selectedPiece.col, row, col);
      } else if (
        piece &&
        ((isWhiteTurn && isWhitePiece(piece)) ||
          (!isWhiteTurn && isBlackPiece(piece)))
      ) {
        // If clicking on another piece of the same color, select it
        setSelectedPiece({ row, col });
        playChessCheck();
      } else {
        // If clicking on an invalid square or opponent's piece, deselect the piece
        setSelectedPiece(null);
      }
    } else {
      // Selecting a piece
      if (
        piece &&
        ((isWhiteTurn && isWhitePiece(piece)) ||
          (!isWhiteTurn && isBlackPiece(piece)))
      ) {
        setSelectedPiece({ row, col });
        playChessCheck();
      }
    }
  };

  const resetGame = () => {
    setBoard(createInitialBoard());
    setSelectedPiece(null);
    setIsWhiteTurn(true);
    setGameStatus("playing");
    setMoveHistory([]);
    setFiftyMoveCounter(0);
    setPositionHistory([JSON.stringify(createInitialBoard())]);
  };

  // Find king position
  const findKingPosition = (color) => {
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (
          (color === "white" && board[i][j] === "♔") ||
          (color === "black" && board[i][j] === "♚")
        ) {
          return { row: i, col: j };
        }
      }
    }
    return null;
  };

  return (
    <ChessContainer>
      <GameHeader>
        <Title>Chess</Title>
        <Status>
          {gameStatus === "playing" &&
            `Current Player: ${isWhiteTurn ? "White" : "Black"}`}
          {gameStatus === "stalemate" && "Stalemate! Game is a draw!"}
          {gameStatus === "draw" && "Game is a draw!"}
        </Status>
        <ResetButton onClick={resetGame}>Reset Game</ResetButton>
      </GameHeader>
      <BoardContainer>
        <Board>
          {board.map((row, rowIndex) => (
            <Row key={rowIndex}>
              <RankLabel>{8 - rowIndex}</RankLabel>
              {row.map((piece, colIndex) => {
                const isKingInCheck =
                  isInCheck(isWhiteTurn ? "white" : "black", board) &&
                  ((isWhiteTurn && piece === "♔") ||
                    (!isWhiteTurn && piece === "♚"));
                const isInvalidMove = invalidMoveAttempted && isKingInCheck;

                return (
                  <Square
                    key={`${rowIndex}-${colIndex}`}
                    $row={rowIndex}
                    $col={colIndex}
                    $isSelected={
                      selectedPiece?.row === rowIndex &&
                      selectedPiece?.col === colIndex
                    }
                    $isPossibleMove={
                      selectedPiece &&
                      isValidMove(board, selectedPiece, {
                        row: rowIndex,
                        col: colIndex,
                      })
                    }
                    $isKingInCheck={isKingInCheck}
                    onClick={() => handleSquareClick(rowIndex, colIndex)}
                  >
                    {piece && (
                      <Piece
                        color={isWhitePiece(piece) ? "white" : "black"}
                        $isInvalidMove={isInvalidMove}
                      >
                        {piece}
                      </Piece>
                    )}
                  </Square>
                );
              })}
            </Row>
          ))}
          <FileLabels>
            {["a", "b", "c", "d", "e", "f", "g", "h"].map((file) => (
              <FileLabel key={file}>{file}</FileLabel>
            ))}
          </FileLabels>
          {gameStatus.startsWith("checkmate") && (
            <WinnerPopup>
              <CloseButton onClick={resetGame}>×</CloseButton>
              <Crown>👑</Crown>
              <WinnerText>
                Checkmate! {gameStatus.split("-")[1]} wins!
              </WinnerText>
              <Confetti>🎉</Confetti>
            </WinnerPopup>
          )}
        </Board>
      </BoardContainer>
    </ChessContainer>
  );
};

const ChessContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background: #ffffff;
  min-height: 100vh;
  color: #2c3e50;
`;

const GameHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin: 0;
  color: #2c3e50;
`;

const Status = styled.div`
  font-size: 1.2rem;
  color: #2c3e50;
`;

const ResetButton = styled.button`
  padding: 0.5rem 1rem;
  font-size: 1rem;
  background: #4a4a4a;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #5a5a5a;
  }
`;

const BoardContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
`;

const Board = styled.div`
  display: flex;
  flex-direction: column;
  border: 2px solid #4a4a4a;
  background: #2c2c2c;
  padding: 1rem;
  border-radius: 8px;
  position: relative;
`;

const Row = styled.div`
  display: flex;
`;

const RankLabel = styled.div`
  width: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ddd;
  font-size: 1rem;
`;

const Square = styled.div`
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) =>
    props.$isSelected
      ? "#4a4a4a"
      : props.$isPossibleMove
      ? "rgba(255, 255, 255, 0.1)"
      : (props.$row + props.$col) % 2 === 0
      ? "#2c2c2c"
      : "#3a3a3a"};
  cursor: pointer;
  position: relative;
  transition: background 0.2s;

  &:hover {
    background: ${(props) =>
      props.$isSelected
        ? "#5a5a5a"
        : props.$isPossibleMove
        ? "rgba(255, 255, 255, 0.2)"
        : "rgba(255, 255, 255, 0.1)"};
  }

  &::after {
    content: "";
    position: absolute;
    width: 16px;
    height: 16px;
    background-color: ${(props) =>
      props.$isPossibleMove ? "#4CAF50" : "transparent"};
    border-radius: 50%;
    opacity: 0.8;
  }

  ${(props) =>
    props.$isKingInCheck &&
    `
    background: rgba(255, 68, 68, 0.3);
  `}
`;

const FileLabels = styled.div`
  display: flex;
  margin-top: 5px;
`;

const FileLabel = styled.div`
  width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ddd;
  font-size: 1rem;
`;

const Piece = styled.div`
  font-size: 3.5rem;
  color: ${(props) => (props.color === "white" ? "#fff" : "#000")};
  text-shadow: ${(props) =>
    props.color === "white" ? "0 0 2px #000" : "0 0 2px #fff"};
  user-select: none;
  animation: ${(props) => (props.$isInvalidMove ? "shake 0.5s" : "none")};

  @keyframes shake {
    0%,
    100% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(-5px);
    }
    75% {
      transform: translateX(5px);
    }
  }
`;

const WinnerPopup = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: linear-gradient(135deg, #2c3e50, #3498db);
  padding: 1.5rem;
  border-radius: 1rem;
  text-align: center;
  animation: popup 0.5s ease-out;
  z-index: 1000;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 2px solid #ffffff;
  min-width: 250px;
  max-width: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto;

  @keyframes popup {
    0% {
      transform: translate(-50%, -50%) scale(0.5);
      opacity: 0;
    }
    50% {
      transform: translate(-50%, -50%) scale(1.1);
    }
    100% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 1;
    }
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid #ffffff;
  background: #e74c3c;
  color: white;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: #c0392b;
    transform: scale(1.1);
  }
`;

const Crown = styled.div`
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  animation: float 2s ease-in-out infinite;

  @keyframes float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-5px);
    }
  }
`;

const WinnerText = styled.div`
  font-size: 1.5rem;
  color: #ffffff;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  margin-bottom: 0.5rem;
  animation: glow 2s ease-in-out infinite;
  font-weight: bold;

  @keyframes glow {
    0%,
    100% {
      text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
    }
    50% {
      text-shadow: 0 0 20px rgba(255, 255, 255, 0.8);
    }
  }
`;

const Confetti = styled.div`
  font-size: 1.5rem;
  animation: spin 1s linear infinite;
`;

export default Chess;
