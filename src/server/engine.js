const vec2d = require('vec2d');
const Player = require('./player');
const Ball = require('./ball');
const Wall = require('./wall');
const Paddle = require('./paddle');
const Goal = require('./goal');

class Engine {
	FIELD_SIZE = vec2d(800, 600);
	PADDLE_SIZE = vec2d(10, 150);
	POINT_NORTH = vec2d(0, 1).normalized();
	POINT_EAST = vec2d(1, 0).normalized();
	POINT_SOUTH = vec2d(0, -1).normalized();
	POINT_WEST = vec2d(-1, 0).normalized();
	INITIAL_PLAYER_LIFES = 10;
	TICK_INTERVAL = 5;  // ms
	CLIENT_UPDATE_INTERVAL = 5;  // ms
	BALL_SPEED = 300;
	BORDER_SIZE = 10;

	intervalHandle = null;
	players = [];
	entities = [];

	gameStart = null;
	gameTime = null;
	lastTick = null;
	nextClientUpdate = 0;
	nextThink = 0;

	constructor(sockets) {
		for (let i = 0; i < sockets.length; i++) {
			let currentSocket = sockets[i];
			let player = new Player(currentSocket, "Noob", this.INITIAL_PLAYER_LIFES);
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

	getRealWorldTime() {
		return Date.now();
	}

	updateGameTime() {
		this.lastTick = this.gameTime;
		this.gameTime = this.getRealWorldTime() - this.gameStart;
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
				lifes: [],
				ball: {
					speed: this.entities[0].currentSpeed
				}
			},
			entities: []
		};

		for (let i = 0; i < this.players.length; i++) {
			message.game.lifes.push(this.players[i].lifes);
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
		this.gameStart = this.getRealWorldTime();
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
		let player1 = this.players[0];
		let player2 = this.players[1];

		let ball = new Ball(
			idCounter++,
			vec2d(5,5),
			this.BALL_SPEED
		)
		ball.reset()
		this.entities.push(ball);

		// Wall top and bottom.
		this.entities.push(new Wall(
			idCounter++,
			vec2d(0, -this.FIELD_SIZE.y / 2),
			this.POINT_NORTH.clone(),
			vec2d(this.FIELD_SIZE.x, this.BORDER_SIZE)
		));
		this.entities.push(new Wall(
			idCounter++,
			vec2d(0, this.FIELD_SIZE.y / 2),
			this.POINT_SOUTH.clone(),
			vec2d(this.FIELD_SIZE.x, this.BORDER_SIZE)
		));

		// Goals left and right.
		this.entities.push(new Goal(
			idCounter++,
			vec2d(-this.FIELD_SIZE.x / 2, 0),
			this.POINT_EAST.clone(),
			vec2d(this.BORDER_SIZE, this.FIELD_SIZE.y),
			player1
		));
		this.entities.push(new Goal(
			idCounter++,
			vec2d(this.FIELD_SIZE.x / 2, 0),
			this.POINT_WEST.clone(),
			vec2d(this.BORDER_SIZE, this.FIELD_SIZE.y),
			player2
		));

		// Players
		this.entities.push(new Paddle(
			idCounter++,
			vec2d(-this.FIELD_SIZE.x / 2 + 25, 0),
			this.POINT_EAST.clone(),
			this.PADDLE_SIZE,
			player1
		));
		this.entities.push(new Paddle(
			idCounter++,
			vec2d(this.FIELD_SIZE.x / 2 - 25, 0),
			this.POINT_WEST.clone(),
			this.PADDLE_SIZE,
			player2
		));
	}

	thinkEntities() {
		if (this.getGameTime() < this.nextThink) {
			return;
		}

		let timeSinceLastTick = this.getTimeSinceLastTick();

		for (let i = 0 ; i < this.entities.length ; i++) {
			let currentEntity = this.entities[i];
			currentEntity.think(timeSinceLastTick);
		}
	}

	handleCollision() {
		let ballEntity = this.entities[0];

		for (let i = 0 ; i < this.entities.length ; i++) {
			let otherEntity = this.entities[i];

			if (ballEntity.name == otherEntity.name) {
				continue;
			}

			// Rectangle collision detection.
			if (this.hasCollision(ballEntity, otherEntity)) {
				console.debug("Ball collides with", otherEntity.name, otherEntity.id)

				switch(otherEntity.name) {
					case "wall":
						ballEntity.bounce(otherEntity);
						// ballEntity.randomlyAdjustAngle();
						return;

					case "paddle":
						otherEntity.touch();
						ballEntity.bounce(otherEntity);
						ballEntity.increaseSpeed();
						return;

					case "goal":
						otherEntity.touch();
						this.checkPlayerLifes();
						this.resetEntities();
						this.nextThink = this.getGameTime() + 1000;
						return;
				}
			}
		}
	}

	hasCollision(entity, otherEntity) {
		// http://jeffreythompson.org/collision-detection/rect-rect.php
		let r1x = entity.position.x - entity.size.x / 2;
		let r1y = entity.position.y - entity.size.y / 2;
		let r1w = entity.size.x;
		let r1h = entity.size.y;

		let r2x = otherEntity.position.x - otherEntity.size.x / 2;
		let r2y = otherEntity.position.y - otherEntity.size.y / 2;
		let r2w = otherEntity.size.x;
		let r2h = otherEntity.size.y;

		if (r1x + r1w >= r2x &&    // r1 right edge past r2 left
			r1x <= r2x + r2w &&    // r1 left edge past r2 right
			r1y + r1h >= r2y &&    // r1 top edge past r2 bottom
			r1y <= r2y + r2h) {    // r1 bottom edge past r2 top
			return true;
		}

		return false;
	}

	resetEntities() {
		for (let i = 0 ; i < this.entities.length ; i++) {
			this.entities[i].reset();
		}
	}

	checkPlayerLifes() {
		for (let i = 0; i < this.players.length; i++) {
			let currentPlayer = this.players[i];

			if (currentPlayer.lifes == 0) {
				return this.endGame(currentPlayer);
			}
		}
	}

	endGame(loser) {
		// for (let i = 0; i < this.players.length; i++) {
		// 	let currentPlayer = this.players[i];
		// 	currentPlayer.emitUnreliable("GameUpdate", message);
		// }
	}
}

module.exports = Engine;