/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */

(function () {

    "use strict";

    var utils = wooga.castle.utils;

    var Person = wooga.castle.Person = function (peopleManager, config) {

            this.eventsBubbleTarget = peopleManager; // TODO: Do I want this? Or is pubsub better approach?

            this.id = Math.random();
            this.definition = wooga.castle.entityDefinitions[Person.DEFINTION_URI];

            this.x = config.x;
            this.y = config.y;

            this.speed = config.speed;

            this.width = this.definition.width;
            this.height = this.definition.height;

            this.walkDirection = 0;

            var that = this;

            var start = function() {
                that.fireEvent("create");
                if (config.path) {
                    that.walk(config.path);
                }
            };

            if (config.delay) {
                this.timeout = setTimeout(function() {
                    start();
                }, config.delay);
            } else {
                start();
            }

        };


    Person.WalkDirection = {
        TOP: 1,
        RIGHT: 2,
        DOWN: 3,
        LEFT: 4
    };

    Person.DEFINTION_URI = "characters/person-skin";

    utils.mixin(Person, utils.ObservableMixin);

    Person.prototype.snapToGrid = function() {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        this.fireEvent("move");
    };

    Person.prototype.updateWalkDirection = function(segment, prevSegment) {

        if (segment.x === prevSegment.x && segment.y < prevSegment.y) {
            return Person.WalkDirection.TOP;
        }
        if (segment.x > prevSegment.x && segment.y === prevSegment.y) {
            return Person.WalkDirection.RIGHT;
        }
        if (segment.x === prevSegment.x && segment.y > prevSegment.y) {
            return Person.WalkDirection.DOWN;
        }
        if (segment.x < prevSegment.x && segment.y === prevSegment.y) {
            return Person.WalkDirection.LEFT;
        }
        return false;
    };

    Person.prototype.walk = function(path) {
        var that = this;

        var isSegmentReached = function(segment) {
            return Math.round(that.x * 10) / 10  === segment.x && Math.round(that.y * 10) / 10  === segment.y;
        };

        var i = 0, stepX, stepY;
        var nextSegment = path[i].entity;

        var step = function() {
            // TODO [szafranek]: Count to 10 (or even better: to n) instead of calling this function on every iteration.
            if (isSegmentReached(nextSegment)) {

                i++;
                if (!path[i]) {
                    that.snapToGrid();
                    that.fireEvent("path walked");
                    return;
                }

                // set walking direction
                var direction = that.updateWalkDirection(path[i].entity, path[i-1].entity);
                if (direction){
                    that.fireEvent("update walk direction", {
                        direction: direction
                    });
                }

                nextSegment = path[i].entity;
                stepX = (nextSegment.x - that.x) * that.speed;
                stepY = (nextSegment.y - that.y) * that.speed;
            }
            that.x += stepX;
            that.y += stepY;
            that.fireEvent("move");
            that.walkTimeout = setTimeout(step, 33);
        };
        step();
    };

    Person.prototype.remove = function () {
        clearTimeout(this.timeout);
        clearTimeout(this.walkTimeout);
        this.fireEvent("remove");
    };

}());
