import GameState from "./GameState";

const GameLogic = {
  // Xác định thắng thua
  getWinner(player, enemy) {
    if (player === enemy) {
      return "DRAW";
    }

    if (
      (player === "ROCK" && enemy === "SCISSORS") ||
      (player === "SCISSORS" && enemy === "PAPER") ||
      (player === "PAPER" && enemy === "ROCK")
    ) {
      return "WIN";
    }

    return "LOSE";
  },

  // Kiểm tra tiền cược hợp lệ
  isValidBet(bet) {
    return Number.isInteger(bet) && bet >= 1;
  },

  // Có thể bắt đầu trận đấu?
  canStart(players) {
    return players.every((player) => player.ready);
  },

  // Chuyển trạng thái
  nextState(currentState) {
    switch (currentState) {
      case GameState.WAITING:
        return GameState.BETTING;

      case GameState.BETTING:
        return GameState.LOCK_BET;

      case GameState.LOCK_BET:
        return GameState.AGREEMENT;

      case GameState.AGREEMENT:
        return GameState.COUNTDOWN;

      case GameState.COUNTDOWN:
        return GameState.CHOOSING;

      case GameState.CHOOSING:
        return GameState.WAIT_RESULT;

      case GameState.WAIT_RESULT:
        return GameState.REVEAL;

      case GameState.REVEAL:
        return GameState.RESULT;

      case GameState.RESULT:
        return GameState.NEXT_ROUND;

      default:
        return GameState.WAITING;
    }
  },
};

export default GameLogic;