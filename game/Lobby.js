var Game = require('./Game.js');
var R = require('ramda');

function Lobby (initialGames) {
  this.games = initialGames || [];

  Lobby.prototype.findGameById = function (gameId) {
    return findById(this.games, gameId);
  };
  Lobby.prototype.findGameByName = function (name) {
    return findByName(this.games, name);
  };
  Lobby.prototype.joinGame = function (gameId, user) {
    var gameToJoin = this.findGameById(gameId);
    if(gameToJoin) {
      gameToJoin.participants.push(user)
      return gameToJoin;
    } return null;
  };
  Lobby.prototype.createNewGame = function (name, user) {
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
