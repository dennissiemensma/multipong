var Vec2D = require('vector2d');

class BaseEntity {
	position;
	size;
	direction;
	
	constructor(position, size, direction) {
		this.position = position;
		this.size = size;
		this.direction = direction;
	}
}

module.exports = BaseEntity;