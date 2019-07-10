const BaseEntity = require('./entity');

class Goal extends BaseEntity {
    scoringPlayer = null;

    constructor(id, position, direction, size, scoringPlayer) {
        super(id, "goal", position, direction, size)
        this.scoringPlayer = scoringPlayer;
    }

    touch() {
        this.scoringPlayer.lifes--;
    }
}

module.exports = Goal;