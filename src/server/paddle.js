const BaseEntity = require('./entity');
const vec2d = require('vec2d');

class Paddle extends BaseEntity {
    SHRINK_PER_HIT = 10;

    initialSize = null;
    player = null;

    constructor(id, position, direction, size, player) {
        super(id, "paddle", position, direction, size);

        this.initialSize = size;
        this.player = player;

        this.reset();
    }

    touch() {
        this.size.sub(vec2d(0, this.SHRINK_PER_HIT))
    }

    reset() {
        this.size = this.initialSize.clone()
    }
}

module.exports = Paddle;