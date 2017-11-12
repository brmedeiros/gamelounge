var restify = require('restify');
var CookieParser = require('restify-cookies');
var redis = require("redis");
var bluebird = require("bluebird");
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
    //this.players = [creator];
    this.players = JSON.stringify([creator]);
}

function createRoom(req, res, next) {
    if (req.body == undefined) {
	res.send(400, {errorMsg: 'please send an object with a username, e.g.:{username:john}'});
	return next();
    }

    if (req.body.username == '' || req.body.username == undefined) {
	res.send(422, {errorMsg: 'please send an object with a username, e.g.:{username:john}'});
	return next();
    }

    var code = codeGen(5);
    var newGameRoom  = new GameRoom(req.body.username, code);

    //newGameRoom = gameRoomService.serialize(newGameRoom);
    //gameRoomService.save(newGameRoom);
    //return next();

    // client.hmset(code, newGameRoom, function(err, reply) {
    // 	if (err) {
    // 	    console.log(err);
    // 	    return next(err);
    // 	}
    // 	res.json(newGameRoom);
    // 	return next();
    // });

    client.hmsetAsync(code, newGameRoom)
	.then(function(reply) {
	    res.json(newGameRoom);
	    return next();
	}).catch(function(err) {
	    return next(err);
	});
}

function joinRoom(req, res, next) {
    if (req.body == undefined) {
	res.send(400, {errorMsg: 'please send an object with a code and username'});
	return next();
    }

    if (req.body.username == '' || req.body.code == '' || req.body.username == undefined || req.body.code == undefined) {
	res.send(422, {errorMsg: 'please send an object with a code and username'});
	return next();
    }

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


    client.hgetallAsync(req.body.code)
	.then(function(reply) {
	    reply.players = JSON.parse(reply.players);
    	    reply.players.push(req.body.username);
    	    reply.players = JSON.stringify(reply.players);
	    client.hmset(req.body.code, 'players', reply.players);
	    res.json(reply);
	}).catch(function(err) {
	    res.send(404, {errorMsg: 'please send a valid code'});
	    return next();
	});
}

function validateCode(req, res, next) {
    if (req.body == undefined) {
	res.send(400, {errorMsg: 'please send an object with a valid code'});
	return next();
    }

    if (req.body.code == '' || req.body.code == undefined) {
	res.send(422, {errorMsg: 'please send an object with a valid code'});
	return next();
	}

    // client.hgetallA(req.body.code, function (err, reply){
    // 	if (reply){
    // 	    res.json('true');
    // 	    return next();
    // 	} else {
    // 	    res.json('enter a valid code'); //invalid form msg
    // 	    return next();
    // 	}
    // });

    client.hgetallAsync(req.body.code)
	.then(function(reply) {
	    if (reply == null) throw Error;
	}).then(function(reply) {
	    res.json('true');
    	    return next();
	}).catch(function(err) {
	    res.json('enter a valid code'); //invalid form msg
	    return next();
	})
}

function validateUsername(req, res, next) {
    if (req.body == undefined) {
	res.send(400, {errorMsg: 'please send an object with a valid username'});
	return next();
    }

    if (req.body.username == '' || req.body.username == undefined) {
	res.send(422, {errorMsg: 'please send an object with a valid username'});
	return next();
    }

    if (req.body.code == '' || req.body.code == undefined) {
	res.json('true');
	return next();
    }

    // client.hgetall(req.body.code, function (err, reply){
    // 	if (reply && JSON.parse(reply.players).includes(req.body.username)){
    // 	    res.json('name already in use');
    // 	    return next();
    // 	}
    // 	res.json('true');
    // 	return next();
    // });

    client.hgetallAsync(req.body.code)
	.then(function(reply) {
	    if (JSON.parse(reply.players).includes(req.body.username)) {
		res.json('name already in use');
    		return next();
	    }
	    res.json('true');
	    return next();
	}).catch(function(err) {
	    res.json('true');
	    return next();
	});
}

var server = restify.createServer({name: 'Game Lounge'});
var client = redis.createClient({host: 'localhost', port: 6379});

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
