class BaseEntity {
	id;
	type;
	position;
	direction;
	size;

	constructor(id, position, direction, size) {
		this.id = id;
		this.type = this.TYPE;
		this.position = position;
		this.direction = direction;
		this.size = size;
	}
}

module.exports = BaseEntity;