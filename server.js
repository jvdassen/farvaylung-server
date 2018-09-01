var logger          = require('morgan'),
    cors            = require('cors'),
    http            = require('http'),
    express         = require('express'),
    errorhandler    = require('errorhandler'),
    dotenv          = require('dotenv'),
    bodyParser      = require('body-parser'),
    config          = require('./config');
    R               = require('ramda');
    Lobby = require('./game/lobby.js');

var app = express();
var port = process.env.PORT || 3001;
var server = http.createServer(app).listen(port, function (err) {
  console.log('listening in http://localhost:' + port);
});

var io = require('socket.io')(server);
var fs = require('fs');

dotenv.load();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(require('./routes/user-routes'));
app.use(require('./routes/static'));

app.use(function(err, req, res, next) {
  if (err.name === 'StatusError') {
    res.send(err.status, err.message);
  } else {
    next(err);
  }
});

if (process.env.NODE_ENV === 'development') {
  app.use(logger('dev'));
  app.use(errorhandler())
}

var lobby = new Lobby([]);
var jwt = require('jsonwebtoken');

io.use(function(socket, next){
  if (socket.handshake.query && socket.handshake.query.token){
    jwt.verify(socket.handshake.query.token, config.secret, function(err, decoded) {
      if(err) return next(new Error('Authentication error'));
      socket.decoded = decoded;
      console.log('decoded web token:', decoded)
      next();
    });
  } else {
      next(new Error('Authentication error'));
  }    
})

io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });

  socket.on('join', function (data){
    var joinedGame = lobby.joinGame(data.game.id, data.user);

    if (joinedGame) {
      socket.join(joinedGame.id)
      io.to(joinedGame.id).emit('news', joinedGame.name + ': we have a newbie ' + data.user.name)
    } else {
      socket.emit('news', 'Unable to join:', data.game)
    }
    //joinSocketAndNotify(socket, joinedGame, 'join', joinedGame)
  })
  
  socket.on('create', function (data){
    var createdGame = lobby.createNewGame(data.game.name, data.user);

    /*if (createdGame) {
      socket.join(createdGame.id)
      io.to(createdGame.id).emit('news', createdGame)
    } else {
      socket.emit('news', 'Unable to create', data.game)
    }*/
    joinSocketAndNotify(socket, createdGame, 'create', createdGame)
  })

});

function joinSocketAndNotify (socket, game, eventType, eventBody) {
  if(game) {
    socket.join(game.id)
    io.to(game.id).emit('news', eventBody)
  } else {
    socket.emit('news', `Ùnable to ${eventType} ${eventBody}`)
  }
}