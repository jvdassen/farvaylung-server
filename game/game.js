var uuidv4 = require('uuid/v4');

function Game (name, creator) {
  this.name = name;
  this.id = uuidv4();
  this.participants = [ creator ];
}

module.exports = Game;