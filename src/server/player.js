class Player {
	socket;
	name;
	score = 0;
	
	constructor(socket, name) {
		this.socket = socket;
		this.name = name;
	}
	
	sendMessage(message) {
		this.socket.emit("serverMessage", message);
	}
}

module.exports = Player;