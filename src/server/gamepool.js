const Game = require('./game');

class GamePool {
	gameIdCounter = 1;
	games = [];
	
	addToGame(socket) {
		// Find any games waiting for opponent.
		let openGame = this.findOpenGame();

		if (openGame != null) {
			console.debug(" - Adding " + socket.id + " to existing game: #" + openGame.gameId)
			return openGame.addClient(socket);
		}
		
		let newGame = new Game(this.gameIdCounter);
		this.gameIdCounter ++;
		this.games.push(newGame);
		
		newGame.addClient(socket);
		console.debug(" - Adding " + socket.id + " to new game: #" + newGame.gameId)

		this.cleanUp();
	}
	
	findOpenGame() {
		for (let i = 0; i < this.games.length; i++) {
			let currentGame = this.games[i];
			
			if (! currentGame.isFull())
			{
				return currentGame;
			}
		}
		
		return null;
	}

	addClientMessage(socket, data) {
		for (let i = 0; i < this.games.length; i++) {
			let currentGame = this.games[i];

			if (currentGame.isClientHere(socket)) {
				// For now just stop the game.
				return currentGame.addClientMessage(socket, data);
			}
		}
	}
	
	removeFromGame(socket) {
		for (let i = 0; i < this.games.length; i++) {
			let currentGame = this.games[i];

			if (currentGame.isClientHere(socket)) {
				// For now just stop the game.
				console.log(">> Stopping game #", currentGame.gameId)
				currentGame.stop();
				break;
			}
		}
		
		this.cleanUp();
	}
	
	cleanUp() {
		this.games = this.games.filter(function(currentGame, index, array){
			console.log(">> Deleting game #", currentGame.gameId)
			return ! currentGame.isEmpty();
		});
		console.debug("[i] Number of games open for players: " + this.games.length);
	}

}

module.exports = GamePool;