function getWinner(player, enemy) {
  if (player === enemy) {
    return "🤝 Hòa";
  }

  if (
    (player === "ROCK" && enemy === "SCISSORS") ||
    (player === "SCISSORS" && enemy === "PAPER") ||
    (player === "PAPER" && enemy === "ROCK")
  ) {
    return "🏆 Bạn thắng";
  }

  return "💀 Bạn thua";
}

export default getWinner;