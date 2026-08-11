class RoomModel {
  constructor() {
    this.id = "";

    this.type = 2;

    this.status = "WAITING";

    this.owner = null;

    this.players = [];

    this.spectators = [];

    this.betLocked = false;

    this.bets = {};

    this.agreements = {};

    this.choices = {};

    this.results = {};
  }
}

export default RoomModel;