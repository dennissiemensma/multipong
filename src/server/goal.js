const BaseEntity = require('./entity');

class Goal extends BaseEntity {
    constructor(id, position, direction, size) {
        super(id, "goal", position, direction, size)
    }
}

module.exports = Goal;