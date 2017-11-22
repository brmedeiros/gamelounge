var GameRoomService = require('../gameRoomService');
var server = require('../server');
var chai = require('chai');
var chaiAsPromised = require("chai-as-promised");
var should = chai.should();

chai.use(chaiAsPromised);

describe('GameRoomService', function(){

    after(function() {
	server.restifyServer.close();
	server.redisClient.quit();
    });

    afterEach(function() {
	server.redisClient.flushdb();
    });

    describe('serialize', function(){
	it('should serialize a gameRoom object so it can be saved in a redis db', function(){
	    var testGameRoom = {code: 'number', creator: 'mike', players: ['mike']};
	    var gameRoomService = new GameRoomService(server.redisClient);
	    gameRoomService.serialize(testGameRoom).should.be.a('object');
	    gameRoomService.serialize(testGameRoom).should.have.property('code').equal('number');
	    gameRoomService.serialize(testGameRoom).should.have.property('creator').equal('mike');
	    gameRoomService.serialize(testGameRoom).should.have.property('players');
	    gameRoomService.serialize(testGameRoom).players.should.be.a('string').equal('["mike"]');
	});
    });

    describe('parse', function() {
	it('should parse a serialized gameRoom', function() {
	    var testGameRoom = {code: 'number', creator: 'mike', players: '["mike"]'};
	    var gameRoomService = new GameRoomService(server.redisClient);
	    gameRoomService.parse(testGameRoom).should.be.a('object');
	    gameRoomService.parse(testGameRoom).should.have.property('code').equal('number');
	    gameRoomService.parse(testGameRoom).should.have.property('creator').equal('mike');
	    gameRoomService.parse(testGameRoom).should.have.property('players');
	    gameRoomService.parse(testGameRoom).players.should.be.a('array').eql(['mike']);
	});
    });

    describe('save', function() {
	it('should return "OK" when it is successful', function() {
	    var testGameRoom = {code: 'number', creator: 'mike', players: ['mike']};
	    var gameRoomService = new GameRoomService(server.redisClient);
	    var test = gameRoomService.save(testGameRoom);
	    return test.should.eventually.be.a('string').equal('OK');
	});

	it('should save a game room and all its properties to redis when a game is created', function() {
	    var testGameRoom = {code: 'number', creator: 'mike', players: ['mike']};
	    var gameRoomService = new GameRoomService(server.redisClient);
	    gameRoomService.save(testGameRoom);
	    var test = server.redisClient.keysAsync('number');
	    return test.should.eventually.be.a('array').eql(['number']);
	});

    });

    describe('update', function() {
	it('should return the updated game room when it is successful', function() {
	    var testGameRoom = {code: 'number', creator: 'mike', players: ['mike','wike']};
	    var newPlayer = 'tike';
	    var gameRoomService = new GameRoomService(server.redisClient);
	    return gameRoomService.save(testGameRoom)
		.then(function() {
		    var test = gameRoomService.update('number', newPlayer);
		    test.should.eventually.be.a('object')
			.and.should.eventually.have.property('players').equal('["mike","wike","tike"]');
		});
	});
    });

    describe('validateCode', () => {
	it('should validate a code with if the room exists', () => {
	    var testGameRoom = {code: 'number', creator: 'mike', players: ['mike','wike']};
	    var gameRoomService = new GameRoomService(server.redisClient);
	    return gameRoomService.save(testGameRoom).then(() => {
		var test = gameRoomService.validateCode('number');
		test.should.eventually.be.a('object')
		    .and.should.eventually.include({creator: 'mike'})
		    .and.should.eventually.have.property('players').equal('["mike","wike"]');
	    });
	});

	it('should not validate a room when if the room does not exist', () => {
	    var gameRoomService = new GameRoomService(server.redisClient);
	    var test = gameRoomService.validateCode('invalidcode');
	    test.should.eventually.be.rejectedWith('invalid code');
	});
    });

    describe('validateUsername', () => {
	it('should not validate a username with if the room exists and the name is in use', () => {
	    var testGameRoom = {code: 'number', creator: 'mike', players: ['mike','wike']};
	    var newPlayer = 'mike';
	    var gameRoomService = new GameRoomService(server.redisClient);
	    return gameRoomService.save(testGameRoom).then(() => {
		var test = gameRoomService.validateUsername('number', newPlayer);
		test.should.eventually.be.a('string').equal('name already in use');
	    });
	});

	it('should validate a username with if the room exists and the name is not in use', () => {
	    var testGameRoom = {code: 'number', creator: 'mike', players: ['mike','wike']};
	    var newPlayer = 'tike';
	    var gameRoomService = new GameRoomService(server.redisClient);
	    return gameRoomService.save(testGameRoom).then(() => {
		var test = gameRoomService.validateUsername('number', newPlayer);
		test.should.eventually.be.a('string').equal('true');
	    });
	});

	it('should validate a username with if the room does not exist', () => {
	    var testGameRoom = {code: 'number', creator: 'mike', players: ['mike','wike']};
	    var newPlayer = 'mike';
	    var gameRoomService = new GameRoomService(server.redisClient);
	    return gameRoomService.save(testGameRoom).then(() => {
		var test = gameRoomService.validateUsername('invalidcode', newPlayer);
		test.should.eventually.be.rejectedWith('invalid code');
	    });
	});
    });
});
