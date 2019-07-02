const BaseEntity = require('./entity');
var Vec2D = require('vector2d');


class Ball extends BaseEntity {
	velocity = 0;
	
	constructor(position, size, direction) {
		super(
			new Vec2D.Vector(0, 0),
			new Vec2D.Vector(1, 1),
			new Vec2D.Vector(0.5, 0.5)
		);
	}
}

module.exports = Ball;