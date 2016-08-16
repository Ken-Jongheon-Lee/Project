// JavaScript source code
'use strict';
const
  cluster = require('cluster'),
  fs = require('fs'),
  zmq = require('zmq');

var net = require('net');

var b2d = require("./box2dnode");
var ProtoBuf = require("protobufjs");

var room = function (id, b2b) {
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
	    self.world = new b2d.b2World(self.worldAABB, gravity,doSleep);
       

        
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
        
        self.init = true;
    };

    self.update = function (timeStep) {
         self.world.Step(timeStep, 10);
    }
	return self;
}

var gameWorld = [];
if (cluster.isMaster) {

    // master process - create ROUTER and DEALER sockets, bind endpoints
    let
      router = zmq.socket('router'),
      dealer = zmq.socket('dealer').bind('tcp://127.0.0.1:5434');
      //dealer = zmq.socket('dealer').bind('ipc://a.ipc');
    router.monitor(500, 0);
    router.bind('tcp://127.0.0.1:5433');
    
    router.on('accept', function (data, ep) {
        

        
        var index = 0;
        var id = data;        

        var bFound = gameWorld.find(function (id) {
            gameWorld.forEach(function (world) {
                return world.id === id;
            });
        });

        if (!bFound) {
            var rm = room(id, b2d);
            gameWorld.push(rm);

            console.log('created Room id : ' + id);
        }
    });

    // forward messages between router and dealer
    router.on('message', function () {
	    console.log("router.on");
        let frames = Array.apply(null, arguments);
        dealer.send(frames);
        

        //router.send('aaa');
    });

    dealer.on('message', function () {
	
        let frames = Array.apply(null, arguments);
        console.log(" dealer.on" + frames.length);
        router.send(frames);

        
    });

    // listen for workers to come online
    cluster.on('online', function (worker) {
        console.log('Worker ' + worker.process.pid + ' is online.');
    });

    // fork three worker processes
    for (let i = 0; i < 2; i++) {
        cluster.fork();

    }

} else {

    // worker process - create REP socket, connect to DEALER
    let responder = zmq.socket('rep').connect('tcp://127.0.0.1:5434');
    var id = 0;
    if (responder) {
        id = process.pid;
        
        
        gameWorld[id] = room(id, b2d);
        gameWorld[id].init();
        console.log("createdroom" + id);
        
        //
    }
	
 

    responder.on('message', function (data) {
	
        var position = gameWorld[id].getBodyPos();
        var pos = { 'x' : position.x, 'y' : position.y };
        responder.send(JSON.stringify(pos));
        console.log("responder.on(message " +id + data);
        gameWorld[id].update();
        
    });

}