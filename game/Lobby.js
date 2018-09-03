var Game = require('./Game.js');
var R = require('ramda');

function Lobby (initialGames) {
  this.games = initialGames || [];

  this.findGameById = function (gameId) {
    return findById(this.games, gameId);
  };
  this.findGameByName = function (name) {
    return findByName(this.games, name);
  };
  this.joinGame = function (gameId, user) {
    var gameToJoin = this.findGameById(gameId);
    if(gameToJoin) {
      gameToJoin.participants.push(user)
      return gameToJoin;
    } return null;
  };
  this.createNewGame = function (name, user) {
    var newGame = new Game(name, user);
    if(this.findGameByName(name)) {
      return null
    } 
    this.games.push(newGame);

    return newGame;
  }
}

function findById (iterateable, id) {
  return R.find(byId(id))(iterateable); //=> {a: 2}
}
  
function findByName (iterateable, name) {
  return R.find(byName(name))(iterateable); //=> {a: 2}
}
  
function byId (id) {
  return R.propEq('id', id)
}
  
function byName (name) {
  return R.propEq('name', name)
}

module.exports = Lobby;