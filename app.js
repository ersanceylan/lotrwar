var express = require('express');
var logfmt = require("logfmt");
var port = Number(process.env.PORT || 5000);
var app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io')(server);
server.listen(port);


var game = require('./lib/gameManager.js');

var GameManager = game.Manager;

//io.set('log level', 1);


// routing
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});
app.get('/game.js', function (req, res) {
  res.sendfile(__dirname + '/lib/game.js');
});
app.use(express.static(__dirname + '/node_modules/socket.io'));
app.use('/game.js', express.static(__dirname + '/lib/game.js'));
app.use(express.static(__dirname + '/public'));

gm = new GameManager(io);
//console.log(gm.notifyAction);

console.log("Started");
// TODO : multiple rooms
var room = 'room1';
io.sockets.on('connection', function (socket) {

	socket.on('adduser', function(username){
		// we store the username in the socket session for this client
        console.log("NEW USER : " + username);
				socket.username = username;
        socket.join(room);
        socket.room = room;
        gm.connect(socket, username);
	});

	// when the user disconnects.. perform this
	socket.on('disconnect', function(){
		// remove the username from global usernames list
		// io.sockets.emit('updateusers', usernames);
		// echo globally that this client has left
		// socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
        console.log(socket.username + ' has disconnected. Waiting new players...');
        // gm.player1 = null;
        // gm.player2 = null;
        gm = new GameManager(io);
	});

    socket.on('action', function(action) {
      console.log("Action : ");
      console.log(action);
      response = gm.processAction(action, socket);
    });
});