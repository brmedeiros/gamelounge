var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server');
var should = chai.should();

chai.use(chaiHttp);

describe('server', function() {

    after(function() {
	server.close();
    });

    it('should create a game room with the correct request', function(done) {
	chai.request(server)
	    .post('/new-room')
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
	chai.request(server)
	    .post('/new-room')
	    .end(function(err, res) {
		res.should.have.status(400);//bad request
		res.body.should.be.a('object');
		res.body.should.have.property('errorMsg')
		    .equal("please send an object with a username, e.g.:{username:john}");
		done();
	    });
    });

    it('should respond with error 422 when the post has a blank username', function(done){
	chai.request(server)
	    .post('/new-room')
	    .send({username: ''})
	    .end(function(err, res) {
		res.should.have.status(422);//unprocessable entity
		res.body.should.be.a('object');
		res.body.should.have.property('errorMsg')
		    .equal("please send an object with a username, e.g.:{username:john}");
		done();
	    });
    });

    it('should add a player to previously created room', function(done){
	var gameCode;
	chai.request(server)
	    .post('/new-room')
	    .send({username: 'jonh'})
	    .end(function(err, res) {
		gameCode = res.body.code;
		chai.request(server)
		    .post('/join-room')
		    .send({code: gameCode,
			   username: 'mike'})
		    .end(function(err, res) {
			res.should.have.status(200);
			res.body.should.be.a('object');
			res.body.should.have.property('code');
			res.body.should.have.property('creator').equal('jonh');
			res.body.should.have.property('players');
			res.body.players.should.be.a('array');
			res.body.players.should.contains('jonh', 'mike');
			done();
		    });
	    });

    });

    it('should respond with 404 when trying to access a room that does not exist', function(done){
	chai.request(server)
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
	chai.request(server)
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
	chai.request(server)
	    .post('/new-room')
	    .send({username: 'jonh'})
	    .end(function(err, res) {
		gameCode = res.body.code;
		chai.request(server)
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
	chai.request(server)
	    .post('/new-room')
	    .send({username: 'jonh'})
	    .end(function(err, res) {
		gameCode = res.body.code;
		chai.request(server)
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
	chai.request(server)
	    .post('/new-room')
	    .send({username: 'jonh'})
	    .end(function(err, res) {
		gameCode = res.body.code;
		chai.request(server)
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

    it('should validate a correct game code', function(done) {
	var gameCode;
	chai.request(server)
	    .post('/new-room')
	    .send({username: 'jonh'})
	    .end(function(err, res){
		gameCode = res.body.code;
		chai.request(server)
		    .post('/validate-room')
		    .send({code: gameCode})
		    .end(function(err, res) {
			res.should.have.status(200);
			res.body.should.be.a('string');
			res.body.should.be.equal('true');
			done();
		    });
	    });
    });

    it('should not validate a incorrect game code', function(done) {
	var gameCode;
	chai.request(server)
	    .post('/new-room')
	    .send({username: 'jonh'})
	    .end(function(err, res){
		gameCode = res.body.code;
		chai.request(server)
		    .post('/validate-room')
		    .send({code: gameCode + 'z'})
		    .end(function(err, res) {
			res.should.have.status(200);
			res.body.should.be.a('string');
			res.body.should.be.equal('enter a valid code');
			done();
		    });
	    });
    });

    it('should respond with 400 when there no code sent for remote validation', function(done) {
	chai.request(server)
	    .post('/validate-room')
	    .end(function(err, res) {
		res.should.have.status(400);
		res.body.should.be.a('object');
		res.body.should.have.property('errorMsg')
		    .equal('please send an object with a valid code');
		done();
	    });
    });

    it('should respond with 422 when the code sent for remote validation is empty', function(done) {
	chai.request(server)
	    .post('/validate-room')
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
