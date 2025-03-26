import styled from "@emotion/styled";
import { motion } from "framer-motion";

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${(props) => props.theme.spacing.xl};
`;

const GameHeader = styled.div`
  text-align: center;
  margin-bottom: ${(props) => props.theme.spacing.xl};
`;

const GameTitle = styled.h1`
  color: ${(props) => props.theme.colors.primary};
  margin-bottom: ${(props) => props.theme.spacing.md};
`;

const GameDescription = styled.p`
  color: ${(props) => props.theme.colors.gray};
  max-width: 600px;
  margin: 0 auto;
`;

const GameContent = styled(motion.div)`
  background-color: ${(props) => props.theme.colors.white};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  box-shadow: ${(props) => props.theme.shadows.lg};
  padding: ${(props) => props.theme.spacing.xl};
  margin-top: ${(props) => props.theme.spacing.xl};
`;

const GameContainer = ({ title, description, children }) => {
  return (
    <Container>
      <GameHeader>
        <GameTitle>{title}</GameTitle>
        {description && <GameDescription>{description}</GameDescription>}
      </GameHeader>
      <GameContent
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </GameContent>
    </Container>
  );
};

export default GameContainer;
