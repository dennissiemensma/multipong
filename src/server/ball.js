const BaseEntity = require('./entity');
const vec2d = require('vec2d');


class Ball extends BaseEntity {
	velocity = 0;  // per second

	constructor(id, position, direction, size, velocity) {
		super(id, "ball", position, direction, size)
		this.velocity = velocity;
	}

	think(timeSinceLastTick) {
		// Velocity is per second, so make it relative to the current tick.
		let multiplier = this.velocity * (timeSinceLastTick / 1000);
		let speed = vec2d(multiplier, multiplier);
		let distance = this.direction.clone().mult(speed);
		this.position.add(distance);
	}
}

module.exports = Ball;