var restify = require('restify');
var CookieParser = require('restify-cookies');
var redis = require("redis");
var bluebird = require("bluebird");
var GameRoomService = require('./gameRoomService');
const uuidv4 = require('uuid/v4');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

function checkCookie(req, res, next) {
    if (!req.cookies['userid']) {
	res.setCookie('userid', uuidv4());
    }
    return next();
}

function codeGen(codeLength) {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
    var code = '';
    for (var i = 0; i < codeLength; ++i) {
	code += chars[Math.floor(Math.random()*chars.length)];
    }
    return code;
}

function GameRoom(creator, code) {
    this.code = code;
    this.creator = creator;
    this.players = [creator];
}

function createRoom(req, res, next) {
    if (!req.body) {
	res.send(400, {errorMsg: 'please send an object with a username, e.g.:{username:john}'});
	next();

    } else if (!req.body.username) {
	res.send(422, {errorMsg: 'please send an object with a username, e.g.:{username:john}'});
	next();

    } else {

	var code = codeGen(5);
	var newGameRoom  = new GameRoom(req.body.username, code);

	gameRoomService.save(newGameRoom)
	    .then((reply) => {
		res.json(newGameRoom);
		next();
	    }).catch((err) => {
		if(err instanceof GameRoomService.TimeoutError) {
		    res.send(504, {errorMSg: 'Timeout error...'});
		    next();
		} else {
		    res.send(500, {errorMSg: 'Persistance error...'});
		    next();
		}
	    });
    }
}

function joinRoom(req, res, next) {
    if (!req.body) {
	res.send(400, {errorMsg: 'please send an object with a code and username'});
	next();

    } else if (!req.body.username || !req.body.code) {
	res.send(422, {errorMsg: 'please send an object with a code and username'});
	next();

    } else {

	gameRoomService.update(req.body.code, req.body.username)
	    .then(function(reply) {
		res.json(reply);
		next();
	    }).catch(function(err) {
		if (err instanceof GameRoomService.TimeoutError) {
		    res.send(504, {errorMsg: 'Timeout error...'});
		    next();
		} else {
		    res.send(404, {errorMsg: 'please send a valid code'});
		    next();
		}
	    });
    }
}

function validateCode(req, res, next) {
    if (!req.body) {
	res.send(400, {errorMsg: 'please send an object with a valid code'});
	next();

    } else if (!req.body.code) {
	res.send(422, {errorMsg: 'please send an object with a valid code'});
	next();

    } else {

	gameRoomService.validateCode(req.body.code)
	    .then((reply) => {
		res.json('true');
		next();
	    }).catch((err) => {
		if (err instanceof GameRoomService.TimeoutError) {
		    res.send(504, {errorMsg: 'Timeout error...'});
		    next();
		} else {
		    res.json('enter a valid code'); //invalid form msg
		    next();
		}
	    });
    }
}

function validateUsername(req, res, next) {
    if (!req.body) {
	res.send(400, {errorMsg: 'please send an object with a valid username'});
	next();

    } else if (!req.body.username) {
	res.send(422, {errorMsg: 'please send an object with a valid username'});
	next();

    } else if (!req.body.code) {
	res.json('true');
	next();

    } else {

	gameRoomService.validateUsername(req.body.code, req.body.username)
	    .then((reply) => {
		res.json(reply);
		next();
	    }).catch((err) => {
		if (err instanceof GameRoomService.TimeoutError) {
		    res.send(504, {errorMsg: 'Timeout error...'});
		    next();
		} else {
		res.json('true');
		next();
		}
	    });
    }
}

var server = restify.createServer({name: 'Game Lounge'});
var client = redis.createClient({host: 'localhost', port: 6379});
var gameRoomService = new GameRoomService(client);

client.on('connect', function() {
    console.log('Redis ready');
});

client.on('error', function() {
    console.log('Redis error');
});

server.use(CookieParser.parse); //restify cookie handler
server.use(checkCookie); //our handler for verifying/creating cookies
server.use(restify.plugins.bodyParser()); //restify handler for parsing post body params

server.post('/create-room', createRoom);
server.post('/join-room', joinRoom);
server.post('/validate-code', validateCode);
server.post('/validate-username', validateUsername);

server.get(/.*/, restify.plugins.serveStatic({
    'directory': __dirname,
    'default': 'home.html'
}));

server.listen(8080, function() {
    console.log('%s listening at %s', server.name, server.url);
});

module.exports = {
    restifyServer: server
};
