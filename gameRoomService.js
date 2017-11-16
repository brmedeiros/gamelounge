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
	    return 'saved';
	}).catch(function(err) {
	    if (err instanceof pTimeout.TimeoutError) {
		return 'timeout';
	    } else return 'error';
	});
};

GameRoomService.prototype.update = function(code, username) {
    var updatedGameRoom;
    var self = this;
    self.redisClient.hgetallAsync(code)
	.then(function(reply) {
	    reply = self.parse(reply);
	    reply.players.push(username);
	    reply = self.serialize(reply);
	    updatedGameRoom = Object.assign({}, reply);
	    return self.RedisClient.hmsetAsync(code, 'players', reply.players);
	}).then(function(reply) {
	    console.log('ok');
	    return updatedGameRoom;
	}).catch(function(err) {

	    if (err instanceof pTimeout.TimeoutError) {
		return 'timeout';
	    } else return 'error';
	});

    // return pTimeout.timeout(this.redisClient.hgetallAsync(code), 1000)
    // 	.then(function(reply) {
    // 	    reply = this.parse(reply);
    // 	    reply.players.push(newPlayer);
    // 	    reply = this.serialize(reply);
    // 	    console.log('ok');
    // 	    console.log(reply);
    // 	    return this.redisClient.hmsetAsync(reply.code, 'players', reply.players);
    // 	}).then(function(reply) {
    // 	    return 'updated';
    // 	}).catch(function(err) {
    // 	    if (err instanceof pTimeout.TimeoutError) {
    // 		return 'timeout';
    // 	    } else {
    // 		console.log('ok1');
    // 		return 'error';
    // 	    }
    // 	});


    // var gameRoomCopy = Object.assign({}, gameRoom);
    // gameRoomCopy = this.parse(gameRoomCopy);
    // gameRoomCopy.players.push(newPlayer);
    // gameRoomCopy = this.serialize(gameRoomCopy);

    // return pTimeout.timeout(this.redisClient.hmsetAsync(gameRoomCopy.code, 'players', gameRoomCopy.players), 1000)
    // 	.then(function(reply) {
    // 	    return 'updated';
    // 	}).catch(function(err) {
    // 	    if (err instanceof pTimeout.TimeoutError) {
    // 		return 'timeout';
    // 	    } else return 'error';
    // 	});
};

module.exports = GameRoomService;
