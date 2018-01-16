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
    tsize: 64,
    layers: [[
        3, 3, 3, 3, 3, 3, 3, 3,
        3, 1, 1, 1, 1, 1, 1, 3,
        3, 1, 1, 1, 2, 2, 1, 3,
        3, 1, 1, 2, 2, 1, 1, 3,
        3, 1, 1, 2, 2, 1, 1, 3,
        3, 1, 1, 1, 2, 1, 1, 3,
        3, 1, 1, 1, 2, 1, 1, 3,
        3, 3, 3, 1, 2, 3, 3, 3
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

var Player = function(id) {
  var self = {
    x: 250,
    y: 250,
    id: id,
    pressingRight: false,
    pressingLeft: false,
    pressingUp: false,
    pressingDown: false,
    maxSpd: 10
  }
  self.updatePosition = function() {
    if (self.pressingRight) {
      self.x += self.maxSpd;
    }
    if (self.pressingLeft) {
      self.x -= self.maxSpd;
    }
    if (self.pressingUp) {
      self.y -= self.maxSpd;
    }
    if (self.pressingDown) {
      self.y += self.maxSpd;
    }
  }
  return self;
}

// on all sockets, listen for connections
io.sockets.on('connection', function(socket) {
  socket.id = Math.random();
  var player = Player(socket.id);
  SOCKET_LIST[socket.id] = socket;
  PLAYER_LIST[socket.id] = player;

  console.log('Connection made.')

  // draw background first, and then foregruond items on top
  // socket.emit('drawMap', map, 0)
  // socket.emit('drawMap', map, 1)

  socket.on('keyPress', function(data) {
    if (data.inputId === 'left') {
      player.pressingLeft = data.state;
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
