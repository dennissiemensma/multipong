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
		
		socket.emit("ServerMessage", "Welcome to game #" + this.gameId);
		
		if (this.isFull()) {
			this.start();
		}
	}
	
	isClientHere(socket) {
		for (let i = 0; i < this.clients.length; i++) {
			let currentSocket = this.clients[i];
			
			if (currentSocket.id == socket.id) {
				return true;
			}
		}

		return false;
	}

	addClientMessage(socket, data) {
		if (this.engine == null) {
			return;
		}

		this.engine.addClientMessage(socket, data);
	}
	
	start() {
		this.broadcast("Enough players joined game, starting...")
		this.engine = new Engine(this.clients);
	}
	
	stop() {
		this.broadcast("Stopping game...")
		this.clients = [];

		if (this.engine == null) {
			return;
		}
		this.engine.shutdown();
		this.engine = null;
	}
	
	broadcast(message) {
		this.clients.forEach(function(currentSocket) {
			if (currentSocket.emit == undefined) {
				return;
			}
		});
	}
}

module.exports = Game;