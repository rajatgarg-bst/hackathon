import { useCallback } from "react";

// Create audio context for generating sounds
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
  // Click sound - medium pitch, short duration
  const playClick = useCallback(() => {
    if (!isSoundEnabled) return;
    createSound(440, 0.1, 'sine'); // A4 note
  }, []);

  // Correct sound - high pitch, cheerful
  const playCorrect = useCallback(() => {
    if (!isSoundEnabled) return;
    createSound(880, 0.15, 'sine'); // A5 note
    setTimeout(() => createSound(1100, 0.15, 'sine'), 100); // Higher note
  }, []);

  // Math correct answer sound - ascending sequence
  const playMathCorrect = useCallback(() => {
    if (!isSoundEnabled) return;
    createSound(440, 0.15, 'sine'); // A4 note
    setTimeout(() => createSound(550, 0.15, 'sine'), 100); // C#5 note
    setTimeout(() => createSound(660, 0.15, 'sine'), 200); // E5 note
    setTimeout(() => createSound(880, 0.15, 'sine'), 300); // A5 note
  }, []);

  // Wrong sound - low pitch, warning
  const playWrong = useCallback(() => {
    if (!isSoundEnabled) return;
    createSound(220, 0.2, 'square'); // A3 note
    setTimeout(() => createSound(196, 0.2, 'square'), 100); // Lower note
  }, []);

  // Lose sound - dramatic descending sequence
  const playLose = useCallback(() => {
    if (!isSoundEnabled) return;
    createSound(880, 0.2, 'sine'); // A5 note
    setTimeout(() => createSound(660, 0.2, 'sine'), 150); // E5 note
    setTimeout(() => createSound(440, 0.2, 'sine'), 300); // A4 note
    setTimeout(() => createSound(220, 0.2, 'sine'), 450); // A3 note
  }, []);

  // Math wrong answer sound - descending notes
  const playMathWrong = useCallback(() => {
    if (!isSoundEnabled) return;
    createSound(440, 0.15, 'sine'); // A4 note
    setTimeout(() => createSound(330, 0.15, 'sine'), 100); // E4 note
    setTimeout(() => createSound(220, 0.15, 'sine'), 200); // A3 note
  }, []);

  // Ludo dice sound - medium pitch, short duration
  const playLudoDice = useCallback(() => {
    if (!isSoundEnabled) return;
    createSound(660, 0.15, 'sine'); // E5 note
  }, []);

  // Ludo move sound - medium pitch, short duration
  const playLudoMove = useCallback(() => {
    if (!isSoundEnabled) return;
    createSound(550, 0.1, 'sine'); // C#5 note
  }, []);

  // Ludo capture sound - high pitch, short duration
  const playLudoCapture = useCallback(() => {
    if (!isSoundEnabled) return;
    createSound(880, 0.2, 'sine'); // A5 note
    setTimeout(() => createSound(1100, 0.15, 'sine'), 100); // Higher note
  }, []);

  const toggleSound = useCallback(() => {
    isSoundEnabled = !isSoundEnabled;
    return isSoundEnabled;
  }, []);

  const getSoundEnabled = useCallback(() => isSoundEnabled, []);

  return {
    playClick,
    playCorrect,
    playWrong,
    playLose,
    playMathWrong,
    playMathCorrect,
    playLudoDice,
    playLudoMove,
    playLudoCapture,
    toggleSound,
    getSoundEnabled
  };
};
