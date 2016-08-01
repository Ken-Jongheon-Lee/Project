// JavaScript source code
//'use strict';
/*
var
    fs = require('fs'),
    net = require('net'),

    filename = "test.txt",

    server = net.createServer(function (connection) {
        console.log('subscriber connected.');
        connection.write(" Now watching " + filename + " for changes ... \n");
        
        var watcher = fs.watch(filename, function () {
            connection.write("file" + filename + "changed:" + Date.now() + "\n");
        });

        connection.on("close", function () {
            console.log("subscriber closed");
            watcher.close();
        });
    });


   


server.listen(5432, function () {
    console.log('listening for subscribers');
});

*/

"use strict";
const
  net = require('net'),
  client = net.connect({ port: 5432 });
client.on('data', function (data) {
    let message = JSON.parse(data);
    if (message.type === 'watching') {
        console.log("Now watching: " + message.file);
    } else if (message.type === 'changed') {
        let date = new Date(message.timestamp);
        console.log("File '" + message.file + "' changed at " + date);
    } else {
        throw Error("Unrecognized message type: " + message.type);
    }
});
