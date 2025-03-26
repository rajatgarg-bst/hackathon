import { useState, useEffect, useCallback, useRef } from "react";
import styled from "@emotion/styled";
import GameContainer from "../../components/GameContainer";
import { motion } from "framer-motion";
import { useGameSounds } from "../../utils/sound";

const GameArea = styled.div`
  width: 600px;
  height: 400px;
  background-color: ${(props) => props.theme.colors.background};
  border: 2px solid ${(props) => props.theme.colors.primary};
  border-radius: ${(props) => props.theme.borderRadius.md};
  margin: 0 auto;
  position: relative;
  overflow: hidden;
`;

const Hoop = styled.div`
  width: 100px;
  height: 10px;
  background-color: ${(props) => props.theme.colors.primary};
  position: absolute;
  top: 50px;
  right: 50px;
  border-radius: ${(props) => props.theme.borderRadius.sm};
`;

const Backboard = styled.div`
  width: 20px;
  height: 60px;
  background-color: ${(props) => props.theme.colors.primary};
  position: absolute;
  top: 50px;
  right: 150px;
  border-radius: ${(props) => props.theme.borderRadius.sm};
`;

const Ball = styled.div`
  width: 30px;
  height: 30px;
  background-color: ${(props) => props.theme.colors.accent};
  border-radius: 50%;
  position: absolute;
  left: 50px;
  bottom: 50px;
  transition: all 0.5s ease;
  cursor: pointer;
`;

const Score = styled.div`
  text-align: center;
  font-size: 2rem;
  font-weight: bold;
  color: ${(props) => props.theme.colors.primary};
  margin-bottom: ${(props) => props.theme.spacing.md};
`;

const Timer = styled.div`
  text-align: center;
  font-size: 1.5rem;
  color: ${(props) => props.theme.colors.primary};
  margin-bottom: ${(props) => props.theme.spacing.md};
`;

const Controls = styled.div`
  display: flex;
  justify-content: center;
  gap: ${(props) => props.theme.spacing.md};
  margin-top: ${(props) => props.theme.spacing.lg};
`;

const Button = styled.button`
  background-color: ${(props) => props.theme.colors.primary};
  color: ${(props) => props.theme.colors.white};
  padding: ${(props) => props.theme.spacing.sm}
    ${(props) => props.theme.spacing.lg};
  border-radius: ${(props) => props.theme.borderRadius.sm};
  font-size: 1rem;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${(props) => props.theme.colors.secondary};
  }

  &:disabled {
    background-color: ${(props) => props.theme.colors.gray};
    cursor: not-allowed;
  }
`;

const GAME_DURATION = 60; // seconds
const POWER_METER_SPEED = 50; // milliseconds
const MAX_POWER = 100;

const Basketball = () => {
  const {
    playClick,
    playBasketballBounce,
    playBasketballScore,
    playBasketballMiss,
  } = useGameSounds();

  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isShooting, setIsShooting] = useState(false);
  const [power, setPower] = useState(0);
  const [isPowerIncreasing, setIsPowerIncreasing] = useState(true);
  const [ballPosition, setBallPosition] = useState({ x: 50, y: 350 });

  useEffect(() => {
    let timer;
    if (isGameActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsGameActive(false);
    }
    return () => clearInterval(timer);
  }, [isGameActive, timeLeft]);

  useEffect(() => {
    let powerTimer;
    if (isShooting) {
      powerTimer = setInterval(() => {
        setPower((prev) => {
          if (isPowerIncreasing) {
            return prev >= MAX_POWER ? prev : prev + 1;
          } else {
            return prev <= 0 ? 0 : prev - 1;
          }
        });
      }, POWER_METER_SPEED);
    }
    return () => clearInterval(powerTimer);
  }, [isShooting, isPowerIncreasing]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setIsGameActive(true);
    setIsShooting(false);
    setPower(0);
    setIsPowerIncreasing(true);
    setBallPosition({ x: 50, y: 350 });
  };

  const handleShoot = useCallback(() => {
    if (isShooting) return;

    setIsShooting(true);
    playBasketballBounce();

    const angle = Math.random() * 30 + 45; // Random angle between 45 and 75 degrees
    const power = Math.random() * 20 + 80; // Random power between 80 and 100
    const isScore = Math.random() < 0.5; // 50% chance of scoring

    setTimeout(() => {
      if (isScore) {
        setScore((prev) => prev + 2);
        playBasketballScore();
      } else {
        playBasketballMiss();
      }
      setIsShooting(false);
    }, 1000);
  }, [
    isShooting,
    playBasketballBounce,
    playBasketballScore,
    playBasketballMiss,
  ]);

  const resetGame = () => {
    setScore(0);
    setIsShooting(false);
    playClick();
  };

  return (
    <GameContainer
      title="Basketball"
      description="Click and hold the ball to charge power, release to shoot. Score points by getting the ball through the hoop!"
    >
      <Score>Score: {score}</Score>
      <Timer>Time Left: {timeLeft}s</Timer>
      <GameArea>
        <Backboard />
        <Hoop />
        <Ball
          style={{
            left: `${ballPosition.x}px`,
            top: `${ballPosition.y}px`,
          }}
          onMouseDown={handleShoot}
          onMouseUp={handleShoot}
          onMouseLeave={handleShoot}
        />
      </GameArea>
      <Controls>
        <Button onClick={startGame} disabled={isGameActive}>
          Start Game
        </Button>
        {isShooting && (
          <div
            style={{
              width: "200px",
              height: "20px",
              backgroundColor: "#ddd",
              borderRadius: "10px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${power}%`,
                height: "100%",
                backgroundColor:
                  power >= 40 && power <= 60 ? "#2ecc71" : "#e74c3c",
                transition: "width 0.05s linear",
              }}
            />
          </div>
        )}
      </Controls>
    </GameContainer>
  );
};

export default Basketball;
