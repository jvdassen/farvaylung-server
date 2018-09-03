var R = require('ramda');

const defaultDeck = [
    { challenging: true, level: 'ace', suit: 'bells' },
    { challenging: true, level: 'king', suit: 'bells' },
    { challenging: true, level: 'ober', suit: 'bells' },
    { challenging: true, level: 'under', suit: 'bells' },
    { challenging: false, level: 'ten', suit: 'bells' },
    { challenging: false, level: 'nine', suit: 'bells' },
    { challenging: false, level: 'eight', suit: 'bells' },
    { challenging: false, level: 'seven', suit: 'bells' },
    { challenging: false, level: 'six', suit: 'bells' },
    { challenging: false, level: 'five', suit: 'bells' },
    { challenging: false, level: 'four', suit: 'bells' },
    { challenging: false, level: 'three', suit: 'bells' },

    { challenging: true, level: 'ace', suit: 'shields' },
    { challenging: true, level: 'king', suit: 'shields' },
    { challenging: true, level: 'ober', suit: 'shields' },
    { challenging: true, level: 'under', suit: 'shields' },
    { challenging: false, level: 'ten', suit: 'shields' },
    { challenging: false, level: 'nine', suit: 'shields' },
    { challenging: false, level: 'eight', suit: 'shields' },
    { challenging: false, level: 'seven', suit: 'shields' },
    { challenging: false, level: 'six', suit: 'shields' },
    { challenging: false, level: 'five', suit: 'shields' },
    { challenging: false, level: 'four', suit: 'shields' },
    { challenging: false, level: 'three', suit: 'shields' },

    { challenging: true, level: 'ace', suit: 'roses' },
    { challenging: true, level: 'king', suit: 'roses' },
    { challenging: true, level: 'ober', suit: 'roses' },
    { challenging: true, level: 'under', suit: 'roses' },
    { challenging: false, level: 'ten', suit: 'roses' },
    { challenging: false, level: 'nine', suit: 'roses' },
    { challenging: false, level: 'eight', suit: 'roses' },
    { challenging: false, level: 'seven', suit: 'roses' },
    { challenging: false, level: 'six', suit: 'roses' },
    { challenging: false, level: 'five', suit: 'roses' },
    { challenging: false, level: 'four', suit: 'roses' },
    { challenging: false, level: 'three', suit: 'roses' },

    { challenging: true, level: 'ace', suit: 'acorns' },
    { challenging: true, level: 'king', suit: 'acorns' },
    { challenging: true, level: 'ober', suit: 'acorns' },
    { challenging: true, level: 'under', suit: 'acorns' },
    { challenging: false, level: 'ten', suit: 'acorns' },
    { challenging: false, level: 'nine', suit: 'acorns' },
    { challenging: false, level: 'eight', suit: 'acorns' },
    { challenging: false, level: 'seven', suit: 'acorns' },
    { challenging: false, level: 'six', suit: 'acorns' },
    { challenging: false, level: 'five', suit: 'acorns' },
    { challenging: false, level: 'four', suit: 'acorns' },
    { challenging: false, level: 'three', suit: 'acorns' }
]

const shuffler = R.curry(function(random, list) {
    var idx = -1;
    var len = list.length;
    var position;
    var result = [];
    while (++idx < len) {
        position = Math.floor((idx + 1) * random());
        result[idx] = result[position];
        result[position] = list[idx];
    }
    return result;
})

function deckFactory (players) {
  if(players.length < 2) {
    return new Error('At least two players required to split a deck!')
  }
  var shuffle = shuffler(Math.random);
  var cardsPerPlayer = defaultDeck.length / players.length;

  var shuffledCards = shuffle(defaultDeck);
  var splitByPlayers = R.splitEvery(cardsPerPlayer, shuffledCards);

  return R.zipObj(players, splitByPlayers);
}
module.exports = deckFactory;