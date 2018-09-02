//var GameState = require('./GameState.js');
var DeckMap = require('./DeckMap.js');
var uuidv4 = require('uuid/v4');
var R = require('ramda');

function Game (name, creator) {
  if(!name || !creator) { throw new Error() }
  this.name = name;
  this.id = uuidv4();
  this.participants = [ creator ];

  this.gameState = null;
  this.started = false;
  this.initialDecks = [];
  this.playedCards = [];
  this.playersTurn = null;

  this.startGame = function () {
    this.gameState = new UnchallengedState();
    this.started = true;
    this.initialDecks = new DeckMap(this.participants);
    this.playersTurn = this.participants[0];
    return this.initialDeck();
  }

  this.playCard = function (card) {
    if(card.player !== this.playersTurn) {
      return new Error()
    } this.gameState.handleCard(card)
  }

  this.stealDeck = function (player) {
    var nrPlayedCards = this.playedCards.length;
    var last = this.playedCards[nrPlayedCards - 1]
    var secondLast = this.playedCards[nrPlayedCards - 2]
    
    if(last === secondLast) {
      // TODO find the corresponding players stack and prepend layed cards.
      var stackOfPlayer = [];
      stackOfPlayer = stackOfPlayer.concat(this.playedCards);
      this.playedCards = [];
    }
  }

}

module.exports = Game;