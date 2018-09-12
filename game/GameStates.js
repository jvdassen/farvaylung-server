function UnchallengedState (game) {
  this.game = game;

  this.handleCard = function (card, player) {
    if(card.challenging) {
      this.game.setNextPlayer(player);
      this.game.challenger = player;
      this.game.challengeTurnsRemaining = levelToTrys(card.level);
      this.game.gameState = new ChallengedState(this.game);
      return true;
    } else {
      this.game.setNextPlayer(player);
      return true;
    }
  }

}

function ChallengedState (game) {
  this.game = game;

  this.handleCard = function (card, player) {
    if(card.challenging) {
      this.game.setNextPlayer(player);
      this.game.challenger = player;
      this.game.challengeTurnsRemaining = levelToTrys(card.level);
      this.game.gameState = new ChallengedState(this.game);
      return true;
    } else {
      this.game.deductChallengeTry();
      return true;
    }
  }
}

function levelToTrys (level) {
  if(level === 'ace') return 4;
  if(level === 'king') return 3;
  if(level === 'ober') return 2;
  if(level === 'under') return 1;
}

module.exports = {
  UnchallengedState,
  ChallengedState
}