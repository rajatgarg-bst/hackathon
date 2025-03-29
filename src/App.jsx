import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@emotion/react";
import { Global } from "@emotion/react";
import { theme } from "./styles/theme";
import { globalStyles } from "./styles/globalStyles";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import TicTacToe from "./pages/games/TicTacToe";
import Snake from "./pages/games/Snake";
import Chess from "./pages/games/Chess";
import Basketball from "./pages/games/Basketball";
import Ludo from "./pages/games/Ludo";
import SnakeAndLadders from "./pages/games/SnakeAndLadders";
import MathChallenge from "./pages/games/MathChallenge";
import SlidingPuzzle from "./pages/games/SlidingPuzzle";
import Crossword from "./pages/games/Crossword";
import ColorMatcher from "./pages/games/ColorMatcher";
import Sudoku from "./games/sudoku";
import Minesweeper from "./games/minesweeper";
import MemoryCardFlip from "./games/memory-card-flip";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Global styles={globalStyles} />
      <Router>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Header />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/games/tic-tac-toe" element={<TicTacToe />} />
              <Route path="/games/snake" element={<Snake />} />
              <Route path="/games/chess" element={<Chess />} />
              <Route path="/games/basketball" element={<Basketball />} />
              <Route path="/games/ludo" element={<Ludo />} />
              <Route
                path="/games/snake-and-ladders"
                element={<SnakeAndLadders />}
              />
              <Route path="/games/math-challenge" element={<MathChallenge />} />
              <Route path="/games/sliding-puzzle" element={<SlidingPuzzle />} />
              <Route path="/games/crossword" element={<Crossword />} />
              <Route path="/games/color-matcher" element={<ColorMatcher />} />
              <Route path="/games/sudoku" element={<Sudoku />} />
              <Route path="/games/minesweeper" element={<Minesweeper />} />
              <Route path="/games/memory-card-flip" element={<MemoryCardFlip />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
