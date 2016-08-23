// JavaScript source code

'use strict';
const
  cluster = require('cluster'),
  fs = require('fs'),
  zmq = require('zmq');

var Broker = require('./pigato-master/lib/Broker');
var Client = require('./pigato-master/lib/Client');
var Worker = require('./pigato-master/lib/Worker');

var net = require('net');

var b2d = require("./box2dnode");
var ProtoBuf = require("protobufjs");
var protobuf = ProtoBuf.protoFromFile("projectA.proto");

var brokerAdd = "tcp://127.0.0.1:55555";
                          
var NUM_WORKER = 4;

function makekey() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 10; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

if (cluster.isMaster) {

    // variable
    var users = new Map();

    //
    let router = zmq.socket('router');
    let dealer = zmq.socket('dealer');

    router.monitor(500, 0);
    router.bind('tcp://127.0.0.1:5433');

    
    //pitago setup
    var broker = new Broker(brokerAdd);
    broker.start();
    var client = new Client(brokerAdd);
    client.start();

    client.on('error', function (e) {
        console.log('ERROR', e);
    });

    

    


    //call backs
    

    router.on('accept', function (data, ep) {
        console.log('accept : ' + data);
    });

    router.on('message', function (address, empty, ready) {
    
        var OneMsg = protobuf.build("ProjectA");
        var pkInfo = OneMsg.OneMessage.decode(arguments[2]);
        var jsonInfo = JSON.stringify(pkInfo);
        console.log("message : " + jsonInfo);
        var identity = arguments[0];

        switch(pkInfo.pType)
        {
            case 1: //loginReq
            {
                var id = pkInfo.loginReq.id;
                if (!users.has(id)) {
                    users.set(id, makekey());
                    console.log(id + " has joined key : " + users.get(id));
                    var wk = cluster.fork();
                    wk.send(users.get(id));
                    var ddd;
                    client.request(users.get(id), pkInfo).on('data', function (data) {
                        ddd = data;                        
                        console.log(data);
                        
                    }).on('end', function () {
                        console.log("pitago client recived");


                        var ProjectA = protobuf.build("ProjectA");
                        var key = makekey();
                        //send res                    
                        var msg = new ProjectA.OneMessage(ddd);

                        var byteBuffer = msg.encode().toBuffer();
                        console.log("res packet created" + byteBuffer);

                        router.send([address, empty, byteBuffer]);
                    });
            
                }
                
                var key = users[id];
                //client.request(key, arguments[2]);

                
                    
                
                
                
            break;
            }
            case 5:
            {
                break;
            }
        }
       

        
    });
} else {

    
     
    process.on('message', function(msg) {
        console.log('Worker ' + process.pid + ' received message from master.', msg);
        //pigatoWorker.service = msg;
       
        console.log("created pigatoWorker, key : " + msg);
        
        var pigatoWorker = new Worker(brokerAdd, msg);
        pigatoWorker.start();

        pigatoWorker.on('request', function (inp, rep, opts) {

            console.log("worker recevied sync , id : " + inp.loginReq.id);
            
                            
            var byteBuffer;
            switch (inp.pType) {
                case 1:
                    var key = makekey();
                    //send res                    
                    rep.write({


                        "loginRes": {
                            "bResult": true,
                            "key": key,
                        },
                        "pType": "LOGINRES",

                    });

                    break;
                case 5:                    
                    break;
    
            }

            
            rep.end();
        });
      

    });

   

    
}