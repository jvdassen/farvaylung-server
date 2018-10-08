var UnchallengedState = require('./GameStates').UnchallengedState;
var DeckMap = require('./DeckFactory');
var Observer = require('./Observer');
var uuidv4 = require('uuid/v4');
var R = require('ramda');

function Game (name, creator) {
  if(!name || !creator) { throw new Error() }
  this.name = name;
  this.id = uuidv4();
  this.participants = [ creator ];

  this.started = false;
  this.playerDecks = [];
  this.playedCards = [];

  this.gameState = null;
  this.playersTurn = null;
  this.challenger = null;
  this.challengeTurnsRemaining = null;
  
  this.stateObserver = new Observer();

  this.startGame = function () {
    this.gameState = new UnchallengedState(this);
    this.started = true;
    this.playerDecks= DeckMap(this.participants);
    this.playersTurn = this.participants[0];
    return this.initialDeck;
  }
 /* this.greet = function () {
    return 'hello!'
  }*/

  this.addPlayer = function (player) {
    if(player && typeof player === 'string') {
      this.participants.push(player);
    }
  }

  this.playCard = function (card, player) {
    if(player !== this.playersTurn) {
      return false;
    }
    this.playerDecks[player].pop();
    this.playedCards.push(card);
    //this.playersTurn = findNextNotDefeatedPlayer();

    return this.gameState.handleCard(card, player);
  }
  this.setNextPlayer = function (lastPlayer) {
    var index = this.participants.findIndex(player => player === lastPlayer);
    var nextPlayer = index === this.participants.length-1 ? this.participants[0] : this.participants[index + 1];
    if(nextPlayer.length === 0) {
      this.setNextPlayer(nextPlayer);
    } else {
      this.playersTurn = nextPlayer;
    }
  }

  this.stealDeck = function (player) {
    var nrPlayedCards = this.playedCards.length;
    if(nrPlayedCards < 2) {
      return false
    }

    var lastLevel = this.playedCards[nrPlayedCards - 1].level
    var secondLastLevel = this.playedCards[nrPlayedCards - 2].level
    if(R.equals(lastLevel, secondLastLevel)) {
      // TODO find the corresponding players stack and prepend layed cards.
      this.givePlayerPlayedDeck(player)

      this.stateObserver.inform({
        event: 'steal',
        winner: player,
        playedCards: this.playedCards,
        playerDecks: this.playerDecks,
        playersTurn: this.playersTurn,
        challengeTurnsRemaining: this.challengeTurnsRemaining,
        challenger: this.challenger
      })

      return true;
    } return false;
  }
  this.givePlayerPlayedDeck = function (player) {
    var playersDeck = R.prop(player, this.playerDecks);
    this.playerDecks[player] = R.reverse(this.playedCards).concat(playersDeck);
    this.playedCards = []
  }
  this.deductChallengeTry = function () {
    var anotherTryPossible = this.challengeTurnsRemaining > 0;
    if(anotherTryPossible) {
      this.challengeTurnsRemaining--;
      // refactor into higher abstraction level
      this.stateObserver.inform({
        event: 'try',
        playedCards: this.playedCards,
        playerDecks: this.playerDecks,
        playersTurn: this.playersTurn,
        challengeTurnsRemaining: this.challengeTurnsRemaining,
        challenger: this.challenger
      })
    } else {
      this.playerWonDeck(this.challenger);
    }
  }
  this.playerWonDeck = function handleWind (winner) {
    this.givePlayerPlayedDeck(winner)
    this.challenger = null;
    this.challengeTurnsRemaining = null;
    this.playersTurn = winner;
    this.gameState = new UnchallengedState(this);

    this.stateObserver.inform({
      event: 'win',
      winner: winner,
      playedCards: this.playedCards,
      playerDecks: this.playerDecks,
      playersTurn: this.playersTurn,
      challengeTurnsRemaining: this.challengeTurnsRemaining,
      challenger: this.challenger
    })
  }
  this.subscribeToGameChanges = function subscribe (subscriber) {
    this.stateObserver.subscribe(subscriber);
  }
}

module.exports = Game;