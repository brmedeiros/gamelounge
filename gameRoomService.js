function GameRoomService(redisClient) {}

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

module.exports = GameRoomService;
