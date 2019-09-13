const BaseEntity = require('./entity');
const vec2d = require('vec2d');


class Ball extends BaseEntity {
	SPEED_INCREMENT_PER_HIT = 5;  // %
	SPEED_CAP = 1500;
	MAX_RANDOM_ANGLE = 10;  // degrees

	initialSpeed = 0;  // per second
	currentSpeed = 0;
	lastBouncedEntity = null;

	constructor(id, size, initialSpeed) {
		super(id, "ball", null, null, size)
		this.initialSpeed = initialSpeed;
	}

	think(timeSinceLastTick) {
		// Velocity is per second, so make it relative to the current tick.
		let multiplier = this.currentSpeed * (timeSinceLastTick / 1000);
		let speed = vec2d(multiplier, multiplier);
		let distance = this.direction.clone().mult(speed);
		this.position.add(distance);
	}

	increaseSpeed() {
		// Increase speed a bit.
		this.currentSpeed = Math.round(this.currentSpeed * (1 + this.SPEED_INCREMENT_PER_HIT * 0.01));

		if (this.currentSpeed > this.SPEED_CAP) {
			this.currentSpeed = this.SPEED_CAP;
		}
	}

	bounce(otherEntity) {
		// Make sure we do not bounce again at the same position and therefor bug out of bounds.
		if (otherEntity == this.lastBouncedEntity) {
			return;
		}

		// Plot a line perpendicular to the entity we just hit.
		let perpendicularDirection = vec2d(-otherEntity.direction.y, otherEntity.direction.x);
		this.direction.reflect(perpendicularDirection).normalize();

		// Prevent re-calculation next tick.
		this.lastBouncedEntity = otherEntity;
	}

	randomlyAdjustAngle() {
		// Add a random change to the angle.
		let randomAngle = Math.random() * (Math.random() < 0.5 ? -1 : 1) * this.MAX_RANDOM_ANGLE;

		// https://matthew-brett.github.io/teaching/rotation_2d.html
		let radianAngle = randomAngle * (Math.PI / 180);
		let newX = this.direction.x * Math.cos(radianAngle) - this.direction.y * Math.sin(radianAngle);
		let newY = this.direction.x * Math.sin(radianAngle) + this.direction.y * Math.cos(radianAngle);
		this.direction = vec2d(newX, newY).normalize();
	}

	getRandomDirection() {
		let x = Math.random() < 0.5 ? -1 : 1;
		let y = Math.random() * 0.5 * (Math.random() < 0.5 ? -1 : 1);
		return vec2d(x, y).normalized();
	}

	reset() {

		this.position = vec2d(0, 0);
		this.direction = this.getRandomDirection();
		this.currentSpeed = this.initialSpeed;
		this.lastBouncedEntity = null;
	}
}

module.exports = Ball;