const Engine = require('./engine');

class Game {
	MAX_CLIENTS = 2;
	
	gameId;
	clients = [];
	engine = null;
	
	constructor(gameId) {
		this.gameId = gameId;
		console.log("Created new game ID: " + this.gameId);
	}
	
	isFull() {
		return this.clients.length == this.MAX_CLIENTS;
	}
	
	isEmpty() {
		return this.clients.length == 0;
	}
	
	addClient(socket) {
		this.clients.push(socket);
		socket.emit("serverMessage", "Welcome to game #" + this.gameId);
		
		if (this.isFull()) {
			this.start();
		}
	}

	isClientHere(socket) {
		for (let i = 0; i < this.clients.length; i++) {
			let currentSocket = this.clients[0];
			
			if (currentSocket.id == socket.id) {
				return true;
			}
		}

		return false;
	}
	
	start() {
		console.log("Starting game: #" + this.gameId);
		this.broadcast("Enough players joined game, starting...")
		this.engine = new Engine(this.clients);
	}
	
	stop() {
		console.debug("Stopping game: #" + this.gameId);
		this.broadcast("Stopping game...")
		this.clients = [];
		this.engine.shutdown();
		this.engine = null;
	}
	
	broadcast(message) {
		this.clients.forEach(function(currentSocket) {
			if (currentSocket.emit == undefined) {
				return;
			}
			currentSocket.emit("serverMessage", message);
		});
	}
}

module.exports = Game;