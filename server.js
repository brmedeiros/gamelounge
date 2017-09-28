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
    var code = 'hehexD';
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
    var newGameRoom  = new GameRoom(req.cookies['userid'], code);
    gameRoomList.push(newGameRoom);
    //console.log(gameRoomList);
    //console.log(req.body.code);
    //console.log('ok');
    res.send(code);
    return next();
}

var server = restify.createServer({name: 'Game Lounge'});
server.use(CookieParser.parse); //restify cookie handler
server.use(checkCookie); //our handler for verifying/creating cookies
server.use(restify.plugins.bodyParser()); //restify handler for parsing post body params

server.get('/new-room/', createRoom);

server.get(/.*/, restify.plugins.serveStatic({
    'directory': __dirname,
    'default': 'home.html'
}));

server.listen(8080, function() {
    console.log('%s listening at %s', server.name, server.url);
});
