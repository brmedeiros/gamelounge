var chai = require('chai');
var chaiHttp = require('chai-http');
var redis = require('redis');
var fakeredis = require('fakeredis');
var should = chai.should();
var bluebird = require('bluebird');

redis.createClient = function() {
    return fakeredis.createClient();
};

bluebird.promisifyAll(fakeredis.RedisClient.prototype);
bluebird.promisifyAll(fakeredis.Multi.prototype);

var server = require('../server');

chai.use(chaiHttp);

describe('server', function() {

    after(function() {
	server.restifyServer.close();
    });

    describe('createRoom', function() {
	it('should create a game room with the correct request', function(done) {
	    chai.request(server.restifyServer)
		.post('/create-room')
		.send({username: 'jonh'})
		.end(function(err, res) {
		    res.should.have.status(200);
		    res.body.should.be.a('object');
		    res.body.should.have.property('code');
		    res.body.should.have.property('creator').equal('jonh');
		    res.body.should.have.property('players');
		    res.body.players.should.be.a('array');
		    res.body.players.should.contain('jonh');
		    done();
		});
	});

	it('should respond with error 400 when the post is empty', function(done) {
	    chai.request(server.restifyServer)
		.post('/create-room')
		.end(function(err, res) {
		    res.should.have.status(400);//bad request
		    res.body.should.be.a('object');
		    res.body.should.have.property('errorMsg')
			.equal("please send an object with a username, e.g.:{username:john}");
		    done();
		});
	});

	it('should respond with error 422 when the post has a blank username', function(done){
	    chai.request(server.restifyServer)
		.post('/create-room')
		.send({username: ''})
		.end(function(err, res) {
		    res.should.have.status(422);//unprocessable entity
		    res.body.should.be.a('object');
		    res.body.should.have.property('errorMsg')
			.equal("please send an object with a username, e.g.:{username:john}");
		    done();
		});
	});
    });

    describe('joinRoom', function() {
	it('should add a player to previously created room', function(done){
	    var gameCode;
	    chai.request(server.restifyServer)
		.post('/create-room')
		.send({username: 'jonh'})
		.end(function(err, res) {
		    gameCode = res.body.code;
		    chai.request(server.restifyServer)
			.post('/join-room')
			.send({code: gameCode,
			       username: 'mike'})
			.end(function(err, res) {
			    res.should.have.status(200);
			    res.body.should.be.a('object');
			    res.body.should.have.property('code');
			    res.body.should.have.property('creator').equal('jonh');
			    res.body.should.have.property('players');
			    res.body.players.should.be.a('string');
			    res.body.players.should.contains('jonh', 'mike');
			    done();
			});
		});

	});

	it('should respond with 404 when trying to access a room that does not exist', function(done){
	    chai.request(server.restifyServer)
		.post('/join-room')
		.send({code: 'tt404',
		       username: 'mike'})
		.end(function(err, res) {
		    res.should.have.status(404);
		    res.body.should.be.a('object');
		    res.body.should.have.property('errorMsg')
			.equal('please send a valid code');
		    done();
		});
	});

	it('should respond with 400 when the post is empty', function(done){
	    chai.request(server.restifyServer)
		.post('/join-room')
		.end(function(err, res) {
		    res.should.have.status(400);
		    res.body.should.be.a('object');
		    res.body.should.have.property('errorMsg')
			.equal('please send an object with a code and username');
		    done();
		});
	});

	it('should respond with 422 when the username is blank', function(done){
	    var gameCode;
	    chai.request(server.restifyServer)
		.post('/create-room')
		.send({username: 'jonh'})
		.end(function(err, res) {
		    gameCode = res.body.code;
		    chai.request(server.restifyServer)
			.post('/join-room')
			.send({code: gameCode,
			       username: ''})
			.end(function(err, res) {
			    res.should.have.status(422);
			    res.body.should.be.a('object');
			    res.body.should.have.property('errorMsg')
				.equal('please send an object with a code and username');
			    done();
			});
		});

	});

	it('should respond with 422 when the code is blank', function(done){
	    var gameCode;
	    chai.request(server.restifyServer)
		.post('/create-room')
		.send({username: 'jonh'})
		.end(function(err, res) {
		    gameCode = res.body.code;
		    chai.request(server.restifyServer)
			.post('/join-room')
			.send({code: '',
			       username: 'mike'})
			.end(function(err, res) {
			    res.should.have.status(422);
			    res.body.should.be.a('object');
			    res.body.should.have.property('errorMsg')
				.equal('please send an object with a code and username');
			    done();
			});
		});
	});

	it('should respond with 422 the request object does not contain username or code properties', function(done){
	    var gameCode;
	    chai.request(server.restifyServer)
		.post('/create-room')
		.send({username: 'jonh'})
		.end(function(err, res) {
		    gameCode = res.body.code;
		    chai.request(server.restifyServer)
			.post('/join-room')
			.send({a: '1',
			       b: '2'})
			.end(function(err, res) {
			    res.should.have.status(422);
			    res.body.should.be.a('object');
			    res.body.should.have.property('errorMsg')
				.equal('please send an object with a code and username');
			    done();
			});
		});
	});
    });

    describe('validateCode', function() {
	it('should validate a correct game code', function(done) {
	    var gameCode;
	    chai.request(server.restifyServer)
		.post('/create-room')
		.send({username: 'jonh'})
		.end(function(err, res){
		    gameCode = res.body.code;
		    chai.request(server.restifyServer)
			.post('/validate-code')
			.send({code: gameCode})
			.end(function(err, res) {
			    res.should.have.status(200);
			    res.body.should.be.a('string');
			    res.body.should.be.equal('true');
			    done();
			});
		});
	});

	it('should not validate an incorrect game code', function(done) {
	    var gameCode;
	    chai.request(server.restifyServer)
		.post('/create-room')
		.send({username: 'jonh'})
		.end(function(err, res){
		    gameCode = res.body.code;
		    chai.request(server.restifyServer)
			.post('/validate-code')
			.send({code: gameCode + 'z'})
			.end(function(err, res) {
			    res.should.have.status(200);
			    res.body.should.be.a('string');
			    res.body.should.be.equal('enter a valid code');
			    done();
			});
		});
	});

	it('should respond with 400 when the validation post is empty', function(done) {
	    chai.request(server.restifyServer)
		.post('/validate-code')
		.end(function(err, res) {
		    res.should.have.status(400);
		    res.body.should.be.a('object');
		    res.body.should.have.property('errorMsg')
			.equal('please send an object with a valid code');
		    done();
		});
	});

	it('should respond with 422 when the code sent for remote validation is empty', function(done) {
	    chai.request(server.restifyServer)
		.post('/validate-code')
		.send({code: ''})
		.end(function(err, res) {
		    res.should.have.status(422);
		    res.body.should.be.a('object');
		    res.body.should.have.property('errorMsg')
			.equal('please send an object with a valid code');
		    done();
		});
	});
    });

    describe('validateUsername', function() {
	it('should validate a name when no code is provided while trying to join a room', function(done) {
	    var userName;
	    chai.request(server.restifyServer)
		.post('/create-room')
		.send({username: 'mike'})
		.end(function(err, res){
		    userName = res.body.creator;
		    chai.request(server.restifyServer)
			.post('/validate-username')
			.send({username: userName})
			.end(function(err, res){
			    res.should.have.status(200);
			    res.body.should.be.a('string');
			    res.body.should.equal('true');
			    done();
			});
		});
	});

	it('should validate a name when an invalid code is provided while trying to join a room', function(done) {
	    var userName;
	    var gameCode;
	    chai.request(server.restifyServer)
		.post('/create-room')
		.send({username: 'mike'})
		.end(function(err, res){
		    userName = res.body.creator;
		    gameCode = res.body.code + 'a';
		    chai.request(server.restifyServer)
			.post('/validate-username')
			.send({username: userName,
			       code: gameCode})
			.end(function(err, res){
			    res.should.have.status(200);
			    res.body.should.be.a('string');
			    res.body.should.equal('true');
			    done();
			});
		});
	});

	it('should not validate a name equal to the game creator when joining a room', function(done) {
	    var userName;
	    var gameCode;
	    chai.request(server.restifyServer)
		.post('/create-room')
		.send({username: 'mike'})
		.end(function(err, res){
		    userName = res.body.creator;
		    gameCode = res.body.code;
		    chai.request(server.restifyServer)
			.post('/validate-username')
			.send({username: userName,
			       code: gameCode})
			.end(function(err, res){
			    res.should.have.status(200);
			    res.body.should.be.a('string');
			    res.body.should.equal('name already in use');
			    done();
			});
		});
	});

	it('should not validate a name already in use by any of the players in the room when trying to join it', function(done) {
	    var gameCode;
	    chai.request(server.restifyServer)
		.post('/create-room')
		.send({username: 'mike'})
		.end(function(err, res){
		    gameCode = res.body.code;
		    chai.request(server.restifyServer)
			.post('/join-room')
			.send({username: 'wike',
			       code: gameCode})
			.end(function(err, res){
			    chai.request(server.restifyServer)
				.post('/validate-username')
				.send({username: 'wike',
				       code: gameCode})
				.end(function(err, res){
				    res.should.have.status(200);
				    res.body.should.be.a('string');
				    res.body.should.equal('name already in use');
				    done();
				});
			});
		});
	});

	it('should validate a name different than any of names used in a valid game room', function(done) {
	    var gameCode;
	    chai.request(server.restifyServer)
		.post('/create-room')
		.send({username: 'mike'})
		.end(function(err, res){
		    gameCode = res.body.code;
		    chai.request(server.restifyServer)
			.post('/join-room')
			.send({username: 'wike',
			       code: gameCode})
			.end(function(err, res){
			    chai.request(server.restifyServer)
				.post('/validate-username')
				.send({username: 'tike',
				       code: gameCode})
				.end(function(err, res){
				    res.should.have.status(200);
				    res.body.should.be.a('string');
				    res.body.should.equal('true');
				    done();
				});
			});
		});
	});

	it('should respond with 400 when the validation post is empty', function(done) {
	    chai.request(server.restifyServer)
		.post('/validate-username')
		.end(function(err, res) {
		    res.should.have.status(400);
		    res.body.should.be.a('object');
		    res.body.should.have.property('errorMsg')
			.equal('please send an object with a valid username');
		    done();
		});
	});

	it('should respond with 422 when the username sent for remote validation is empty', function(done) {
	    chai.request(server.restifyServer)
		.post('/validate-username')
		.send({username: ''})
		.end(function(err, res) {
		    res.should.have.status(422);
		    res.body.should.be.a('object');
		    res.body.should.have.property('errorMsg')
			.equal('please send an object with a valid username');
		    done();
		});
	});

    });
});
