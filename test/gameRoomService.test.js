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

    describe('GameRoomService.serialize', function(){
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

    describe('GameRoomService.parse', function() {
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

    describe('GameRoomService.saveRoom', function() {
	it('should save a game room and all its properties to redis when a game is created', function(done) {
	    var testGameRoom = {code: 'number', creator: 'mike', players: ['mike']};
	    var gameRoomService = new GameRoomService(server.redisClient);
	    gameRoomService.save(testGameRoom).should.eventually.be.a('string').equal('saved');
	    server.redisClient.keysAsync('number').should.eventually.be.a('array').eql(['number']);
	    done();
	});
    });
});
