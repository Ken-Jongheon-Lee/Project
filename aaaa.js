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



var createWorld = function (id, b2b) {
    var self = {
        isInit: false,
        id: id,
        worldAABB: null,
        world: null,
        groundBody: null,
        body: {},
    };

    self.getBodyPos = function () {
        return self.body.GetPosition();
    }

    self.init = function () {
        //if (self.worldAABB === null)
        self.worldAABB = new b2b.b2AABB();
        self.worldAABB.lowerBound.Set(-100.0, -100.0);
        self.worldAABB.upperBound.Set(100.0, 100.0);

        var gravity = new b2b.b2Vec2(0, -10);
        var doSleep = true;
        self.world = new b2d.b2World(self.worldAABB, gravity, doSleep);



        {
            var groundBodyDef = new b2b.b2BodyDef();
            groundBodyDef.position.Set(0.0, -10.0);
            groundBodyDef.angle = 0.0;
            self.groundBody = self.world.CreateBody(groundBodyDef);

            var groundShapeDef = new b2d.b2PolygonDef();
            groundShapeDef.SetAsBox(50.0, 10.0);

            self.groundBody.CreateShape(groundShapeDef);
        }


        var bodyDef = new b2d.b2BodyDef();
        bodyDef.position.Set(0.0, 50.0);

        self.body = self.world.CreateBody(bodyDef);

        var shapeDef = new b2d.b2PolygonDef();
        shapeDef.SetAsBox(1.0, 1.0);
        shapeDef.density = 1.0;
        shapeDef.friction = 0.3;
        self.body.CreateShape(shapeDef);
        self.body.SetMassFromShapes();

        self.isInit = true;
    };

    self.update = function (timeStep) {
        self.world.Step(timeStep, 10);
    }
    return self;
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

    /*
    var world = createWorld("aaaa", b2d);
    world.init();

    setInterval(function () {
        if (world.isInit === true) {
            world.update(100.0);
        }
    }, 100);
    */


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

        var key;
        switch (pkInfo.pType) {
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
        }

        var ddd;
        client.request(key, pkInfo).on('data', function (data) {
            ddd = data;
            console.log(data);

        }).on('end', function () {
            var ProjectA = protobuf.build("ProjectA");

            //send res                    
            var msg = new ProjectA.OneMessage(ddd);
            console.log(ddd);

            var byteBuffer = msg.encode().toBuffer();
            router.send([address, empty, byteBuffer]);
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
        var world = createWorld(key, b2d);
        world.init();

        setInterval(function () {
            if (world.isInit === true) {
                world.update(1);
            }
        }, 10);

        pigatoWorker.on('request', function (inp, rep, opts) {

            var byteBuffer;
            switch (inp.pType) {
                case 1:
                    console.log("worker recevied sync , id : " + inp.loginReq.id);

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
                        var pos = world.body.GetPosition();

                        var x = Math.floor(pos.x);
                        var y = Math.floor(pos.y);

                        console.log("floor " + x + " ," + y);
                        rep.write({
                            "pType": "SYNKRES",
                            "syncRes": {
                                "x": pos.x,
                                "y": pos.x,
                            },
                        });
                    }
                    break;


            }
            rep.end();
        });
    });








}