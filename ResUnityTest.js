// JavaScript source code
"use strict"


var b2d = require("./box2dnode");

// Define world
var worldAABB = new b2d.b2AABB();
worldAABB.lowerBound.Set(-100.0, -100.0);
worldAABB.upperBound.Set(100.0, 100.0);

var gravity = new b2d.b2Vec2(0.0, -10.0);
var doSleep = true;

var world = new b2d.b2World(worldAABB, gravity, doSleep);

// Ground Box
var groundBodyDef = new b2d.b2BodyDef();
groundBodyDef.position.Set(0.0, -10.0);
groundBodyDef.angle = 0.0;

var groundBody = world.CreateBody(groundBodyDef);

var groundShapeDef = new b2d.b2PolygonDef();
groundShapeDef.SetAsBox(50.0, 10.0);

groundBody.CreateShape(groundShapeDef);

// Dynamic Body
var bodyDef = new b2d.b2BodyDef();
bodyDef.position.Set(0.0, 50.0);

var body = world.CreateBody(bodyDef);

var shapeDef = new b2d.b2PolygonDef();
shapeDef.SetAsBox(1.0, 1.0);
shapeDef.density = 1.0;
shapeDef.friction = 0.3;
body.CreateShape(shapeDef);
body.SetMassFromShapes();

// Run Simulation!
var timeStep = 1.0 / 60.0;

var iterations = 10;
/*
for (var i = 0; i < 60; i++) {
    world.Step(timeStep, iterations);
    var position = body.GetPosition();
    var angle = body.GetAngle();
    sys.puts(i + ": <" + position.x + ", " + position.y + "> @" + angle);
}
*/

const zmq = require('zmq'),
    responder = zmq.socket('rep'),
    req = zmq.socket('req');
var i = 0;
responder.on('connection', function () {
    bodyDef.position.Set(0.0, 50.0);
});
responder.on('message', function (data) {
    world.Step(timeStep, iterations);

    var position = body.GetPosition();
    var pos = { 'x' : position.x, 'y' : position.y };
    
    responder.send(JSON.stringify(pos));
    console.log(data);
});


responder.bind('tcp://127.0.0.1:5433', function (err) {
    console.log('listening for zmq requesters...')
});


// close the responder when the Node process ends
process.on('SIGINT', function () {
    console.log('Shutting down...');
    responder.close();
});