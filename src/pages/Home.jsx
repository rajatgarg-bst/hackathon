import React from "react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled from "@emotion/styled";
import { motion, AnimatePresence } from "framer-motion";
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
} from "react-icons/gi";
import { FaSearch, FaHistory } from "react-icons/fa";
import Header from "../components/Header";

// Create a function to handle dynamic styles
const getBackgroundColor = (props) => props.bgColor || "#f0f0f0";
const getColor = (props) => props.color || "#333";

const HomeHeader = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
`;

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 3rem 0.75rem 1rem;
  font-size: 1rem;
  border: 2px solid #333;
  border-radius: 8px;
  outline: none;
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.1);
  color: white;

  &::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }

  &:focus {
    border-color: #7b61ff;
    box-shadow: 0 0 0 3px rgba(123, 97, 255, 0.1);
    background: rgba(255, 255, 255, 0.15);
  }
`;

const SearchIcon = styled(FaSearch)`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
`;

const SearchDropdown = styled(motion.div)`
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  background: #1a1a1a;
  border: 2px solid #333;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
`;

const SearchResultItem = styled.div`
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const SearchResultIcon = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${getBackgroundColor};
  border-radius: 50%;
  font-size: 1.2rem;
  color: ${getColor};
`;

const SearchResultInfo = styled.div`
  flex: 1;
`;

const SearchResultTitle = styled.div`
  font-weight: 500;
  color: white;
`;

const SearchResultDescription = styled.div`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
`;

const MainContent = styled.main`
  margin-top: 10px;
  max-width: 100%;
  margin-left: auto;
  margin-right: auto;
`;

const RecentGames = styled.div`
  margin: 0 20px;
  background: rgba(0, 0, 0, 0.5);
  height: 50px;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  gap: 12px;
  width: calc(100% - 40px);
  border-radius: 8px;
  backdrop-filter: blur(8px);
`;

const RecentGamesHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  font-weight: 500;
  font-size: 0.9rem;
  white-space: nowrap;
  flex-shrink: 0;
`;

const RecentGamesList = styled.div`
  display: flex;
  gap: 4px;
  overflow-x: auto;
  white-space: nowrap;
  flex: 1;
  height: 38px;
  align-items: center;
  padding-right: 1rem;

  /* Hide scrollbar but keep functionality */
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const RecentGameItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  width: 180px;
  height: 32px;

  &:hover {
    transform: translateY(-1px);
  }
`;

const RecentGameIcon = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${getBackgroundColor};
  border-radius: 50%;
  font-size: 0.9rem;
  color: ${getColor};
  flex-shrink: 0;
`;

const RecentGameInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const RecentGameTitle = styled.div`
  font-weight: 500;
  color: white;
  font-size: 0.85rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
`;

const RecentGameTime = styled.div`
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1;
`;

const GamesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const GameCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
`;

const GameIcon = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${getBackgroundColor};
  border-radius: 50%;
  font-size: 2rem;
  color: ${getColor};
`;

const GameTitle = styled.h3`
  margin: 0.5rem 0;
  color: #333;
  font-size: 1.2rem;
`;

const GameDescription = styled.p`
  color: #666;
  font-size: 0.9rem;
  margin: 0;
`;

const games = [
  {
    id: "tic-tac-toe",
    title: "Tic Tac Toe",
    description: "Classic two-player game of X's and O's",
    path: "/games/tic-tac-toe",
    icon: GiTicTacToe,
    bgColor: "#4CAF50",
    color: "white",
  },
  {
    id: "snake",
    title: "Snake",
    description: "Classic snake game with growing tail and obstacles",
    path: "/games/snake",
    icon: GiSnake,
    bgColor: "#2196F3",
    color: "white",
  },
  {
    id: "chess",
    title: "Chess",
    description: "Strategic two-player chess game with all standard rules",
    path: "/games/chess",
    icon: GiChessKing,
    bgColor: "#FF9800",
    color: "white",
  },
  {
    id: "basketball",
    title: "Basketball",
    description: "Test your timing in this basketball shooting game",
    path: "/games/basketball",
    icon: GiBasketballBall,
    bgColor: "#E91E63",
    color: "white",
  },
  {
    id: "ludo",
    title: "Ludo",
    description: "Classic board game with four players and dice rolling",
    path: "/games/ludo",
    icon: GiDiceSixFacesFive,
    bgColor: "#9C27B0",
    color: "white",
  },
  {
    id: "snake-and-ladders",
    title: "Snake & Ladders",
    description: "Roll the dice and climb ladders while avoiding snakes",
    path: "/games/snake-and-ladders",
    icon: GiSnakeTongue,
    bgColor: "#00BCD4",
    color: "white",
  },
  {
    id: "math-challenge",
    title: "Math Challenge",
    description: "Test your math skills with timed problems",
    path: "/games/math-challenge",
    icon: GiAbacus,
    bgColor: "#795548",
    color: "white",
  },
  {
    id: "sliding-puzzle",
    title: "Sliding Puzzle",
    description: "Arrange the numbers in order by sliding the tiles",
    path: "/games/sliding-puzzle",
    icon: GiPuzzle,
    bgColor: "#607D8B",
    color: "white",
  },
  {
    id: "crossword",
    title: "Crossword",
    description: "Solve the crossword puzzle with React-themed clues",
    path: "/games/crossword",
    icon: GiCrossedSwords,
    bgColor: "#3F51B5",
    color: "white",
  },
];

function Home() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [recentGames, setRecentGames] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef(null);

  const handleGameClick = (game) => {
    // Update recent games with the full game object including the icon
    const gameToSave = {
      id: game.id,
      title: game.title,
      description: game.description,
      path: game.path,
      bgColor: game.bgColor,
      color: game.color,
      timestamp: Date.now(),
      // Store the icon name instead of the function
      iconName: game.icon.name,
    };

    const updatedRecentGames = [
      gameToSave,
      ...recentGames.filter((g) => g.id !== game.id),
    ].slice(0, 5); // Keep only 5 recent games

    setRecentGames(updatedRecentGames);
    localStorage.setItem("recentGames", JSON.stringify(updatedRecentGames));

    // Navigate to game
    navigate(game.path);
    setIsSearchFocused(false);
  };

  // Map icon names to actual icon components
  const iconMap = {
    GiTicTacToe,
    GiSnake,
    GiChessKing,
    GiBasketballBall,
    GiDiceSixFacesFive,
    GiSnakeTongue,
    GiAbacus,
    GiPuzzle,
    GiCrossedSwords,
  };

  useEffect(() => {
    // Load recent games from localStorage
    const savedRecentGames = localStorage.getItem("recentGames");
    if (savedRecentGames) {
      try {
        const parsedGames = JSON.parse(savedRecentGames);
        setRecentGames(parsedGames);
      } catch (error) {
        console.error("Error parsing recent games:", error);
        localStorage.removeItem("recentGames"); // Clear invalid data
        setRecentGames([]);
      }
    }

    // Handle click outside search dropdown
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredGames = games.filter(
    (game) =>
      game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTimeAgo = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const SearchComponent = (
    <SearchContainer ref={searchRef}>
      <SearchInput
        type="text"
        placeholder="Search games..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setIsSearchFocused(true)}
      />
      <SearchIcon />
      <AnimatePresence>
        {isSearchFocused && searchTerm && (
          <SearchDropdown
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {filteredGames.map((game) => (
              <SearchResultItem
                key={game.id}
                onClick={() => handleGameClick(game)}
              >
                <SearchResultIcon bgColor={game.bgColor} color={game.color}>
                  {React.createElement(game.icon)}
                </SearchResultIcon>
                <SearchResultInfo>
                  <SearchResultTitle>{game.title}</SearchResultTitle>
                  <SearchResultDescription>
                    {game.description}
                  </SearchResultDescription>
                </SearchResultInfo>
              </SearchResultItem>
            ))}
          </SearchDropdown>
        )}
      </AnimatePresence>
    </SearchContainer>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <MainContent>
        {recentGames.length > 0 && (
          <RecentGames>
            <RecentGamesHeader>
              <FaHistory /> Recent Games
            </RecentGamesHeader>
            <RecentGamesList>
              {recentGames.map((game) => {
                const IconComponent = iconMap[game.iconName];
                if (!IconComponent) return null;

                return (
                  <RecentGameItem
                    key={game.id}
                    onClick={() =>
                      handleGameClick(games.find((g) => g.id === game.id))
                    }
                  >
                    <RecentGameIcon bgColor={game.bgColor} color={game.color}>
                      <IconComponent />
                    </RecentGameIcon>
                    <RecentGameInfo>
                      <RecentGameTitle>{game.title}</RecentGameTitle>
                      <RecentGameTime>
                        {formatTimeAgo(game.timestamp)}
                      </RecentGameTime>
                    </RecentGameInfo>
                  </RecentGameItem>
                );
              })}
            </RecentGamesList>
          </RecentGames>
        )}

        <GamesGrid>
          {games.map((game) => (
            <GameCard
              key={game.id}
              onClick={() => handleGameClick(game)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <GameIcon bgColor={game.bgColor} color={game.color}>
                {React.createElement(game.icon)}
              </GameIcon>
              <GameTitle>{game.title}</GameTitle>
              <GameDescription>{game.description}</GameDescription>
            </GameCard>
          ))}
        </GamesGrid>
      </MainContent>
    </div>
  );
}

export { Home as default };
