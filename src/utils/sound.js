import { useCallback } from "react";
import useSound from "use-sound";

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
  chessMove: new Audio("/sounds/move.mp3"),
  chessCapture: new Audio("/sounds/eat.mp3"),
  chessCheck: new Audio("/sounds/click.mp3"),
};

// Sound enabled state
let isSoundEnabled = true;

export const useGameSounds = () => {
  const [playClick] = useSound("/sounds/click.mp3", { volume: 0.5 });
  const [playChessMove] = useSound("/sounds/chess-move.mp3", { volume: 0.5 });
  const [playChessCapture] = useSound("/sounds/chess-capture.mp3", { volume: 0.5 });
  const [playLudoDice] = useSound("/sounds/ludo-dice.mp3", { volume: 0.5 });
  const [playLudoMove] = useSound("/sounds/ludo-move.mp3", { volume: 0.5 });
  const [playLudoCapture] = useSound("/sounds/ludo-capture.mp3", { volume: 0.5 });

  // Add back the missing sound functions using the SOUNDS object
  const playWin = useCallback(() => {
    if (isSoundEnabled) SOUNDS.win.play();
  }, []);

  const playLose = useCallback(() => {
    if (isSoundEnabled) SOUNDS.lose.play();
  }, []);

  const playMove = useCallback(() => {
    if (isSoundEnabled) SOUNDS.move.play();
  }, []);

  const playEat = useCallback(() => {
    if (isSoundEnabled) SOUNDS.eat.play();
  }, []);

  const playDice = useCallback(() => {
    if (isSoundEnabled) SOUNDS.dice.play();
  }, []);

  const playShoot = useCallback(() => {
    if (isSoundEnabled) SOUNDS.shoot.play();
  }, []);

  const playCapture = useCallback(() => {
    if (isSoundEnabled) SOUNDS.capture.play();
  }, []);

  const playSlide = useCallback(() => {
    if (isSoundEnabled) SOUNDS.slide.play();
  }, []);

  const playCorrect = useCallback(() => {
    if (isSoundEnabled) SOUNDS.correct.play();
  }, []);

  const playWrong = useCallback(() => {
    if (isSoundEnabled) SOUNDS.wrong.play();
  }, []);

  const playPowerup = useCallback(() => {
    if (isSoundEnabled) SOUNDS.powerup.play();
  }, []);

  const playBasketballBounce = useCallback(() => {
    if (isSoundEnabled) SOUNDS.basketballBounce.play();
  }, []);

  const playBasketballScore = useCallback(() => {
    if (isSoundEnabled) SOUNDS.basketballScore.play();
  }, []);

  const playBasketballMiss = useCallback(() => {
    if (isSoundEnabled) SOUNDS.basketballMiss.play();
  }, []);

  const playMathCorrect = useCallback(() => {
    if (isSoundEnabled) SOUNDS.mathCorrect.play();
  }, []);

  const playMathWrong = useCallback(() => {
    if (isSoundEnabled) SOUNDS.mathWrong.play();
  }, []);

  const playMathLevelUp = useCallback(() => {
    if (isSoundEnabled) SOUNDS.mathLevelUp.play();
  }, []);

  const playPuzzleComplete = useCallback(() => {
    if (isSoundEnabled) SOUNDS.puzzleComplete.play();
  }, []);

  const playCrosswordCorrect = useCallback(() => {
    if (isSoundEnabled) SOUNDS.crosswordCorrect.play();
  }, []);

  const playCrosswordWrong = useCallback(() => {
    if (isSoundEnabled) SOUNDS.crosswordWrong.play();
  }, []);

  const playCrosswordComplete = useCallback(() => {
    if (isSoundEnabled) SOUNDS.crosswordComplete.play();
  }, []);

  const playChessCheck = useCallback(() => {
    if (isSoundEnabled) SOUNDS.chessCheck.play();
  }, []);

  const toggleSound = useCallback(() => {
    isSoundEnabled = !isSoundEnabled;
    return isSoundEnabled;
  }, []);

  const getSoundEnabled = useCallback(() => isSoundEnabled, []);

  return {
    playClick,
    playWin,
    playLose,
    playMove,
    playEat,
    playDice,
    playShoot,
    playCapture,
    playSlide,
    playCorrect,
    playWrong,
    playPowerup,
    playBasketballBounce,
    playBasketballScore,
    playBasketballMiss,
    playLudoDice,
    playLudoMove,
    playLudoCapture,
    playMathCorrect,
    playMathWrong,
    playMathLevelUp,
    playPuzzleComplete,
    playCrosswordCorrect,
    playCrosswordWrong,
    playCrosswordComplete,
    playChessMove,
    playChessCapture,
    playChessCheck,
    toggleSound,
    getSoundEnabled
  };
};
