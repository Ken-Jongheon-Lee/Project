// JavaScript source code
'use strict';
const
  cluster = require('cluster'),
  fs = require('fs'),
  zmq = require('zmq');

var net = require('net');

var b2d = require("./box2dnode");
var ProtoBuf = require("protobufjs");
var protobuf = ProtoBuf.protoFromFile("projectA.proto");

var createRoom = function (id, b2b) {
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
        
            self.isInit = true;
    };

    self.update = function (timeStep) {
         self.world.Step(timeStep, 10);
    }
	return self;
}

var gameWorld = new Map();
var users = [];
var mapIdToKey = new Map();


setInterval(function () {
    gameWorld.forEach(function (world, key, map) {
        if (world.isInit) {
            world.update(1.0 / 60.0);
            var position = world.body.GetPosition();
            var pos = { 'x': position.x, 'y': position.y };
            //console.log("gameWorld.forEach");
        }        
    });
}, 100);

function makekey() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

if (cluster.isMaster) {

    // master process - create ROUTER and DEALER sockets, bind endpoints
    let
        router = zmq.socket('router'),
        dealer = zmq.socket('dealer');



      //dealer = zmq.socket('dealer').bind('ipc://a.ipc');
    router.monitor(500, 0);
    router.bind('tcp://127.0.0.1:5433');
    dealer.bind('tcp://127.0.0.1:5434');

    
    
    router.on('accept', function (data, ep) {

    });

    // forward messages between router and dealer
    router.on('message', function (data) {
	    console.log("router.on" + data);
        let frames = Array.apply(null, arguments);
        dealer.send(frames);
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
    for (let i = 0; i < 1; i++) {
        cluster.fork();

    }

} else {

    // worker process - create REP socket, connect to DEALER
    let responder = zmq.socket('rep').connect('tcp://127.0.0.1:5434');
    var id = 0;

    

    responder.on('message', function (data) {

        console.log("process.pid" + process.pid);

        var OneMsg = protobuf.build("ProjectA");

        console.log("data" + data);

        var pkInfo = OneMsg.OneMessage.decode(data); 
        
        switch (pkInfo.pType) {
            case 1: //loginReq
                {
                    var id = pkInfo.loginReq.id;
                    var found = mapIdToKey.has(id);

                    if (found)
                        break;

                    console.log("login id : " + pkInfo.loginReq.id);
                    var ProjectA = protobuf.build("ProjectA");
                    var key = makekey();
                    //send res                    
                     var msg = new ProjectA.OneMessage({
                        
                        
                        "loginRes": {
                            "bResult": true,
                            "key": key,
                         },
                        "pType": "LOGINRES",
                        
                    });
                   
                    var byteBuffer = msg.encode().toBuffer();
                    
                    responder.send(byteBuffer);
                    console.log("joine user key : " + key + "user id " + id);

                    mapIdToKey.set(key , id);

                    var rm = createRoom(key, b2d);
                    rm.init();
                    gameWorld.set(key, rm);
                    if (gameWorld.has(key)) {                        
                        console.log("added : " + key + "length : " + key.length);
                    }
                    
                    break;
                }
            case 5: //syncreq    
                {
                    
                    var key = pkInfo.syncReq.key.toString();

                    console.log("received syncRes :" + key + ", length : " + key.length);

                    gameWorld.forEach(function (item, k, mapObj) {
                        console.log("gameWorld.forEach : " + k);
                        if (k == key) {
                            console.log("gameWorld.has(key)");

                            var pos = item.getBodyPos();

                            var ProjectA = protobuf.build("ProjectA");
                            console.log(pos);
                            var msg = new ProjectA.OneMessage({
                                
                                "syncRes": {
                                    "x": Math.floor( pos.x),
                                    "y": Math.floor( pos.y),
                                },
                                "pType": "SYNKRES",

                            });

                            var byteBuffer = msg.encode().toBuffer();

                            if (responder.send(byteBuffer))
                                console.log("sent SYNKRES");
                        }
                        else {
                            console.log("not found" + key);
                        }
                    });
                    
                    break;
                }

                
        }

            
            /*
            console.log("login ID : " + loginInfo.id);
            var loginRes = SomeMessage.LoginRes;
            loginRes = new SomeMessage.LoginRes({
                "type": {
                    "type": 2,
                    "id": loginInfo.id
                },
                "bResult": true,
                "key":"ok",t
            });
            var buffer = loginRes.encode();
            var array = buffer.toBase64();
            responder.send(array);
            //responder.send("aaaaa");
            console.log("buffer.toArrayBuffer()" + buffer.toBase64());
           
        }
        else if (type == 4)
        {
            var position = gameWorld[id].getBodyPos();
            var pos = { 'x': position.x, 'y': position.y };
            responder.send(JSON.stringify(pos));
            console.log("responder.on(message " + id + data);
            gameWorld[id].update();
        } */


        

        
    });

}