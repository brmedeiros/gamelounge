var restify = require('restify');
var CookieParser = require('restify-cookies');
const uuidv4 = require('uuid/v4');

function checkCookie(req, res, next) {
    if (!req.cookies['username']) {
	res.setCookie('username', uuidv4());
    }
    return next();
}

function codeGen(req, res, next) {
    res.send('hehexD');
    return next();
}

var server = restify.createServer({name: 'Game Lounge'});
server.use(CookieParser.parse); //restify cookie handler
server.use(checkCookie); //our handler for verifying cookies

server.get('/code-gen/', codeGen);

server.get(/.*/, restify.plugins.serveStatic({
    'directory': __dirname,
    'default': 'home.html'
}));

server.listen(8080, function() {
    console.log('%s listening at %s', server.name, server.url);
});
