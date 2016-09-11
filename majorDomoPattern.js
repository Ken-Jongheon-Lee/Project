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




var ProtoBuf = require("protobufjs");
var protobuf = ProtoBuf.loadProtoFile("projectA.proto");
var b2d = require("./box2dnode");

var brokerAdd = "tcp://192.168.0.4:55555";
var workerRouterAddr = 'tcp://192.168.0.4:5432';                          
var NUM_WORKER = 4;
var waitingUser = [];
var readyUser = [];

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
    let routerForClients = zmq.socket('router');
    let routerForWorkers = zmq.socket('router');

    routerForWorkers.on('message', function (address, recivedMsg, ready) {
        var ProjectA = protobuf.build("ProjectA");
        var pkInfo = ProjectA.ClusterMessage.decode(recivedMsg);
        switch (pkInfo.pType)
        {   
            case 1: //'HEART_BEAT_REQ':
                {
                    if (waitingUser.length == 0) {
                        var msg = new ProjectA.ClusterMessage({
                            "pType": "HEART_BEAT_REA",
                            "heartbeatRes": {}
                        });
                        console.log("HEART_BEAT_REQ");

                        var byteBuffer = msg.encode().toBuffer();
                        routerForWorkers.send([address, byteBuffer]);
                    } else {
                        var msg = new ProjectA.ClusterMessage({
                            "pType": "CREATE_ROOM_REQ",
                            "createRoomReq": {id : waitingUser[0].id}
                        });
                        waitingUser.splice(0, 1);
                        console.log("CREART ROOM REQUEST");
                        var byteBuffer = msg.encode().toBuffer();
                        routerForWorkers.send([address, byteBuffer]);
                    }
                }
                break;
            case 4://CREATE_ROOM_REP
                {
                    console.log("before readyUser.push" + jsonInfo);                    
                    readyUser.push({ "roomkey": pkInfo.createdRoomAns.roomkey, "id": pkInfo.createdRoomAns.id });
                                        
                    break;
                }
        }
    });

    routerForClients.monitor(500, 0);
    routerForClients.bind('tcp://192.168.0.4:5433');
    routerForWorkers.bind(workerRouterAddr);
    
    //pitago setup
    var broker = new Broker(brokerAdd);
    broker.start();
    var client = new Client(brokerAdd);
    client.start();

    client.on('error', function (e) {
        console.log('ERROR', e);
    });
    //call backs
    

    routerForClients.on('accept', function (data, ep) {
        console.log('accept : ' + data);
    });

    routerForClients.on('message', function (address, empty, ready) {
    
        var ProjectA = protobuf.build("ProjectA");
        var pkInfo = ProjectA.OneMessage.decode(arguments[2]);
        var jsonInfo = JSON.stringify(pkInfo);
        //console.log("message : " + jsonInfo);
        //var identity = arguments[0];

        var key;
        switch(pkInfo.pType)
        {
            case 1: //loginReq
            {
                var id = pkInfo.loginReq.id;
                if (!users.has(id)) {
                    
                    key = makekey();
                    users.set(id, key);
                    waitingUser.push({ "id": id, "key": key });
                    console.log("add user to waitingUser");

                    /*
                    console.log(id + " has joined key : " + key);
                    //todo fork한 프로세서로 메세지를 보낼게 아님 
                    var wk = cluster.fork();
                    wk.send(key);
                    */

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
        /*
        var ddd;
        client.request(key, pkInfo).on('data', function (data) {
            ddd = data;
        }).on('end', function () {
            var msg = new ProjectA.OneMessage(ddd);

            var byteBuffer = msg.encode().toBuffer();
            //console.log("res packet created" + byteBuffer);
            routerForClients.send([address, empty, byteBuffer]); 
        });
        */
        
    });
} else {

    var pigatoWorker;
    var key;
    process.on('message', function (msg) {
        console.log('Worker ' + process.pid + ' received message from master.', msg);
        //pigatoWorker.service = msg;

        console.log("created pigatoWorker, key : " + msg);

        pigatoWorker = new Worker(brokerAdd, msg, { timeout: -1 });
        pigatoWorker.start();
        key = msg;
        var world = World.createWorld(key);
        world.init();
        
        setInterval(function () {
            if (world.isInit === true) {
                world.update(1 / 60.0);
            }
        }, 10);
        
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
                case 3: //respawn
                    {
                        console.log(inp.respawnReq);
                        world.createUnit(inp.respawnReq.x, inp.respawnReq.y);

                        rep.write({
                            "pType": "RESPWANRES",
                            "respawnRes": {
                                "bResult": true,
                            }
                        });
                        break;
                    };
                case 5: //syncReq
                    {
                        var units = world.getBodyPos();                        
                        rep.write({
                            "pType": "SYNCRES",
                            "syncRes": {
                                units,
                            }
                        });                       
                        break;   
                    }
            }
            rep.end();
        });
    });

    



   

    
}