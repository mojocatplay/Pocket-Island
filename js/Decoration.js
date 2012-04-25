/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */

(function () {
    "use strict";
    var utils = wooga.castle.utils;

    var Decoration = function (game, config) {

        wooga.castle.Entity.call(this, game, config);

        this.effectedEntities = [];

    };

    Decoration.prototype = new wooga.castle.Entity();
    Decoration.prototype.constructor = Decoration;


    Decoration.prototype.getInfluencedEntities = function (entities, x, y) {

        var radius = this.definition.influenceArea;
        this.game.testCollisions2({
                    x: "undefined" === typeof x ? this.x - radius : x - radius,
                    y: "undefined" === typeof y ? this.y - radius : y - radius,
                    width: this.definition.width + 2 * radius,
                    height: this.definition.height + this.definition.offsetY + 2 * radius
                }, this, true, entities);
        return entities;
    };

    Decoration.prototype.broadcastChangeAfterMove = function () {
        this.effectedEntities.forEach(function (e) {
            utils.publish('game:boosts/maybe-change', {
                entity: e,
                decoration: this
            });
        }, this);
        return this;
    };

    Decoration.prototype.applyBoosts = function(x, y) {
        if (this.effectedEntities.length) {
            this.game.publish("decoration/hideBoost", {
                 entityView: this.entityView
            });
            this.removeBoosts();
            this.effectedEntities = []; //TODO
        }

        this.getInfluencedEntities(this.effectedEntities, x, y);
        this.addBoosts();
        return this;
    };

    Decoration.prototype.addBoosts = function() {
        this.updateBoosts(false);
    };

    Decoration.prototype.removeBoosts = function() {
        this.updateBoosts(true);
    };

    Decoration.prototype.updateBoosts = function(removeBoost) {
        var factor = 1, entity, i;
        if (removeBoost) { factor = -1; } // subtract boost value
        for (i = 0; i < this.effectedEntities.length; i++) {
            entity = this.effectedEntities[i];
            this.game.publish('boost/change', {entity: entity, decoration: this});
            if (this.definition.goldBoost) {
                entity.updateBoost(factor * this.definition.goldBoost, "gold");
            }
            if (this.definition.foodBoost) {
                entity.updateBoost(factor * this.definition.foodBoost, "food");
            }
        }
    };

    Decoration.prototype.getInfoModeString = function() {
        var result = '<p>Nearby buildings get a ';
        var concatBoosts = false;
        if (this.definition.goldBoost) {
              result += 'gold boost of ' + this.definition.goldBoost + '%';
              concatBoosts = true;
        }
        if (this.definition.foodBoost) {
            if(concatBoosts) {
                result += '</p><p>and a ';
            }
            result += 'food boost of ' + this.definition.foodBoost + '%.';
        }
        return result;
    };


    Decoration.prototype.removeEntity = function(entity) {
        this.effectedEntities.splice(this.effectedEntities.indexOf(entity), 1);
    };



    wooga.castle.Decoration = Decoration;

}());
