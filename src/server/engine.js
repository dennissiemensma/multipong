const vec2d = require('vec2d');
const Player = require('./player');
const Ball = require('./ball');
const Wall = require('./wall');
const Paddle = require('./paddle');
const Goal = require('./goal');

class Engine {
	FIELD_SIZE = vec2d(800, 600);
	POINT_NORTH = vec2d(0, 1);
	POINT_EAST = vec2d(1, 0);
	POINT_SOUTH = vec2d(0, -1);
	POINT_WEST = vec2d(-1, 0);
	TICK_INTERVAL = 15;  // ms
	CLIENT_UPDATE_INTERVAL = 50;  // ms
	BALL_VELOCITY = 50;

	intervalHandle = null;
	players = [];
	entities = [];

	gameStart = null;
	gameTime = null;
	lastTick = null;
	nextClientUpdate = 0;

	constructor(sockets) {
		for (let i = 0; i < sockets.length; i++) {
			let currentSocket = sockets[i];
			let player = new Player(currentSocket, "Noob");
			this.players.push(player)
			player.emitUnreliable("ServerMessage", "Starting game");
		}

		this.start();
	}

	addClientMessage(socket, data) {
		for (let i = 0; i < this.players.length; i++) {
			let currentPlayer = this.players[i];

			if (currentPlayer.socket.id == socket.id) {
				return currentPlayer.addClientMessage(data);
			}
		}
	}

	getCurrentTime() {
		return Date.now();
	}

	updateGameTime() {
		this.lastTick = this.gameTime;
		this.gameTime = this.getCurrentTime() - this.gameStart;
	}

	getGameTime() {
		return this.gameTime;
	}

	getTimeSinceLastTick() {
		return this.gameTime - this.lastTick;
	}
	
	/**
	 * Updates game state to clients. Uses unreliable networking for performance.
	 */
	clientUpdate() {
		if (this.getGameTime() < this.nextClientUpdate) {
			return;
		}

		let message = {
			game: {
				time: this.getGameTime(),
				score: [],
			},
			entities: []
		};

		for (let i = 0; i < this.players.length; i++) {
			message.game.score.push(this.players[i].score);
		}

		for (let i = 0 ; i < this.entities.length ; i++) {
			let currentEntity = this.entities[i];
			message.entities.push(currentEntity.export());
		}

		for (let i = 0; i < this.players.length; i++) {
			let currentPlayer = this.players[i];
			currentPlayer.emitUnreliable("GameUpdate", message);
		}

		this.nextClientUpdate = this.getGameTime() + this.CLIENT_UPDATE_INTERVAL;
	}
	
	start() {
		this.intervalHandle = setInterval(this.tick, this.TICK_INTERVAL, this);
		this.spawnEntities();
		this.gameStart = this.getCurrentTime();
		this.lastTick = this.gameStart;
	}

	shutdown() {
		console.debug("Shutting down game");
		clearInterval(this.intervalHandle);
	}
	/**
	 * Single tick of the engine running. Called every X interval.
	 */
	tick(engine) {
		engine.updateGameTime();
		// console.debug("Engine tick @ " + engine.getGameTime());

		// Read client input.
		engine.readClientInput();

		// Update game state.
		engine.thinkEntities();
		engine.handleCollision();

		// Update clients.
		engine.clientUpdate();
	}

	readClientInput() {
		for (let i = 0; i < this.players.length; i++) {
			let currentPlayer = this.players[i];
			let messages = currentPlayer.getClientMessages();
			// console.log(messages)
		}
	}

	spawnEntities() {
		let idCounter = 1;
		this.entities.push(new Ball(
			idCounter++,
			vec2d(0, 0),
			vec2d(Math.random(), Math.random()).normalize(),
			vec2d(5,5),
			this.BALL_VELOCITY
		));

		// Wall top and bottom.
		this.entities.push(new Wall(
			idCounter++,
			vec2d(0, -this.FIELD_SIZE.y + 5),
			this.POINT_NORTH.clone(),
			vec2d(this.FIELD_SIZE, 2)
		));
		this.entities.push(new Wall(
			idCounter++,
			vec2d(0, this.FIELD_SIZE.y - 5),
			this.POINT_SOUTH.clone(),
			vec2d(this.FIELD_SIZE, 2)
		));

		// Goals left and right.
		this.entities.push(new Goal(
			idCounter++,
			vec2d(-this.FIELD_SIZE.x / 2 + 1, 0),
			this.POINT_EAST.clone(),
			vec2d(5, this.FIELD_SIZE.y)
		));
		this.entities.push(new Goal(
			idCounter++,
			vec2d(this.FIELD_SIZE.x / 2 - 1, 0),
			this.POINT_WEST.clone(),
			vec2d(5, this.FIELD_SIZE.y)
		));

		// Players
		this.entities.push(new Paddle(
			idCounter++,
			vec2d(-this.FIELD_SIZE.x / 2 + 25, 0),
			this.POINT_EAST.clone(),
			vec2d(10, 100)
		));
		this.entities.push(new Paddle(
			idCounter++,
			vec2d(this.FIELD_SIZE.x / 2 - 25, 0),
			this.POINT_WEST.clone(),
			vec2d(10, 100)
		));
	}

	thinkEntities() {
		let timeSinceLastTick = this.getTimeSinceLastTick();

		for (let i = 0 ; i < this.entities.length ; i++) {
			let currentEntity = this.entities[i];
			currentEntity.think(timeSinceLastTick);
		}
	}

	handleCollision() {

	}
}

module.exports = Engine;