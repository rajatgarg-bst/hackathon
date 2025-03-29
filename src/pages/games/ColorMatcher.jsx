import { useState, useEffect } from "react";
import styled from "@emotion/styled";
import GameContainer from "../../components/GameContainer";
import { motion, AnimatePresence } from "framer-motion";
import { useGameSounds } from "../../utils/sound";

const GameArea = styled.div`
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
  position: relative;
  padding: 20px;
`;

const ColorCard = styled(motion.div)`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: 30px;
  margin: 20px auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const ColorDisplay = styled.div`
  width: 100%;
  height: 100px;
  background-color: ${props => props.color};
  border-radius: ${props => props.theme.borderRadius.md};
  margin-bottom: 10px;
  border: 3px solid ${props => props.theme.colors.primary};
`;

const ColorName = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: ${props => props.color};
  margin: 20px 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
`;

const Score = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.theme.colors.primary};
  margin: 20px 0;
`;

const HighScore = styled.div`
  font-size: 1.2rem;
  color: ${props => props.theme.colors.secondary};
  margin-bottom: 20px;
`;

const Level = styled.div`
  font-size: 1.3rem;
  color: ${props => props.theme.colors.primary};
  margin-bottom: 10px;
  font-weight: bold;
`;

const Timer = styled(motion.div)`
  font-size: 2rem;
  font-weight: bold;
  color: ${props => props.theme.colors.primary};
  margin: 20px 0;
  padding: 10px 20px;
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.sm};
  display: inline-block;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Controls = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
`;

const Button = styled.button`
  background-color: ${props => props.bgColor || props.theme.colors.primary};
  color: ${props => props.theme.colors.white};
  padding: 15px 30px;
  border-radius: ${props => props.theme.borderRadius.sm};
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.2s ease;
  min-width: 150px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    background-color: ${props => props.theme.colors.gray};
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const SoundToggle = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: ${props => props.theme.colors.primary};
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.white};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  
  &:hover {
    transform: scale(1.1);
    background: ${props => props.theme.colors.secondary};
  }
`;

const GameOver = styled(motion.div)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: ${props => props.theme.colors.white};
  padding: 30px;
  border-radius: ${props => props.theme.borderRadius.md};
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  text-align: center;
  z-index: 1000;
`;

const StartScreen = styled(motion.div)`
  text-align: center;
  padding: 40px;
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.md};
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin: 20px auto;
  max-width: 500px;
`;

const GameTitle = styled.h2`
  font-size: 2rem;
  color: ${props => props.theme.colors.primary};
  margin-bottom: 20px;
`;

const GameInstructions = styled.div`
  text-align: left;
  margin: 20px 0;
  padding: 20px;
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.borderRadius.sm};
`;

const InstructionItem = styled.div`
  margin: 10px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  
  &:before {
    content: "•";
    color: ${props => props.theme.colors.primary};
    font-weight: bold;
  }
`;

const colors = [
  { name: "Red", color: "#FF0000" },
  { name: "Blue", color: "#0000FF" },
  { name: "Green", color: "#00FF00" },
  { name: "Yellow", color: "#FFFF00" },
  { name: "Purple", color: "#800080" },
  { name: "Orange", color: "#FFA500" },
  { name: "Pink", color: "#FFC0CB" },
  { name: "Gray", color: "#808080" },
  { name: "Black", color: "#000000" },
  { name: "Cyan", color: "#00FFFF" },
];

const ColorMatcher = () => {
  const { playClick, playCorrect, playWrong } = useGameSounds() || {};
  const [currentColor, setCurrentColor] = useState(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem("colorMatcherHighScore");
    return saved ? parseInt(saved) : 0;
  });
  const [isGameOver, setIsGameOver] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(() => {
    const saved = localStorage.getItem("colorMatcherSoundEnabled");
    return saved ? JSON.parse(saved) : true;
  });
  const [level, setLevel] = useState(1);
  const [correctInLevel, setCorrectInLevel] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [timerKey, setTimerKey] = useState(0);
  const [gameOverReason, setGameOverReason] = useState("");

  // Save sound preference
  useEffect(() => {
    localStorage.setItem("colorMatcherSoundEnabled", JSON.stringify(isSoundEnabled));
  }, [isSoundEnabled]);

  const toggleSound = () => {
    setIsSoundEnabled(prev => !prev);
    if (isSoundEnabled && playClick) {
      playClick();
    }
  };

  const playSound = (soundFunction) => {
    if (isSoundEnabled && soundFunction) {
      soundFunction();
    }
  };

  const generateRandomColor = () => {
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomName = colors[Math.floor(Math.random() * colors.length)];
    
    // Check if the name matches the color
    const isMatch = randomColor.name === randomName.name;
    
    return {
      name: randomName.name,
      color: randomColor.color,
      isMatch: isMatch  // true if name matches color, false if they don't match
    };
  };

  const startGame = () => {
    setIsGameStarted(true);
    setCurrentColor(generateRandomColor());
    setScore(0);
    setLevel(1);
    setCorrectInLevel(0);
    setTimeLeft(10);
    setTimerKey(prev => prev + 1);
    setIsGameOver(false);
    setGameOverReason("");
    playSound(playClick);
  };

  const initializeGame = () => {
    setCurrentColor(generateRandomColor());
    setScore(0);
    setLevel(1);
    setCorrectInLevel(0);
    setTimeLeft(10);
    setTimerKey(prev => prev + 1);
    setIsGameOver(false);
    setGameOverReason("");
    playSound(playClick);
  };

  // Timer effect
  useEffect(() => {
    if (isGameOver || !isGameStarted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameOverReason("Time's up!");
          setIsGameOver(true);
          if (score > highScore) {
            setHighScore(score);
            localStorage.setItem("colorMatcherHighScore", score.toString());
          }
          playSound(playWrong);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameOver, isGameStarted, score, highScore, isSoundEnabled, playWrong]);

  const handleMatch = (userSaidMatch) => {
    if (isGameOver) return; // Prevent actions after game over
    
    // Find the actual color object that matches the displayed color
    const actualColor = colors.find(c => c.color === currentColor.color);
    
    // Check if the user's answer is correct
    const isCorrect = userSaidMatch === (actualColor.name === currentColor.name);
    
    if (isCorrect) {
      const points = level; // Points increase with level
      setScore(prev => prev + points);
      setCorrectInLevel(prev => prev + 1);
      
      // Play correct sound
      if (isSoundEnabled && playCorrect) {
        try {
          playCorrect();
        } catch (error) {
          console.log('Sound play error:', error);
        }
      }

      // Level up after 5 correct answers
      if (correctInLevel + 1 >= 5) {
        setLevel(prev => prev + 1);
        setCorrectInLevel(0);
      }

      // Generate new color and reset timer
      setCurrentColor(generateRandomColor());
      setTimeLeft(10);
      setTimerKey(prev => prev + 1);
    } else {
      // Play wrong sound
      if (isSoundEnabled && playWrong) {
        try {
          playWrong();
        } catch (error) {
          console.log('Sound play error:', error);
        }
      }
      // Set game over reason and state
      setGameOverReason("Wrong match!");
      setIsGameOver(true);
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem("colorMatcherHighScore", score.toString());
      }
    }
  };

  // Debug log for color matching
  useEffect(() => {
    if (currentColor) {
      const actualColor = colors.find(c => c.color === currentColor.color);
      console.log('Current display:', {
        displayedName: currentColor.name,
        displayedColor: currentColor.color,
        actualColorName: actualColor.name,
        isMatching: actualColor.name === currentColor.name
      });
    }
  }, [currentColor]);

  return (
    <GameContainer
      title="Color Matcher"
      description="Check if the color name matches its actual color. Press 'Match' if they match, 'No Match' if they don't. One wrong answer or running out of time ends the game!"
    >
      <GameArea>
        <SoundToggle onClick={toggleSound} aria-label="Toggle sound">
          {isSoundEnabled ? "🔊" : "🔈"}
        </SoundToggle>

        {!isGameStarted ? (
          <StartScreen
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <GameTitle>Color Matcher</GameTitle>
            <GameInstructions>
              <InstructionItem>Match the color name with its actual color</InstructionItem>
              <InstructionItem>Press 'Match' if they match, 'No Match' if they don't</InstructionItem>
              <InstructionItem>Get 5 correct answers to level up</InstructionItem>
              <InstructionItem>Points increase with each level</InstructionItem>
              <InstructionItem>Game ends on wrong answer or time running out</InstructionItem>
            </GameInstructions>
            <HighScore>High Score: {highScore}</HighScore>
            <Button onClick={startGame}>Start Game</Button>
          </StartScreen>
        ) : (
          <>
            <Level>Level {level} ({correctInLevel}/5 correct)</Level>
            <Score>Score: {score}</Score>
            <HighScore>High Score: {highScore}</HighScore>
            
            <Timer
              key={timerKey}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {timeLeft}s
            </Timer>
            
            {currentColor && (
              <ColorCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <ColorName color={currentColor.color}>{currentColor.name}</ColorName>
                <Controls>
                  <Button 
                    onClick={() => handleMatch(true)}
                    bgColor="#4CAF50"
                    disabled={isGameOver}
                  >
                    Match
                  </Button>
                  <Button 
                    onClick={() => handleMatch(false)}
                    bgColor="#F44336"
                    disabled={isGameOver}
                  >
                    No Match
                  </Button>
                </Controls>
              </ColorCard>
            )}

            {isGameOver && (
              <GameOver
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <h2>Game Over!</h2>
                <p style={{ color: "#F44336", fontWeight: "bold" }}>{gameOverReason}</p>
                <p>Final Score: {score}</p>
                <p>High Score: {highScore}</p>
                <p>Level Reached: {level}</p>
                <Button onClick={initializeGame}>Play Again</Button>
              </GameOver>
            )}
          </>
        )}
      </GameArea>
    </GameContainer>
  );
};

export default ColorMatcher; 