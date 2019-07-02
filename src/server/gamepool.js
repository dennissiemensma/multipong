const Game = require('./game');

class GamePool {
	gameIdCounter = 1;
	games = [];
	
	addToGame(socket) {
		// Find any games waiting for opponent.
		let openGame = this.findOpenGame();

		if (openGame != null) {
			console.debug("Adding " + socket.id + " to existing game: #" + openGame.gameId)
			return openGame.addClient(socket);
		}
		
		let newGame = new Game(this.gameIdCounter);
		this.gameIdCounter ++;
		this.games.push(newGame);
		
		newGame.addClient(socket);
		console.debug("Adding " + socket.id + " to new game: #" + newGame.gameId)

		this.logStats();
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
	
	removeFromGame(socket) {
		for (let i = 0; i < this.games.length; i++) {
			let currentGame = this.games[i];

			if (currentGame.isClientHere(socket)) {
				// For now just stop the game.
				currentGame.stop();
				break;
			}
		}
		
		this.cleanUp();
		this.logStats();
	}
	
	cleanUp() {
		this.games = this.games.filter(function(currentGame, index, array){
			return ! currentGame.isEmpty();
		});
	}
	
	logStats() {
		console.debug("Number of games open for players: " + this.games.length);
	}
}

module.exports = GamePool;