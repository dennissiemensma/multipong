class BaseEntity {
    id;
    name;
    position;
    direction;
    size;

    constructor(id, name, position, direction, size) {
        this.id = id;
        this.name = name;
        this.position = position;
        this.direction = direction;
        this.size = size;
    }
}