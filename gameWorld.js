// JavaScript source code

var b2d = require("./box2dnode");

module.exports = {
    
    createWorld  : function (id) {
        var self = {
            isInit: false,
            id: id,
            worldAABB: null,
            world: null,
            groundBody: null,
            units: [],
        };

        self.getBodyPos = function () {
            if (self.isInit === false)
                return null;
            var array = [];
            var index = 0;
            self.units.forEach(function (unit) {                
                array.push({
                    'index': index,
                    'posX': unit.GetPosition().x,
                    'posY' : unit.GetPosition().y ,
                    'angle': unit.GetAngle(),
                    
                });
                index++;
            });
            
            return array;
        }
        self.createUnit = function (x,y) {           
            
            var bodyDef = new b2d.b2BodyDef();
            bodyDef.position.Set(x, y);

            var body = self.world.CreateBody(bodyDef);

            var shapeDef = new b2d.b2PolygonDef();
            shapeDef.SetAsBox(1.0, 1.0);
            shapeDef.density = 1.0;
            shapeDef.friction = 0.3;
            body.CreateShape(shapeDef);
            body.SetMassFromShapes();
            
            self.units.push(body);
        }

        self.init = function () {
            //if (self.worldAABB === null)
            self.worldAABB = new b2d.b2AABB();
            self.worldAABB.lowerBound.Set(-100.0, -100.0);
            self.worldAABB.upperBound.Set(100.0, 100.0);

            var gravity = new b2d.b2Vec2(0, -9);
            var doSleep = true;
            self.world = new b2d.b2World(self.worldAABB, gravity, doSleep);



            {
                var groundBodyDef = new b2d.b2BodyDef();
                groundBodyDef.position.Set(0.0, -10.0);
                groundBodyDef.angle = 0.0;
                self.groundBody = self.world.CreateBody(groundBodyDef);

                var groundShapeDef = new b2d.b2PolygonDef();
                groundShapeDef.SetAsBox(50.0, 10.0);

                self.groundBody.CreateShape(groundShapeDef);
            }

            self.createUnit(0, 50);
           

            self.isInit = true;
        };

        self.update = function (timeStep) {
            //self.body.SetXForm(new b2d.b2Vec2(100, 100), 100);
            self.world.Step(timeStep, 10);
        }
        return self;
    }

};

