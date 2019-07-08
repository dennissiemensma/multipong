class BaseEntity {
	id;
	name;
	position;
	direction;
	size;

	constructor(id, name, position, direction, size) {
		this.id = id;
		this.name = name;
		this.position = position;
		this.direction = direction;
		this.size = size;
	}

	export() {
		return {
			id: this.id,
			name: this.name,
			position: this.position,
			direction: this.direction,
			size: this.size,
		}
	}

	// Called each tick
	think(timeSinceLastTick) {}
}

module.exports = BaseEntity;