class Player {
	socket;
	name;
	score = 0;
	clientMessages = []
	
	constructor(socket, name) {
		this.socket = socket;
		this.name = name;
	}
	
	getClientMessages() {
		messages = this.clientMessages.clone();
		this.clientMessages = []
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