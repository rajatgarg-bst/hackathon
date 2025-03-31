import {
  GiTicTacToe,
  GiSnake,
  GiChessKing,
  GiBasketballBall,
  GiDiceSixFacesFive,
  GiSnakeTongue,
  GiAbacus,
  GiPuzzle,
  GiCrossedSwords,
  GiPalette,
  GiPerspectiveDiceSixFacesRandom,
  GiMineExplosion,
  GiCardRandom,
  GiEarthAmerica,
  GiWorld,
  GiPingPongBat,
} from "react-icons/gi";

export const games = [
  {
    id: "chess",
    name: "Chess",
    description: "Strategic two-player chess game with all standard rules",
    path: "/games/chess",
    icon: GiChessKing,
    bgColor: "#FF9800",
    color: "white",
  },
  {
    id: "ludo",
    name: "Ludo",
    description: "Classic board game with four players and dice rolling",
    path: "/games/ludo",
    icon: GiDiceSixFacesFive,
    bgColor: "#9C27B0",
    color: "white",
  },
  {
    id: "snake-and-ladders",
    name: "Snake & Ladders",
    description: "Roll the dice and climb ladders while avoiding snakes",
    path: "/games/snake-and-ladders",
    icon: GiSnakeTongue,
    bgColor: "#00BCD4",
    color: "white",
  },
  {
    id: "snake",
    name: "Snake",
    description: "Classic snake game with growing tail and obstacles",
    path: "/games/snake",
    icon: GiSnake,
    bgColor: "#2196F3",
    color: "white",
  },
  {
    id: "minesweeper",
    name: "Minesweeper",
    description: "Classic puzzle game where you avoid hidden mines",
    path: "/games/minesweeper",
    icon: GiMineExplosion,
    bgColor: "#673AB7",
    color: "white",
  },
  {
    id: "tic-tac-toe",
    name: "Tic Tac Toe",
    description: "Classic two-player game of X's and O's",
    path: "/games/tic-tac-toe",
    icon: GiTicTacToe,
    bgColor: "#4CAF50",
    color: "white",
  },
  {
    id: "sliding-puzzle",
    name: "Sliding Puzzle",
    description: "Arrange the numbers in order by sliding the tiles",
    path: "/games/sliding-puzzle",
    icon: GiPuzzle,
    bgColor: "#607D8B",
    color: "white",
  },
  {
    id: "color-matcher",
    name: "Color Matcher",
    description: "Match colors with their names",
    path: "/games/color-matcher",
    icon: GiPalette,
    bgColor: "#FF5722",
    color: "white",
  },
  {
    id: "math-challenge",
    name: "Math Challenge",
    description: "Test your math skills with timed problems",
    path: "/games/math-challenge",
    icon: GiAbacus,
    bgColor: "#795548",
    color: "white",
  },
  //{
  //  id: "crossword",
  //  name: "Crossword",
  //  description: "Solve the crossword puzzle with React-themed clues",
  //  path: "/games/crossword",
  //  icon: GiCrossedSwords,
  //  bgColor: "#3F51B5",
  //  color: "white",
  //},
  {
    id: "sudoku",
    name: "Sudoku",
    description: "Classic number puzzle game with 9x9 grid",
    path: "/games/sudoku",
    icon: GiPerspectiveDiceSixFacesRandom,
    bgColor: "#009688",
    color: "white",
  },
  {
    id: "memory-card-flip",
    name: "Memory Card Flip",
    description: "Test your memory by matching pairs of cards",
    path: "/games/memory-card-flip",
    icon: GiCardRandom,
    bgColor: "#8BC34A",
    color: "white",
  },
  {
    id: "world-map-puzzle",
    name: "World Map Puzzle",
    description: "Drag and drop countries to the correct location",
    path: "/games/world-map-puzzle",
    icon: GiEarthAmerica,
    bgColor: "#03A9F4",
    color: "white",
  },
  {
    id: "capitals-quiz",
    name: "Capitals Quiz",
    description: "Test your knowledge of world capitals",
    path: "/games/capitals-quiz",
    icon: GiWorld,
    bgColor: "#9C27B0",
    color: "white",
  },
  {
    id: "table-tennis",
    name: "Table Tennis",
    description: "Classic ping pong game with paddle controls",
    path: "/games/table-tennis",
    icon: GiPingPongBat,
    bgColor: "#FF5722",
    color: "white",
  },
]; 