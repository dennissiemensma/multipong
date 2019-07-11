const BaseEntity = require('./entity');

class Wall extends BaseEntity {
    constructor(id, position, direction, size) {
        super(id, "wall", position, direction, size)
    }
}

module.exports = Wall;