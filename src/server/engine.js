const vec2d = require('vec2d');
const Player = require('./player');
const Ball = require('./ball');
const Wall = require('./wall');
const Paddle = require('./paddle');
const Goal = require('./goal');

class Engine {
	FIELD_SIZE = vec2d(800, 600);
	PADDLE_SIZE = vec2d(5, 125);
	POINT_NORTH = vec2d(0, 1).normalized();
	POINT_EAST = vec2d(1, 0).normalized();
	POINT_SOUTH = vec2d(0, -1).normalized();
	POINT_WEST = vec2d(-1, 0).normalized();
	INITIAL_PLAYER_LIFES = 10;
	TICK_INTERVAL = 5;  // ms
	CLIENT_UPDATE_INTERVAL = 5;  // ms
	BALL_SPEED = 300;
	BORDER_SIZE = 100;

	gameId = null;
	intervalHandle = null;
	players = [];
	entities = [];

	gameStart = null;
	gameTime = null;
	lastTick = null;
	nextClientUpdate = 0;
	nextThink = 0;

	constructor(gameId, sockets) {
		this.gameId = gameId;

		for (let i = 0; i < sockets.length; i++) {
			let currentSocket = sockets[i];
			let player = new Player(currentSocket, this.INITIAL_PLAYER_LIFES);
			this.players.push(player)
		}

		this.run();
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
			type: "GameUpdate",
			game: {
				lifes: [],
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
			currentPlayer.emitUnreliable("ServerMessage", message);
		}

		this.setNextClientUpdate(this.CLIENT_UPDATE_INTERVAL);
	}
	
	run() {
		this.spawnEntities();
		this.gameStart = this.getRealWorldTime();
		this.lastTick = this.gameStart;

		this.updateGameTime();

		// Wait a bit.
		this.setNextClientUpdate(4000);
		this.setNextThink(5000);

		this.intervalHandle = setInterval(this.tick, this.TICK_INTERVAL, this);

		for (let i = 0; i < this.players.length; i++) {
			let currentPlayer = this.players[i];
			currentPlayer.emitReliable("ServerMessage", {
				type: "Announcement",
				message: "Game #" + this.gameId + " will start shortly..."
			});
		}
	}

	halt() {
		clearInterval(this.intervalHandle);
		this.players = [];
	}
	/**
	 * Single tick of the engine running. Called every X interval.
	 */
	tick(engine) {
		engine.updateGameTime();

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

			if (messages.length > 0) {
				for (let x = 0 ; x < messages.length ; x++) {
					let currentMessage = messages[x];
					currentPlayer.paddle.position.y = currentMessage.position;
				}
			}
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
			vec2d(0, -this.FIELD_SIZE.y / 2 - this.BORDER_SIZE / 2 + 5),
			this.POINT_NORTH.clone(),
			vec2d(this.FIELD_SIZE.x, this.BORDER_SIZE)
		));
		this.entities.push(new Wall(
			idCounter++,
			vec2d(0, this.FIELD_SIZE.y / 2 + this.BORDER_SIZE / 2 - 5),
			this.POINT_SOUTH.clone(),
			vec2d(this.FIELD_SIZE.x, this.BORDER_SIZE)
		));

		// Goals left and right.
		this.entities.push(new Goal(
			idCounter++,
			vec2d(-this.FIELD_SIZE.x / 2 - this.BORDER_SIZE / 2 + 5, 0),
			this.POINT_EAST.clone(),
			vec2d(this.BORDER_SIZE, this.FIELD_SIZE.y),
			player1
		));
		this.entities.push(new Goal(
			idCounter++,
			vec2d(this.FIELD_SIZE.x / 2 + this.BORDER_SIZE / 2 - 5, 0),
			this.POINT_WEST.clone(),
			vec2d(this.BORDER_SIZE, this.FIELD_SIZE.y),
			player2
		));

		// Player paddles
		let paddle1 = new Paddle(
			idCounter++,
			vec2d(-this.FIELD_SIZE.x / 2 + 25, 0),
			this.POINT_EAST.clone(),
			this.PADDLE_SIZE,
			player1
		);
		this.entities.push(paddle1);
		player1.paddle = paddle1;

		let paddle2 = new Paddle(
			idCounter++,
			vec2d(this.FIELD_SIZE.x / 2 - 25, 0),
			this.POINT_WEST.clone(),
			this.PADDLE_SIZE,
			player2
		);
		this.entities.push(paddle2);
		player2.paddle = paddle2;
	}

	resetEntities() {
		for (let i = 0 ; i < this.entities.length ; i++) {
			this.entities[i].reset();
		}
	}

	setNextThink(interval) {
		this.nextThink = this.getGameTime() + interval;
	}

	setNextClientUpdate(interval) {
		this.nextClientUpdate = this.getGameTime() + interval;
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
			if (ballEntity.collidesWith(otherEntity)) {
				// Dynamic action, implemented by entity.
				otherEntity.touch();

				switch(otherEntity.name) {
					case "wall":
						ballEntity.bounce(otherEntity);
						ballEntity.increaseSpeed();
						ballEntity.randomlyAdjustAngle();
						return;

					case "paddle":
						ballEntity.bounce(otherEntity);
						ballEntity.increaseSpeed();
						return;

					case "goal":
						this.resetEntities();
						this.setNextThink(1500);
						this.checkPlayerLifes();
						return;
				}
			}
		}
	}

	checkPlayerLifes() {
		for (let i = 0; i < this.players.length; i++) {
			let currentPlayer = this.players[i];

			if (currentPlayer.lifes == 0) {
				return this.stop(currentPlayer);
			}
		}
	}

	stop(loser) {
		for (let i = 0; i < this.players.length; i++) {
			let currentPlayer = this.players[i];
			let won = currentPlayer != loser;
			let message = won ? "Winner, winner!" : "Bummer! You've lost  =(";

			currentPlayer.emitReliable("ServerMessage", {
				type: "GameOver",
				message: message,
				won: won
			});
		}

		this.halt();
	}
}

module.exports = Engine;