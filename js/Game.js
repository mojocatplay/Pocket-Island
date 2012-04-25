/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */
(function () {
    "use strict";
    var utils = wooga.castle.utils,
        ENEMY_RESPAWN_INTERVAL = 40 * 1000;

        var _instance = null;


        var Game = function (config) {

            if (_instance) {
                throw "Game was already instantiated.";
            }

            _instance = this;

            this.playerData = config.playerData;

            utils.publish('have player data', {
                game: this,
                playerData: this.playerData
            });

            wooga.castle.playerData = this.playerData;

            this.entitiesDefinition = config.entitiesDefinition;

            wooga.castle.xp = new wooga.castle.XP(this.playerData, this); // TODO: wooga.castle.xp is bad // also XP.read was bad.
                // wooga.castle.xp is a controller for the xperience handling, read data from it if you want to save.

            this.entities = [];
            this.decorations = [];
            this.worldEntity = new wooga.castle.WorldEntity(this);

            var mapWidth = this.mapWidth = this.playerData.map.width,
                mapHeight = this.mapHeight = this.playerData.map.height;

            this.mapRel = {
                halfWidth: mapWidth / 2,
                halfHeight: mapHeight / 2
            };
            this.mapRel.x = {
                "first": -this.mapRel.halfWidth,
                "last": this.mapRel.halfWidth
            };
            this.mapRel.y = {
                "first": -this.mapRel.halfHeight,
                "last": this.mapRel.halfHeight
            };

            this.generateGridMaps();

            this.initializeSubscriptions();

            this.initActivityCheck();
        };

    utils.mixin(Game, utils.PubSubMixin);
    utils.mixin(Game, utils.ObservableMixin);

    Game.instance = function () {
        return _instance;
    };

    (function () {

        var CHECK_FOR_ACTIVITY_INTERVAL = 5000;

        Game.prototype._updateContracts = function () {
            if(window.wakeup_already_called){
                this.publish('wake-up',{});
            } else {
                window.wakeup_already_called = true;
            }
            var i, e,
                PAUSED = wooga.castle.House.ContractState.PAUSED,
                IDLE = wooga.castle.House.ContractState.IDLE;

            for (i = 0; i < this.entities.length; i++){
                e = this.entities[i];
                if ( ( e.is('any house') && e.contractState !== PAUSED && e.contractState !== IDLE ) || e.is('farm')) {
                    if (e.contract !== null && typeof e.contract !== 'undefined') {

                        var timeLeft = e.contractStartTime + e.contract.requiredTime - Date.now();
                        if (timeLeft <= 0) {
                            clearTimeout(e.contractTimeout);
                            e.finishContract();
                        }
                    }
                }
            }
        };

        Game.prototype._updatesAfterPhoneIdle = function () {
            if (!this.playerData) {
                return;
            }

            var timeSinceLastActiveCheck = Math.max(0, Date.now() - (this.playerData._lastActiveCheck || 0));
            var checkPerformedLastTime = Math.floor(timeSinceLastActiveCheck / CHECK_FOR_ACTIVITY_INTERVAL);
            var nextActiveCheckTimeout = checkPerformedLastTime % CHECK_FOR_ACTIVITY_INTERVAL;

            if (checkPerformedLastTime) {
                if ((Date.now() - this.playerData._lastActiveCheck) > 1.5 * CHECK_FOR_ACTIVITY_INTERVAL) {
                    this._updateContracts();

                    if (this.playerData.doneTutorial) {
                        wooga.notify("Remember to finish the King's Wishlist!");
                    }
                }
            }
            this.playerData._lastActiveCheck = Date.now() + nextActiveCheckTimeout;
        };

        Game.prototype.initActivityCheck = function () {
            setInterval(utils.bind(this._updatesAfterPhoneIdle, this), 2000);
        };

    }());

    Game.prototype.initializeSubscriptions = function() {
        this.subscribe("contract/start", this.contractStartHandler);
        this.subscribe("contract/collect", this.contractCollectHandler);
        this.subscribe("contract/", this.updateMapData);

        this.subscribe("entity/buy", this.buyHandler);
        this.subscribe("entity/buy", this.updateMapData);
        this.subscribe("entity/move", this.updateMapData);
        this.subscribe("entity/move", this.onEntityMove);
        this.subscribe("entity/buy", this.onEntityBoughtAndPlaced);

        this.subscribe('player/level-up', this.levelUp);
        this.subscribe('tutorial/done', this.enemyRespawn);
        this.subscribe('enemy/kill', this.enemyRespawn);
    };

    // generates gridMap & coastSubSet
    Game.prototype.generateGridMaps = function() {
        this.gridMap = {};
        this.gridMapCoastSubSet =  {};
        var coastmap =  this.entitiesDefinition.coastmap.image,
            w = coastmap.width,
            h = coastmap.height,
            imageData, yi, xi, yl, xl,
            canvas = document.createElement('canvas'),
            ctx = canvas.getContext('2d'),
            mapRel = this.mapRel;

        canvas.height = h;
        canvas.width = w;
        ctx.drawImage(coastmap, 0, 0, w, h);

        imageData = ctx.getImageData(0, 0, w, h);

        // gridMapCoastSubSet
        for (yi = mapRel.y.first, yl = mapRel.y.last; yi < yl; yi++) {
            this.gridMapCoastSubSet[yi] = {};
            for (xi = mapRel.x.first, xl = mapRel.x.last; xi < xl; xi++) {
                this.gridMapCoastSubSet[yi][xi] = imageData.data[((yi + mapRel.halfHeight) * this.mapWidth + (xi + mapRel.halfWidth)) * 4] === 0;
            }
        }

        // gridMap
        for (yi = mapRel.y.first, yl = mapRel.y.last; yi < yl ; yi++) {
            this.gridMap[yi] = {};
            for (xi = mapRel.x.first, xl = mapRel.x.last; xi < xl; xi++) {
                this.gridMap[yi][xi] = []; // TODO: can entities overlap?
            }
        }
    };


    Game.prototype.enemyRespawn = function () {
        var self = this;
        setTimeout(function () {
            if (self.playerData.doneTutorial) {
                utils.publish('spawn enemy');
            }
        }, ENEMY_RESPAWN_INTERVAL);
    };



    Game.prototype.init = function () {

        this.playerData.map.entities.sort(function (a, b) {
            var akey = a.key, bkey = b.key;
            return (akey.indexOf('path') !== -1 || akey.indexOf('farm') !== -1 ) ?  -1 : ( bkey.indexOf('path') !== -1 || bkey.indexOf('farm') !== -1 ? 1 : ( a.y - b.y ));
        }).forEach(this.createEntity, this);

        this.decorations.forEach(function(decoration) {
            decoration.applyBoosts();
        });

        wooga.castle.game = this;

        this.publish("game/init", {
            game: this
        });

        this.subscribe('castle/upgrade', function(message){
            this.castle = message.entityView.entity;
        }, this);

        this.publish('player/update');

        wooga.castle.publish('game/init', {
            game: this
        });
    };

    Game.prototype.createEntity = function (entityConfig) {
        var entity;

        switch (this.entitiesDefinition[entityConfig.key]["class"]) {

            case "castle":
                entity = new wooga.castle.Castle(this, entityConfig);
                this.castle = entity;
                break;

            case "house":
                entity = new wooga.castle.House(this, entityConfig);
                break;

            case "uhouse":
                entity = new wooga.castle.UnfoodedHouse(this, entityConfig);
                break;

            case "statichouse":
                entity = new wooga.castle.SpecialBuilding(this, entityConfig);
                break;

            case "ship":
                entity = new wooga.castle.Ship(this, entityConfig);
                break;

            case "farm":
                entity = new wooga.castle.FarmField(this, entityConfig);
                break;

            case "enemy":
                entity = new wooga.castle.Enemy(this, entityConfig);
                break;

            case "decoration":
                entity = new wooga.castle.Decoration(this, entityConfig);
                this.decorations.push(entity);
                break;

            case "whackable":
                entity = new wooga.castle[(/tree/.test(entityConfig.key) ? "Tree" : "Whackable")](this, entityConfig);
                break;

            case "tree":
                entity = new wooga.castle.Tree(this, entityConfig);
                break;

            case "unlockable":
                entity = new wooga.castle.UnlockableArea(this, entityConfig);
                break;

            case "rock":
                entity = new wooga.castle.Rock(this, entityConfig);
                break;

            default:
                entity = new wooga.castle.Entity(this, entityConfig);
        }

        this.entities.push(entity);

        if (!entity.preview) {
            this.addToGridMap(entity, entity.x, entity.y);
        }

        return entity;
    };

    Game.prototype.removeEntity = function (entity) {
        this.entities.splice(this.entities.indexOf(entity), 1);
        this.removeFromGridMap(entity, entity.x, entity.y);
        if (entity.destructor) {
            entity.destructor();
        }

        // updates for decorations
        if (entity instanceof wooga.castle.Decoration) {
            entity.removeBoosts();
            this.decorations.splice(this.decorations.indexOf(entity), 1);
        } else if (entity instanceof wooga.castle.House ||
                   entity instanceof wooga.castle.FarmField) {
            this.decorations.forEach(function(decoration) {
                decoration.removeEntity(entity);
            });
        }
    };

    Game.prototype.onEntityMove = function (message) {

        var entity = message.entity;

        this.removeFromGridMap(entity, message.prevX, message.prevY);
        this.addToGridMap(entity, entity.x, entity.y);

        this.updateBoosts(entity);
    };

    Game.prototype.onEntityBoughtAndPlaced = function (message) {
        this.updateBoosts(message.entity);
    };

    Game.prototype.updateBoosts = function (entity) {
        // update boosts to enties after move of decoration
        if (entity instanceof wooga.castle.Decoration) {
            entity.applyBoosts().broadcastChangeAfterMove();
        // update boosts of houses or farms after they have been moved - TODO: this calculating everything all over again - make more efficient
        } else if (entity instanceof wooga.castle.House ||
                   entity instanceof wooga.castle.FarmField) {
            this.decorations.forEach(function(decoration) {
                decoration.applyBoosts().broadcastChangeAfterMove();
            });
        }
    };

    Game.prototype.addToGridMap = function (entity, x, y) {

        var yi, xi;

        var yiMax = y + entity.definition.height + (entity.definition.offsetY || 0);
        var xiMax = x + entity.definition.width;

        if ('undefined' !== typeof entity.definition.xOffsetLeft) { x += entity.definition.xOffsetLeft; }
        if ('undefined' !== typeof entity.definition.xOffsetRight) { xiMax += entity.definition.xOffsetRight; }

        for (yi = y; yi < yiMax; yi++) {
            for (xi = x; xi < xiMax; xi++) {
                if (this.gridMap[yi] && this.gridMap[yi][xi]) {
                    this.gridMap[yi][xi].push(entity);
                }
            }
        }
    };

    Game.prototype.removeFromGridMap = function (entity, x, y) {

        var yi, xi, gridField, entityIndex;

        var yiMax = y + entity.definition.height + (entity.definition.offsetY || 0);
        var xiMax = x + entity.definition.width;


        if ('undefined' !== typeof entity.definition.xOffsetLeft) { x += entity.definition.xOffsetLeft; }
        if ('undefined' !== typeof entity.definition.xOffsetRight) { xiMax += entity.definition.xOffsetRight; }

        for (yi = y; yi < yiMax; yi++) {
            for (xi = x; xi < xiMax; xi++) {
                if (this.gridMap[yi] && this.gridMap[yi][xi]) {
                    gridField = this.gridMap[yi][xi];
                    entityIndex = gridField.indexOf(entity);
                    if (entityIndex > -1) {
                        gridField.splice(entityIndex, 1);
                    }
                }
            }
        }

    };

    /**
     * @param rect An area that will be tested for already existing entities lying within
     * @param entity [optional] An entity that will be excluded from the test
     */
    Game.prototype.testCollisions = function (rect, entity) {

        var yi, xi, gridField;

        var xMax = rect.x + rect.width;
        var yMax = rect.y + rect.height;

        for (yi = rect.y; yi < yMax; yi++) {
            for (xi = rect.x; xi < xMax; xi++) {
                if (this.gridMapCoastSubSet[yi] && this.gridMapCoastSubSet[yi][xi]) {
                    return true;
                }
                if (this.gridMap[yi] && this.gridMap[yi][xi]) {
                    gridField = this.gridMap[yi][xi];
                    if (gridField.length && (!entity || (gridField.indexOf(entity) === -1))) {
                        return true;
                    }
                } else {
                    return true;
                }
            }
        }

        return false;

    };

    /**
     * @param rect An area that will be tested for already existing entities lying within
     * @param entity [optional] An entity that will be excluded from the test
     * @param returnEntities [optional] If isReturningEntities is true all the colliding entities are returned
     * @param entities[] [optional] an array to be filled with the colliding entities
     */
    Game.prototype.testCollisions2 = function (rect, entity, returnEntities, entities) {
        var yi, xi, gridField;

        var xMax = rect.x + rect.width;
        var yMax = rect.y + rect.height;

        var result = false,
            isDuplicate = false;

        for (yi = rect.y; yi < yMax; yi++) {
            for (xi = rect.x; xi < xMax; xi++) {
                isDuplicate = false;
                if (this.gridMapCoastSubSet[yi][xi]) {
                    result = true;
                    if (!returnEntities) { return result; }
                }
                gridField = this.gridMap[yi][xi];
                if (this.gridMap[yi] && gridField) {
                    if (gridField.length && (!entity || (gridField.indexOf(entity) === -1))) {
                        result = true;
                        if (!returnEntities) {
                            return result;
                        }

                        if (returnEntities && entities ) {
                            var i;
                            for (i = 0; i < entities.length; i++) {
                                // for now assume entities can't be placed on another
                                if (gridField[0] === entities[i]) { isDuplicate = true; }
                            }
                            if (!isDuplicate) { entities[entities.length] = gridField[0]; }
                        }
                        else { return result; }
                    }
                } else {
                    result = true;
                    if (!returnEntities) {
                        return result;
                    }
                }
            }
        }
        return result;
    };

    Game.prototype.contractStartHandler = function (message) {
        this.publish("player/update");
    };

    Game.prototype.contractCollectHandler = function (message) {
        var contract = message.contract;

        if (contract.providedFood) {
            if (message.entity) {
                this.playerData.food += message.entity.getContractValue();
            } else {
                this.playerData.food += contract.providedFood;
            }
        }
        if (contract.providedGold) {
            if (message.entity !== "undefined") {
                this.playerData.gold += message.entity.getContractValue();
            } else {
                this.playerData.gold += contract.providedGold;
            }
        }
        if (contract.providedXP) {
            wooga.castle.xp.addXP( contract.providedXP );
        }

        this.publish("player/update");
    };

    Game.prototype.levelUp = function () {
        this.publish("player/update");
    };

    Game.prototype.buyHandler = function (message) {
        var entity = message.entity;
        this.drain('gold', entity.definition.goldCost);
        switch (entity.definition["class"]) {
            case "house":
            case "uhouse":
                this.publish('population/change', entity);
                if (entity.contract.constructionTime) {
                    entity.startConstruction();
                } else {
                    entity.activateContract();
                }
                break;
            case "decoration":
                entity.applyBoosts().broadcastChangeAfterMove();
                break;
        }
        this.publish("player/update");
    };

    Game.prototype.drain = function (stat, amount, entityView) {
        if (typeof amount === 'undefined') {
            amount = 1;
        }
        var retval = false;

        if("food" === stat) {
            this.foodNotificationHandler(stat, amount, 30);
        }

        if(this.playerData[stat] - amount >= 0){
            if("xp" !== stat) {
                this.playerData[stat] -= amount;
            } else {
                wooga.castle.xp.addXP(Math.abs(amount));
            }
            wooga.castle.publish('game/' + ( amount > 0 ? 'drain' : 'increase' ) + '-' + stat, {
              entityView: entityView,
              amount: amount,
              text: utils.sign( -1 * amount ) + ' ' + stat
            });
            this.publish('player/update');
            retval = true;
        } else {
            if (entityView) {
                wooga.castle.publish('game/not-enough-' + stat, {
                  entityView: entityView,
                  text: "Not enough " + stat + '!'
                });
            }
        }

        return retval;
    };

    Game.prototype.foodNotificationHandler = function (stat, amount, foodTreshold) {
        if(!this.playerData.recievedFoodBonus) {
            if ((this.playerData[stat] - amount) < 0) {
                this.publish('popup/info', {url: 'templates/popup.html',
                                                    text: "Oh, you ran out of fruit. Don't worry, here is some extra food. But try to plant some seeds right away"});
                this.playerData[stat] += 500;
                this.publish('player/update');
                this.playerData.recievedFoodBonus = true;
            }
        } else {
            if ((this.playerData[stat] - amount) < foodTreshold && (this.playerData[stat] - amount) > 0 ) {
                wooga.notify("You need to plant more seeds!");
            }
        }
    };


    Game.prototype.hasStat = function (stat, amount) {
        return this.playerData[stat] - amount >= 0;
    };

    Game.prototype.getStat = function (stat) {
        return this.playerData[stat];
    };

    Game.prototype.increase = function (stat, amount, entity) {
        if (typeof amount === 'undefined') {
            amount = 1;
        }
        return this.drain(stat, -amount, entity);
    };


    Game.prototype.getPopulation = function () {
        //TODO use caching
        var total = 0;
        this.entities.forEach(function (e) {
            if (e.is(["house", "uhouse"])) {
                total += e.definition.population||1;
            }
        });
        return total;
    };

    Game.prototype.updateMapData = function () {


        this.playerData.map.entities = this.entities.map(function (entity) {

            var result = entity.toSerializable();

            if (entity.is(["house", "uhouse"])) {

                if(entity.contract) {
                    result.contract = {
                        state: entity.contractState
                    };
                    if (entity.contractStartTime) {
                        result.contract.startTime = entity.contractStartTime;
                    }
                    if (entity.contractPauseTime) {
                        result.contract.pauseTime = entity.contractPauseTime;
                    }
                }
            } else

            if (entity.is("statichouse")){
                 if(typeof entity.isHidden  !== 'undefined') {
                    result.isHidden = entity.isHidden;
                 }
            } else

            if (entity.is("farm") && entity.contract) {
                result.contract = {
                    seedName: entity.seedName,
                    state: entity.contractState,
                    startTime: entity.contractStartTime
                };
            } else

            if(entity.is("ship")){
                if(entity.contract) {
                    result.contract = {
                        state: entity.contractState
                    };
                    if (entity.contractStartTime) {
                        result.contract.startTime = entity.contractStartTime;
                    }
                }
            }

            return result;

        }, this);

        this.publish("map/update");

        return this;
    };

    Game.prototype.isAreaOnCoast = function (area) {
        var x,
            y,
            x2,
            y2,
            coastMap = this.gridMapCoastSubSet;
        for (y = area.y, y2 = y + area.height; y < y2; y++) {
            for (x = area.x, x2 = x + area.width; x < x2; x++) {
                if (coastMap[y][x]) {
                     return true;
                }
            }
        }
        return false;
    };

    wooga.castle.Game = Game;



}());
