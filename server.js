var restify = require('restify');
var CookieParser = require('restify-cookies');
const uuidv4 = require('uuid/v4');

function checkCookie(req, res, next) {
    if (!req.cookies['userid']) {
	res.setCookie('userid', uuidv4());
    }
    return next();
}

function codeGen() {
    var code = 'hey';
    return code;
}

function GameRoom(creator, code) {
    this.code = code;
    this.creator = creator;
    this.players = [creator];
}

var gameRoomList = [];

function createRoom(req, res, next) {
    var code = codeGen();
    var newGameRoom  = new GameRoom(req.body.username, code);
    gameRoomList.push(newGameRoom);
    res.json(newGameRoom);

    //console.log(req.body);
    console.log(gameRoomList);
    console.log('\n');

    return next();
}

function joinRoom(req, res, next) {
    console.log(req.body);
    var game;
    for (game of gameRoomList){
	if (req.body.code == game.code){
	    game.players.push(req.body.username);
	    res.json(game);

	    //console.log(req.body);
	    console.log(gameRoomList);
	    console.log('\n');

	    return next();
	}
    }
    return undefined;
}

var server = restify.createServer({name: 'Game Lounge'});
server.use(CookieParser.parse); //restify cookie handler
server.use(checkCookie); //our handler for verifying/creating cookies
server.use(restify.plugins.bodyParser()); //restify handler for parsing post body params

server.post('/new-room/', createRoom);
server.post('/join-room/', joinRoom);

server.get(/.*/, restify.plugins.serveStatic({
    'directory': __dirname,
    'default': 'home.html'
}));

server.listen(8080, function() {
    console.log('%s listening at %s', server.name, server.url);
});
