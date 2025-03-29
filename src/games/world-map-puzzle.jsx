import React, { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrophy, FaClock, FaRedo, FaVolumeUp, FaVolumeMute, FaCheck, FaMapMarkedAlt } from 'react-icons/fa';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  position: relative;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 1rem;
  color: #03A9F4;
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
    color: #03A9F4;
  }
`;

const GameHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  background-color: #f0f0f0;
  border-radius: 8px;
  border: 2px solid #ddd;
  
  @media (max-width: 600px) {
    flex-direction: column;
    gap: 0.5rem;
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
    color: #03A9F4;
  }
`;

const DifficultySelector = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  
  @media (max-width: 600px) {
    flex-wrap: wrap;
  }
`;

const DifficultyButton = styled.button`
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  background-color: ${props => props.isSelected ? '#03A9F4' : '#f0f0f0'};
  color: ${props => props.isSelected ? 'white' : '#333'};
  border: 2px solid ${props => props.isSelected ? '#03A9F4' : '#ddd'};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.isSelected ? '#0288D1' : '#e0e0e0'};
  }
`;

const GameArea = styled.div`
  position: relative;
  width: 100%;
  height: 60vh;
  min-height: 400px;
  margin: 0 auto;
  border: 2px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f5f5f5;
  
  @media (max-width: 768px) {
    height: 50vh;
  }
`;

const WorldMap = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg');
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0.3;
`;

const CountryOutlines = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;

const CountryOutline = styled.div`
  position: absolute;
  border: 2px dashed #999;
  border-radius: 4px;
  pointer-events: none;
  opacity: 0.6;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CountryLabel = styled.div`
  color: #333;
  font-size: 0.7rem;
  font-weight: 600;
  background-color: rgba(255, 255, 255, 0.7);
  padding: 1px 3px;
  border-radius: 2px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  max-width: 90%;
  opacity: 0.9;
  text-align: center;
  user-select: none;
  pointer-events: none;
`;

const CountryContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 1rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  background-color: #f0f0f0;
`;

const CountryItem = styled(motion.div)`
  padding: 0.5rem;
  background-color: ${props => props.isCorrect ? '#4CAF50' : '#03A9F4'};
  color: white;
  border-radius: 4px;
  cursor: grab;
  user-select: none;
  box-shadow: ${props => props.isDragging ? '0 5px 10px rgba(0, 0, 0, 0.3)' : '0 2px 5px rgba(0, 0, 0, 0.2)'};
  font-weight: ${props => props.isDragging ? 'bold' : 'normal'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:active {
    cursor: grabbing;
  }
`;

const CountryShape = styled.div`
  width: 36px;
  height: 36px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 30px;
    height: 30px;
    path {
      fill: white;
    }
  }
  
  @media (max-width: 600px) {
    width: 32px;
    height: 32px;
    svg {
      width: 26px;
      height: 26px;
    }
  }
`;

const CountryName = styled.span`
  font-size: 0.9rem;
  font-weight: 500;
`;

const DropZone = styled.div`
  position: absolute;
  background-color: rgba(3, 169, 244, 0.1);
  border: 2px dashed ${props => props.isActive ? '#03A9F4' : 'rgba(3, 169, 244, 0.4)'};
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(3, 169, 244, 0.2);
    border-color: #03A9F4;
  }
`;

const PlacedCountry = styled(motion.div)`
  position: absolute;
  padding: 0.5rem;
  background-color: ${props => props.isCorrect ? '#4CAF50' : '#03A9F4'};
  color: white;
  border-radius: 4px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  cursor: ${props => props.isCorrect ? 'default' : 'grab'};
  user-select: none;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:active {
    cursor: ${props => props.isCorrect ? 'default' : 'grabbing'};
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  background-color: ${props => props.primary ? '#03A9F4' : '#f0f0f0'};
  color: ${props => props.primary ? 'white' : '#333'};
  border: 2px solid ${props => props.primary ? '#03A9F4' : '#ddd'};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.primary ? '#0288D1' : '#e0e0e0'};
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
`;

const GameOverTitle = styled.h2`
  color: #03A9F4;
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
    color: #03A9F4;
  }
`;

const RegionSelector = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const RegionButton = styled.button`
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  background-color: ${props => props.isSelected ? '#03A9F4' : '#f0f0f0'};
  color: ${props => props.isSelected ? 'white' : '#333'};
  border: 2px solid ${props => props.isSelected ? '#03A9F4' : '#ddd'};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.isSelected ? '#0288D1' : '#e0e0e0'};
  }
`;

// Map region definitions with countries and drop zones
const regions = {
  europe: {
    name: 'Europe',
    countries: [
      { id: 'france', name: 'France', x: 43, y: 38, width: 6, height: 5 },
      { id: 'germany', name: 'Germany', x: 47, y: 35, width: 5, height: 4 },
      { id: 'italy', name: 'Italy', x: 48, y: 42, width: 4, height: 6 },
      { id: 'uk', name: 'United Kingdom', x: 42, y: 33, width: 4, height: 4 },
      { id: 'spain', name: 'Spain', x: 40, y: 43, width: 6, height: 5 },
      { id: 'poland', name: 'Poland', x: 51, y: 34, width: 5, height: 4 },
      { id: 'ukraine', name: 'Ukraine', x: 55, y: 36, width: 7, height: 5 },
      { id: 'sweden', name: 'Sweden', x: 48, y: 28, width: 4, height: 6 }
    ]
  },
  asia: {
    name: 'Asia',
    countries: [
      { id: 'china', name: 'China', x: 70, y: 40, width: 10, height: 8 },
      { id: 'india', name: 'India', x: 65, y: 48, width: 8, height: 7 },
      { id: 'japan', name: 'Japan', x: 82, y: 38, width: 4, height: 7 },
      { id: 'russia', name: 'Russia', x: 63, y: 28, width: 17, height: 10 },
      { id: 'indonesia', name: 'Indonesia', x: 72, y: 59, width: 10, height: 5 },
      { id: 'saudi', name: 'Saudi Arabia', x: 58, y: 48, width: 6, height: 5 },
      { id: 'turkey', name: 'Turkey', x: 55, y: 42, width: 6, height: 4 },
      { id: 'korea', name: 'South Korea', x: 79, y: 41, width: 3, height: 3 }
    ]
  },
  americas: {
    name: 'Americas',
    countries: [
      { id: 'usa', name: 'United States', x: 18, y: 38, width: 12, height: 8 },
      { id: 'canada', name: 'Canada', x: 18, y: 30, width: 14, height: 7 },
      { id: 'mexico', name: 'Mexico', x: 16, y: 47, width: 7, height: 5 },
      { id: 'brazil', name: 'Brazil', x: 28, y: 58, width: 10, height: 9 },
      { id: 'argentina', name: 'Argentina', x: 25, y: 68, width: 7, height: 8 },
      { id: 'colombia', name: 'Colombia', x: 23, y: 54, width: 5, height: 5 },
      { id: 'peru', name: 'Peru', x: 21, y: 58, width: 5, height: 5 },
      { id: 'chile', name: 'Chile', x: 23, y: 67, width: 3, height: 10 }
    ]
  },
  africa: {
    name: 'Africa',
    countries: [
      { id: 'egypt', name: 'Egypt', x: 55, y: 46, width: 5, height: 4 },
      { id: 'nigeria', name: 'Nigeria', x: 47, y: 54, width: 5, height: 4 },
      { id: 'southafrica', name: 'South Africa', x: 51, y: 69, width: 6, height: 5 },
      { id: 'kenya', name: 'Kenya', x: 56, y: 56, width: 4, height: 4 },
      { id: 'ethiopia', name: 'Ethiopia', x: 57, y: 52, width: 5, height: 4 },
      { id: 'morocco', name: 'Morocco', x: 43, y: 45, width: 5, height: 3 },
      { id: 'algeria', name: 'Algeria', x: 45, y: 48, width: 6, height: 5 },
      { id: 'congo', name: 'Congo', x: 50, y: 58, width: 5, height: 5 }
    ]
  },
  oceania: {
    name: 'Oceania',
    countries: [
      { id: 'australia', name: 'Australia', x: 78, y: 68, width: 10, height: 8 },
      { id: 'newzealand', name: 'New Zealand', x: 86, y: 76, width: 5, height: 4 },
      { id: 'png', name: 'Papua New Guinea', x: 83, y: 58, width: 5, height: 3 },
      { id: 'fiji', name: 'Fiji', x: 92, y: 65, width: 3, height: 2 }
    ]
  }
};

// Difficulty settings
const difficulties = {
  easy: { timeLimit: 180, countries: 5 },
  medium: { timeLimit: 150, countries: 10 },
  hard: { timeLimit: 120, countries: 15 }
};

// Add country SVG outlines - improved with more recognizable shapes
const countrySvgs = {
  // Europe
  france: "M10,10 L5,18 L10,25 L20,30 L25,20 L20,15 L25,10 Z",
  germany: "M10,5 L25,5 L30,15 L25,25 L15,30 L5,20 L10,10 Z",
  italy: "M15,5 L25,10 L22,15 L25,20 L20,30 L15,25 L10,30 L5,20 L15,15 Z",
  uk: "M5,5 L15,3 L20,10 L15,15 L20,20 L10,25 L5,15 Z",
  spain: "M5,10 L25,5 L30,15 L25,25 L10,30 L5,20 Z",
  poland: "M5,10 L30,5 L30,25 L5,25 L10,15 Z",
  ukraine: "M5,10 L30,5 L35,15 L25,25 L15,30 L5,20 Z",
  sweden: "M15,3 L20,5 L25,15 L20,25 L15,35 L10,30 L5,15 L10,5 Z",
  
  // Asia
  china: "M5,10 L15,5 L30,10 L35,20 L30,30 L15,35 L5,25 L10,15 Z",
  india: "M10,10 L25,5 L30,15 L25,30 L15,35 L5,25 L5,15 Z",
  japan: "M10,5 C15,5 15,10 10,15 C15,20 10,25 5,20 C5,15 10,15 10,10 Z M20,10 C25,10 25,15 20,20 C15,20 15,15 20,10 Z M15,25 C20,25 20,30 15,35 C10,35 10,30 15,25 Z",
  russia: "M5,5 L35,5 L35,15 L25,25 L15,30 L5,25 L10,15 Z",
  indonesia: "M5,10 C10,5 15,10 20,5 S25,10 30,5 L25,15 C20,20 15,15 10,20 S5,15 5,10 Z",
  saudi: "M5,10 L25,5 L30,15 L25,30 L15,35 L5,25 Z",
  turkey: "M5,15 L15,5 L30,10 L25,20 L15,25 L5,20 Z",
  korea: "M10,5 L20,10 L15,25 L5,20 L10,10 Z",
  
  // Americas
  usa: "M5,10 L15,5 L30,10 L25,20 L30,25 L20,30 L10,25 L5,15 Z",
  canada: "M5,10 L10,5 L20,3 L25,5 L30,10 L25,20 L15,25 L5,20 Z",
  mexico: "M5,10 L20,5 L25,15 L20,25 L10,30 L5,20 Z",
  brazil: "M10,10 L25,5 L30,15 L25,25 L30,35 L15,40 L5,30 L5,15 Z",
  argentina: "M10,5 L20,10 L25,20 L20,30 L10,40 L5,25 Z",
  colombia: "M5,15 L20,5 L25,15 L20,25 L10,30 L5,20 Z",
  peru: "M5,15 L20,5 L25,15 L20,25 L10,30 L5,20 Z",
  chile: "M10,5 L15,10 L15,40 L10,35 L5,20 Z",
  
  // Africa
  egypt: "M5,10 L25,5 L30,15 L25,25 L10,30 L5,20 Z",
  nigeria: "M5,10 L25,5 L30,15 L25,25 L10,30 L5,20 Z",
  southafrica: "M5,15 L20,5 L30,15 L25,25 L15,35 L5,25 Z",
  kenya: "M10,10 L25,5 L30,15 L25,25 L10,30 L5,20 Z",
  ethiopia: "M5,10 L25,5 L30,15 L25,25 L10,30 L5,20 Z",
  morocco: "M5,15 L20,5 L30,15 L25,25 L15,20 L5,25 Z",
  algeria: "M5,10 L30,5 L35,15 L25,25 L10,30 L5,20 Z",
  congo: "M5,10 L30,5 L35,15 L30,25 L15,30 L5,25 Z",
  
  // Oceania
  australia: "M5,15 C10,5 25,5 30,15 C35,25 20,35 5,25 C0,20 0,20 5,15 Z",
  newzealand: "M5,10 C15,5 20,10 15,20 C10,25 5,20 5,15 Z M20,15 C25,10 30,15 25,25 C20,30 15,25 20,15 Z",
  png: "M5,15 C15,5 25,15 30,20 C20,25 10,25 5,15 Z",
  fiji: "M15,15 C20,10 25,15 20,20 C15,25 10,20 15,15 Z"
};

// Function to render country shape SVG
const CountryShapeSvg = ({ countryId }) => {
  const pathData = countrySvgs[countryId] || "M10,10 L20,10 L20,20 L10,20 Z"; // Default square
  
  return (
    <svg viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
      <path d={pathData} />
    </svg>
  );
};

// Add a helper tooltip to the GameArea
const GameAreaHelp = styled.div`
  position: absolute;
  bottom: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  z-index: 10;
  pointer-events: none;
  opacity: 0.8;
`;

const WorldMapPuzzle = () => {
  const [region, setRegion] = useState('europe');
  const [difficulty, setDifficulty] = useState('easy');
  const [settings, setSettings] = useState(difficulties.easy);
  const [countries, setCountries] = useState([]);
  const [availableCountries, setAvailableCountries] = useState([]);
  const [placedCountries, setPlacedCountries] = useState([]);
  const [time, setTime] = useState(0);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeDropZone, setActiveDropZone] = useState(null);
  const timerRef = useRef(null);
  
  // Audio refs
  const dropSoundRef = useRef(null);
  const correctSoundRef = useRef(null);
  const wrongSoundRef = useRef(null);
  const winSoundRef = useRef(null);
  
  // Initialize sounds
  useEffect(() => {
    try {
      // Create audio elements
      dropSoundRef.current = new Audio('https://www.soundjay.com/button/sounds/button-09.mp3');
      correctSoundRef.current = new Audio('https://www.soundjay.com/button/sounds/button-37.mp3');
      wrongSoundRef.current = new Audio('https://www.soundjay.com/button/sounds/button-10.mp3');
      winSoundRef.current = new Audio('https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3');
      
      // Set volumes
      dropSoundRef.current.volume = 0.3;
      correctSoundRef.current.volume = 0.3;
      wrongSoundRef.current.volume = 0.3;
      winSoundRef.current.volume = 0.5;
      
      // Check if there's a saved mute preference
      const savedMuteState = localStorage.getItem('worldMapPuzzleSoundMuted');
      if (savedMuteState !== null) {
        setIsMuted(savedMuteState === 'true');
      }
    } catch (error) {
      console.error("Error initializing sounds:", error);
    }
  }, []);
  
  // Play sound function
  const playSound = (soundRef) => {
    if (isMuted || !soundRef.current) return;
    
    try {
      soundRef.current.currentTime = 0;
      soundRef.current.play().catch(error => {
        console.log('Sound playback prevented:', error);
      });
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };
  
  // Toggle mute function
  const toggleMute = () => {
    setIsMuted(prev => {
      const newState = !prev;
      localStorage.setItem('worldMapPuzzleSoundMuted', newState.toString());
      return newState;
    });
  };
  
  // Initialize game
  const initializeGame = () => {
    // Reset states
    setPlacedCountries([]);
    setScore(0);
    setTime(settings.timeLimit);
    setIsGameOver(false);
    
    // Get available countries for the selected region and difficulty
    const regionCountries = [...regions[region].countries];
    // Shuffle array
    const shuffledCountries = regionCountries.sort(() => Math.random() - 0.5);
    // Take the appropriate number of countries based on difficulty
    const selectedCountries = shuffledCountries.slice(0, settings.countries);
    
    setCountries(selectedCountries);
    setAvailableCountries([...selectedCountries]);
    
    // Start timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setTime(prevTime => {
        if (prevTime <= 1) {
          // Game over when time runs out
          clearInterval(timerRef.current);
          setIsGameOver(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };
  
  // Update settings when difficulty or region changes
  useEffect(() => {
    setSettings(difficulties[difficulty]);
  }, [difficulty]);
  
  useEffect(() => {
    initializeGame();
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [settings, region]);
  
  // Handle region change
  const handleRegionChange = (newRegion) => {
    setRegion(newRegion);
  };
  
  // Handle difficulty change
  const handleDifficultyChange = (newDifficulty) => {
    setDifficulty(newDifficulty);
  };
  
  // Handle drag start
  const handleDragStart = (countryId) => {
    setActiveDropZone(countryId);
  };
  
  // Handle country placement - the core drag and drop logic
  const handleDrop = (countryId, event) => {
    // Find the country from available countries
    const country = countries.find(c => c.id === countryId);
    setActiveDropZone(null);
    
    if (!country) return;
    
    // Get the drop position relative to the game area
    const gameArea = document.querySelector('#game-area');
    if (!gameArea) return;
    
    const gameAreaRect = gameArea.getBoundingClientRect();
    const dropX = ((event.clientX - gameAreaRect.left) / gameAreaRect.width) * 100;
    const dropY = ((event.clientY - gameAreaRect.top) / gameAreaRect.height) * 100;
    
    // Check if the drop position is close to the correct position
    const isCorrect = Math.abs(dropX - country.x) <= 8 && Math.abs(dropY - country.y) <= 8;
    
    // Create a new placed country object
    const placedCountry = {
      ...country,
      placedX: isCorrect ? country.x : dropX,
      placedY: isCorrect ? country.y : dropY,
      isCorrect
    };
    
    // Update states
    setPlacedCountries(prev => [...prev, placedCountry]);
    setAvailableCountries(prev => prev.filter(c => c.id !== countryId));
    
    // Update score
    if (isCorrect) {
      setScore(prev => prev + 100);
      playSound(correctSoundRef);
    } else {
      playSound(wrongSoundRef);
    }
    
    // Check if the game is complete
    if (availableCountries.length === 1) { // Last country being placed
      setTimeout(() => {
        setIsGameOver(true);
        clearInterval(timerRef.current);
        playSound(winSoundRef);
      }, 500);
    }
  };
  
  // Reset the game
  const resetGame = () => {
    initializeGame();
  };
  
  // Format time as MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Calculate final score based on correct placements and time
  const calculateFinalScore = () => {
    const correctPlacements = placedCountries.filter(c => c.isCorrect).length;
    const placementScore = correctPlacements * 100;
    const timeBonus = time > 0 ? time * 2 : 0;
    
    return placementScore + timeBonus;
  };
  
  return (
    <Container>
      <Title>World Map Puzzle</Title>
      
      <SoundButton onClick={toggleMute} title={isMuted ? "Unmute Sounds" : "Mute Sounds"}>
        {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
      </SoundButton>
      
      <RegionSelector>
        {Object.keys(regions).map(regionKey => (
          <RegionButton
            key={regionKey}
            isSelected={region === regionKey}
            onClick={() => handleRegionChange(regionKey)}
          >
            {regions[regionKey].name}
          </RegionButton>
        ))}
      </RegionSelector>
      
      <DifficultySelector>
        <DifficultyButton 
          onClick={() => handleDifficultyChange('easy')}
          isSelected={difficulty === 'easy'}
        >
          Easy
        </DifficultyButton>
        <DifficultyButton 
          onClick={() => handleDifficultyChange('medium')}
          isSelected={difficulty === 'medium'}
        >
          Medium
        </DifficultyButton>
        <DifficultyButton 
          onClick={() => handleDifficultyChange('hard')}
          isSelected={difficulty === 'hard'}
        >
          Hard
        </DifficultyButton>
      </DifficultySelector>
      
      <GameHeader>
        <StatsItem>
          <FaMapMarkedAlt /> {placedCountries.filter(c => c.isCorrect).length}/{countries.length} Correct
        </StatsItem>
        <StatsItem>
          <FaTrophy /> Score: {score}
        </StatsItem>
        <StatsItem>
          <FaClock /> Time: {formatTime(time)}
        </StatsItem>
      </GameHeader>
      
      <GameArea id="game-area">
        <WorldMap />
        
        {/* Always show country outlines on the map */}
        <CountryOutlines>
          {countries.map(country => (
            <CountryOutline
              key={country.id}
              style={{
                left: `${country.x}%`,
                top: `${country.y}%`,
                width: `${country.width}%`,
                height: `${country.height}%`,
                borderColor: placedCountries.some(c => c.id === country.id && c.isCorrect) ? '#4CAF50' : '#999',
                backgroundColor: placedCountries.some(c => c.id === country.id && c.isCorrect) ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
                opacity: placedCountries.some(c => c.id === country.id) ? 0.3 : 0.6
              }}
            >
              {!placedCountries.some(c => c.id === country.id) && (
                <CountryLabel>
                  {country.name}
                </CountryLabel>
              )}
            </CountryOutline>
          ))}
        </CountryOutlines>
        
        {/* Drop zones - only highlighted when dragging */}
        {countries.map(country => (
          <DropZone
            key={country.id}
            style={{
              left: `${country.x}%`,
              top: `${country.y}%`,
              width: `${country.width}%`,
              height: `${country.height}%`,
              opacity: activeDropZone === country.id ? 1 : 0.1,
              pointerEvents: placedCountries.some(c => c.id === country.id) ? 'none' : 'auto'
            }}
            isActive={activeDropZone === country.id}
          />
        ))}
        
        {/* Placed countries */}
        {placedCountries.map(country => (
          <PlacedCountry
            key={country.id}
            isCorrect={country.isCorrect}
            style={{
              left: `${country.placedX}%`,
              top: `${country.placedY}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <CountryShape>
              <CountryShapeSvg countryId={country.id} />
            </CountryShape>
            <CountryName>{country.name}</CountryName>
            {country.isCorrect && <FaCheck style={{ marginLeft: '4px' }} />}
          </PlacedCountry>
        ))}
        
        <GameAreaHelp>
          Drag countries to match their shape with the outlines on the map
        </GameAreaHelp>
      </GameArea>
      
      <CountryContainer>
        {availableCountries.map(country => (
          <motion.div key={country.id}>
            <CountryItem
              drag
              whileDrag={{ scale: 1.1 }}
              onDragStart={() => handleDragStart(country.id)}
              onDragEnd={(event) => handleDrop(country.id, event)}
              dragSnapToOrigin
            >
              <CountryShape>
                <CountryShapeSvg countryId={country.id} />
              </CountryShape>
              <CountryName>{country.name}</CountryName>
            </CountryItem>
          </motion.div>
        ))}
        
        {availableCountries.length === 0 && (
          <div style={{ padding: '0.5rem', color: '#666' }}>
            All countries placed! Correctly placed: {placedCountries.filter(c => c.isCorrect).length}/{countries.length}
          </div>
        )}
      </CountryContainer>
      
      <ButtonContainer>
        <Button onClick={resetGame}>
          <FaRedo /> Reset
        </Button>
      </ButtonContainer>
      
      <AnimatePresence>
        {isGameOver && (
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
              <GameOverTitle>Game Complete!</GameOverTitle>
              
              <GameOverStat>
                <FaMapMarkedAlt /> Correct Placements: {placedCountries.filter(c => c.isCorrect).length}/{countries.length}
              </GameOverStat>
              <GameOverStat>
                <FaClock /> Time Remaining: {formatTime(time)}
              </GameOverStat>
              <GameOverStat>
                <FaTrophy /> Final Score: {calculateFinalScore()}
              </GameOverStat>
              
              <ButtonContainer>
                <Button onClick={() => setIsGameOver(false)}>
                  Continue
                </Button>
                <Button onClick={resetGame} primary>
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

export default WorldMapPuzzle; 