// JavaScript source code
"use strict";

const fs = require('fs'),
    zmq = require('zmq'),

    publisher = zmq.socket('pub'),

    filename = "test.txt";

fs.watch(filename, function () {
    publisher.send(JSON.stringify({
        type: 'changed',
        file: filename,
        timestamp: Date.now()
    }));
});

publisher.bind('tcp://*:5432', function (err) {
    console.log('Listening for zmq subscribers ... ');
});