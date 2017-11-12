var server = require('./server');

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

GameRoomService.prototype.save = function(gameRoomSerialized) {
    this.redisClient.hmset(gameRoomSerialized.code, gameRoomSerialized, function(err, reply) {
	if(err) {
	    return 'KO';
	} else {
	    console.log(reply);
	    return reply;
	}
    });
};

module.exports = GameRoomService;
