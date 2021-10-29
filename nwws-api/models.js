/**
 * @param {number} players_current
 * @param {number} players_maximum
 * @param {number} queue_current
 * @param {number} queue_wait_time_minutes
 * @param {string} status_enum
 */
class World {
    /**
     * @param {number} players_current
     * @param {number} players_maximum
     * @param {number} queue_current
     * @param {number} queue_wait_time_minutes
     * @param {string} status_enum
     */
    constructor(players_current, players_maximum, queue_current, queue_wait_time_minutes, status_enum) {
        this.players_current = players_current
        this.players_maximum = players_maximum
        this.queue_current = queue_current
        this.queue_wait_time_minutes = queue_wait_time_minutes
        this.status_enum = status_enum
    }

    /**
     * @param {Array<World>} data
     */
    static fromResponse = (data) => {
        return new World(data.players_current, data.players_maximum, data.queue_current, data.queue_wait_time_minutes, data.status_enum)
    }
}

class Worlds {
    /**
     * @param {string} identifier
     * @param {string} name
     * @param {string} type
     * @param {string} serialized_type
     */
    constructor(identifier, name, type, serialized_type) {
        this.identifier = identifier
        this.name = name
        this.type = type
        this.serialized_type = serialized_type
    }
}

class WorldSet {
    /**
     * @param {string} identifier
     * @param {string} name
     * @param {string} type
     * @param {string} serialized_type
     */
    constructor(identifier, name, type, serialized_type) {
        this.identifier = identifier
        this.name = name
        this.type = type
        this.serialized_type = serialized_type
    }
}

class WorldSets {
    /**
     * @param {string} identifier
     * @param {string} name
     * @param {string} type
     * @param {string} serialized_type
     */
    constructor(identifier, name, type, serialized_type) {
        this.identifier = identifier
        this.name = name
        this.type = type
        this.serialized_type = serialized_type
    }
}

module.exports = {
    World: World,
    Worlds: Worlds,
    WorldSet: WorldSet,
    WorldSets, WorldSets
}