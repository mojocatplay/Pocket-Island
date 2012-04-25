/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */

(function () {
    "use strict";

    var utils = wooga.castle.utils;
    function UnlockableArea (game, config) {
        wooga.castle.Entity.call(this, game, config);
        this.x = this.definition.x;
        this.y = this.definition.y;

        this.trees = false;

        var requiredTime = this.definition.contract.requiredTime;
        this.contract = {
            requiredTime: requiredTime
        };
        this.contractStartTime = config.contractStartTime;
        this.contractState = config.contractState || "inactive";
    }

    utils['extends'](UnlockableArea, wooga.castle.Entity);

    UnlockableArea.prototype.spawnTrees = function (excludeArea) {

        var i, l, j, m, o, pw = excludeArea? excludeArea.x + excludeArea.width : null,
            ph = excludeArea? excludeArea.y + excludeArea.height : null;
        this.trees = this.trees || [];
        for(i = this.x, l = this.x + this.definition.width, j, m, 0; i < l; i++) {
            for(m = this.y + this.definition.height, j = this.y; j < m; j ++){
                if (!excludeArea || (
                        (excludeArea.x > i || i > pw) ||
                        (excludeArea.y >= j || j > ph)
                    )) {
                    if (Math.random() > 0.425) {

                        o = {
                            "invalidate": false,
                            "key": wooga.castle.Spawner.getRandomTreeKey(),
                            "x": i,
                            "y": j
                        };

                        if (! this.game.isAreaOnCoast ({
                                x: o.x, y: o.y, width: 2, height: 1
                            })){
                            utils.publish('spawn at location', o);
                            this.trees.push(o.spawned);
                        }
                    }
                }
            }
        }
        this.entityView.invalidatePosition();
    };

    UnlockableArea.prototype.unlock = function () {
        var specialBuilding = (function (game, u) {
            var staticHouses = game.entities.filter(function (e) {
                return e.definition['class'] === "statichouse"
                    && e.x >= u.x && e.x + e.definition.width <= u.x + u.definition.width
                    && e.y >= u.y && e.y + (e.definition.height + (e.definition.offsetY || 0)) <= u.y + u.definition.height;
            });
            return staticHouses[0];
        }(this.game, this));
        if (specialBuilding) {
            this.spawnTrees({
                x: specialBuilding.x - 2,
                y: specialBuilding.y + (specialBuilding.definition.offsetY || 0),
                height: specialBuilding.definition.height,
                width: specialBuilding.definition.width + 1
            });
        } else {
            this.spawnTrees();
        }
        this.fireEvent('unlock');

        wooga.castle.utils.publish("game:unlockable/unlock", {entity: this});
        wooga.castle.game.removeEntity(this);
    };

    UnlockableArea.prototype.startContract = function() {
        this.contractStartTime = (new Date()).getTime();
        this.contractState = "started";
        this.countdown();

        wooga.castle.utils.publish("game:contract/start", {
            entity: this,
            contract: this.contract
        });
    };

    UnlockableArea.prototype.finishContract = function() {
        this.contractState = "finished";
        this.contractTimeLeft = 0;
        delete this.contractStartTime;
        var contract = this.contract;
        wooga.castle.utils.publish("game:contract/update", {
            entity: this,
            contract: contract,
            update: {
                state: "finished"
            }
        });
        this.fireEvent("finishContract");
    };

    UnlockableArea.prototype.countdown = function() {
        var unlockTimeout = setInterval(utils.bind(function() {
            var elapsedTime = (new Date().getTime()) - this.contractStartTime;
            if (elapsedTime <= this.contract.requiredTime) {
                this.contractTimeLeft = this.contract.requiredTime - elapsedTime;
                this.fireEvent("countdown");
            } else {
                clearInterval(unlockTimeout);
                this.finishContract();
            }
        }, this), 1000);
    };

    UnlockableArea.prototype.toSerializable = function () {
        var result = this.parent.prototype.toSerializable.call(this);
        result.contract = this.contract;
        result.contractStartTime = this.contractStartTime;
        result.contractState = this.contractState;

        return result;
    };

    wooga.castle.UnlockableArea = UnlockableArea;

    utils.subscribe('game/ready', function () {
        var population = wooga.castle.game.getPopulation();
        var now = (new Date().getTime());
        wooga.castle.game.entities.forEach(function (e) {
            if(e.is("unlockable")){
                if (e.contractStartTime) {
                    if (e.contractStartTime + e.contract.requiredTime > now) {
                        e.countdown();
                    } else {
                        e.finishContract();
                    }
                } else if (e.definition.unlock <= population) {
                    e.unlock();
                }
            }
        });

        utils.subscribe('game:unlockable/keyTouch', function () {
            var currentPopulation = wooga.castle.game.getPopulation();
            wooga.castle.game.entities.forEach(function (e) {
                if(e.is("unlockable") && e.definition.unlock <= currentPopulation){
                    e.startContract();
                }
            });
        });
    });

}());
