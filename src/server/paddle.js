const BaseEntity = require('./entity');
const vec2d = require('vec2d');

class Paddle extends BaseEntity {
    MINIMAL_SIZE = 25;
    SHRINK_PER_HIT = 5;

    initialSize = null;
    player = null;

    constructor(id, position, direction, size, player) {
        super(id, "paddle", position, direction, size);

        this.initialSize = size;
        this.player = player;

        this.reset();
    }

    touch() {
        if (this.size.y < this.MINIMAL_SIZE) {
            this.size.y = this.MINIMAL_SIZE
            return;
        }

        this.size.sub(vec2d(0, this.SHRINK_PER_HIT))
    }

    reset() {
        this.size = this.initialSize.clone()
    }
}

module.exports = Paddle;