// JavaScript source code

'use strict';

const
    fs = require('fs'),
    net = require('net'),

    filename = "test.txt",
     server = net.createServer(function (connection) {
         console.log('subscriber connected.');
         connection.write(" Now watching " + filename + " for changes ... \n");

         connection.write(JSON.stringify({
             type: 'changed',
             file: filename,
             timestamp: Date.now()
         }) + '\n');
         
         let watcher = fs.watch(filename, function () {
             connection.write("File" + filename + "changed" + Date.now() + "\n");

         });
         connection.on("close", function () {
             console.log("subscriber closed");
             watcher.close();
         });
     });


server.listen(5432, function () {
    console.log('listening for subscribers');
});