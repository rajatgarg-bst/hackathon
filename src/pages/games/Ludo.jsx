import { useState, useCallback, useEffect } from "react";
import styled from "@emotion/styled";
import GameContainer from "../../components/GameContainer";
import { useGameSounds } from "../../utils/sound";

const Board = styled.div`
  width: 600px;
  height: 600px;
  display: grid;
  grid-template-columns: repeat(15, 1fr);
  grid-template-rows: repeat(15, 1fr);
  gap: 2px;
  background-color: #000;
  padding: 2px;
  border-radius: 8px;
  margin: 0 auto;
  position: relative;
`;

const Cell = styled.div`
  background-color: ${(props) => {
    if (props.type === "homeInterior") return props.color;
    if (props.isHome) return props.color;
    if (props.isSafe && props.hasStar) return "#000000";
    if (props.isPath && props.color) return props.color;
    if (props.isPath) return "#f0f0f0";
    return "#ffffff";
  }};
  border-radius: 3px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border: ${props => props.hasBorder ? "1px solid #000" : "none"};
  
  /* No need for ::before since we're using stars for all safe spots */
`;

const CellCoordinates = styled.div`
  position: absolute;
  top: 2px;
  left: 2px;
  font-size: 8px;
  color: #333;
  opacity: 0.7;
  pointer-events: none;
`;

const HomeBase = styled.div`
  position: absolute;
  width: 30%;
  height: 30%;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.4);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
  color: white;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.8);
`;

const HomeArea = styled.div`
  position: absolute;
  width: ${props => props.size || "40%"};
  height: ${props => props.size || "40%"};
  background-color: ${props => props.color};
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  
  &.red {
    top: 0;
    left: 0;
  }
  
  &.green {
    top: 0;
    right: 0;
  }
  
  &.yellow {
    bottom: 0;
    left: 0;
  }
  
  &.blue {
    bottom: 0;
    right: 0;
  }
`;

const Token = styled.div`
  width: 20px;
  height: 20px;
  background-color: ${(props) => props.color};
  border: 2px solid #000;
  border-radius: 50%;
  position: absolute;
  cursor: ${(props) => (props.canMove ? "pointer" : "default")};
  transition: all 0.3s ease;
  z-index: ${(props) => (props.canMove ? 4 : 3)};
  opacity: ${(props) => (props.canMove ? 1 : 0.8)};
  box-shadow: ${(props) => (props.canMove ? "0 2px 5px rgba(0,0,0,0.5)" : "0 1px 3px rgba(0,0,0,0.3)")};

  &:hover {
    transform: ${(props) => (props.canMove ? "scale(1.2)" : "none")};
  }
`;

const Star = styled.div`
  font-size: ${props => props.isEntry ? "18px" : "24px"};
  color: ${(props) => props.onBlack ? "#ffffff" : props.color};
  z-index: 1;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-shadow: 0px 0px 1px #000;
`;

const Arrow = styled.div`
  font-size: 18px;
  color: ${(props) => props.color};
  z-index: 1;
`;

const Center = styled.div`
  position: absolute;
  width: 15%;
  height: 15%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: linear-gradient(to bottom right, red, green, blue, yellow);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;
`;

const Crown = styled.div`
  font-size: 24px;
  color: #000;
`;

const Dice = styled.div`
  width: 60px;
  height: 60px;
  background-color: white;
  border: 2px solid #333;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2rem;
  font-weight: bold;
  cursor: pointer;
  user-select: none;
  margin: 0 auto;
  margin-bottom: 20px;
`;

const GameInfo = styled.div`
  text-align: center;
  margin-bottom: 20px;
  padding-right: 100px;
  padding-top: 5px;
  padding-bottom: 5px;
  font-size: 1.2rem;
  color: #333;
  position: relative;
`;

const Button = styled.button`
  background-color: #3498db;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 1rem;
  transition: background-color 0.2s ease;
  border: none;
  cursor: pointer;
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);

  &:hover {
    background-color: #2980b9;
  }
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 60px;
  height: 28px;
  margin-left: 10px;
  margin-top: 10px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: .4s;
    border-radius: 34px;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 20px;
    width: 20px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
  }

  input:checked + .slider {
    background-color: #2196F3;
  }

  input:checked + .slider:before {
    transform: translateX(32px);
  }
`;

const AutoPlayContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  gap: 20px;
`;

const COLORS = {
  red: "#ff4444",
  green: "#00C851",
  yellow: "#ffbb33",
  blue: "#33b5e5",
};

// Board layout constants - completely revise these
const HOME_POSITIONS = {
  red: { startRow: 0, startCol: 0, endRow: 5, endCol: 5 },
  green: { startRow: 0, startCol: 9, endRow: 5, endCol: 14 },
  yellow: { startRow: 9, startCol: 0, endRow: 14, endCol: 5 },
  blue: { startRow: 9, startCol: 9, endRow: 14, endCol: 14 },
};

// Starting position for tokens in their home base
const STARTING_POSITIONS = {
  red: [
    { row: 1, col: 1 }, { row: 1, col: 4 }, { row: 4, col: 1 }, { row: 4, col: 4 },
  ],
  green: [
    { row: 1, col: 10 }, { row: 1, col: 13 }, { row: 4, col: 10 }, { row: 4, col: 13 },
  ],
  yellow: [
    { row: 10, col: 1 }, { row: 10, col: 4 }, { row: 13, col: 1 }, { row: 13, col: 4 },
  ],
  blue: [
    { row: 10, col: 10 }, { row: 10, col: 13 }, { row: 13, col: 10 }, { row: 13, col: 13 },
  ],
};

// Entry points for each player's tokens
const ENTRY_POINTS = {
  red: { row: 6, col: 1 },
  green: { row: 1, col: 8 },
  blue: { row: 8, col: 13 },
  yellow: { row: 13, col: 6 },
};

// Starting positions where tokens first appear when leaving home
// Make sure these match the first position in each player's path
const START_POSITIONS = {
  red: { row: 6, col: 1 },
  green: { row: 1, col: 8 },
  blue: { row: 8, col: 13 },
  yellow: { row: 13, col: 6 },
};

// Paths that each player follows on the board
const PLAYER_PATHS = {
  red: [
    { row: 6, col: 1 }, // Start position (0)
    { row: 6, col: 2 }, 
    { row: 6, col: 3 }, 
    { row: 6, col: 4 }, 
    { row: 6, col: 5 }, 
    { row: 5, col: 6 }, 
    { row: 4, col: 6 }, 
    { row: 3, col: 6 }, 
    { row: 2, col: 6 }, // Star position (8)
    { row: 1, col: 6 }, 
    { row: 0, col: 6 }, // Position (10)
    { row: 0, col: 7 }, // Position (11)
    { row: 0, col: 8 }, // Star position (12) - Corrected
    { row: 1, col: 8 }, // Position (13) - Corrected from {row: 2, col: 8}
    { row: 2, col: 8 }, // Position (14) - Corrected from {row: 3, col: 8}
    { row: 3, col: 8 }, // Position (15) - Corrected from {row: 4, col: 8}
    { row: 4, col: 8 }, // Position (16) - Corrected from {row: 5, col: 8}
    { row: 5, col: 8 }, // Position (17)
    { row: 6, col: 9 }, 
    { row: 6, col: 10 }, 
    { row: 6, col: 11 }, 
    { row: 6, col: 12 }, // Star position (21)
    { row: 6, col: 13 }, 
    { row: 6, col: 14 }, // Position (23)
    { row: 7, col: 14 }, // Position (24)
    { row: 8, col: 14 }, // Position (25)
    { row: 8, col: 13 }, // Star position (26)
    { row: 8, col: 12 }, 
    { row: 8, col: 11 }, 
    { row: 8, col: 10 }, 
    { row: 8, col: 9 }, 
    { row: 9, col: 8 }, 
    { row: 10, col: 8 }, 
    { row: 11, col: 8 }, 
    { row: 12, col: 8 }, // Star position (34)
    { row: 13, col: 8 }, 
    { row: 14, col: 8 }, // Position (36)
    { row: 14, col: 7 }, // Position (37)
    { row: 14, col: 6 }, // Position (38)
    { row: 13, col: 6 }, // Star position (39)
    { row: 12, col: 6 }, 
    { row: 11, col: 6 }, 
    { row: 10, col: 6 }, 
    { row: 9, col: 6 }, 
    { row: 8, col: 5 }, 
    { row: 8, col: 4 }, 
    { row: 8, col: 3 }, 
    { row: 8, col: 2 }, // Star position (47)
    { row: 8, col: 1 }, 
    { row: 8, col: 0 }, // Position (49)
    { row: 7, col: 0 }, // Position (50)
    { row: 7, col: 1 }, // Position (51)
    { row: 7, col: 2 }, 
    { row: 7, col: 3 }, 
    { row: 7, col: 4 }, 
    { row: 7, col: 5 }, 
    { row: 7, col: 6 }, 
    { row: 7, col: 7 }, // Center (57)
  ],
  green: [
    { row: 1, col: 8 }, // Start position (0)
    { row: 2, col: 8 }, 
    { row: 3, col: 8 }, 
    { row: 4, col: 8 }, 
    { row: 5, col: 8 }, 
    { row: 6, col: 9 }, 
    { row: 6, col: 10 }, 
    { row: 6, col: 11 }, 
    { row: 6, col: 12 }, // Star position (8)
    { row: 6, col: 13 }, 
    { row: 6, col: 14 }, // Position (10)
    { row: 7, col: 14 }, // Position (11)
    { row: 8, col: 14 }, // Position (12)
    { row: 8, col: 13 }, // Star position (13)
    { row: 8, col: 12 }, 
    { row: 8, col: 11 }, 
    { row: 8, col: 10 }, 
    { row: 8, col: 9 }, 
    { row: 9, col: 8 }, 
    { row: 10, col: 8 }, 
    { row: 11, col: 8 }, 
    { row: 12, col: 8 }, // Star position (21)
    { row: 13, col: 8 }, 
    { row: 14, col: 8 }, // Position (23)
    { row: 14, col: 7 }, // Position (24)
    { row: 14, col: 6 }, // Position (25)
    { row: 13, col: 6 }, // Star position (26)
    { row: 12, col: 6 }, 
    { row: 11, col: 6 }, 
    { row: 10, col: 6 }, 
    { row: 9, col: 6 }, 
    { row: 8, col: 5 }, 
    { row: 8, col: 4 }, 
    { row: 8, col: 3 }, 
    { row: 8, col: 2 }, // Star position (34)
    { row: 8, col: 1 }, 
    { row: 8, col: 0 }, // Position (36)
    { row: 7, col: 0 }, // Position (37)
    { row: 6, col: 0 }, // Position (38)
    { row: 6, col: 1 }, // Star position (39)
    { row: 6, col: 2 }, 
    { row: 6, col: 3 }, 
    { row: 6, col: 4 }, 
    { row: 6, col: 5 }, 
    { row: 5, col: 6 }, 
    { row: 4, col: 6 }, 
    { row: 3, col: 6 }, 
    { row: 2, col: 6 }, // Star position (47)
    { row: 1, col: 6 }, 
    { row: 0, col: 6 }, // Position (49)
    { row: 0, col: 7 }, // Position (50)
    { row: 1, col: 7 }, // Position (51)
    { row: 2, col: 7 }, 
    { row: 3, col: 7 }, 
    { row: 4, col: 7 }, 
    { row: 5, col: 7 }, 
    { row: 6, col: 7 }, 
    { row: 7, col: 7 }, // Center (57)
  ],
  yellow: [
    { row: 13, col: 6 }, // Start position (0)
    { row: 12, col: 6 }, 
    { row: 11, col: 6 }, 
    { row: 10, col: 6 }, 
    { row: 9, col: 6 }, 
    { row: 8, col: 5 }, 
    { row: 8, col: 4 }, 
    { row: 8, col: 3 }, 
    { row: 8, col: 2 }, // Star position (8)
    { row: 8, col: 1 }, 
    { row: 8, col: 0 }, // Position (10)
    { row: 7, col: 0 }, // Position (11)
    { row: 6, col: 0 }, // Position (12)
    { row: 6, col: 1 }, // Star position (13)
    { row: 6, col: 2 }, 
    { row: 6, col: 3 }, 
    { row: 6, col: 4 }, 
    { row: 6, col: 5 }, 
    { row: 5, col: 6 }, 
    { row: 4, col: 6 }, 
    { row: 3, col: 6 }, 
    { row: 2, col: 6 }, // Star position (21)
    { row: 1, col: 6 }, 
    { row: 0, col: 6 }, // Position (23)
    { row: 0, col: 7 }, // Position (24)
    { row: 0, col: 8 }, // Position (25)
    { row: 1, col: 8 }, // Star position (26)
    { row: 2, col: 8 }, 
    { row: 3, col: 8 }, 
    { row: 4, col: 8 }, 
    { row: 5, col: 8 }, 
    { row: 6, col: 9 }, 
    { row: 6, col: 10 }, 
    { row: 6, col: 11 }, 
    { row: 6, col: 12 }, // Star position (34)
    { row: 6, col: 13 }, 
    { row: 6, col: 14 }, // Position (36)
    { row: 7, col: 14 }, // Position (37)
    { row: 8, col: 14 }, // Position (38)
    { row: 8, col: 13 }, // Star position (39)
    { row: 8, col: 12 }, 
    { row: 8, col: 11 }, 
    { row: 8, col: 10 }, 
    { row: 8, col: 9 }, 
    { row: 9, col: 8 }, 
    { row: 10, col: 8 }, 
    { row: 11, col: 8 }, 
    { row: 12, col: 8 }, // Star position (47)
    { row: 13, col: 8 }, 
    { row: 14, col: 8 }, // Position (49)
    { row: 14, col: 7 }, // Position (50)
    { row: 13, col: 7 }, // Position (51)
    { row: 12, col: 7 }, 
    { row: 11, col: 7 }, 
    { row: 10, col: 7 }, 
    { row: 9, col: 7 }, 
    { row: 8, col: 7 }, 
    { row: 7, col: 7 }, // Center (57)
  ],
  blue: [
    { row: 8, col: 13 }, // Start position (0)
    { row: 8, col: 12 }, 
    { row: 8, col: 11 }, 
    { row: 8, col: 10 }, 
    { row: 8, col: 9 }, 
    { row: 9, col: 8 }, 
    { row: 10, col: 8 }, 
    { row: 11, col: 8 }, 
    { row: 12, col: 8 }, // Star position (8)
    { row: 13, col: 8 }, 
    { row: 14, col: 8 }, // Position (10)
    { row: 14, col: 7 }, // Position (11)
    { row: 14, col: 6 }, // Position (12)
    { row: 13, col: 6 }, // Star position (13)
    { row: 12, col: 6 }, 
    { row: 11, col: 6 }, 
    { row: 10, col: 6 }, 
    { row: 9, col: 6 }, 
    { row: 8, col: 5 }, 
    { row: 8, col: 4 }, 
    { row: 8, col: 3 }, 
    { row: 8, col: 2 }, // Star position (21)
    { row: 8, col: 1 }, 
    { row: 8, col: 0 }, // Position (23)
    { row: 7, col: 0 }, // Position (24)
    { row: 6, col: 0 }, // Position (25)
    { row: 6, col: 1 }, // Star position (26)
    { row: 6, col: 2 }, 
    { row: 6, col: 3 }, 
    { row: 6, col: 4 }, 
    { row: 6, col: 5 }, 
    { row: 5, col: 6 }, 
    { row: 4, col: 6 }, 
    { row: 3, col: 6 }, 
    { row: 2, col: 6 }, // Star position (34)
    { row: 1, col: 6 }, 
    { row: 0, col: 6 }, // Position (36)
    { row: 0, col: 7 }, // Position (37)
    { row: 0, col: 8 }, // Position (38)
    { row: 1, col: 8 }, // Star position (39)
    { row: 2, col: 8 }, 
    { row: 3, col: 8 }, 
    { row: 4, col: 8 }, 
    { row: 5, col: 8 }, 
    { row: 6, col: 9 }, 
    { row: 6, col: 10 }, 
    { row: 6, col: 11 }, 
    { row: 6, col: 12 }, // Star position (47)
    { row: 6, col: 13 }, 
    { row: 6, col: 14 }, // Position (49)
    { row: 7, col: 14 }, // Position (50)
    { row: 7, col: 13 }, // Position (51)
    { row: 7, col: 12 }, 
    { row: 7, col: 11 }, 
    { row: 7, col: 10 }, 
    { row: 7, col: 9 }, 
    { row: 7, col: 8 }, 
    { row: 7, col: 7 }, // Center (57)
  ],
};

// All safe positions from the reference image 
const SAFE_POSITIONS = [
  // Entry points (the first position outside home)
  { row: 6, col: 1, isEntry: true },  // Red's entry point (star)
  { row: 1, col: 8, isEntry: true },  // Green's entry point (star)
  { row: 8, col: 13, isEntry: true }, // Blue's entry point (star)
  { row: 13, col: 6, isEntry: true }, // Yellow's entry point (star)
  
  // Important star positions on the path
  { row: 2, col: 6 },   // Green safe position
  { row: 8, col: 2 },   // Red safe position
  { row: 6, col: 12 },  // Blue safe position
  { row: 12, col: 8 },  // Yellow safe position
  
  // Additional corner safe spots
  { row: 8, col: 14 },  // Corner position near blue entry
  { row: 14, col: 6 },  // Corner position near yellow entry
  { row: 6, col: 0 },   // Corner position near green entry
  
  // All other safe positions from the path
  { row: 1, col: 6 },   // Safe spot
  { row: 13, col: 8 },  // Safe spot
  { row: 8, col: 0 },   // Safe spot
  { row: 0, col: 6 },   // Safe spot
];

// Add color information to each safe position
const STAR_POSITIONS = [
  // Entry points (the first position outside home)
  { row: 6, col: 1, color: COLORS.red, isEntry: true },      // Red's entry
  { row: 1, col: 8, color: COLORS.green, isEntry: true },    // Green's entry
  { row: 8, col: 13, color: COLORS.blue, isEntry: true },    // Blue's entry
  { row: 13, col: 6, color: COLORS.yellow, isEntry: true },  // Yellow's entry
  
  // Major star positions (one per player path)
  { row: 2, col: 6, color: COLORS.green },    // Green path star
  { row: 8, col: 2, color: COLORS.red },      // Red path star
  { row: 6, col: 12, color: COLORS.blue },    // Blue path star
  { row: 12, col: 8, color: COLORS.yellow },  // Yellow path star
];

// Direction arrows
const ARROW_POSITIONS = [
  { row: 7, col: 1, color: COLORS.red, direction: "→" },
  { row: 1, col: 7, color: COLORS.green, direction: "↓" },
  { row: 7, col: 13, color: COLORS.blue, direction: "←" },
  { row: 13, col: 7, color: COLORS.yellow, direction: "↑" },
];

const createBoard = () => {
  const board = Array(15)
    .fill()
    .map(() => Array(15).fill({ type: "empty", hasBorder: true }));

  // Set up all cells as bordered by default
  for (let i = 0; i < 15; i++) {
    for (let j = 0; j < 15; j++) {
      board[i][j] = { 
        ...board[i][j],
        hasBorder: true 
      };
    }
  }

  // Set up home bases
  Object.entries(HOME_POSITIONS).forEach(([playerColor, position]) => {
    for (let i = position.startRow; i <= position.endRow; i++) {
      for (let j = position.startCol; j <= position.endCol; j++) {
        board[i][j] = { 
          type: "home", 
          color: COLORS[playerColor],
          hasBorder: false 
        };
      }
    }
  });

  // Home base interior (white area with tokens)
  // Red
  for (let i = 1; i <= 4; i++) {
    for (let j = 1; j <= 4; j++) {
      board[i][j] = { type: "homeInterior", color: COLORS.red, hasBorder: false };
    }
  }
  // Green
  for (let i = 1; i <= 4; i++) {
    for (let j = 10; j <= 13; j++) {
      board[i][j] = { type: "homeInterior", color: COLORS.green, hasBorder: false };
    }
  }
  // Yellow
  for (let i = 10; i <= 13; i++) {
    for (let j = 1; j <= 4; j++) {
      board[i][j] = { type: "homeInterior", color: COLORS.yellow, hasBorder: false };
    }
  }
  // Blue
  for (let i = 10; i <= 13; i++) {
    for (let j = 10; j <= 13; j++) {
      board[i][j] = { type: "homeInterior", color: COLORS.blue, hasBorder: false };
    }
  }

  // Set paths
  // Horizontal paths
  for (let i = 6; i <= 8; i++) {
    for (let j = 0; j < 15; j++) {
      if (j < 6 || j > 8) {
        board[i][j] = { type: "path", hasBorder: true };
      }
    }
  }

  // Vertical paths
  for (let j = 6; j <= 8; j++) {
    for (let i = 0; i < 15; i++) {
      if (i < 6 || i > 8) {
        board[i][j] = { type: "path", hasBorder: true };
      }
    }
  }

  // Set colored home paths
  // Red
  for (let j = 1; j <= 5; j++) {
    board[7][j] = { type: "path", color: COLORS.red, hasBorder: true };
  }
  // Green
  for (let i = 1; i <= 5; i++) {
    board[i][7] = { type: "path", color: COLORS.green, hasBorder: true };
  }
  // Blue - in row 7, columns 9-13
  for (let j = 9; j <= 13; j++) {
    board[7][j] = { type: "path", color: COLORS.blue, hasBorder: true };
  }
  // Yellow - in column 7, rows 9-13
  for (let i = 9; i <= 13; i++) {
    board[i][7] = { type: "path", color: COLORS.yellow, hasBorder: true };
  }

  // Set up center area
  for (let i = 6; i <= 8; i++) {
    for (let j = 6; j <= 8; j++) {
      board[i][j] = { type: "center", hasBorder: false };
    }
  }

  // Add colored triangles in center
  board[6][6] = { type: "center", color: COLORS.red, hasBorder: false };
  board[6][8] = { type: "center", color: COLORS.green, hasBorder: false };
  board[8][8] = { type: "center", color: COLORS.blue, hasBorder: false };
  board[8][6] = { type: "center", color: COLORS.yellow, hasBorder: false };

  // Set safe spots
  SAFE_POSITIONS.forEach(pos => {
    board[pos.row][pos.col] = { 
      ...board[pos.row][pos.col], 
      type: "safe", 
      isSafe: true 
    };
  });

  return board;
};

const Ludo = () => {
  const { playClick, playLudoDice, playLudoMove, playLudoCapture } = useGameSounds();

  const [board, setBoard] = useState(createBoard());
  const [currentPlayer, setCurrentPlayer] = useState("red");
  const [diceValue, setDiceValue] = useState(null);
  const [tokens, setTokens] = useState({
    red: STARTING_POSITIONS.red.map(pos => ({ ...pos, status: "home", distance: -1 })),
    green: STARTING_POSITIONS.green.map(pos => ({ ...pos, status: "home", distance: -1 })),
    blue: STARTING_POSITIONS.blue.map(pos => ({ ...pos, status: "home", distance: -1 })),
    yellow: STARTING_POSITIONS.yellow.map(pos => ({ ...pos, status: "home", distance: -1 })),
  });

  const [isRolling, setIsRolling] = useState(false);
  const [hasRolled, setHasRolled] = useState(false);
  const [movableTokens, setMovableTokens] = useState([]);
  // We'll use canRollAgain in the UI to indicate when player can roll again
  const [canRollAgain, setCanRollAgain] = useState(false);
  const [winners, setWinners] = useState([]);

  // State for auto features
  const [isAutoRoll, setIsAutoRoll] = useState(false);
  const [isAutoRollOnly, setIsAutoRollOnly] = useState(false);

  const getNextPlayer = useCallback((player) => {
    const players = ["red", "green", "blue", "yellow"];
    const currentIndex = players.indexOf(player);
    return players[(currentIndex + 1) % 4];
  }, []);

  const calculateMovableTokens = useCallback(() => {
    const playerTokens = tokens[currentPlayer];
    const movable = [];

    playerTokens.forEach((token, index) => {
      // If dice roll is 6, home tokens can move out
      if (diceValue === 6 && token.status === "home") {
        // Check if the entry point is blocked by the same player's token
        const entryPoint = ENTRY_POINTS[currentPlayer];
        const isEntryBlocked = playerTokens.some((t, i) => 
          i !== index && 
          t.status === "active" && 
          t.row === entryPoint.row && 
          t.col === entryPoint.col
        );
        
        // Can move if entry is not blocked by own token
        if (!isEntryBlocked) {
          movable.push(index);
        }
      } 
      // Active tokens can move if they won't go beyond the finish line
      else if (token.status === "active") {
        const newDistance = token.distance + diceValue;
        
        // Token can move if it either:
        // 1. Will land exactly on the finish (distance 57)
        // 2. Will remain on the path (distance < 57)
        if (newDistance <= 57) {
          movable.push(index);
        }
      }
    });

    return movable;
  }, [currentPlayer, diceValue, tokens]);

  useEffect(() => {
    if (diceValue !== null && !isRolling) {
      const movable = calculateMovableTokens();
      setMovableTokens(movable);

      // If no moves are possible, end turn
      if (movable.length === 0) {
        setTimeout(() => {
          if (diceValue !== 6) {
            setCurrentPlayer(getNextPlayer(currentPlayer));
          }
          setDiceValue(null);
          setHasRolled(false);
        }, 1000);
      }
    }
  }, [diceValue, isRolling, calculateMovableTokens, currentPlayer, getNextPlayer]);

  const rollDice = useCallback(() => {
    if (isRolling || hasRolled) return;

    setIsRolling(true);
    playLudoDice();

    // Use a random number to determine if we roll a 6 (30% chance) or another number
    const randomValue = Math.random();
    let roll;
    
    if (randomValue < 0.3) { // 30% chance of rolling a 6
      roll = 6;
    } else {
      // The remaining 70% is distributed among values 1-5
      roll = Math.floor(Math.random() * 5) + 1;
    }
    
    console.log(`\n${currentPlayer.toUpperCase()} rolled a ${roll}`);
    setDiceValue(roll);

    setTimeout(() => {
      setIsRolling(false);
      setHasRolled(true);
      setCanRollAgain(roll === 6);
    }, 500);
  }, [isRolling, hasRolled, playLudoDice, currentPlayer]);

  const moveToken = useCallback((color, index) => {
    if (color !== currentPlayer || !diceValue || !movableTokens.includes(index)) return;

    console.log(`---------------------`);
    console.log(`Moving ${color} token ${index} with dice value ${diceValue}`);

    const token = tokens[color][index];
    const newTokens = JSON.parse(JSON.stringify(tokens)); // Deep clone to avoid reference issues

    // Moving a token from home to start
    if (token.status === "home" && diceValue === 6) {
      const startPosition = ENTRY_POINTS[color];
      newTokens[color][index] = {
        ...startPosition, 
        status: "active",
        distance: 0 
      };
      console.log(`HOME TO START: ${color} token ${index} moved from home to start position (${startPosition.row},${startPosition.col})`);
      playLudoMove();
    } 
    // Move active token along the path
    else if (token.status === "active") {
      const newDistance = token.distance + diceValue;
      console.log(`DISTANCE CHANGE: ${color} token ${index} moving from distance ${token.distance} to ${newDistance} (dice: ${diceValue})`);
      
      // Check if token would land on winning position (center)
      if (newDistance === 57) {
        console.log(`WIN: ${color} token ${index} reached center and won!`);
        newTokens[color][index] = { 
          row: 7, 
          col: 7, 
          status: "finished", 
          distance: newDistance 
        };
        playLudoCapture(); // Play winning sound
      } 
      // Normal move along the path
      else if (newDistance < 57) {
        // Get new position from player's path
        const newPosition = PLAYER_PATHS[color][newDistance];
        const currentPosition = PLAYER_PATHS[color][token.distance];
        
        console.log(`MOVEMENT: ${color} token ${index} moving from (${currentPosition.row},${currentPosition.col}) to (${newPosition.row},${newPosition.col})`);
        
        // Make sure the new position has both row and col defined
        if (newPosition && typeof newPosition.row === 'number' && typeof newPosition.col === 'number') {
          newTokens[color][index] = { 
            ...newPosition, 
            status: "active", 
            distance: newDistance 
          };
          
          // Check if the token landed on a star position
          const isStarPosition = STAR_POSITIONS.some(
            pos => pos.row === newPosition.row && pos.col === newPosition.col
          );
          
          if (isStarPosition) {
            console.log(`STAR: ${color} token ${index} landed on a star position at (${newPosition.row},${newPosition.col})`);
          }
          
          playLudoMove();

          // Check for capturing other tokens after movement
          Object.entries(newTokens).forEach(([otherColor, otherTokens]) => {
            if (otherColor !== color) {
              otherTokens.forEach((otherToken, otherIndex) => {
                if (otherToken.status === "active" && 
                    otherToken.row === newPosition.row && 
                    otherToken.col === newPosition.col) {
                  
                  // Check if the position is a safe spot
                  const isSafe = SAFE_POSITIONS.some(
                    pos => pos.row === newPosition.row && pos.col === newPosition.col
                  );
                  
                  if (!isSafe) {
                    // Send token back home - retrieve the correct home position
                    const homePosition = STARTING_POSITIONS[otherColor][otherIndex];
                    console.log(`CAPTURE: ${color} captured ${otherColor} token ${otherIndex} at (${newPosition.row},${newPosition.col})`);
                    newTokens[otherColor][otherIndex] = {
                      ...homePosition,
                      status: "home",
                      distance: -1,
                    };
                    playLudoCapture();
                  } else {
                    console.log(`SAFE: ${otherColor} token ${otherIndex} is on a safe spot and cannot be captured`);
                  }
                }
              });
            }
          });
        } else {
          // If path position is invalid (unlikely but safe check)
          console.error(`Invalid position for ${color} at distance ${newDistance}`);
          return; // Don't update if position is invalid
        }
      } else {
        console.log(`BLOCKED: ${color} token ${index} cannot move beyond the center`);
        return;
      }
    }

    // Update tokens state
    setTokens(newTokens);
    setHasRolled(false);
    setMovableTokens([]);

    // Check if all tokens are finished
    const allFinished = newTokens[color].every(t => t.status === "finished");
    if (allFinished && !winners.includes(color)) {
      setWinners([...winners, color]);
      console.log(`WINNER: ${color} has finished all tokens!`);
    }

    // Next player's turn (if not 6)
    if (diceValue !== 6) {
      setTimeout(() => {
        const nextPlayer = getNextPlayer(currentPlayer);
        console.log(`NEXT TURN: ${nextPlayer}'s turn`);
        setCurrentPlayer(nextPlayer);
        setDiceValue(null);
      }, 500);
    } else {
      console.log(`ROLL AGAIN: ${color} rolled a 6 and gets another turn`);
      setDiceValue(null);
    }
    console.log(`---------------------`);
  }, [currentPlayer, diceValue, movableTokens, tokens, winners, getNextPlayer, playLudoMove, playLudoCapture]);

  // Update the useEffect for auto-rolling
  useEffect(() => {
    let timer;
    
    // Auto-roll if either auto-roll or auto-roll-only is enabled
    if ((isAutoRoll || isAutoRollOnly) && !isRolling && !hasRolled) {
      timer = setTimeout(() => {
        rollDice();
      }, 1000); // Roll the dice every 1 second
    }
    
    return () => clearTimeout(timer);
  }, [isAutoRoll, isAutoRollOnly, isRolling, hasRolled, rollDice]);
  
  // Update the useEffect for auto-moving tokens to only work when full auto-play is on
  useEffect(() => {
    let timer;
    
    if (isAutoRoll && movableTokens.length >= 1) {
      // Automatically make the first available move
      timer = setTimeout(() => {
        moveToken(currentPlayer, movableTokens[0]);
      }, 1000);
    }
    
    return () => clearTimeout(timer);
  }, [isAutoRoll, movableTokens, currentPlayer, moveToken]);

  // Add function to handle toggle changes
  const handleAutoRollToggle = () => {
    // If turning on full auto-play, turn off auto-roll-only
    if (!isAutoRoll) {
      setIsAutoRollOnly(false);
    }
    setIsAutoRoll(!isAutoRoll);
  };
  
  const handleAutoRollOnlyToggle = () => {
    // If turning on auto-roll-only, turn off full auto-play
    if (!isAutoRollOnly) {
      setIsAutoRoll(false);
    }
    setIsAutoRollOnly(!isAutoRollOnly);
  };
  
  const resetGame = () => {
    setBoard(createBoard());
    setCurrentPlayer("red");
    setDiceValue(null);
    setTokens({
      red: STARTING_POSITIONS.red.map(pos => ({ ...pos, status: "home", distance: -1 })),
      green: STARTING_POSITIONS.green.map(pos => ({ ...pos, status: "home", distance: -1 })),
      blue: STARTING_POSITIONS.blue.map(pos => ({ ...pos, status: "home", distance: -1 })),
      yellow: STARTING_POSITIONS.yellow.map(pos => ({ ...pos, status: "home", distance: -1 })),
    });
    setIsRolling(false);
    setHasRolled(false);
    setMovableTokens([]);
    setCanRollAgain(false);
    setWinners([]);
    setIsAutoRoll(false);
    setIsAutoRollOnly(false);
    playClick();
  };

  useEffect(() => {
    console.log("Current tokens positions:");
    Object.entries(tokens).forEach(([color, colorTokens]) => {
      colorTokens.forEach((token, index) => {
        if (token.status === "active") {
          console.log(`${color} token ${index}: position (${token.row},${token.col}), distance ${token.distance}`);
          
          // Check if this matches the position in the path
          const pathPosition = PLAYER_PATHS[color][token.distance];
          if (pathPosition.row !== token.row || pathPosition.col !== token.col) {
            console.error(`MISMATCH: ${color} token ${index} has inconsistent position! Token: (${token.row},${token.col}), Path: (${pathPosition.row},${pathPosition.col})`);
          }
        }
      });
    });
  }, [tokens]);

  return (
    <GameContainer
      title="Ludo"
      description="Roll the dice and move your tokens around the board. First player to get all tokens to the center wins!"
    >
      <GameInfo>
        Current Player: <span style={{ color: COLORS[currentPlayer] }}>{currentPlayer.toUpperCase()}</span>
        {canRollAgain && <div>You rolled a 6! Roll again.</div>}
        {winners.length > 0 && (
          <div>
            Winners: {winners.map((w, i) => (
              <span key={i} style={{ color: COLORS[w], marginRight: '5px' }}>
                {w.toUpperCase()}
              </span>
            ))}
          </div>
        )}
        <Button onClick={resetGame}>Reset Game</Button>
        <button 
          style={{ 
            position: 'absolute', 
            right: '120px', 
            top: '50%', 
            transform: 'translateY(-50%)',
            background: '#7b61ff',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '4px', 
            border: 'none',
            cursor: 'pointer'
          }}
          onClick={() => {
            // Create a direct copy of the current tokens state
            const newTokens = JSON.parse(JSON.stringify(tokens));
            
            // Create a new token for green player at position row 13, col 6
            // This bypasses the path index system and directly sets coordinates
            newTokens.green[0] = {
              row: 13, 
              col: 6, 
              status: "active", 
              // Since the position in the screenshot is at index 26 in the green path,
              // we'll use that distance for consistency
              distance: 26
            };
            
            // Update the tokens state
            setTokens(newTokens);
            console.log("Debug: Green token placed at position row 13, col 6 (GREEN index 26)");
          }}
        >
          Debug Token
        </button>
      </GameInfo>
      <AutoPlayContainer>
        <div>
          <span>Auto Play: </span>
          <ToggleSwitch>
            <input 
              type="checkbox" 
              checked={isAutoRoll} 
              onChange={handleAutoRollToggle} 
            />
            <span className="slider"></span>
          </ToggleSwitch>
        </div>
        <div>
          <span>Auto Roll Dice Only: </span>
          <ToggleSwitch>
            <input 
              type="checkbox" 
              checked={isAutoRollOnly} 
              onChange={handleAutoRollOnlyToggle} 
            />
            <span className="slider"></span>
          </ToggleSwitch>
        </div>
      </AutoPlayContainer>
      <Dice onClick={rollDice} style={{ opacity: isRolling ? 0.7 : 1 }}>
        {diceValue || "?"}
      </Dice>
      <Board>
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const hasStar = STAR_POSITIONS.some(pos => pos.row === rowIndex && pos.col === colIndex);
            return (
              <Cell
                key={`${rowIndex}-${colIndex}`}
                isHome={cell.type === "home" || cell.type === "homeInterior"}
                isSafe={cell.type === "safe"}
                isPath={cell.type === "path"}
                color={cell.color}
                hasBorder={cell.hasBorder}
                type={cell.type}
                name={`row-${rowIndex}-col-${colIndex}`}
                hasStar={hasStar}
              >
                <CellCoordinates>
                  row-{rowIndex}-col-{colIndex}
                </CellCoordinates>
                
                {/* Stars for all safe positions */}
                {hasStar && (
                  <Star 
                    color={STAR_POSITIONS.find(pos => pos.row === rowIndex && pos.col === colIndex).color}
                    isEntry={STAR_POSITIONS.find(pos => pos.row === rowIndex && pos.col === colIndex).isEntry}
                    onBlack={cell.type === "safe" && hasStar}
                  >
                    ★
                  </Star>
                )}
                
                {/* Arrows showing direction */}
                {ARROW_POSITIONS.some(pos => pos.row === rowIndex && pos.col === colIndex) && (
                  <Arrow 
                    color={ARROW_POSITIONS.find(pos => pos.row === rowIndex && pos.col === colIndex).color}
                  >
                    {ARROW_POSITIONS.find(pos => pos.row === rowIndex && pos.col === colIndex).direction}
                  </Arrow>
                )}
              </Cell>
            );
          })
        )}
        
        {/* Center crown */}
        <Center>
          <Crown>👑</Crown>
        </Center>

        {/* Home Areas with player dice */}
        <HomeArea className="red" color={COLORS.red} size="40%">
          <HomeBase>
            <div style={{ fontSize: '24px' }}>4</div>
          </HomeBase>
        </HomeArea>
        <HomeArea className="green" color={COLORS.green} size="40%">
          <HomeBase>
            <div style={{ fontSize: '24px' }}>4</div>
          </HomeBase>
        </HomeArea>
        <HomeArea className="blue" color={COLORS.blue} size="40%">
          <HomeBase>
            <div style={{ fontSize: '24px' }}>4</div>
          </HomeBase>
        </HomeArea>
        <HomeArea className="yellow" color={COLORS.yellow} size="40%">
          <HomeBase>
            <div style={{ fontSize: '24px' }}>4</div>
          </HomeBase>
        </HomeArea>

        {/* Tokens */}
        {Object.entries(tokens).map(([color, colorTokens]) =>
          colorTokens.map((token, index) => {
            // Calculate cell dimensions
            const cellWidth = 100 / 15;
            const cellHeight = 100 / 15;
            
            // Calculate base position (center of cell)
            const baseLeft = token.col * cellWidth + (cellWidth / 2);
            const baseTop = token.row * cellHeight + (cellHeight / 2);
            
            // Define offsets based on token status and position
            let offsetX = 0;
            let offsetY = 0;
            
            if (token.status === "home") {
              // Fixed offsets for home tokens in a square pattern (more precise positioning)
              const offset = 8; // pixel offset within home cell
              if (index === 0) { offsetX = -offset; offsetY = -offset; }      // Top-left
              else if (index === 1) { offsetX = offset; offsetY = -offset; }  // Top-right
              else if (index === 2) { offsetX = -offset; offsetY = offset; }  // Bottom-left
              else if (index === 3) { offsetX = offset; offsetY = offset; }   // Bottom-right
            } else if (token.status === "active" || token.status === "finished") {
              // Get all tokens at this position (same color and other colors)
              const tokensAtThisPosition = [];
              
              // Check for tokens of the same color
              colorTokens.forEach((t, i) => {
                if (i !== index && t.row === token.row && t.col === token.col && 
                    (t.status === "active" || t.status === "finished")) {
                  tokensAtThisPosition.push({color, index: i});
                }
              });
              
              // Check for tokens of other colors
              Object.entries(tokens).forEach(([otherColor, otherColorTokens]) => {
                if (otherColor !== color) {
                  otherColorTokens.forEach((t, i) => {
                    if (t.row === token.row && t.col === token.col && 
                        (t.status === "active" || t.status === "finished")) {
                      tokensAtThisPosition.push({color: otherColor, index: i});
                    }
                  });
                }
              });
              
              // Position tokens in a circular pattern if there are multiple at the same spot
              if (tokensAtThisPosition.length > 0) {
                // Find position of current token in the array of tokens at this position
                const positionIndex = tokensAtThisPosition.findIndex(t => 
                  t.color === color && t.index === index);
                
                // If this token is not in the array yet, add it
                if (positionIndex === -1) {
                  tokensAtThisPosition.push({color, index});
                }
                
                // Calculate angle based on position in array
                const totalTokens = tokensAtThisPosition.length + 1;
                const currentTokenIndex = positionIndex === -1 ? tokensAtThisPosition.length - 1 : positionIndex;
                const angle = (currentTokenIndex * 2 * Math.PI) / totalTokens;
                
                // Calculate offsets using a radius that fits within the cell
                const radius = 6; // smaller radius to fit within cell
                offsetX = Math.cos(angle) * radius;
                offsetY = Math.sin(angle) * radius;
              }
            }
            
            return (
              <Token
                key={`${color}-${index}`}
                style={{
                  top: `${baseTop}%`,
                  left: `${baseLeft}%`,
                  transform: `translate(-50%, -50%) translate(${offsetX}px, ${offsetY}px)`,
                }}
                color={COLORS[color]}
                canMove={movableTokens.includes(index) && currentPlayer === color}
                onClick={() => moveToken(color, index)}
              />
            );
          })
        )}
      </Board>
    </GameContainer>
  );
};

export default Ludo;
