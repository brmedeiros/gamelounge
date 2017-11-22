var pTimeout = require('promise-timeout');

function GameRoomService(redisClient) {
    this.redisClient = redisClient;
}

GameRoomService.prototype.serialize = function(gameRoom) {
    var gameRoomCopy = Object.assign({}, gameRoom);
    gameRoomCopy.players = JSON.stringify(gameRoom.players);
    return gameRoomCopy;
};

GameRoomService.prototype.parse = function(gameRoomSerialized) {
    var gameRoomSerializedCopy = Object.assign({}, gameRoomSerialized);
    gameRoomSerializedCopy.players = JSON.parse(gameRoomSerialized.players);
    return gameRoomSerializedCopy;
};

GameRoomService.prototype.save = function(gameRoom) {
    var gameRoomCopy = Object.assign({}, gameRoom);
    gameRoomCopy = this.serialize(gameRoom);

    return pTimeout.timeout(this.redisClient.hmsetAsync(gameRoomCopy.code, gameRoomCopy), 1000)
	.then(function(reply) {
	    return reply;
	}).catch(function(err) {
	    if (err instanceof pTimeout.TimeoutError) {
		throw new GameRoomService.TimeoutError('Redis timeout');
	    } else throw new GameRoomService.PersistenceError('Redis internal Error');
	});
};

GameRoomService.prototype.update = function(code, username) {
    var updatedGameRoom;
    var self = this;
    return pTimeout.timeout(this.redisClient.hgetallAsync(code), 1000)
	.then(function(reply) {
	    reply = self.parse(reply);
	    reply.players.push(username);
	    reply = self.serialize(reply);
	    updatedGameRoom = Object.assign({}, reply);
	    return self.redisClient.hmsetAsync(code, 'players', reply.players);
	}).then(function(reply) {
	    return updatedGameRoom;
	}).catch(function(err) {
	    if (err instanceof pTimeout.TimeoutError) {
		throw new GameRoomService.TimeoutError('Timeout Error');
	    } else throw new GameRoomService.PersistenceError('Persistance Error');
	});
};

GameRoomService.prototype.validateCode = function(code) {
    return pTimeout.timeout(this.redisClient.hgetallAsync(code), 1000)
	.then((reply) => {
	    if (reply == null) throw Error;
	    else return reply;
	}).catch((err) => {
	    if (err instanceof pTimeout.TimeoutError) {
		throw new GameRoomService.TimeoutError('Timeout Error');
	    } else throw Error('invalid code');
	});
};

GameRoomService.prototype.validateUsername = function(code, username) {
    return pTimeout.timeout(this.redisClient.hgetallAsync(code), 1000)
	.then((reply) => {
	    if (reply == null) throw Error;
	    else if (this.parse(reply).players.includes(username)) return 'name already in use';
	    else return 'true';
	}).catch((err) => {
	    if (err instanceof pTimeout.TimeoutError) {
		throw new GameRoomService.TimeoutError('Timeout Error');
	    } else throw Error('invalid code');
	});
};

GameRoomService.PersistenceError = class extends Error {};
GameRoomService.TimeoutError = class extends pTimeout.TimeoutError {};

module.exports = GameRoomService;
