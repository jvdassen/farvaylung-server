var express = require('express'),
    _       = require('lodash'),
    jwt     = require('jsonwebtoken'),
    mongoose= require('mongoose'),
    bcrypt  = require('bcrypt'),
    config  = require('../config'),
    user    = require('../models/user');
    
var app = module.exports = express.Router();
var mongoDB = 'mongodb://127.0.0.1/farvaylung';

mongoose.connect(mongoDB);
mongoose.Promse = global.Promise;
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));


var users = [{
  id: 1,
  username: 'gonto',
  password: 'gonto'
}];

function createIdToken(user) {
  return jwt.sign(_.omit(user, 'password'), config.secret, { expiresIn: 60*60*5 });
}

function createAccessToken() {
  return jwt.sign({
    iss: config.issuer,
    aud: config.audience,
    exp: Math.floor(Date.now() / 1000) + (60 * 60),
    scope: 'full_access',
    sub: "lalaland|gonto",
    jti: genJti(), // unique identifier for the token
    alg: 'HS256'
  }, config.secret);
}

// Generate Unique Identifier for the access token
function genJti() {
  let jti = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 16; i++) {
    jti += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return jti;
}

function getUserScheme(req) {

  var username;
  var type;
  var userSearch = {};

  // The POST contains a username and not an email
  if(req.body.username) {
    username = req.body.username;
    type = 'username';
    userSearch = { username: username };
  }

  return {
    username: username,
    type: type,
    userSearch: userSearch
  }
}

app.post('/users', function(req, res) {
  var userScheme = getUserScheme(req);

  if (!userScheme.username || !req.body.password) {
    return res.status(400).send("You must send the username and the password");
  }

  user.find({username: req.body.username}, function (err, users) {
    console.log(users)
    if (users.length === 0) {
      bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(req.body.password, salt, function(err, hash) {
          var newUser = new user({
            username: req.body.username,
            firstname: 'test',
            lastname: 'optional',
            pwHash: hash,
            pwSalt: salt
          })
          newUser.save();
          res.status(201).send({
            id_token: createIdToken(newUser),
            access_token: createAccessToken()
          });
        });
      });
    } else {
      return res.status(400).send("A user with that username already exists");
    }
  })

  var profile = _.pick(req.body, userScheme.type, 'password', 'extra');
  profile.id = _.max(users, 'id').id + 1;
  var newUser = new user({
    username: req.body.username,
    firstname: 'test',
    lastname: 'optional',
    pwHash: req.body.password,
    pwSalt: 'TBD'

  })
  users.push(profile);
});

app.post('/sessions/create', function(req, res) {
  var userScheme = getUserScheme(req);

  if (!userScheme.username || !req.body.password) {
    return res.status(400).send("You must send the username and the password");
  }
  var user = _.find(users, userScheme.userSearch);
  if (!user) {
    return res.status(401).send("The username or password don't match");
  }
  if (user.password !== req.body.password) {
    return res.status(401).send("The username or password don't match");
  }
  res.status(201).send({
    id_token: createIdToken(user),
    access_token: createAccessToken()
  });
});
