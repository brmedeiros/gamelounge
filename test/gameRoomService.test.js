var chai = require('chai');
var should = chai.should();
var GameRoomService = require('../gameRoomService');

describe('GameRoomService', function(){
    describe('GameRoomService.serialize', function(){
	it('should serialize a gameRoom object so it can be saved in a redis db', function(){
	    var testGameRoom = {code: 'number', creator: 'mike', players: ['mike']};
	    var gameRoomService = new GameRoomService();
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
	    var gameRoomService = new GameRoomService();
	    gameRoomService.parse(testGameRoom).should.be.a('object');
	    gameRoomService.parse(testGameRoom).should.have.property('code').equal('number');
	    gameRoomService.parse(testGameRoom).should.have.property('creator').equal('mike');
	    gameRoomService.parse(testGameRoom).should.have.property('players');
	    gameRoomService.parse(testGameRoom).players.should.be.a('array').eql(['mike']);
	});
    });
});
