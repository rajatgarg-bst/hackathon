import React, { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrophy, FaClock, FaRedo, FaVolumeUp, FaVolumeMute, FaCheck, FaTimes, FaGlobeAmericas, FaGlobeAsia, FaGlobeEurope, FaGlobeAfrica, FaFlag } from 'react-icons/fa';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
  position: relative;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 1rem;
  color: #9C27B0;
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
    color: #9C27B0;
  }
`;

const GameHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
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
    color: #9C27B0;
  }
`;

const DifficultySelector = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 600px) {
    flex-wrap: wrap;
  }
`;

const DifficultyButton = styled.button`
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  background-color: ${props => props.isSelected ? '#9C27B0' : '#f0f0f0'};
  color: ${props => props.isSelected ? 'white' : '#333'};
  border: 2px solid ${props => props.isSelected ? '#9C27B0' : '#ddd'};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.isSelected ? '#7B1FA2' : '#e0e0e0'};
  }
`;

const RegionSelector = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const RegionButton = styled.button`
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  background-color: ${props => props.isSelected ? '#9C27B0' : '#f0f0f0'};
  color: ${props => props.isSelected ? 'white' : '#333'};
  border: 2px solid ${props => props.isSelected ? '#9C27B0' : '#ddd'};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background-color: ${props => props.isSelected ? '#7B1FA2' : '#e0e0e0'};
  }
  
  svg {
    font-size: 1.1rem;
  }
`;

const QuizArea = styled.div`
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  border: 2px solid #ddd;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const QuestionNumber = styled.div`
  text-align: center;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
`;

const Question = styled.h2`
  text-align: center;
  font-size: 1.4rem;
  margin-bottom: 1.5rem;
  color: #333;
  
  @media (max-width: 600px) {
    font-size: 1.2rem;
  }
`;

const CountryFlag = styled.div`
  width: 100%;
  height: 140px;
  margin: 0 auto 1.5rem;
  border-radius: 8px;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  background-color: #f0f0f0;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (max-width: 600px) {
    height: 100px;
  }
`;

const FlagFallback = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #9C27B0;
  font-size: 3rem;
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const OptionButton = styled.button`
  width: 100%;
  padding: 0.75rem 1rem;
  text-align: left;
  background-color: ${props => 
    props.isCorrect ? '#4CAF50' : 
    props.isIncorrect ? '#F44336' : 
    '#fff'
  };
  color: ${props => 
    (props.isCorrect || props.isIncorrect) ? 'white' : '#333'
  };
  border: 2px solid ${props => 
    props.isCorrect ? '#4CAF50' : 
    props.isIncorrect ? '#F44336' : 
    '#ddd'
  };
  border-radius: 4px;
  cursor: ${props => props.disabled ? 'default' : 'pointer'};
  transition: all 0.2s ease;
  font-size: 1rem;
  position: relative;
  overflow: hidden;
  
  &:hover {
    background-color: ${props => 
      props.isCorrect ? '#4CAF50' : 
      props.isIncorrect ? '#F44336' : 
      props.disabled ? '#fff' : '#f0f0f0'
    };
  }
  
  &:disabled {
    opacity: ${props => (props.isCorrect || props.isIncorrect) ? 1 : 0.7};
  }
`;

const ResultIcon = styled.div`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.2rem;
`;

const FeedbackMessage = styled.div`
  text-align: center;
  margin: 1.5rem 0;
  font-size: 1.1rem;
  font-weight: 500;
  color: ${props => props.isCorrect ? '#4CAF50' : '#F44336'};
  animation: fadeIn 0.5s;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  background-color: ${props => props.primary ? '#9C27B0' : '#f0f0f0'};
  color: ${props => props.primary ? 'white' : '#333'};
  border: 2px solid ${props => props.primary ? '#9C27B0' : '#ddd'};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background-color: ${props => props.primary ? '#7B1FA2' : '#e0e0e0'};
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: default;
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
  color: #9C27B0;
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
    color: #9C27B0;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background-color: #eee;
  border-radius: 3px;
  margin: 1rem 0;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background-color: #9C27B0;
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

// Update the regions to use more reliable URLs for flags (from country-flags project on GitHub)
const getFlagUrl = (code) => `https://raw.githubusercontent.com/hampusborgos/country-flags/main/png250px/${code.toLowerCase()}.png`;

// Define regions with their respective countries and capitals
const regions = {
  all: {
    name: "All Regions",
    icon: FaGlobeAmericas,
    countries: [] // Will be populated with all countries
  },
  americas: {
    name: "Americas",
    icon: FaGlobeAmericas,
    countries: [
      { country: "United States", capital: "Washington D.C.", flag: getFlagUrl('us') },
      { country: "Canada", capital: "Ottawa", flag: getFlagUrl('ca') },
      { country: "Mexico", capital: "Mexico City", flag: getFlagUrl('mx') },
      { country: "Brazil", capital: "Brasília", flag: getFlagUrl('br') },
      { country: "Argentina", capital: "Buenos Aires", flag: getFlagUrl('ar') },
      { country: "Colombia", capital: "Bogotá", flag: getFlagUrl('co') },
      { country: "Peru", capital: "Lima", flag: getFlagUrl('pe') },
      { country: "Chile", capital: "Santiago", flag: getFlagUrl('cl') },
      { country: "Ecuador", capital: "Quito", flag: getFlagUrl('ec') },
      { country: "Venezuela", capital: "Caracas", flag: getFlagUrl('ve') },
      { country: "Cuba", capital: "Havana", flag: getFlagUrl('cu') },
      { country: "Jamaica", capital: "Kingston", flag: getFlagUrl('jm') }
    ]
  },
  europe: {
    name: "Europe",
    icon: FaGlobeEurope,
    countries: [
      { country: "United Kingdom", capital: "London", flag: getFlagUrl('gb') },
      { country: "France", capital: "Paris", flag: getFlagUrl('fr') },
      { country: "Germany", capital: "Berlin", flag: getFlagUrl('de') },
      { country: "Italy", capital: "Rome", flag: getFlagUrl('it') },
      { country: "Spain", capital: "Madrid", flag: getFlagUrl('es') },
      { country: "Portugal", capital: "Lisbon", flag: getFlagUrl('pt') },
      { country: "Netherlands", capital: "Amsterdam", flag: getFlagUrl('nl') },
      { country: "Belgium", capital: "Brussels", flag: getFlagUrl('be') },
      { country: "Sweden", capital: "Stockholm", flag: getFlagUrl('se') },
      { country: "Norway", capital: "Oslo", flag: getFlagUrl('no') },
      { country: "Denmark", capital: "Copenhagen", flag: getFlagUrl('dk') },
      { country: "Finland", capital: "Helsinki", flag: getFlagUrl('fi') },
      { country: "Ireland", capital: "Dublin", flag: getFlagUrl('ie') },
      { country: "Austria", capital: "Vienna", flag: getFlagUrl('at') },
      { country: "Switzerland", capital: "Bern", flag: getFlagUrl('ch') },
      { country: "Greece", capital: "Athens", flag: getFlagUrl('gr') },
      { country: "Poland", capital: "Warsaw", flag: getFlagUrl('pl') },
      { country: "Ukraine", capital: "Kyiv", flag: getFlagUrl('ua') },
      { country: "Hungary", capital: "Budapest", flag: getFlagUrl('hu') },
      { country: "Romania", capital: "Bucharest", flag: getFlagUrl('ro') }
    ]
  },
  asia: {
    name: "Asia",
    icon: FaGlobeAsia,
    countries: [
      { country: "China", capital: "Beijing", flag: getFlagUrl('cn') },
      { country: "Japan", capital: "Tokyo", flag: getFlagUrl('jp') },
      { country: "India", capital: "New Delhi", flag: getFlagUrl('in') },
      { country: "South Korea", capital: "Seoul", flag: getFlagUrl('kr') },
      { country: "Russia", capital: "Moscow", flag: getFlagUrl('ru') },
      { country: "Indonesia", capital: "Jakarta", flag: getFlagUrl('id') },
      { country: "Thailand", capital: "Bangkok", flag: getFlagUrl('th') },
      { country: "Vietnam", capital: "Hanoi", flag: getFlagUrl('vn') },
      { country: "Malaysia", capital: "Kuala Lumpur", flag: getFlagUrl('my') },
      { country: "Singapore", capital: "Singapore", flag: getFlagUrl('sg') },
      { country: "Philippines", capital: "Manila", flag: getFlagUrl('ph') },
      { country: "Pakistan", capital: "Islamabad", flag: getFlagUrl('pk') },
      { country: "Iran", capital: "Tehran", flag: getFlagUrl('ir') },
      { country: "Iraq", capital: "Baghdad", flag: getFlagUrl('iq') },
      { country: "Saudi Arabia", capital: "Riyadh", flag: getFlagUrl('sa') },
      { country: "United Arab Emirates", capital: "Abu Dhabi", flag: getFlagUrl('ae') },
      { country: "Turkey", capital: "Ankara", flag: getFlagUrl('tr') },
      { country: "Israel", capital: "Jerusalem", flag: getFlagUrl('il') }
    ]
  },
  africa: {
    name: "Africa",
    icon: FaGlobeAfrica,
    countries: [
      { country: "Egypt", capital: "Cairo", flag: getFlagUrl('eg') },
      { country: "South Africa", capital: "Pretoria", flag: getFlagUrl('za') },
      { country: "Nigeria", capital: "Abuja", flag: getFlagUrl('ng') },
      { country: "Kenya", capital: "Nairobi", flag: getFlagUrl('ke') },
      { country: "Ethiopia", capital: "Addis Ababa", flag: getFlagUrl('et') },
      { country: "Ghana", capital: "Accra", flag: getFlagUrl('gh') },
      { country: "Morocco", capital: "Rabat", flag: getFlagUrl('ma') },
      { country: "Algeria", capital: "Algiers", flag: getFlagUrl('dz') },
      { country: "Tunisia", capital: "Tunis", flag: getFlagUrl('tn') },
      { country: "Tanzania", capital: "Dodoma", flag: getFlagUrl('tz') },
      { country: "Uganda", capital: "Kampala", flag: getFlagUrl('ug') },
      { country: "Zimbabwe", capital: "Harare", flag: getFlagUrl('zw') },
      { country: "Senegal", capital: "Dakar", flag: getFlagUrl('sn') },
      { country: "Ivory Coast", capital: "Yamoussoukro", flag: getFlagUrl('ci') }
    ]
  },
  oceania: {
    name: "Oceania",
    icon: FaGlobeAmericas,
    countries: [
      { country: "Australia", capital: "Canberra", flag: getFlagUrl('au') },
      { country: "New Zealand", capital: "Wellington", flag: getFlagUrl('nz') },
      { country: "Fiji", capital: "Suva", flag: getFlagUrl('fj') },
      { country: "Papua New Guinea", capital: "Port Moresby", flag: getFlagUrl('pg') },
      { country: "Solomon Islands", capital: "Honiara", flag: getFlagUrl('sb') },
      { country: "Vanuatu", capital: "Port Vila", flag: getFlagUrl('vu') },
      { country: "Samoa", capital: "Apia", flag: getFlagUrl('ws') },
      { country: "Kiribati", capital: "Tarawa", flag: getFlagUrl('ki') }
    ]
  }
};

// Combine all countries for the "All Regions" option
regions.all.countries = [
  ...regions.americas.countries,
  ...regions.europe.countries,
  ...regions.asia.countries,
  ...regions.africa.countries,
  ...regions.oceania.countries
];

// Difficulty settings
const difficulties = {
  easy: { questions: 10, options: 3, time: 20, penalty: 0 },
  medium: { questions: 15, options: 4, time: 15, penalty: 5 },
  hard: { questions: 20, options: 4, time: 10, penalty: 10 }
};

// Add FlagImage component for better error handling
const FlagImage = ({ src, country }) => {
  const [error, setError] = useState(false);
  
  return error ? (
    <FlagFallback>
      <FaFlag />
      <div style={{ fontSize: '14px', marginTop: '10px' }}>Flag not available</div>
    </FlagFallback>
  ) : (
    <div
      style={{ 
        backgroundImage: `url(${src})`,
        width: '100%',
        height: '100%',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat'
      }}
      onError={() => setError(true)}
      role="img"
      aria-label={`Flag of ${country}`}
    />
  );
};

const CapitalsQuiz = () => {
  const [region, setRegion] = useState('all');
  const [difficulty, setDifficulty] = useState('easy');
  const [settings, setSettings] = useState(difficulties.easy);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const timerRef = useRef(null);
  
  // Audio refs
  const correctSoundRef = useRef(null);
  const wrongSoundRef = useRef(null);
  const successSoundRef = useRef(null);
  
  // Initialize sounds with better error handling
  useEffect(() => {
    const loadAudio = () => {
      try {
        // Create audio elements with error handling
        const loadSound = (url) => {
          try {
            const audio = new Audio(url);
            audio.volume = 0.3;
            return audio;
          } catch (error) {
            console.error(`Error loading sound from ${url}:`, error);
            return null;
          }
        };
        
        correctSoundRef.current = loadSound('https://www.soundjay.com/button/sounds/button-37.mp3');
        wrongSoundRef.current = loadSound('https://www.soundjay.com/button/sounds/button-10.mp3');
        successSoundRef.current = loadSound('https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3');
        
        if (successSoundRef.current) {
          successSoundRef.current.volume = 0.5;
        }
        
        // Check if there's a saved mute preference
        const savedMuteState = localStorage.getItem('capitalsQuizSoundMuted');
        if (savedMuteState !== null) {
          setIsMuted(savedMuteState === 'true');
        }
      } catch (error) {
        console.error("Error initializing sounds:", error);
      }
    };
    
    // Load audio after a short delay to ensure the component is fully mounted
    const timer = setTimeout(loadAudio, 100);
    return () => clearTimeout(timer);
  }, []);
  
  // Play sound function
  const playSound = (soundRef) => {
    if (isMuted || !soundRef?.current) return;
    
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
      localStorage.setItem('capitalsQuizSoundMuted', newState.toString());
      return newState;
    });
  };
  
  // Update generateQuestions with error handling
  const generateQuestions = () => {
    try {
      const regionCountries = [...regions[region].countries];
      // Shuffle array
      const shuffledCountries = regionCountries.sort(() => Math.random() - 0.5);
      // Take the appropriate number of questions based on difficulty
      const selectedCountries = shuffledCountries.slice(0, settings.questions);
      
      // Create questions
      const newQuestions = selectedCountries.map(country => ({
        country: country.country,
        capital: country.capital,
        flag: country.flag,
        options: [] // Will be populated with answer options
      }));
      
      setQuestions(newQuestions);
      return newQuestions;
    } catch (error) {
      console.error("Error generating questions:", error);
      // Return a default set of questions as fallback
      return [];
    }
  };
  
  // Generate answer options for a question
  const generateOptions = (question) => {
    const allCapitals = regions[region].countries.map(c => c.capital);
    const correctAnswer = question.capital;
    
    // Start with the correct answer
    const questionOptions = [{ text: correctAnswer, isCorrect: true }];
    
    // Add wrong answers
    const wrongOptions = allCapitals
      .filter(capital => capital !== correctAnswer)
      .sort(() => Math.random() - 0.5)
      .slice(0, settings.options - 1);
    
    wrongOptions.forEach(option => {
      questionOptions.push({ text: option, isCorrect: false });
    });
    
    // Shuffle options
    return questionOptions.sort(() => Math.random() - 0.5);
  };
  
  // Start the quiz with better error handling
  const startQuiz = () => {
    try {
      // Reset states
      setScore(0);
      setCurrentQuestionIndex(0);
      setSelectedOption(null);
      setIsCorrect(null);
      setIsGameOver(false);
      setGameStarted(true);
      
      // Generate questions
      const newQuestions = generateQuestions();
      
      // Set options for the first question
      if (newQuestions && newQuestions.length > 0) {
        const firstQuestionOptions = generateOptions(newQuestions[0]);
        setOptions(firstQuestionOptions);
        
        // Start timer
        setTime(settings.time);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        
        timerRef.current = setInterval(() => {
          setTime(prevTime => {
            if (prevTime <= 1) {
              // Move to next question or end game when time runs out
              handleTimeUp();
              return settings.time;
            }
            return prevTime - 1;
          });
        }, 1000);
      } else {
        // Handle case where questions couldn't be generated
        console.error("Failed to generate questions");
        setGameStarted(false);
      }
    } catch (error) {
      console.error("Error starting quiz:", error);
      setGameStarted(false);
    }
  };
  
  // Handle when time runs out
  const handleTimeUp = () => {
    // If no option selected, it's a wrong answer
    if (selectedOption === null) {
      setIsCorrect(false);
      playSound(wrongSoundRef);
      
      // Apply time penalty for difficult levels
      setScore(prevScore => Math.max(0, prevScore - settings.penalty));
      
      // Move to next question after a short delay
      setTimeout(() => {
        moveToNextQuestion();
      }, 1500);
    }
  };
  
  // Handle option selection
  const handleOptionSelect = (option, index) => {
    setSelectedOption(index);
    const correct = option.isCorrect;
    setIsCorrect(correct);
    
    if (correct) {
      setScore(prevScore => prevScore + 10);
      playSound(correctSoundRef);
    } else {
      // Apply score penalty for wrong answers in medium/hard modes
      setScore(prevScore => Math.max(0, prevScore - settings.penalty));
      playSound(wrongSoundRef);
    }
    
    // Move to next question after a short delay
    setTimeout(() => {
      moveToNextQuestion();
    }, 1500);
  };
  
  // Move to the next question
  const moveToNextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;
    
    if (nextIndex >= questions.length) {
      // End of quiz
      endQuiz();
      return;
    }
    
    // Reset for next question
    setCurrentQuestionIndex(nextIndex);
    setSelectedOption(null);
    setIsCorrect(null);
    setTime(settings.time);
    
    // Generate options for the next question
    const nextQuestionOptions = generateOptions(questions[nextIndex]);
    setOptions(nextQuestionOptions);
  };
  
  // End the quiz
  const endQuiz = () => {
    clearInterval(timerRef.current);
    setIsGameOver(true);
    playSound(successSoundRef);
  };
  
  // Reset and start a new quiz
  const newQuiz = () => {
    setGameStarted(false);
    setIsGameOver(false);
    clearInterval(timerRef.current);
  };
  
  // Update settings when difficulty changes
  useEffect(() => {
    setSettings(difficulties[difficulty]);
  }, [difficulty]);
  
  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  // Handle region change
  const handleRegionChange = (newRegion) => {
    setRegion(newRegion);
    setGameStarted(false);
  };
  
  // Handle difficulty change
  const handleDifficultyChange = (newDifficulty) => {
    setDifficulty(newDifficulty);
    setGameStarted(false);
  };
  
  // Calculate quiz progress percentage
  const calculateProgress = () => {
    return ((currentQuestionIndex) / questions.length) * 100;
  };
  
  // Format time for display
  const formatTime = (seconds) => {
    return seconds < 10 ? `0${seconds}` : seconds;
  };
  
  return (
    <Container>
      <Title>World Capitals Quiz</Title>
      
      <SoundButton onClick={toggleMute} title={isMuted ? "Unmute Sounds" : "Mute Sounds"}>
        {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
      </SoundButton>
      
      {!gameStarted && (
        <>
          <RegionSelector>
            {Object.keys(regions).map(regionKey => (
              <RegionButton
                key={regionKey}
                isSelected={region === regionKey}
                onClick={() => handleRegionChange(regionKey)}
              >
                {React.createElement(regions[regionKey].icon)} {regions[regionKey].name}
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
          
          <ButtonContainer>
            <Button onClick={startQuiz} primary>
              <FaFlag /> Start Quiz
            </Button>
          </ButtonContainer>
        </>
      )}
      
      {gameStarted && !isGameOver && questions.length > 0 && (
        <>
          <GameHeader>
            <StatsItem>
              <FaFlag /> Question: {currentQuestionIndex + 1}/{questions.length}
            </StatsItem>
            <StatsItem>
              <FaTrophy /> Score: {score}
            </StatsItem>
            <StatsItem>
              <FaClock /> Time: {formatTime(time)}
            </StatsItem>
          </GameHeader>
          
          <ProgressBar>
            <ProgressFill progress={calculateProgress()} />
          </ProgressBar>
          
          <QuizArea>
            <QuestionNumber>Question {currentQuestionIndex + 1} of {questions.length}</QuestionNumber>
            <Question>What is the capital of {questions[currentQuestionIndex].country}?</Question>
            
            <CountryFlag>
              <FlagImage 
                src={questions[currentQuestionIndex].flag} 
                country={questions[currentQuestionIndex].country} 
              />
            </CountryFlag>
            
            <OptionsGrid>
              {options.map((option, index) => (
                <OptionButton
                  key={index}
                  onClick={() => selectedOption === null && handleOptionSelect(option, index)}
                  disabled={selectedOption !== null}
                  isCorrect={selectedOption !== null && option.isCorrect}
                  isIncorrect={selectedOption === index && !option.isCorrect}
                >
                  {option.text}
                  {selectedOption !== null && option.isCorrect && (
                    <ResultIcon><FaCheck /></ResultIcon>
                  )}
                  {selectedOption === index && !option.isCorrect && (
                    <ResultIcon><FaTimes /></ResultIcon>
                  )}
                </OptionButton>
              ))}
            </OptionsGrid>
            
            {isCorrect !== null && (
              <FeedbackMessage isCorrect={isCorrect}>
                {isCorrect 
                  ? `Correct! The capital of ${questions[currentQuestionIndex].country} is ${questions[currentQuestionIndex].capital}.` 
                  : `Wrong! The capital of ${questions[currentQuestionIndex].country} is ${questions[currentQuestionIndex].capital}.`
                }
              </FeedbackMessage>
            )}
          </QuizArea>
          
          <ButtonContainer>
            <Button onClick={newQuiz}>
              <FaRedo /> New Quiz
            </Button>
          </ButtonContainer>
        </>
      )}
      
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
              <GameOverTitle>Quiz Complete!</GameOverTitle>
              
              <GameOverStat>
                <FaFlag /> Region: {regions[region].name}
              </GameOverStat>
              <GameOverStat>
                <FaTrophy /> Final Score: {score}
              </GameOverStat>
              <GameOverStat>
                Questions: {questions.length}
              </GameOverStat>
              
              <ButtonContainer>
                <Button onClick={newQuiz}>
                  <FaRedo /> New Quiz
                </Button>
              </ButtonContainer>
            </GameOverContent>
          </GameOver>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default CapitalsQuiz; 