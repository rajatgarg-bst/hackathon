// Create audio context and oscillator for generating sounds
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Sound enabled state
let isSoundEnabled = true;

const createSound = (frequency, duration, type = 'sine') => {
  if (!isSoundEnabled) return;
  
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
};

export const useGameSounds = () => {
  const playClick = () => {
    createSound(440, 0.1); // A4 note, 100ms duration
  };

  const playLudoDice = () => {
    createSound(880, 0.2, 'square'); // A5 note, 200ms duration, square wave
  };

  const playLudoMove = () => {
    createSound(660, 0.15, 'sine'); // E5 note, 150ms duration
  };

  const playLudoCapture = () => {
    createSound(220, 0.3, 'triangle'); // A3 note, 300ms duration, triangle wave
  };

  const toggleSound = () => {
    isSoundEnabled = !isSoundEnabled;
    return isSoundEnabled;
  };

  const getSoundEnabled = () => isSoundEnabled;

  return {
    playClick,
    playWin: playClick,
    playLose: playClick,
    playMove: playClick,
    playEat: playClick,
    playDice: playClick,
    playShoot: playClick,
    playCapture: playClick,
    playSlide: playClick,
    playCorrect: playClick,
    playWrong: playClick,
    playPowerup: playClick,
    playBasketballBounce: playClick,
    playBasketballScore: playClick,
    playBasketballMiss: playClick,
    playLudoDice,
    playLudoMove,
    playLudoCapture,
    playMathCorrect: playClick,
    playMathWrong: playClick,
    playMathLevelUp: playClick,
    playPuzzleComplete: playClick,
    playCrosswordCorrect: playClick,
    playCrosswordWrong: playClick,
    playCrosswordComplete: playClick,
    playChessMove: playClick,
    playChessCapture: playClick,
    playChessCheck: playClick,
    toggleSound,
    getSoundEnabled
  };
};
