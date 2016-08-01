var assert = require("assert");
var fs = require("fs");
var by = require("bytebuffer");
var ProtoBuf = require("./node_modules/protobufjs");
var WebSocketServer = require('websocket').server;
var http = require('http');

var builder = ProtoBuf.loadProtoFile("./feeds.proto");

Message = builder.build("Feeds");

	
var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url +  ' ' + process.pid);	    
    response.writeHead(404);
    response.end();
});
server.listen(8080, function() {
    console.log((new Date()) + ' Server is listening on port 8080 of process:' + process.pid);
});


var wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});


function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }

    var connection = request.accept('echo-protocol', request.origin);
    
    console.log((new Date()) + ' Connection accepted.' + process.pid);

    //var parser = ProtoBuf.DotProto.Parser(ProtoBuf.Util.fetch("feeds.proto"));

    connection.on('message', function (message) {
        var proto = ProtoBuf.protoFromFile("feeds.proto");
        //console.log(proto);
        //proto.parse(message.binaryData);
        var SomeMessage = ProtoBuf.protoFromFile("feeds.proto").build("feeds");
        //console.log(SomeMessage);
        
        //var text = SomeMessage.decode(message.binaryData);
        

        if (message.type === 'utf8') {
            console.log('Server Received Message: ' + message.utf8Data + ' len: ' + message.utf8Data.length);
            connection.send(message.utf8Data);
            
        }
        else if (message.type === 'binary') {
            console.log('Server Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
            
            
            var text = SomeMessage.Feed.decode(message.binaryData);
            console.log(text.title);
            
        }
    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
    
});