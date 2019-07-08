const BaseEntity = require('./entity');

class Paddle extends BaseEntity {
    constructor(id, position, direction, size) {
        super(id, "paddle", position, direction, size)
    }
}

module.exports = Paddle;