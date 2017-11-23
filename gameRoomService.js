var pTimeout = require('promise-timeout');

class GameRoomService {
    constructor(redisClient) {
	this.redisClient = redisClient;
    }

    serialize(gameRoom) {
	var gameRoomCopy = Object.assign({}, gameRoom);
	gameRoomCopy.players = JSON.stringify(gameRoom.players);
	return gameRoomCopy;
    }

    parse(gameRoomSerialized) {
	var gameRoomSerializedCopy = Object.assign({}, gameRoomSerialized);
	gameRoomSerializedCopy.players = JSON.parse(gameRoomSerialized.players);
	return gameRoomSerializedCopy;
    }

    save(gameRoom) {
	var gameRoomCopy = Object.assign({}, gameRoom);
	gameRoomCopy = this.serialize(gameRoom);

	return pTimeout.timeout(this.redisClient.hmsetAsync(gameRoomCopy.code, gameRoomCopy), 1000)
	    .then((reply) => {
		return reply;
	    }).catch((err) => {
		if (err instanceof pTimeout.TimeoutError) {
		    throw new GameRoomService.TimeoutError('Redis timeout');
		} else throw new GameRoomService.PersistenceError('Redis internal Error');
	    });
    }

    update(code, username) {
	var updatedGameRoom;
	return pTimeout.timeout(this.redisClient.hgetallAsync(code), 1000)
	    .then((reply) => {
		reply = this.parse(reply);
		reply.players.push(username);
		reply = this.serialize(reply);
		updatedGameRoom = Object.assign({}, reply);
		return this.redisClient.hmsetAsync(code, 'players', reply.players);
	    }).then((reply) => {
		return updatedGameRoom;
	    }).catch((err) => {
		if (err instanceof pTimeout.TimeoutError) {
		    throw new GameRoomService.TimeoutError('Timeout Error');
		} else throw new GameRoomService.PersistenceError('Persistance Error');
	    });
    }

    validateCode(code) {
	return pTimeout.timeout(this.redisClient.hgetallAsync(code), 1000)
	    .then((reply) => {
		if (!reply) throw Error;
		else return reply;
	    }).catch((err) => {
		if (err instanceof pTimeout.TimeoutError) {
		    throw new GameRoomService.TimeoutError('Timeout Error');
		} else throw Error('invalid code');
	    });
    }

    validateUsername(code, username) {
	return pTimeout.timeout(this.redisClient.hgetallAsync(code), 1000)
	    .then((reply) => {
		if (!reply) throw Error;
		else if (this.parse(reply).players.includes(username)) return 'name already in use';
		else return 'true';
	    }).catch((err) => {
		if (err instanceof pTimeout.TimeoutError) {
		    throw new GameRoomService.TimeoutError('Timeout Error');
		} else throw Error('invalid code');
	    });
    }
}

GameRoomService.PersistenceError = class extends Error {};
GameRoomService.TimeoutError = class extends pTimeout.TimeoutError {};

module.exports = GameRoomService;
