var express = require('express'),
    path = require('path');

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

// initialize app settings
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname + '/views'));
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
    res.render('index');
});

io.on('connection', function(socket) {
    socket.broadcast.emit('user connect', 'a user just joined');

    // broadcast the chat message
    socket.on('chat message', function(msg) {
	socket.broadcast.emit('chat message', msg);
    });

    // broadcast player moves
    socket.on('player move', function(index) {
	socket.broadcast.emit('player move', index);
    });

    // broadcast player restarting the game
    socket.on('player restart', function(_) {
	socket.broadcast.emit('player restart', _);
    });

    // broadcast the disconnect
    socket.on('disconnect', function(_) {
	socket.broadcast.emit('user connect', 'a user left');
    });
});

server.listen(app.get('port'), function() {
    console.log('Tic-Tac-Toe is running on port ' + app.get('port'));
});
