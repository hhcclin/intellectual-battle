import GameLogic from "./GameLogic";
import GameState from "./GameState";

class GameEngine {
  constructor() {
    this.state = GameState.WAITING;
  }

  getState() {
    return this.state;
  }

  next() {
    this.state = GameLogic.nextState(this.state);
    return this.state;
  }

  reset() {
    this.state = GameState.WAITING;
  }
}

export default GameEngine;