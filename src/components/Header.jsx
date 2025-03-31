import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "@emotion/styled";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaHistory } from "react-icons/fa";
import { games } from "../utils/gameList";

// Create a function to handle dynamic styles
const getBackgroundColor = (props) => props.bgColor || "#f0f0f0";
const getColor = (props) => props.color || "#333";

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
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

const HeaderContainer = styled.header`
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  background: #1a1a1a;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Logo = styled(Link)`
  color: white;
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: bold;
  flex-shrink: 0;
`;

const SearchWrapper = styled.div`
  flex: 1;
  max-width: 500px;
  min-width: 200px;
  margin-left: auto;
`;

function Header() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef(null);

  const handleGameClick = (game) => {
    navigate(game.path);
    setShowSearchDropdown(false);
    setSearchQuery("");
  };

  const filteredGames = games.filter(
    (game) =>
      game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <HeaderContainer>
      <Logo to="/">Game Hub</Logo>
      <SearchWrapper>
        <SearchContainer ref={searchRef}>
          <SearchInput
            type="text"
            placeholder="Search games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSearchDropdown(true)}
          />
          <SearchIcon />
          <AnimatePresence>
            {showSearchDropdown && searchQuery && (
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
                      <SearchResultTitle>{game.name}</SearchResultTitle>
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
      </SearchWrapper>
    </HeaderContainer>
  );
}

export default Header;
