class Player {
	socket;
	name;
	lifes = 0;
	clientMessages = []
	
	constructor(socket, name, lifes) {
		this.socket = socket;
		this.name = name;
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