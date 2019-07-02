const Player = require('./player');
const Ball = require('./ball');

class Engine {
	TICK_DELAY = 500;
	intervalHandle = null;

	players = [];
	entities = [];
	
	constructor(sockets) {
		for (let i = 0; i < sockets.length; i++) {
			let currentSocket = sockets[i];
			let player = new Player(currentSocket, "Noob");
			this.players.push(player)
			player.emitUnreliable("ServerMessage", "Starting game");
		}

		this.run();
	}
	
	/**
	 * Updates game state to clients. Uses unreliable networking for speed.
	 */
	clientUpdate() {
		console.log(this.entities)
		
		for (let i = 0; i < this.players.length; i++) {
			let currentPlayer = this.players[i];
			
//			currentPlayer.emitUnreliable("ServerMessage", "Tick update");
			currentPlayer.emitUnreliable("ServerMessage", this.entities);
		}
	}
	
	run() {
		this.intervalHandle = setInterval(this.tick, this.TICK_DELAY, this);
		this.entities.push(new Ball());
	}
	
	shutdown() {
		console.debug("Shutting down game");
		clearInterval(this.intervalHandle);
	}
	
	/**
	 * Single tick of the engine running.
	 */
	tick(engine) {
		console.debug("Engine tick")
		
		// Read client input.
		
		// Update game state.
		
		// Update clients.
		engine.clientUpdate();
	}
}

module.exports = Engine;