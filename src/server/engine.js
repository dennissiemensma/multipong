const Player = require('./player');

class Engine {
	TICK_RATE = 50;
	players = [];
	intervalHandle = null;
	
	constructor(sockets) {
		for (let i = 0; i < sockets.length; i++) {
			let currentSocket = sockets[0];
			this.players.push(new Player(currentSocket, "Noob"))
		}
		
		 this.intervalHandle = setInterval(this.tick, this.TICK_RATE);
	}
	
	shutdown() {
		clearInterval(this.intervalHandle);
	}
	
	tick() {
		console.log("TICK")
	}
}

module.exports = Engine;