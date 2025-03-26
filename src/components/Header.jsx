import React from "react";
import { Link } from "react-router-dom";
import styled from "@emotion/styled";

const HeaderContainer = styled.header`
  background: #1a1a1a;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  gap: 2rem;
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
