class Player {
	socket;
	name;
	score = 0;
	clientMessages = []
	
	constructor(socket, name) {
		this.socket = socket;
		this.name = name;
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