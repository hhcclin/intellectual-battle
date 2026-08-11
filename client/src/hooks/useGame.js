import { useState, useEffect } from "react";
import getWinner from "../utils/gameLogic";

function useGame() {
  // Trạng thái phòng
  const [gameState, setGameState] = useState("WAITING");

  // Tiền cược
  const [bet, setBet] = useState(1);

  // Người chơi chọn
  const [choice, setChoice] = useState("");

  // Đối thủ
  const [enemyChoice, setEnemyChoice] = useState("");

  // Kết quả
  const [result, setResult] = useState("");

  // Đồng ý bắt đầu
  const [ready, setReady] = useState(false);

  // Đếm ngược
  const [countdown, setCountdown] = useState(3);

  // ===========================
  // Khi Ready -> Đếm ngược
  // ===========================

  useEffect(() => {
    if (!ready) return;

    setGameState("COUNTDOWN");
    setCountdown(3);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(timer);
          setGameState("CHOOSING");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [ready]);

  // ===========================
  // Sau khi người chơi chọn
  // ===========================

  useEffect(() => {
    if (choice === "") return;

    const choices = ["ROCK", "PAPER", "SCISSORS"];

    const randomEnemy =
      choices[Math.floor(Math.random() * choices.length)];

    setEnemyChoice(randomEnemy);

    const winner = getWinner(choice, randomEnemy);

    setResult(winner);

    setGameState("RESULT");
  }, [choice]);

  // ===========================
  // Chơi tiếp
  // ===========================

  function resetGame() {
    setReady(false);

    setCountdown(3);

    setChoice("");

    setEnemyChoice("");

    setResult("");

    setGameState("WAITING");
  }

  return {
    // state
    gameState,
    bet,
    choice,
    enemyChoice,
    result,
    ready,
    countdown,

    // setter
    setGameState,
    setBet,
    setChoice,
    setEnemyChoice,
    setResult,
    setReady,

    // function
    resetGame,
  };
}

export default useGame;