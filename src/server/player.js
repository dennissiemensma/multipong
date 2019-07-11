class Player {
	socket;
	lifes = 0;
	clientMessages = []
	paddle = null;
	
	constructor(socket, lifes) {
		this.socket = socket;
		this.lifes = lifes;
	}

	addClientMessage(message) {
		this.clientMessages.push(message);
	}

	getClientMessages() {
		let messages = this.clientMessages;
		this.clientMessages = [];
		return messages;
	}
	
	emitReliable(event, data) {
		this.socket.emit(event, data);
	}
	
	emitUnreliable(event, data) {
		this.socket.volatile.emit(event, data);
	}
}

module.exports = Player;