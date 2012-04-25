/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */
(function () {
    "use strict";
    var utils = wooga.castle.utils;

    wooga.castle.Entity = function (game, config) {

        if (!game || !config) {
            return;
        }

        this.game = game;

        this.eventsBubbleTarget = game.worldEntity;

        this.id = Math.random();

        this.x = config.x;
        this.y = config.y;
        this.key = config.key;

        this.definition = game.entitiesDefinition[config.key];

        this.selectable = this.definition.selectable || false;
        this.draggable = this.definition.draggable || false;

        this.preview = config.preview;

        this.boost = 0;
        this.contractValue = 0;

    };

    var Entity = wooga.castle.Entity;

    utils.mixin(Entity, utils.ObservableMixin);

    Entity.prototype.move = function (position) {

        var prevX = this.x,
            prevY = this.y;

        this.x = position.x;
        this.y = position.y;

        this.game.publish("entity/move", {
            entity: this,
            prevX: prevX,
            prevY: prevY
        });

    };

    Entity.prototype.buy = function (position) {

        this.x = position.x;
        this.y = position.y;

        delete this.preview;

        this.game.addToGridMap(this, this.x, this.y);

        this.game.publish("entity/buy", {
            entity: this
        });

    };

    Entity.prototype.isColliding = function (position) {
        return this.game.testCollisions({
                    x: position.x,
                    y: position.y,
                    width: this.definition.width,
                    height: this.definition.height + this.definition.offsetY
                }, this);
    };

    Entity.prototype.is = function (type) {
        if (!utils.isArray(type)) {
            type = [type];
        }
        var className = this.definition['class'];
        return type.filter(function (currentType) {
            if (currentType === "any house") {
                return ['house', 'uhouse', 'statichouse'].indexOf(className) !== -1;
            }
            if (currentType === "movable house") {
                return ['house', 'uhouse'].indexOf(className) !== -1;
            }
            return className === currentType;
        }).length !== 0;
    };

    Entity.findEntityDefinitionByPath = function (game, searchFor, single) {
        var found = [], slug;
        if(typeof single === 'undefined') {
            single = true;
        }
        for(slug in game.entitiesDefinition) {
            if (game.entitiesDefinition.hasOwnProperty(slug)) {
                if(slug.indexOf(searchFor) !== -1) {
                    found.push(game.entitiesDefinition[slug]);
                    if(single) {
                        break;
                    }
                }
            }

        }
        return single ? ( found.length ? found[0] : null ) : found;

    };

    Entity.prototype.updateBoost = function (amount, type) {

        //boost applicable?
        if (typeof this.contractState === "undefined") { return; }

        if ((type === "gold" && ["house", "uhouse", "statichouse"].indexOf(this.definition["class"]) !== -1) ||
                (type === "food" && this.definition["class"] === "farm")) {
            if ((this.boost + amount) > 0) {
                this.boost += amount;
            } else {
                this.boost = 0;
            }
        }

        // update values
        if (this.contractState !== "finished" && this.contractState !== "idle") { // prevent contract value to be changed after contract is finished
            if (type === "gold" && this.definition["class"] === "house" && this.contract.providedGold) {
                this.contractValue = this.contract.providedGold + Math.round(this.contract.providedGold * (this.boost/100));
            } else if (type === "food" && this.definition["class"] === "farm" && this.contract.providedFood) {
                this.contractValue = this.contract.providedFood + Math.round(this.contract.providedFood * (this.boost/100));
            }
        }
   };

    Entity.prototype.toSerializable = function () {
        return {
            "key": this.key,
            "x": this.x,
            "y": this.y
        };
    };

    Entity.prototype.getCallableName = function () {
        return this.definition['class'];
    };

    Entity.prototype.getProperName = function () {
        return this.definition.name;
    };

    Entity.prototype.getInfoModeString = function () {
        return "";
    };

}());
