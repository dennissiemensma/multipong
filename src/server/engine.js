const vec2d = require('vec2d');
const Player = require('./player');
const Ball = require('./ball');
const Wall = require('./wall');

class Engine {
	FIELD_SIZE = vec2d(800, 600);
	TICK_DELAY = 250;
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
		for (let i = 0; i < this.players.length; i++) {
			let currentPlayer = this.players[i];
			
			currentPlayer.emitUnreliable(
				"ServerMessage", {
					entities: this.entities
				}
			);
		}
	}
	
	run() {
		this.intervalHandle = setInterval(this.tick, this.TICK_DELAY, this);
		this.entities.push(new Ball(
			1,
			vec2d(0, 0),
			vec2d(Math.random(), Math.random()).normalize(),
			vec2d(5,5)
		));
		this.entities.push(new Wall(
			2,
			vec2d(0, -this.FIELD_SIZE.y),
			vec2d(0, 1),
			vec2d(this.FIELD_SIZE, 10)
		));
		this.entities.push(new Wall(
			3,
			vec2d(0, this.FIELD_SIZE.y),
			vec2d(0, -1),
			vec2d(this.FIELD_SIZE, 10)
		));
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
		engine.entities[0].move();
		
		// Update clients.
		engine.clientUpdate();
	}
}

module.exports = Engine;