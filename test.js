var io = require('socket.io-client'); 
var assert = require('assert'); 
var expect = require('chai').expect;
var axios = require('axios');

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
        console.log(game)
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
          console.log(news)
          expect(news).to.have.string('test2')
          done();
        })
      })
    })
  });
});