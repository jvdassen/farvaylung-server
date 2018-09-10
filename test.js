var io = require('socket.io-client'); 
var assert = require('assert'); 
var expect = require('chai').expect;
var axios = require('axios');
var R = require('ramda');

describe('Suite of unit tests', function () {
  var socket;

  beforeEach(function (done) {
    this.timeout(2000)
    axios.post('http://localhost:3001/users', {
      username: 'test', 
      password: 'passwd'
    })
    .then(function (res) {
      tryToLogin(done);
    })
    .catch(function (res){
      tryToLogin(done);
    })
  })

  function tryToLogin (done) {
    axios.post('http://localhost:3001/sessions/create', {
      username: 'test',
      password: 'passwd'
    })
    .then(function (token) {
      // Setup
      socket = io.connect('http://localhost:3001',{ 
        query: { 
          token: token.data.access_token 
        }
      });
      socket.on('connect', function () {
        socket.user = 'test'
        done();
      });
      socket.on('disconnect', function () { }) 
    });
  }

   
  afterEach(function (done) {
    // Cleanup
    if(socket.connected) {
      socket.disconnect();
    }
    done();
  });

  describe('Connection', function () {
    it('Should connect successfully', function (done) {
      expect(socket.connected).to.be.true;
      done();
    });
  });

  describe('Game creation', function () {
    it('Should create a game for valid parameters', function (done) {
      socket.emit('create', {
        game: {
          name: 'test-game'
        },
        user: socket.user
      })
      socket.on('news', function (news) {
        expect(news.participants).to.have.members([ socket.user ])
        done();
      })
    });
  });

  describe('Game rooms', function () {

    var gameRoom;
    beforeEach(function (done) {
      socket.emit('create', {
        game: {
          name: 'test-game2'
        },
        user: 'user2'
      })
      socket.on('news', function (game) {
        gameRoom = game;
        if(Array.isArray(game.participants)) {
          expect(game.participants).to.have.members([ 'user2' ])
          done();
        }
      })
    });
    
    describe('Join game', function () {
      it('Should be able to join the created game', function (done) {
        socket.emit('join', {
          game: {
            id: gameRoom.id
          },
          user: { name: 'test2' }
        })
        socket.on('news', function (news) {
          expect(news).to.have.string('test2')
          done();
        })
      })
    })
  });
  describe('Card Decks and Shuffling', function () {
    var DeckMap = require('./game/DeckFactory');

    it('should not create a deck for empty players', function () {
      var deck = DeckMap([]);
      expect(deck).to.be.an('Error');
    })
    it('should create different decks for the correct amount of players', function () {
      var deck = DeckMap([ 'player1', 'player2' ]);
      expect(deck.player1.length).to.equal(deck.player2.length);
      expect(deck.player1).to.not.deep.equal(deck.player2);

      var deck2 = DeckMap([ 'playerx', 'playery', 'playerz' ]);
      expect(deck2.playerx.length).to.equal(deck2.playery.length);
      expect(deck2.playerx.length).to.equal(deck2.playerz.length);
      expect(deck2.playery.length).to.equal(deck2.playerz.length);

      expect(deck2.playerx).to.not.deep.equal(deck2.playery);
      expect(deck2.playerx).to.not.deep.equal(deck2.playerz);
      expect(deck2.playery).to.not.deep.equal(deck2.playerz);
    })
    it('should create different decks for same players at different times', function () {
      var deck = new DeckMap([ 'player1', 'player2' ]);
      expect(deck.player1.length).to.equal(deck.player2.length);
      expect(deck.player1).to.not.deep.equal(deck.player2);

      var deck2 = new DeckMap([ 'player1', 'player2' ]);
      expect(deck2.player1.length).to.equal(deck2.player2.length);
      expect(deck2.player1).to.not.deep.equal(deck2.player2);
      expect(deck2).to.not.deep.equal(deck);
      expect(deck.player1).to.not.deep.equal(deck2.player1)
      expect(deck.player2).to.not.deep.equal(deck2.player2)
    })
  });
  describe('Game', function () {
    var Game = require('./game/Game');

    it('should construct a game', function () {
      var game = new Game('game-name', 'player1');

      expect(game.participants).to.contain('player1');
      expect(game.id).to.not.be.null;
      expect(game.id).to.be.a('String');
      expect(game.id.length).to.be.greaterThan(0);
    })

    it('should add players', function () {
      var game = new Game('game-name', 'player1');
      game.addPlayer('player2')

      expect(game.participants).to.contain('player1');
      expect(game.participants).to.contain('player2');
      expect(game.participants.length).to.be.equal(2);
    })
    it('should not add empty players', function () {
      var game = new Game('game-name', 'player1');
      game.addPlayer('')
      game.addPlayer(null)
      game.addPlayer(undefined)
      game.addPlayer([])

      expect(game.participants.length).to.be.equal(1);
    })
    it('should correctly initialize a deck', function () {
      var creator = 'player1';
      var game = new Game('game-name', creator);
      game.addPlayer('player2');
      game.startGame();

      expect(game.participants.length).to.be.equal(2);
      expect(game.started).to.be.true;
      expect(R.keys(game.playerDecks).length).to.be.equal(game.participants.length);
      expect(game.playerDecks.player1.length).to.be.equal(game.playerDecks.player2.length);
      expect(game.playersTurn).to.be.equal(creator);

    })
    it('should correctly attribute played cards to winners', function () {
      var creator = 'player1';
      var game = new Game('game-name', creator);
      game.addPlayer('player2');
      game.startGame();
      game.playedCards = [
        { challenging: true, level: 'ace', suit: 'bells' },
        { challenging: false, level: 'four', suit: 'bells' }
      ]
      game.givePlayerPlayedDeck('player2');

      expect(game.playerDecks.player2.length).to.be.equal(game.playerDecks.player1.length + 2)
      expect(game.playedCards).to.be.deep.equal([]);
      expect(game.playerDecks.player2[0]).to.be.deep.equal({
        challenging: false, level: 'four', suit: 'bells'
      })
      expect(game.playerDecks.player2[1]).to.be.deep.equal({
        challenging: true, level: 'ace', suit: 'bells'
      })
    });
    it('should correctly add stolen cards', function () {
      var creator = 'player1';
      var game = new Game('game-name', creator);
      game.addPlayer('player2');
      game.startGame();
      game.playedCards = [
        { challenging: true, level: 'ace', suit: 'bells' },
        { challenging: true, level: 'ace', suit: 'acorns' },
      ]
      var successFullyStolen = game.stealDeck('player2');
      var firstPlayersDeck = game.playerDecks.player1;
      var secondPlayersDeck = game.playerDecks.player2;

      expect(successFullyStolen).to.be.true;
      expect(secondPlayersDeck.length).to.be.equal(firstPlayersDeck.length + 2)
      expect(game.playedCards).to.be.deep.equal([]);
      expect(secondPlayersDeck [0]).to.be.deep.equal({
        challenging: true, level: 'ace', suit: 'acorns' 
      })
      expect(secondPlayersDeck [1]).to.be.deep.equal({
        challenging: true, level: 'ace', suit: 'bells'
      })
    })
    it('should not add stolen cards if types dont match', function () {
      var creator = 'player1';
      var game = new Game('game-name', creator);
      game.addPlayer('player2');
      game.startGame();
      game.playedCards = [
        { challenging: true, level: 'ace', suit: 'bells' },
        { challenging: true, level: 'king', suit: 'acorns' },
      ]
      var successFullyStolen = game.stealDeck('player2');

      expect(successFullyStolen).to.be.false;
      expect(game.playerDecks.player2.length).to.be.equal(game.playerDecks.player1.length)
      expect(game.playedCards).to.be.deep.equal([
        { challenging: true, level: 'ace', suit: 'bells' },
        { challenging: true, level: 'king', suit: 'acorns' },
      ]);
    })
    it('should not allow users adding cards if its not their turn', function () {
      var creator = 'player1';
      var game = new Game('game-name', creator);
      game.addPlayer('player2');
      game.startGame();

      var successFullyAddedCard = game.playCard(game.playerDecks.player2[0], 'player2')
      
      expect(successFullyAddedCard).to.be.false;
      expect(game.playersTurn).to.be.equal('player1');
      expect(game.playedCards).to.be.deep.equal([]);
    })
    it('should accept non-challenging cards without state changes', function () {
      var creator = 'player1';
      var game = new Game('game-name', creator);
      game.addPlayer('player2');
      game.startGame();

      var successFullyAddedCard = game.playCard({ challenging: false, level: 'ten', suit: 'bells' } , 'player1')

      expect(successFullyAddedCard).to.be.true;
      expect(game.playersTurn).to.be.equal('player2');

      var successFullyReaddedCard = game.playCard({ challenging: false, level: 'ten', suit: 'bells' } , 'player1')
      console.log(game.challengeTurnsRemaining, game.challenger)
      expect(game.challengeTurnsRemaining).to.be.null;
      expect(game.challenger).to.be.null;
      expect(successFullyReaddedCard).to.be.false;
      expect(game.playersTurn).to.be.equal('player2');

    })
    it('should accept challenging cards correctly if not challenged', function () {
      var creator = 'player1';
      var game = new Game('game-name', creator);
      game.addPlayer('player2');
      game.startGame();

      expect(game.gameState).to.be.an('string')

      var successFullyAddedCard = game.playCard({ challenging: true, level: 'ace', suit: 'bells' } , 'player1')

      expect(successFullyAddedCard).to.be.true;
      expect(game.playersTurn).to.be.equal('player2');
      expect(game.challenger).to.be.equal('player1');
      expect(game.challengeTurnsRemaining).to.be.equal(4)

      var successFullyReaddedCard = game.playCard({ challenging: false, level: 'ace', suit: 'bells' } , 'player1')

      expect(successFullyReaddedCard).to.be.false;
      expect(game.playersTurn).to.be.equal('player2');
    })
  });
});