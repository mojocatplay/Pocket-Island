/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */
(function () {
    "use strict";
    var utils = wooga.castle.utils;

    wooga.castle.RoadsMode = function (manager, config) {

        this.manager = manager;

        this.parentNode = config.rootNode;

        this._build();

        var that = this;
        manager.game.subscribe("game/init", function() {
            that.updateConnections(true);
        });
        manager.game.subscribe("entity/move", function() {
            // updateConnections has to be explicitly called with a falsy parameter, it can't just be added as an event handler
            that.updateConnections(false);
        });
        manager.game.subscribe("entity/buy", function() {
            that.updateConnections(false);
        });

    };

    var RoadsMode = wooga.castle.RoadsMode;

    RoadsMode.prototype._build = function () {

        var hud = document.createElement("div");
        hud.className = "hud_mode roads";

        this.infoPanel = document.createElement("div");
        this.infoPanel.className = "infoPanel";
        this.infoPanel.innerHTML = '<div class="specification"><h6>Edit Roads</h6><p>Tap to place roads for FREE, tap again to remove them.</p></div>';
        hud.appendChild(this.infoPanel);
        this.closeButton = document.createElement("button");
        this.closeButton.className = "close";
        hud.appendChild(this.closeButton);

        utils.addTouchHandler(this.closeButton, this.deactivate, this);

        this.parentNode.appendChild(hud);

        this.rootNode = hud;

    };

    var pathsFilter = function (entity) {
        return entity.is("path");
    };
    var housesFilter = function (entity) {
        return entity.is("any house");
    };

    RoadsMode.prototype.tracePath = function (paths, x, y, dirtyFlag, isSectionConnected, firstRun) {

        var gridMap = this.manager.game.gridMap;

        if (gridMap[y] && gridMap[y][x]) {

            var cell = gridMap[y][x];

            var pathEntity = cell.filter(pathsFilter)[0];

            if (cell.dirtyFlag !== dirtyFlag) {

                cell.dirtyFlag = dirtyFlag;

                if (pathEntity) {

                    var roadType = 0;

                    if (this.tracePath(paths, x, y - 1, dirtyFlag, isSectionConnected, firstRun)) { roadType += 1; }
                    if (this.tracePath(paths, x + 1, y, dirtyFlag, isSectionConnected, firstRun)) { roadType += 2; }
                    if (this.tracePath(paths, x, y + 1, dirtyFlag, isSectionConnected, firstRun)) { roadType += 4; }
                    if (this.tracePath(paths, x - 1, y, dirtyFlag, isSectionConnected, firstRun)) { roadType += 8; }

                    this.manager.view.entitiesViews[pathEntity.id].setRoadType(roadType);

                    paths.splice(paths.indexOf(pathEntity), 1);

                } else if (isSectionConnected) {

                    var houseEntity = cell.filter(housesFilter)[0];
                    if (houseEntity) {
                        houseEntity.connect(firstRun);
                    }

                }

            }

            return !!pathEntity;

        } else {
            return false;
        }

    };

    // It's a static method (not instance method) because it doesn't require "this" and can be called like a function.
    RoadsMode.getRoadRootPosition = function(entity) {
        return {
            x: entity.x + entity.definition.rootRoadPosition.x,
            y: entity.y + entity.definition.rootRoadPosition.y
        };
    };

    RoadsMode.prototype.updateConnections = function (firstRun) {

        var game = this.manager.game;

        var houses = game.entities.filter(housesFilter);
        houses.forEach(function (entity) {
            entity.resetConnection();
        });

        var paths = game.entities.filter(pathsFilter);
        var roadSectionStart = RoadsMode.getRoadRootPosition(game.castle);
        var isSectionConnected = true;

        do {
            this.tracePath(paths, roadSectionStart.x, roadSectionStart.y, Math.random(), isSectionConnected, firstRun);

            roadSectionStart = paths[0];
            isSectionConnected = false;

        } while (paths.length);

        houses.forEach(function (entity) {
            if (!entity.connected) {
                entity.disconnect(firstRun);
            }
        });

    };

    RoadsMode.prototype.checkForDisconnected = function () {

        if (this.manager.game.playerData.doneTutorial) {
            this.setDisconnectedRoadNotification(this.manager.game.entities.filter(function (entity) {
                return housesFilter(entity) && !entity.connected;
            }).length > 0);
        }

    };

    var notificationElement;
    RoadsMode.prototype.setDisconnectedRoadNotification = function (value) {

        if (value) {

            if (!notificationElement) {
                notificationElement = document.querySelector(".no_road_notification");
                if(! notificationElement ){ //TODO who removed the element?
                    return;
                }

                notificationElement.addEventListener('webkitAnimationEnd', function (ev) {
                    var el = ev.target;
                    el.style.webkitAnimationDuration = el.style.webkitAnimationName === "bounce, ine" ? ".5s, 5s" : ".5s, 20s";
                    el.style.webkitAnimationName = el.style.webkitAnimationName === "bounce, ine" ? "bounce, oute" : "bounce, ine";
                }, false);

            }

            notificationElement.style.display = "block";

        } else {

            if (notificationElement) {
                notificationElement.style.display = "none";
            }

        }

    };

    RoadsMode.prototype.activate = function (config) {
        if( this.rootNode.style.display === "block" ){
                return;
        }

        this.manager.view.enableRendering();

        this.manager.view.isFocusedEntityView = function (ev) {
            return !ev || (ev.entity.definition["class"] === "path");
        };

        this.manager.view.addEventHandler("touch", this.touchHandler, this);

        this.show();

    };

    RoadsMode.prototype.deactivate = function () {

        if( ! utils.can('leave-roads') ) {
            return;
        }

        this.manager.view.stopRendering();

        this.manager.view.isFocusedEntityView = this.manager.view.isFocusedEntityViewDefault;

        this.manager.view.removeEventHandler("touch", this.touchHandler, this);

        this.hide();

        this.manager.view.publish('roads/accept');

        this.manager.setMode(wooga.castle.GameModesManager.Mode.BASIC);

    };

    RoadsMode.prototype.show = function () {
        this.rootNode.style.display = "block";
    };

    RoadsMode.prototype.hide = function () {
        this.rootNode.style.display = "none";
    };

    RoadsMode.prototype.touchHandler = function (event) {
        var view = this.manager.view,
            gridUnit = view.gridUnit;

        var x = event.x - view.scrollLeft; x -= x % gridUnit;
        var y = event.y - view.scrollTop;  y -= y % gridUnit;

        var reducedHits = this.getReducedHits(x, y),
            coords = this.manager.view.clientXYtoWorldXY(event),
            cantPlaceRoad = false,
            rect;

        if (reducedHits.length === 0) {
            rect = {
                x: coords.x,
                y: coords.y,
                width: 1,
                height: 1
            };
            if (!this.manager.game.testCollisions(rect, null)) {
				this.addRoad(coords);
			} else {
                cantPlaceRoad = true;
            }
        } else {
            var roadView = reducedHits.filter(function (ev) { return ev.entity.definition["class"] === "path"; })[0];
            if (roadView) {
                if (! this.isRootRoad(roadView.entity)) {
                    this.removeRoad(roadView.entity, roadView);
                } else {
                    utils.publish('view:root-road-tap', {entityView: roadView});
                }
            } else {
                cantPlaceRoad = true;
            }
        }
        if(cantPlaceRoad) {
            var message = {
                entityView: {
                    x: x,
                    y: y,
                    width: gridUnit
                }
            };
            utils.publish('game:road/cant-place-here', message);
        }
    };


    RoadsMode.prototype.isRootRoad = function (roadEntity) {
        var castleRoot = this.getCastleRootPosition();
        return roadEntity.x === castleRoot.x && roadEntity.y === castleRoot.y;
    };

    RoadsMode.prototype.getCastleRootPosition = function () {
        var castle = this.manager.game.castle;
        return {
            x: castle.x + castle.definition.rootRoadPosition.x,
            y: castle.y + castle.definition.rootRoadPosition.y
        };
    };

    RoadsMode.prototype.addRoad = function (position) {

        var message = {
                key: "paths/road",
                x: position.x,
                y: position.y
            },
            entity,
            entityView;

        if(! utils.can('add-road', message)) {
            return;
        }

        entity = this.manager.game.createEntity(message);

        entityView = this.manager.view.createEntityView(entity);

        this.manager.game.publish("road/add", entityView);

        this.updateConnections(false);

    };

    RoadsMode.prototype.removeRoad = function (entity, entityView) {
        if(! utils.can('remove-road', entityView)) {
            return;
        }
        this.manager.view.removeEntityView(entityView);
        this.manager.game.removeEntity(entity);

        this.manager.game.publish("road/remove", entityView);
        this.updateConnections(false);
    };

    RoadsMode.prototype.getReducedHits = function (x, y) {

        return this.manager.view.hitMap[y][x].filter(function (entityView) {
            var isReducedHit = false;
            var xOffsetLeft = 0, xOffsetRight = 0;

            if ('undefined' !== typeof entityView.entity.definition.xOffsetLeft) { xOffsetLeft += entityView.entity.definition.xOffsetLeft; }
            if ('undefined' !== typeof entityView.entity.definition.xOffsetRight) { xOffsetRight += entityView.entity.definition.xOffsetRight; }

            if ((x - entityView.x >=  xOffsetLeft * this.manager.view.gridUnit) && (x - entityView.x <= xOffsetRight * this.manager.view.gridUnit)) {
                isReducedHit = true;
            }

            return (isReducedHit && (y - entityView.y >= -entityView.entity.definition.offsetY * this.manager.view.gridUnit));
        }, this);

    };

}());
