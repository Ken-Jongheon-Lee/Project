// JavaScript source code

'use strict';
const
  cluster = require('cluster'),
  fs = require('fs'),
  zmq = require('zmq');

var Broker = require('./pigato-master/lib/Broker');
var Client = require('./pigato-master/lib/Client');
var Worker = require('./pigato-master/lib/Worker');
var World = require('./gameWorld.js');

var net = require('net');


var ProtoBuf = require("protobufjs");
var protobuf = ProtoBuf.loadProtoFile("projectA.proto");
var b2d = require("./box2dnode");

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
    
        var ProjectA = protobuf.build("ProjectA");
        var pkInfo = ProjectA.OneMessage.decode(arguments[2]);
        var jsonInfo = JSON.stringify(pkInfo);
        console.log("message : " + jsonInfo);
        var identity = arguments[0];

        var key;
        switch(pkInfo.pType)
        {
            case 1: //loginReq
            {
                var id = pkInfo.loginReq.id;
                if (!users.has(id)) {
                    key = makekey();
                    users.set(id, key);
                    console.log(id + " has joined key : " + key);
                    //todo fork한 프로세서로 메세지를 보낼게 아님 
                    var wk = cluster.fork();
                    wk.send(key);
                } else {
                    //exception, received login request but it already has the session
                    key = users.get(id);
                }    
                break;
            }
            case 5:
                {
                    key = pkInfo.syncReq.key;
                break;
                }
            case 3:
                key = pkInfo.respawnReq.key;
                break;
        }

        var ddd;
        client.request(key, pkInfo).on('data', function (data) {
            ddd = data;
            
            var msg = new ProjectA.OneMessage(ddd);

            var byteBuffer = msg.encode().toBuffer();
            console.log("res packet created" + byteBuffer);
            router.send([address, empty, byteBuffer]);
            

        }).on('end', function () {
            

            
        });

        
    });
} else {

    var pigatoWorker;
    var key;
    process.on('message', function (msg) {
        console.log('Worker ' + process.pid + ' received message from master.', msg);
        //pigatoWorker.service = msg;

        console.log("created pigatoWorker, key : " + msg);

        pigatoWorker = new Worker(brokerAdd, msg);
        pigatoWorker.start();
        key = msg;
        var world = World.createWorld(key);
        world.init();
        var pos = new b2d.b2Vec2();
        
        setInterval(function () {
            if (world.isInit === true) {
                world.update(1.0 / 60.0);
                var units = world.getBodyPos();
                if (null != units && units.length > 0) {
                    pos = units[0].pos;
                }
            }
        }, 100);
        
        pigatoWorker.on('request', function (inp, rep, opts) {

            var byteBuffer;
            switch (inp.pType) {
                case 1:
                    console.log("worker recevied sync , id : " + inp.loginReq.id + " key" + key);

                    //send res                    
                    rep.write({
                        "loginRes": {
                            "bResult": true,
                            "key": key,
                        },
                        "pType": "LOGINRES",
                    });
                    break;

                case 5: //syncReq
                    {
                        var units = world.getBodyPos();
                        
                        var res = {
                            "pType": "SYNCRES",
                            "syncRes": {
                                units,
                            }
                        };
                        rep.write(res);                       
                       
                    }
                    break;
                case 3:
                    {
                        console.log(inp.respawnReq);
                        world.createUnit(inp.respawnReq.x, inp.respawnReq.y);

                        var res = {
                            "pType": "RESPWANRES",
                            "respawnRes" : {
                                "bResult": true,
                            }
                        };
                        rep.write(res);   
                        break;
                    };
                    
                    
            }
            rep.end();
        });
    });

    



   

    
}