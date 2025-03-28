import React from "react";
import { Link } from "react-router-dom";
import styled from "@emotion/styled";

const HeaderContainer = styled.header`
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  background: #1a1a1a;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  gap: 2rem;
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
`;

const Nav = styled.nav`
  display: flex;
  gap: 2rem;
  align-items: center;
  margin-left: auto;
  flex-shrink: 0;
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
  white-space: nowrap;

  &:hover {
    color: #7b61ff;
  }
`;

function Header({ searchComponent }) {
  return (
    <HeaderContainer>
      <Logo to="/">Game Collection</Logo>
      {searchComponent && <SearchWrapper>{searchComponent}</SearchWrapper>}
      <Nav>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/leaderboard">Leaderboard</NavLink>
        <NavLink to="/profile">Profile</NavLink>
      </Nav>
    </HeaderContainer>
  );
}

export default Header;
