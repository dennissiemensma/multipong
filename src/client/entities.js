class BaseEntity {
    id;
    type;
    position;
    size;
    direction;

    constructor(id, type, position, size, direction) {
        this.id = id;
        this.type = type;
        this.position = position;
        this.size = size;
        this.direction = direction;
    }

    dump() {
        return {
            'id': this.id,
            'type': this.type,
            'position': this.position,
            'size': this.size,
            'direction': this.direction
        }
    }
}