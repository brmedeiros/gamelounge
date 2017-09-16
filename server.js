var restify = require('restify');

function respond(req, res, next) {
    res.send('hahaxd');
    next();
}

var server = restify.createServer({name: 'Game Lounge'});

server.get('/code-gen/', respond);
//server.head('/code-gen/', respond);

server.get(/.*/, restify.plugins.serveStatic({
    'directory': __dirname,
    'default': 'home.html'
}));

server.listen(8080, function() {
    console.log('%s listening at %s', server.name, server.url);
});
