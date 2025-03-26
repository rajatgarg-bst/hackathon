import { useCallback } from "react";

const SOUNDS = {
  click: new Audio("/sounds/click.mp3"),
  win: new Audio("/sounds/win.mp3"),
  lose: new Audio("/sounds/lose.mp3"),
  move: new Audio("/sounds/move.mp3"),
  eat: new Audio("/sounds/eat.mp3"),
  dice: new Audio("/sounds/dice.mp3"),
  shoot: new Audio("/sounds/shoot.mp3"),
  capture: new Audio("/sounds/capture.mp3"),
  slide: new Audio("/sounds/slide.mp3"),
  correct: new Audio("/sounds/correct.mp3"),
  wrong: new Audio("/sounds/wrong.mp3"),
  powerup: new Audio("/sounds/powerup.mp3"),
  basketballBounce: new Audio("/sounds/basketball-bounce.mp3"),
  basketballScore: new Audio("/sounds/basketball-score.mp3"),
  basketballMiss: new Audio("/sounds/basketball-miss.mp3"),
  ludoDice: new Audio("/sounds/ludo-dice.mp3"),
  ludoMove: new Audio("/sounds/ludo-move.mp3"),
  ludoCapture: new Audio("/sounds/ludo-capture.mp3"),
  mathCorrect: new Audio("/sounds/math-correct.mp3"),
  mathWrong: new Audio("/sounds/math-wrong.mp3"),
  mathLevelUp: new Audio("/sounds/math-level-up.mp3"),
  puzzleComplete: new Audio("/sounds/puzzle-complete.mp3"),
  crosswordCorrect: new Audio("/sounds/crossword-correct.mp3"),
  crosswordWrong: new Audio("/sounds/crossword-wrong.mp3"),
  crosswordComplete: new Audio("/sounds/crossword-complete.mp3"),
  chessMove: new Audio("/sounds/chess-move.mp3"),
  chessCapture: new Audio("/sounds/chess-capture.mp3"),
  chessCheck: new Audio("/sounds/chess-check.mp3"),
};

// Set volume for all sounds
Object.values(SOUNDS).forEach((sound) => {
  sound.volume = 0.5;
});

export const useGameSounds = () => {
  const playSound = useCallback((soundName) => {
    const sound = SOUNDS[soundName];
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch((error) => {
        console.error(`Error playing sound ${soundName}:`, error);
      });
    }
  }, []);

  return {
    playClick: () => playSound("click"),
    playWin: () => playSound("win"),
    playLose: () => playSound("lose"),
    playMove: () => playSound("move"),
    playEat: () => playSound("eat"),
    playDice: () => playSound("dice"),
    playShoot: () => playSound("shoot"),
    playCapture: () => playSound("capture"),
    playSlide: () => playSound("slide"),
    playCorrect: () => playSound("correct"),
    playWrong: () => playSound("wrong"),
    playPowerup: () => playSound("powerup"),
    playBasketballBounce: () => playSound("basketballBounce"),
    playBasketballScore: () => playSound("basketballScore"),
    playBasketballMiss: () => playSound("basketballMiss"),
    playLudoDice: () => playSound("ludoDice"),
    playLudoMove: () => playSound("ludoMove"),
    playLudoCapture: () => playSound("ludoCapture"),
    playMathCorrect: () => playSound("mathCorrect"),
    playMathWrong: () => playSound("mathWrong"),
    playMathLevelUp: () => playSound("mathLevelUp"),
    playPuzzleComplete: () => playSound("puzzleComplete"),
    playCrosswordCorrect: () => playSound("crosswordCorrect"),
    playCrosswordWrong: () => playSound("crosswordWrong"),
    playCrosswordComplete: () => playSound("crosswordComplete"),
    playChessMove: () => playSound("chessMove"),
    playChessCapture: () => playSound("chessCapture"),
    playChessCheck: () => playSound("chessCheck"),
  };
};
