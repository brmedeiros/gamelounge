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
    if (req.body == undefined) {
	res.send(400, {errorMsg: 'please send an object with a username, e.g.:{username:john}'});
	next();

    } else if (req.body.username == '' || req.body.username == undefined) {
	res.send(422, {errorMsg: 'please send an object with a username, e.g.:{username:john}'});
	next();

    } else {

	var code = codeGen(5);
	var newGameRoom  = new GameRoom(req.body.username, code);

	var redisTimeout = setTimeout(function() {
	    console.log('redisServer timeout...');
	    res.send(504, {errorMsg: 'Redis Server Timeout...'});
	    next();
	}, 1000);

	newGameRoom = gameRoomService.serialize(newGameRoom);
	client.hmsetAsync(code, newGameRoom)
	    .then(function(reply) {
		clearTimeout(redisTimeout);
		res.json(newGameRoom);
		next();
	    }).catch(function(err) {
		clearTimeout(redisTimeout);
		next(err);
	    });

	// gameRoomService.save(newGameRoom).then(function(reply) {
	//     if (reply == 'saved') {
	// 	res.json(newGameRoom);
	// 	next();
	//     } else if (reply == 'error') {
	// 	res.send(500, {errorMSg: 'Redis internal error...'});
	// 	next();
	//     } else if (reply == 'timeout') {
	// 	res.send(504, {errorMsg: 'Redis Server Timeout...'});
	// 	next();
	//     }
	// });
    }
}

function joinRoom(req, res, next) {
    if (req.body == undefined) {
	res.send(400, {errorMsg: 'please send an object with a code and username'});
	next();

    } else if (req.body.username == '' || req.body.code == '' || req.body.username == undefined || req.body.code == undefined) {
	res.send(422, {errorMsg: 'please send an object with a code and username'});
	next();
    } else {

    // client.hgetall(req.body.code, function(err, reply) {
    // 	if(err) {
    // 	    console.log(err);
    // 	    return next(err);
    // 	}
    // 	if(reply) {
    // 	    reply.players = JSON.parse(reply.players);
    // 	    reply.players.push(req.body.username);
    // 	    reply.players = JSON.stringify(reply.players);
    // 	    client.hmset(req.body.code, reply, function() {
    // 		if(err) {
    // 		    console.log(err);
    // 		    return next(err);
    // 		}
    // 		res.json(reply);
    // 		return next();
    // 	    });
    // 	} else {
    // 	    res.send(404, {errorMsg: 'please send a valid code'});
    // 	    return next();
    // 	}
    // });

	var redisTimeout = setTimeout(function() {
	    console.log('RedisServer timeout...');
	    res.send(504, {errorMsg: 'Redis Server Timeout...'});
	    next();
	}, 1000);

	client.hgetallAsync(req.body.code)
	    .then(function(reply) {
		reply = gameRoomService.parse(reply);
		reply.players.push(req.body.username);
		reply = gameRoomService.serialize(reply);
		client.hmsetAsync(req.body.code, 'players', reply.players)
		    .then(function() {
			clearTimeout(redisTimeout);
			res.json(reply);
			next();
		    });
	    }).catch(function(err) {
		clearTimeout(redisTimeout);
		res.send(404, {errorMsg: 'please send a valid code'});
		next();
	    });
    }
}

function validateCode(req, res, next) {
    if (req.body == undefined) {
	res.send(400, {errorMsg: 'please send an object with a valid code'});
	next();

    } else if (req.body.code == '' || req.body.code == undefined) {
	res.send(422, {errorMsg: 'please send an object with a valid code'});
	next();

    } else {

	// client.hgetallA(req.body.code, function (err, reply){
	// 	if (reply){
	// 	    res.json('true');
	// 	    return next();
	// 	} else {
	// 	    res.json('enter a valid code'); //invalid form msg
	// 	    return next();
	// 	}
	// });

	var redisTimeout = setTimeout(function() {
	    console.log('RedisServer timeout...');
	    res.send(504, {errorMsg: 'Redis Server Timeout...'});
	    next();
	}, 1000);

	client.hgetallAsync(req.body.code)
	    .then(function(reply) {
		if (reply == null) {
		    clearTimeout(redisTimeout);
		    throw Error;
		}
	    }).then(function(reply) {
		clearTimeout(redisTimeout);
		res.json('true');
		next();
	    }).catch(function(err) {
		res.json('enter a valid code'); //invalid form msg
		next();
	    });
    }
}

function validateUsername(req, res, next) {
    if (req.body == undefined) {
	res.send(400, {errorMsg: 'please send an object with a valid username'});
	next();

    } else if (req.body.username == '' || req.body.username == undefined) {
	res.send(422, {errorMsg: 'please send an object with a valid username'});
	next();

    } else if (req.body.code == '' || req.body.code == undefined) {
	res.json('true');
	next();

    } else {

	// client.hgetall(req.body.code, function (err, reply){
	// 	if (reply && JSON.parse(reply.players).includes(req.body.username)){
	// 	    res.json('name already in use');
	// 	    return next();
	// 	}
	// 	res.json('true');
	// 	return next();
	// });

	var redisTimeout = setTimeout(function() {
	    console.log('RedisServer timeout...');
	    res.send(504, {errorMsg: 'Redis Server Timeout...'});
	    next();
	}, 1000);

	client.hgetallAsync(req.body.code)
	    .then(function(reply) {
		clearTimeout(redisTimeout);
		if (JSON.parse(reply.players).includes(req.body.username)) {
		    res.json('name already in use');
		    next();
		} else {
		    res.json('true');
		    next();
		}
	    }).catch(function(err) {
		res.json('true');
		next();
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
    restifyServer: server,
    redisClient: client
};
