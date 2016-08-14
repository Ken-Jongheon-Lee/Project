// JavaScript source code
'use strict';
const
  cluster = require('cluster'),
  fs = require('fs'),
  zmq = require('zmq');

var b2d = require("./box2dnode");
var ProtoBuf = require("./protobufjs");

var room = function (id) {
    var self = {
        isInit: false,
        id: id,
        worldAABB: null,
        world: null,
        groundBody: null,
        body: {},
    };

    self.init = function () {
        if (self.worldAABB === null)
            self.worldAABB = new b2b.b2AABB();
        self.worldAABB.lowerBound.Set(-100.0, -100.0);
        self.worldAABB.upperBound.Set(100.0, 100.0);

        var gravity = new b2b.b2Vec2(0, -10);
        var doSleep = true;



        if (self.groundBody === null) {
            var groundBodyDef = new b2b.b2BodyDef();
            groundBodyDef.position.Set(0.0, -10.0);
            groundBodyDef.angle = 0.0;
            self.groundBody = world.CreateBody(groundBodyDef);

            var groundShapeDef = new b2d.b2PolygonDef();
            groundShapeDef.SetAsBox(50.0, 10.0);

            self.groundBody.CreateShape(groundShapeDef);
        }

        if (self.bodyDef === null) {
            var bodyDef = new b2d.b2BodyDef();
            bodyDef.position.Set(0.0, 50.0);

            self.body = world.CreateBody(bodyDef);

            var shapeDef = new b2d.b2PolygonDef();
            shapeDef.SetAsBox(1.0, 1.0);
            shapeDef.density = 1.0;
            shapeDef.friction = 0.3;
            self.body.CreateShape(shapeDef);
            self.body.SetMassFromShapes();
        }
        self.init = true;
    }

    self.update = function (timeStep) {
        world.Step(timeStep, 10);
    }
}

var gameWorld = {}
if (cluster.isMaster) {

    // master process - create ROUTER and DEALER sockets, bind endpoints
    let
      router = zmq.socket('router').bind('tcp://127.0.0.1:5433'),
      dealer = zmq.socket('dealer').bind('tcp://127.0.0.1:5434');
      //dealer = zmq.socket('dealer').bind('ipc://filer-dealer.ipc');

    // forward messages between router and dealer
    router.on('message', function () {
        let frames = Array.prototype.slice.call(arguments);
        dealer.send(frames);
        router.send('aaa');
    });

    dealer.on('message', function () {
        let frames = Array.prototype.slice.call(null, arguments);
        router.send(frames);
    });

    // listen for workers to come online
    cluster.on('online', function (worker) {
        console.log('Worker ' + worker.process.pid + ' is online.');
    });

    // fork three worker processes
    for (let i = 0; i < 3; i++) {
        cluster.fork();
    }

} else {

    // worker process - create REP socket, connect to DEALER
    let responder = zmq.socket('rep').connect('tcp://127.0.0.1:5434');
    //if (responder)
    {
        var id = process.pid;
        var rm = room(id);
        gameWorld[id] = rm;
    }
    responder.on('message', function (data) {

        var aa = 0;
        
        // parse incoming message
        let request = JSON.parse(data);
        console.log(process.pid + ' received request for: ' + request.path);

        // read file and reply with content
        fs.readFile(request.path, function (err, data) {
            console.log(process.pid + ' sending response');
            responder.send(JSON.stringify({
                pid: process.pid,
                data: data.toString(),
                timestamp: Date.now()
            }));
        });

    });

}

