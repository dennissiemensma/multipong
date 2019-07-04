const BaseEntity = require('./entity');
const vec2d = require('vec2d');


class Ball extends BaseEntity {
	TYPE = "ball"
	velocity = 5;

	move() {
		let speed = vec2d(this.velocity, this.velocity);
		let distance = this.direction.clone().mult(speed);
		this.position.add(distance);
	}
}

module.exports = Ball;