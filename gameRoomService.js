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

// GameRoomService.prototype.redisClientTimeout = function() {
//     var promise = new Promise(function(resolve, reject) {
// 	setTimeout(function() {
// 	    console.log('RedisServer timeout...');
// 	    resolve();
// 	}, 1);
// 	return promise;
//     });
// };

GameRoomService.prototype.save = function(gameRoom) {
    var gameRoomCopy = Object.assign({}, gameRoom);
    gameRoomCopy = this.serialize(gameRoom);

    // var redisTimeout = this.redisClientTimeout().then(function (done) {
    // 	return 'timeout';
    // });

    var redisTimeout = setTimeout(function() {
	console.log('RedisServer timeout...');
	return 'timeout'; //PROBLEM HERE
    }, 1000);

    return this.redisClient.hmsetAsync(gameRoomCopy.code, gameRoomCopy)
	.then(function(reply) {
	    clearTimeout(redisTimeout);
	    return 'saved';
	}).catch(function(err) {
	    clearTimeout(redisTimeout);
	    return 'error';
	});
};

module.exports = GameRoomService;
