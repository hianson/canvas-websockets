// Server
var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/public/index.html');
});
app.use('/public', express.static(__dirname + '/public'));

serv.listen(3000);
console.log('Listening for clients...')

// create socket list to keep track of all connections
var SOCKET_LIST = {};
var PLAYER_LIST = {};
var io = require('socket.io')(serv, {});

var map = {
    cols: 8,
    rows: 8,
    tsize: 16,
    layers: [[
        9, 9, 9, 9, 9, 9, 9, 9,
        9, 1, 1, 1, 1, 1, 1, 9,
        9, 1, 2, 2, 2, 1, 1, 9,
        9, 1, 2, 2, 2, 1, 1, 9,
        9, 1, 2, 1, 2, 1, 1, 9,
        9, 1, 1, 1, 1, 1, 1, 9,
        9, 1, 1, 1, 1, 1, 1, 9,
        9, 9, 9, 1, 1, 9, 9, 9
    ], [
        4, 3, 3, 3, 3, 3, 3, 4,
        4, 0, 0, 0, 0, 0, 0, 4,
        4, 0, 0, 0, 0, 0, 0, 4,
        4, 0, 0, 5, 0, 0, 0, 4,
        4, 0, 0, 5, 0, 0, 0, 4,
        4, 0, 0, 0, 0, 0, 0, 4,
        4, 4, 4, 0, 0, 4, 4, 4,
        0, 3, 3, 0, 0, 3, 3, 3
    ]],
    getTile: function(layer, col, row) {
        return this.layers[layer][row * map.cols + col];
    }
};

function Player(id) {
  this.x = 230;
  this.y = 380;
  this.id = id;
  this.pressingRight = false;
  this.pressingLeft = false;
  this.pressingUp = false;
  this.pressingDown = false;
  this.maxSpd = 10;
  this.lookDirection = 0;
}

Player.prototype.updatePosition = function() {
  if (this.pressingRight) {
    this.x += this.maxSpd;
  }
  if (this.pressingLeft) {
    this.x -= this.maxSpd;
  }
  if (this.pressingUp) {
    this.y -= this.maxSpd;
  }
  if (this.pressingDown) {
    this.y += this.maxSpd;
  }
}

// on all sockets, listen for connections
io.sockets.on('connection', function(socket) {
  socket.id = Math.random();
  // create a new player using random socket.id:
  var player = new Player(socket.id);
  SOCKET_LIST[socket.id] = socket;
  // insert created player into PLAYER_LIST with socket.id key
  PLAYER_LIST[socket.id] = player;

  console.log('Connection made:', socket.id)

  // while player connected, listen for these events:
  socket.on('keyPress', function(data) {
    if (data.inputId === 'left') {
      player.pressingLeft = data.state;
      // change player lookDirection here
    } else if (data.inputId === 'right') {
      player.pressingRight = data.state;
    } else if (data.inputId === 'up') {
      player.pressingUp = data.state;
    } else if (data.inputId === 'down') {
      player.pressingDown = data.state;
    }
  });

  socket.on('disconnect', function() {
    delete SOCKET_LIST[socket.id];
    delete PLAYER_LIST[socket.id];
    console.log('Connection ended.')
  })

});


// loop thru every socket in socket list to send packets to each connection (rather than to each player in player list)
setInterval(function() {
  var playerPack = [];
  // for every socket (player) in the SOCKET_LIST:
    // changes player's positions and store as package so we can send new positions to all clients
  for (var i in PLAYER_LIST) {
    var player = PLAYER_LIST[i]
    player.updatePosition();
    playerPack.push({
      x: player.x,
      y: player.y
    })
  }

  // loop thru and send package to all clients to update their view with map and all player's new positions.
  for (var i in SOCKET_LIST) {
    var socket = SOCKET_LIST[i]
    socket.emit('update', playerPack, map, 0)
  }
}, 1000/25)
