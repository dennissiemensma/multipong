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

	collidesWith(otherEntity) {
		// http://jeffreythompson.org/collision-detection/rect-rect.php
		let r1x = this.position.x - this.size.x / 2;
		let r1y = this.position.y - this.size.y / 2;
		let r1w = this.size.x;
		let r1h = this.size.y;

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


	// Called each tick
	think(timeSinceLastTick) {}

	// On ball hit.
	touch() {}

	// After each goal.
	reset() {}
}

module.exports = BaseEntity;