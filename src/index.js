const express = require('express');
const app = express();
const port = 3000;
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const GamePool = require('./server/gamepool');

let globalGamePool = new GamePool();

// Init.
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
app.use('/static', express.static(__dirname + '/client'))


io.on('connection', function(socket){
  console.log('Client connected: ' + socket.id);
    globalGamePool.addToGame(socket);

  socket.on('disconnect', function(){
	  console.log('Client disconnected: ' + socket.id);
      globalGamePool.removeFromGame(socket);
  });
});


// Listener.
http.listen(port, function(){
  console.log('listening for requests...');
});