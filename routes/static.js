var express = require('express');

var app = module.exports = express.Router();

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});