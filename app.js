var express = require('express');
var app = express();
var serv = require('http').Server(app);
var ProtoBuf = require("./node_modules/protobufjs");

app.get('/', function(req, res) {
res.sendFile(__dirname + '/client/index.html');
});

app.use('/client',express.static(__dirname + '/client'));

serv.listen(2000);

console.log("Server started.");

var SOCKET_LIST = {};
var PLAYER_LIST = {};

var Entity = function(id){
	var self = {
		x:250,
		y:250,
		spdX:0,
		spdY:1,
		id:id,
		number:""+Math.floor(10 * Math.random()),
	};

	self.update = function() {
		self.updatePosition();
	};
	
	self.updatePosition = function(){
		self.x += self.spdX;
		self.y += self.spdY;
		
	};
	return self;
}

var Player = function(id) {
	
	var self = Entity();
	self.id = id;
	
	
	self.pressingLeft = false;
    self.pressingRight = false;
    self.pressingUp = false;
    self.pressingDown = false;
    self.maxSpeed = 10;
	
	
	self.updatePosition = function(){
        if(self.pressingRight)
            self.x += self.maxSpd;
        if(self.pressingLeft)
            self.x -= self.maxSpd;
        if(self.pressingUp)
            self.y -= self.maxSpd;
        if(self.pressingDown)
            self.y += self.maxSpd;
    }
	
	return self;
}

var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket) {
	console.log("socket connection");
	socket.emit('hello',"hello");
	socket.id = Math.random();
	
	var player = Player(socket.id);
	PLAYER_LIST[socket.id] = player;
	
	SOCKET_LIST[socket.id ] = socket;
	
	socket.on('disconnect', function(){
		delete PLAYER_LIST[socket.id];
		delete SOCKET_LIST[socket.id];
	});
	
	socket.on('keyPress', function(data) {
		if(data.inputId == 'left')
		{
			player.pressingLeft = data.state;
		}
		else if(data.inputId == 'right')
		{
			player.pressingRight = data.state;
		}
		else if(data.inputId == 'up')
		{
			player.pressingUp = data.state;
		}
		else if(data.inputId == 'down')
		{
			player.pressingDown = data.state;
		}
	});
	//socket.on('happy', function(data) {
	//	console.log('happy because' + data.reason);
	//});
	
	//socket.emit('serverMsg', { 
	//	msg:'hello',
	//});
});


setInterval(function() {
	var pack = [];
	for( var i in PLAYER_LIST) {
		
		var player = PLAYER_LIST[i];		
		player.updatePosition();
		pack.push({
			x:player.x,
			y:player.y,
			number:player.number
		});
	}
	for( var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		socket.emit('newPosition', pack);
	}
}, 1000/25);