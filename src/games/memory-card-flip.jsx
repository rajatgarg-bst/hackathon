import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from '@emotion/styled';
import { FaVolumeUp, FaVolumeMute, FaRedo, FaTrophy, FaClock, FaBrain } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 0.75rem 1rem;
  position: relative;
  
  @media (max-width: 768px) {
    padding: 0.5rem 0.75rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.4rem 0.5rem;
  }
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 0.75rem;
  color: #8BC34A;
  font-size: 1.8rem;
  
  @media (max-width: 768px) {
    font-size: 1.6rem;
    margin-bottom: 0.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.4rem;
    margin-bottom: 0.4rem;
  }
`;

const SoundButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 100;
  background-color: #f0f0f0;
  border-radius: 50%;
  padding: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: #666;
  
  &:hover {
    background-color: #e0e0e0;
    color: #8BC34A;
  }
`;

const GameHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  padding: 0.4rem 0.75rem;
  background-color: #f0f0f0;
  border-radius: 8px;
  border: 2px solid #ddd;
  
  @media (max-width: 480px) {
    padding: 0.3rem;
    flex-wrap: wrap;
    gap: 3px;
    justify-content: center;
    margin-bottom: 0.4rem;
  }
`;

const StatsItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: bold;
  color: #333;
  
  svg {
    color: #8BC34A;
  }
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    gap: 0.3rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
    flex: 1 1 30%;
    justify-content: center;
  }
`;

const DifficultySelector = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  
  @media (max-width: 480px) {
    gap: 0.25rem;
    flex-wrap: wrap;
    margin-bottom: 0.4rem;
  }
`;

const DifficultyButton = styled.button`
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  background-color: ${props => props.isSelected ? '#8BC34A' : '#f0f0f0'};
  color: ${props => props.isSelected ? 'white' : '#333'};
  border: 2px solid ${props => props.isSelected ? '#8BC34A' : '#ddd'};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.isSelected ? '#7CB342' : '#e0e0e0'};
  }
  
  @media (max-width: 480px) {
    padding: 0.4rem 0.7rem;
    font-size: 0.8rem;
  }
`;

const GameBoard = styled.div`
  display: grid;
  grid-template-columns: repeat(${props => props.columns}, 1fr);
  gap: 8px;
  margin: 0 auto;
  justify-content: center;
  max-width: 680px;
  width: 100%;

  @media (max-width: 768px) {
    gap: 6px;
    max-width: 90%;
  }

  @media (max-width: 600px) {
    gap: 4px;
  }

  @media (max-width: 480px) {
    gap: 3px;
  }
`;

const Card = styled(motion.div)`
  aspect-ratio: 1.2;
  perspective: 1000px;
  cursor: pointer;
  max-width: 100%;
  height: auto;
  min-height: 0;

  @media (max-width: 768px) {
    aspect-ratio: 1.25;
  }

  @media (max-width: 600px) {
    aspect-ratio: 1.3;
  }

  @media (max-width: 480px) {
    aspect-ratio: 1.35;
  }
`;

const CardInner = styled(motion.div)`
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const CardFace = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
`;

const CardFront = styled(CardFace)`
  background: linear-gradient(135deg, #8BC34A, #689F38);
  color: white;
  
  &::after {
    content: '?';
    font-size: 2rem;
    opacity: 0.8;

    @media (max-width: 768px) {
      font-size: 1.7rem;
    }

    @media (max-width: 600px) {
      font-size: 1.4rem;
    }

    @media (max-width: 480px) {
      font-size: 1.2rem;
    }
  }
`;

const CardBack = styled(CardFace)`
  background-color: white;
  transform: rotateY(180deg);
  border: 2px solid #ddd;
  font-size: ${props => props.large ? '2rem' : '1.75rem'};
  color: ${props => props.color || '#333'};

  @media (max-width: 768px) {
    font-size: ${props => props.large ? '1.8rem' : '1.5rem'};
    border-width: 1px;
  }

  @media (max-width: 600px) {
    font-size: ${props => props.large ? '1.5rem' : '1.3rem'};
  }

  @media (max-width: 480px) {
    font-size: ${props => props.large ? '1.3rem' : '1.1rem'};
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  background-color: ${props => props.primary ? '#8BC34A' : '#f0f0f0'};
  color: ${props => props.primary ? 'white' : '#333'};
  border: 2px solid ${props => props.primary ? '#8BC34A' : '#ddd'};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 1.5rem;

  &:hover {
    background-color: ${props => props.primary ? '#7CB342' : '#e0e0e0'};
  }
  
  @media (max-width: 768px) {
    padding: 0.6rem 1.2rem;
    font-size: 0.95rem;
    margin-top: 1.2rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    margin-top: 1rem;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 0.8rem;
  
  @media (max-width: 480px) {
    gap: 0.4rem;
    flex-wrap: wrap;
    margin-top: 0.6rem;
  }
`;

const GameOver = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const GameOverContent = styled(motion.div)`
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  
  @media (max-width: 480px) {
    padding: 1.5rem 1rem;
    width: 85%;
  }
`;

const GameOverTitle = styled.h2`
  color: #8BC34A;
  margin-bottom: 1rem;
`;

const GameOverStat = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 0.75rem 0;
  font-size: 1.1rem;
  
  svg {
    color: #8BC34A;
  }
  
  @media (max-width: 480px) {
    font-size: 0.95rem;
    gap: 0.3rem;
  }
`;

const ThemeSelectorTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 0.4rem;
  color: #666;
  font-size: 0.9rem;
  text-align: center;
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
    margin-bottom: 0.3rem;
  }
`;

const ThemeSelector = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
  
  @media (max-width: 480px) {
    gap: 0.25rem;
  }
`;

const ThemeButton = styled.button`
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  background-color: ${props => props.isSelected ? '#8BC34A' : '#f0f0f0'};
  color: ${props => props.isSelected ? 'white' : '#333'};
  border: 2px solid ${props => props.isSelected ? '#8BC34A' : '#ddd'};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.isSelected ? '#7CB342' : '#e0e0e0'};
  }
  
  @media (max-width: 480px) {
    padding: 0.4rem 0.7rem;
    font-size: 0.8rem;
  }
`;

// Card themes
const themes = {
  emoji: [
    { value: '🐶', color: '#333' }, { value: '🐱', color: '#333' },
    { value: '🐭', color: '#333' }, { value: '🐹', color: '#333' },
    { value: '🐰', color: '#333' }, { value: '🦊', color: '#333' },
    { value: '🐻', color: '#333' }, { value: '🐼', color: '#333' },
    { value: '🐨', color: '#333' }, { value: '🐯', color: '#333' },
    { value: '🦁', color: '#333' }, { value: '🐮', color: '#333' },
    { value: '🐷', color: '#333' }, { value: '🐸', color: '#333' },
    { value: '🐵', color: '#333' }, { value: '🐔', color: '#333' },
    { value: '🐧', color: '#333' }, { value: '🐦', color: '#333' },
    { value: '🦅', color: '#333' }, { value: '🦉', color: '#333' },
    { value: '🦇', color: '#333' }, { value: '🐺', color: '#333' },
    { value: '🐗', color: '#333' }, { value: '🐴', color: '#333' }
  ],
  fruits: [
    { value: '🍎', color: '#E53935' }, { value: '🍐', color: '#7CB342' },
    { value: '🍊', color: '#FB8C00' }, { value: '🍋', color: '#FDD835' },
    { value: '🍌', color: '#FDD835' }, { value: '🍉', color: '#E53935' },
    { value: '🍇', color: '#8E24AA' }, { value: '🍓', color: '#E53935' },
    { value: '🍈', color: '#7CB342' }, { value: '🍒', color: '#E53935' },
    { value: '🍑', color: '#FB8C00' }, { value: '🍍', color: '#FDD835' },
    { value: '🥝', color: '#7CB342' }, { value: '🍅', color: '#E53935' },
    { value: '🥥', color: '#795548' }, { value: '🥑', color: '#7CB342' },
    { value: '🥕', color: '#FB8C00' }, { value: '🥔', color: '#795548' },
    { value: '🍆', color: '#8E24AA' }, { value: '🥜', color: '#795548' },
    { value: '🥐', color: '#D7CCC8' }, { value: '🥞', color: '#D7CCC8' },
    { value: '🥓', color: '#E53935' }, { value: '🍔', color: '#795548' }
  ],
  symbols: [
    { value: '♠️', color: '#333' }, { value: '♥️', color: '#E53935' },
    { value: '♦️', color: '#E53935' }, { value: '♣️', color: '#333' },
    { value: '🔴', color: '#E53935' }, { value: '🔵', color: '#1E88E5' },
    { value: '🟢', color: '#7CB342' }, { value: '🟡', color: '#FDD835' },
    { value: '⭐', color: '#FDD835' }, { value: '🔶', color: '#FB8C00' },
    { value: '🔷', color: '#1E88E5' }, { value: '🔸', color: '#FB8C00' },
    { value: '🔹', color: '#1E88E5' }, { value: '🚀', color: '#333' },
    { value: '⚡', color: '#FDD835' }, { value: '🔥', color: '#E53935' },
    { value: '💧', color: '#1E88E5' }, { value: '❄️', color: '#1E88E5' },
    { value: '🌈', color: '#333' }, { value: '☀️', color: '#FDD835' },
    { value: '🌙', color: '#FDD835' }, { value: '⛄', color: '#E0E0E0' },
    { value: '🌟', color: '#FDD835' }, { value: '🎯', color: '#E53935' }
  ]
};

// Difficulty configurations
const difficulties = {
  easy: { rows: 4, columns: 4, pairs: 8 },
  medium: { rows: 5, columns: 6, pairs: 15 },
  hard: { rows: 6, columns: 6, pairs: 18 }
};

const MemoryCardFlip = () => {
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [difficulty, setDifficulty] = useState('easy');
  const [config, setConfig] = useState(difficulties.easy);
  const [theme, setTheme] = useState('emoji');
  const [time, setTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const timerRef = useRef(null);
  
  // Audio refs
  const flipSoundRef = useRef(null);
  const matchSoundRef = useRef(null);
  const gameOverSoundRef = useRef(null);
  
  // Initialize sounds
  useEffect(() => {
    try {
      // Create audio elements
      flipSoundRef.current = new Audio('https://www.soundjay.com/button/sounds/button-21.mp3');
      matchSoundRef.current = new Audio('https://www.soundjay.com/button/sounds/button-37.mp3');
      gameOverSoundRef.current = new Audio('https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3');
      
      // Preload sounds
      flipSoundRef.current.load();
      matchSoundRef.current.load();
      gameOverSoundRef.current.load();
      
      // Set volumes
      flipSoundRef.current.volume = 0.3;
      matchSoundRef.current.volume = 0.3;
      gameOverSoundRef.current.volume = 0.5;
      
      // Check if there's a saved mute preference
      const savedMuteState = localStorage.getItem('memoryCardFlipSoundMuted');
      if (savedMuteState !== null) {
        setIsMuted(savedMuteState === 'true');
      }
    } catch (error) {
      console.error("Error initializing sounds:", error);
    }
    
    // Cleanup
    return () => {
      [flipSoundRef, matchSoundRef, gameOverSoundRef].forEach(ref => {
        if (ref.current) {
          ref.current.pause();
          ref.current.currentTime = 0;
        }
      });
    };
  }, []);
  
  // Play sound function
  const playSound = useCallback((soundRef) => {
    if (isMuted || !soundRef.current) return;
    
    try {
      // Reset sound to beginning if it's already playing
      soundRef.current.pause();
      soundRef.current.currentTime = 0;
      
      // Play with proper error handling
      const playPromise = soundRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          // Handle autoplay policy errors gracefully
          console.log('Sound playback prevented:', error);
        });
      }
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  }, [isMuted]);
  
  // Toggle mute function
  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newState = !prev;
      localStorage.setItem('memoryCardFlipSoundMuted', newState.toString());
      return newState;
    });
  }, []);

  // Initialize game
  const initializeGame = useCallback(() => {
    const { pairs } = config;
    const selectedTheme = themes[theme];
    
    // Shuffle and select cards for this game
    const shuffledSymbols = [...selectedTheme].sort(() => Math.random() - 0.5).slice(0, pairs);
    
    // Create pairs and shuffle them
    const cardPairs = [...shuffledSymbols, ...shuffledSymbols].map((card, index) => ({
      id: index,
      value: card.value,
      color: card.color,
      isFlipped: false,
      isMatched: false
    })).sort(() => Math.random() - 0.5);
    
    setCards(cardPairs);
    setFlippedIndices([]);
    setMatchedPairs([]);
    setMoves(0);
    setGameOver(false);
    setTime(0);
    
    // Reset timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Start timer
    timerRef.current = setInterval(() => {
      setTime(prevTime => prevTime + 1);
    }, 1000);
    
  }, [config, theme]);
  
  // Initialize game when config changes
  useEffect(() => {
    initializeGame();
    
    // Clean up timer on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [config, theme, initializeGame]);
  
  // Handle difficulty change
  const handleDifficultyChange = (newDifficulty) => {
    setDifficulty(newDifficulty);
    setConfig(difficulties[newDifficulty]);
  };
  
  // Handle theme change
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };
  
  // Handle card click
  const handleCardClick = (index) => {
    // Ignore clicks if already flipped or matched
    if (flippedIndices.includes(index) || cards[index].isMatched || flippedIndices.length >= 2) {
      return;
    }
    
    // Play flip sound
    playSound(flipSoundRef);
    
    // Flip the card
    const newFlippedIndices = [...flippedIndices, index];
    setFlippedIndices(newFlippedIndices);
    
    // If this is the second card, check for a match
    if (newFlippedIndices.length === 2) {
      setMoves(prevMoves => prevMoves + 1);
      
      const [firstIndex, secondIndex] = newFlippedIndices;
      const firstCard = cards[firstIndex];
      const secondCard = cards[secondIndex];
      
      if (firstCard.value === secondCard.value) {
        // Cards match
        setTimeout(() => {
          const newCards = [...cards];
          newCards[firstIndex].isMatched = true;
          newCards[secondIndex].isMatched = true;
          setCards(newCards);
          
          const newMatchedPairs = [...matchedPairs, firstCard.value];
          setMatchedPairs(newMatchedPairs);
          
          // Play match sound
          playSound(matchSoundRef);
          
          // Reset flipped indices
          setFlippedIndices([]);
          
          // Check if game is over
          if (newMatchedPairs.length === config.pairs) {
            // Game over - player won
            setGameOver(true);
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            
            // Play game over sound
            playSound(gameOverSoundRef);
          }
        }, 500);
      } else {
        // Cards don't match, flip them back
        setTimeout(() => {
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };
  
  // Format time as MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Start a new game
  const handleNewGame = () => {
    initializeGame();
  };
  
  // Reset current game
  const handleReset = () => {
    initializeGame();
  };
  
  // Calculate score (based on difficulty, moves, and time)
  const calculateScore = () => {
    let baseScore;
    
    switch (difficulty) {
      case 'easy':
        baseScore = 1000;
        break;
      case 'medium':
        baseScore = 2000;
        break;
      case 'hard':
        baseScore = 3000;
        break;
      default:
        baseScore = 1000;
    }
    
    // Penalize for moves and time
    const movePenalty = moves * 10;
    const timePenalty = time * 2;
    
    const score = Math.max(baseScore - movePenalty - timePenalty, 0);
    return score;
  };
  
  // Get star rating based on moves
  const getStarRating = () => {
    const perfectMovesThreshold = config.pairs * 2; // Perfect is one move per pair
    const goodMovesThreshold = perfectMovesThreshold + Math.floor(config.pairs / 2);
    
    if (moves <= perfectMovesThreshold) {
      return '⭐⭐⭐'; // 3 stars
    } else if (moves <= goodMovesThreshold) {
      return '⭐⭐'; // 2 stars
    } else {
      return '⭐'; // 1 star
    }
  };
  
  return (
    <Container>
      <Title>Memory Card Flip</Title>
      
      <SoundButton 
        onClick={toggleMute}
        title={isMuted ? "Unmute Sounds" : "Mute Sounds"}
      >
        {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
      </SoundButton>
      
      <ThemeSelectorTitle>Theme</ThemeSelectorTitle>
      <ThemeSelector>
        <ThemeButton 
          onClick={() => handleThemeChange('emoji')}
          isSelected={theme === 'emoji'}
        >
          Emoji
        </ThemeButton>
        <ThemeButton 
          onClick={() => handleThemeChange('fruits')}
          isSelected={theme === 'fruits'}
        >
          Food
        </ThemeButton>
        <ThemeButton 
          onClick={() => handleThemeChange('symbols')}
          isSelected={theme === 'symbols'}
        >
          Symbols
        </ThemeButton>
      </ThemeSelector>
      
      <DifficultySelector>
        <DifficultyButton 
          onClick={() => handleDifficultyChange('easy')}
          isSelected={difficulty === 'easy'}
        >
          Easy (4x4)
        </DifficultyButton>
        <DifficultyButton 
          onClick={() => handleDifficultyChange('medium')}
          isSelected={difficulty === 'medium'}
        >
          Medium (5x6)
        </DifficultyButton>
        <DifficultyButton 
          onClick={() => handleDifficultyChange('hard')}
          isSelected={difficulty === 'hard'}
        >
          Hard (6x6)
        </DifficultyButton>
      </DifficultySelector>
      
      <GameHeader>
        <StatsItem>
          <FaBrain /> {moves} Moves
        </StatsItem>
        <StatsItem>
          <FaTrophy /> {matchedPairs.length}/{config.pairs} Pairs
        </StatsItem>
        <StatsItem>
          <FaClock /> {formatTime(time)}
        </StatsItem>
      </GameHeader>
      
      <GameBoard columns={config.columns}>
        {cards.map((card, index) => (
          <Card 
            key={index} 
            onClick={() => handleCardClick(index)}
          >
            <CardInner
              initial={false}
              animate={{ 
                rotateY: flippedIndices.includes(index) || card.isMatched ? 180 : 0 
              }}
              transition={{ duration: 0.5 }}
            >
              <CardFront />
              <CardBack 
                color={card.color}
                large={card.value.length === 1}
              >
                {card.value}
              </CardBack>
            </CardInner>
          </Card>
        ))}
      </GameBoard>
      
      <ButtonContainer>
        <Button onClick={handleReset}>
          <FaRedo /> Reset
        </Button>
        <Button onClick={handleNewGame} primary>
          New Game
        </Button>
      </ButtonContainer>
      
      <AnimatePresence>
        {gameOver && (
          <GameOver
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <GameOverContent
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <GameOverTitle>Congratulations!</GameOverTitle>
              <p>You've matched all the cards!</p>
              
              <GameOverStat>
                <FaBrain /> Moves: {moves}
              </GameOverStat>
              <GameOverStat>
                <FaClock /> Time: {formatTime(time)}
              </GameOverStat>
              <GameOverStat>
                <FaTrophy /> Score: {calculateScore()}
              </GameOverStat>
              <GameOverStat>
                Rating: {getStarRating()}
              </GameOverStat>
              
              <ButtonContainer>
                <Button onClick={() => setGameOver(false)}>
                  Continue
                </Button>
                <Button onClick={handleNewGame} primary>
                  New Game
                </Button>
              </ButtonContainer>
            </GameOverContent>
          </GameOver>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default MemoryCardFlip; 