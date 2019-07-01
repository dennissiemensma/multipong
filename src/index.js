var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const GamePool = require('./server/gamepool');

let gamePool = new GamePool();

// Init.
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});


// Events.
io.on('connection', function(socket){
  console.log('Client connected: ' + socket.id);
  gamePool.addToGame(socket);
	
  socket.on('disconnect', function(){
	  console.log('Client disconnected: ' + socket.id);
	  gamePool.removeFromGame(socket);
  });
});


// Listener.
http.listen(3000, function(){
  console.log('listening on *:3000');
});