var logger          = require('morgan'),
    cors            = require('cors'),
    http            = require('http'),
    express         = require('express'),
    errorhandler    = require('errorhandler'),
    dotenv          = require('dotenv'),
    bodyParser      = require('body-parser'),
    config          = require('./config');
    R               = require('Ramda')

var app = express();

dotenv.load();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

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

app.use(require('./user-routes'));
app.use(require('./static'));

var port = process.env.PORT || 3001;

var server = http.createServer(app).listen(port, function (err) {
  console.log('listening in http://localhost:' + port);
});


const io = require('socket.io')(server);
const fs = require('fs');
const uuidv4 = require('uuid/v4');

const rooms =[
  {
    name: 'defaultroom',
    id: '123',
    participants:[
      { name: 'bot', id: '456' }     
    ] 
  }
]; 

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
    console.log('A wants to join game:', data.game)

    var gameToJoin = findById(rooms, data.game.id)
    if (gameToJoin) {
      gameToJoin.participants.push(data.user);
      socket.join(gameToJoin.id)
      console.log('lobby after joining:', JSON.stringify(rooms))
    } else {
      socket.emit('news', 'Unable to join:', data.game)
    }
    io.to(gameToJoin.id).emit('news', gameToJoin.name + ': we have a newbie ' + data.user.name)
  })
  
  socket.on('create', function (data){
    console.log('A wants to create game:', data.game)

    var gameToCreate = findByName(rooms, data.game.name)
    if (!gameToCreate) {
      var newGame = addNewRoom(data.game.name, data.user)
      socket.join(newGame.id)
      console.log('lobby after creating', rooms)
      io.to(newGame.id).emit('news', newGame)
    } else {
      socket.emit('news', 'Unable to create', data.game)
    }
  })

  socket.on('message', function (userMessage) {
    socket.emit('message', 'Hello from echo bot\nI received your: ' + userMessage);
  })
});

function addNewRoom (name, creator) {
  var newGame = {
    name: name,
    id: uuidv4(),
    participants: [
      creator
    ] 
  }
  rooms.push(newGame);
  return newGame;
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