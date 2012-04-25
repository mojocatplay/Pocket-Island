/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */

(function () {

    "use strict";

    var utils = wooga.castle.utils;

    wooga.castle.EntityView = function (view, entity) {

        if (!view || !entity) {
            return;
        }

        wooga.castle.View.call(this);

        this.view = view;
        this.entity = entity;

        if(this.entity.selectable) {
            this.actions = {
                "move": true,
                "destroy": true
            };
        }

        this.eventsBubbleTarget = view;

        this.ctx = view.canvas.getContext("2d");
        this.bufferCtx = view.bufferCanvas.getContext("2d");
        this.entity.entityView = this;

        this.x = (entity.x + view.mapWidth / 2) * view.gridUnit;
        this.y = (entity.y + (entity.definition.offsetY || 0) + view.mapHeight / 2) * view.gridUnit;
        this.flexX = 0;
        this.flexY = 0;

        this.zIndex = entity.definition.zIndex || 0;

        this.image = entity.definition.image;

        this.width = entity.definition.width * view.gridUnit;
        this.height = entity.definition.height * view.gridUnit;

        this.colliding = false;
        this.dynamic = 0; // dynamic switch is a number. if the number is higher than 0 then this view will be rendered dynamically.

        this.showBoostInfo = false;

        this.cacheImageFrame();
        this.initDraggability();

        this.iconCircle = Date.now();
    };

    var EntityView = wooga.castle.EntityView;

    EntityView.prototype = new wooga.castle.View();
    EntityView.prototype.constructor = EntityView;


    EntityView.prototype.initDraggability = function () {

        this.addEventHandler("dragstart", function (event) {
            if (this.isDraggable) {
                this.beforeMove();
                return false;
            }
        });

        this.addEventHandler("drag", function (event) {
            if (this.isDraggable) {
                this.moveTo(event, true);
                return false; // prevent event propagation, otherwise world would scroll
            }
        });

        this.addEventHandler("dragend", function () {
            if (this.isDraggable) {
                this.moved();
                // Caching the value used later many times in the game loop
                this.isCollidingCache = this.isColliding();
                // WARNING: it does not mean that the entity has moved! only entityView did! call entity.move() to save the state (just don't do it here).
                return false;
            }
        });

    };

    EntityView.prototype.isColliding = function () {
        return this.entity.isColliding({
            x: (this.x / this.view.gridUnit - this.view.mapWidth / 2),
            y: (this.y / this.view.gridUnit - this.view.mapHeight / 2 - this.entity.definition.offsetY)
        });
    };

    EntityView.prototype.getImageFrame = function () {
        return this.defaultImageFrame;
    };

    EntityView.prototype.setImageFrame = function (definition) {
        var gridUnit = this.view.gridUnit;
        var frame = this.defaultImageFrame;

        frame.width = definition.width * gridUnit;
        frame.height = definition.height * gridUnit;

        frame.x = (definition.spritex || 0) * gridUnit;
        frame.y = (definition.spritey || 0) * gridUnit;
    };

    EntityView.prototype.cacheImageFrame = function(){
        this.defaultImageFrame = this.getImageFrameForDefinition(this.entity.definition);
        return this;
    };

    EntityView.prototype.getImageFrameForDefinition = function(definition){
        return {
            x: (definition.spritex || 0) * this.view.gridUnit,
            y: (definition.spritey || 0) * this.view.gridUnit,
            width: this.width,
            height: this.height
        };
    };


    EntityView.prototype.beforeMove = function(){
        this.view.removeFromHitmap(this);
        this.makeDynamic();
    };

    EntityView.prototype.moveTo = function(xy, applyOffset){
        var gridUnit = this.view.gridUnit;

        var x = xy.x - this.view.scrollLeft - (this.width - gridUnit) / 2;
        var y = xy.y - this.view.scrollTop - (this.height - gridUnit) / 2;

        this.flexX = x % gridUnit - gridUnit / 2;
        this.flexY = y % gridUnit - gridUnit / 2;

        this.x = x - x % gridUnit;
        this.y = y - y % gridUnit + Math.min(this.entity.definition.offsetY, -1) * gridUnit;

        if (applyOffset) {
             this.y -= gridUnit;
        }

        this.fireEvent('moved', this);
        return this;
    };

    EntityView.prototype.moved = function() {
        if (this._afterMovedTimeoutEV) {
            clearTimeout(this._afterMovedTimeoutEV);
        }

        delete this.isCollidingCache;
        var self = this;
        this._afterMovedTimeoutEV = setTimeout( function () {
            self.clearFlex();
            self.view.addToHitmap(self);
            self.makeStatic();
            self.view.publish('entity/moved', {
                "entity": self
            });
        }, 50);
    };

    EntityView.prototype.clearFlex = function () {
        this.flexX = 0;
        this.flexY = 0;
    };

    EntityView.prototype.draw = function (ctx, x, y) {
        var frame = this.getImageFrame();
        ctx.drawImage(
                this.image,
                frame.x, frame.y, frame.width, frame.height,
                x + this.flexX, y + this.flexY, frame.width, frame.height);
    };

    EntityView.prototype.drawStatic = function () {

        if (!this.dynamic && !this.entity.preview) {
            this.draw(this.bufferCtx, this.x, this.y);
        }

    };


    EntityView.prototype.drawDynamic = function (x, y) {

        if (this.isDraggable && !this.isCollidingCache) {
            this.drawBaseGrid();
        }

        if (this.dynamic || this.entity.preview) {
            this.draw(this.ctx, x, y);
        }

        if (this.isDraggable && this.isCollidingCache) {
            this.drawBaseGrid();
        }


    };

    EntityView.prototype.drawBaseGrid = function () {

        var ctx = this.ctx;

        var hitMap = this.view.hitMap,
            gridUnit = this.view.gridUnit,
            view = this.view;

        var xMin = this.x,
            xMax = xMin + this.width;

        var yMin = this.y - this.entity.definition.offsetY * gridUnit,
            yMax = this.y + this.height;

        var isColliding, color, isOneSubgridColliding = false;

        var tutorial = wooga.castle.Tutorial.instance();
        this.actionsMenu.setActionEnabled( 'confirm', false);


        var yi, xi;
        for (yi = yMin; yi < yMax; yi += gridUnit) {
            for (xi = xMin; xi < xMax; xi += gridUnit) {

                if (hitMap[yi] && hitMap[yi][xi]) {
                    isColliding = false;

                    var mapWidth = this.entity.game.playerData.map.width,
                        mapHeight = this.entity.game.playerData.map.height,
                        newX = Math.floor(xi/gridUnit - mapWidth / 2),
                        newY = Math.floor(yi/gridUnit - mapHeight / 2);

                    if (wooga.castle.playerData.doneTutorial || !tutorial) {
                        if (this.view.game.testCollisions({x: newX, y: newY, width: 1, height: 1}, this.entity)) {
                            isColliding = true;
                        }
                    } else {
                        var hilite = tutorial.screen.config.hilite;
                        if (!(newX >= hilite.x && newX < (hilite.x + hilite.width) && newY  >= hilite.y && newY < (hilite.y + hilite.height))) {
                            isColliding = true;
                        }
                    }

                    color = isColliding ? "rgba(255, 0, 0, 0.5)" : "rgba(0, 255, 0, 0.5)";

                    ctx.fillStyle = color;
                    ctx.strokeStyle = color;
                    ctx.fillRect(xi + view.scrollLeft, yi + view.scrollTop, gridUnit, gridUnit);
                    ctx.strokeRect(xi + view.scrollLeft, yi + view.scrollTop, gridUnit, gridUnit);

                    isOneSubgridColliding = isOneSubgridColliding || isColliding;
                }
            }
        }

        if (!isOneSubgridColliding) {
           this.actionsMenu.setActionEnabled( 'confirm', true);
        }
    };

    EntityView.prototype.makeDynamic = function () {
        if (!this.dynamic) {
            this.view.bufferCanvasChanges.push(this);
        }

        this.dynamic++;
    };

    EntityView.prototype.makeStatic = function () {

        if (this.dynamic > 0) { this.dynamic--; }

        if (!this.dynamic) {
            this.view.bufferCanvasChanges.push(this);
        }
    };

    EntityView.prototype.isFocusable = function () {
        return this.entity.selectable;
    };

    //TODO move
    EntityView.prototype.drawBoostInfo = function () {

        if (this.entity.boost <= 0) { return; }

        var ctx = this.ctx,
            messageL1 = "Bonus",
            messageL2 = this.entity.boost + " %";

        var metrics1 = ctx.measureText(messageL1),
            metrics2 = ctx.measureText(messageL2);

        var xPosShift1 = this.width/2 - metrics1.width/2,
            xPosShift2 = this.width/2 - metrics2.width/2,
            fontSizeFill = this.view.gridUnit/1.5,
            fontSizeStroke = this.view.gridUnit/1.49;

        ctx.font = fontSizeStroke + "px 'Luckiest Guy'";
        ctx.strokeStyle ="rgba(0, 0, 0, 1)";
        ctx.strokeText(messageL1, this.x + this.view.scrollLeft + xPosShift1, this.y + this.width/2   + this.view.scrollTop);
        ctx.strokeText(messageL2, this.x + this.view.scrollLeft + xPosShift2, this.y + this.width/2 + this.view.gridUnit/1.7 + this.view.scrollTop);

        ctx.font = fontSizeFill + "px 'Luckiest Guy'";
        ctx.fillStyle = "rgba(86, 255, 255, 1)";
        ctx.fillText(messageL1, this.x + this.view.scrollLeft + xPosShift1, this.y + this.width/2   + this.view.scrollTop);
        ctx.fillText(messageL2, this.x + this.view.scrollLeft + xPosShift2, this.y + this.width/2 + this.view.gridUnit/1.7 + this.view.scrollTop );
    };


    EntityView.prototype.findNewPosition = function () {

        var mapWidth = this.entity.game.playerData.map.width,
            mapHeight = this.entity.game.playerData.map.height;

        var newX = 0, newY = 0,
            count = 0, x = 0, y = 0,
            isOffmap = false,
            maxNumTrials = 100,
            prevX = this.x,
            prevY = this.y;


        do {
            count += 1;
            newX = Math.floor(Math.random() * (mapWidth) ) - mapWidth / 2;
            newY = Math.floor(Math.random() * (mapHeight)) - mapHeight / 2;

            x = (newX + mapWidth / 2) * this.view.gridUnit;
            y = (newY + this.entity.definition.offsetY + mapHeight / 2) * this.view.gridUnit;

            if ((this.entity.definition.width + newX  + mapWidth  / 2) >= mapWidth ||
                (this.entity.definition.height + newY + mapHeight / 2) >= mapHeight ||
                x < 0 || y < 0) {
                    isOffmap = true;
            } else {
                isOffmap = false;
            }
		} while ((this.isEntityColliding(x,y) || isOffmap || (prevX === x && prevY === y)) && count < maxNumTrials );

        // if no random spot was found, then find the first spot there is (by exaustive search) that is not the current one
        if (count >= maxNumTrials) {
            var yi, xi;
            for (yi = -mapHeight / 2; yi < mapHeight / 2; yi++) {
                for (xi = -mapWidth / 2; xi < mapWidth / 2; xi++) {
                    newX = xi;
                    newY = yi;
                    x = (newX + mapWidth / 2) * this.view.gridUnit;
                    y = (newY + this.entity.definition.offsetY + mapHeight / 2) * this.view.gridUnit;
                    if (!this.isEntityColliding(x,y) && prevX !== x && prevY !== y) {
                        this.entity.move({
                            x: newX,
                            y: newY
                        });
                        return true;
                    }
                }
            }
        } else {
            this.entity.move({
                x: newX,
                y: newY
            });
            return true;
        }

        return false;
    };


    EntityView.prototype.isEntityColliding = function (x, y) {
        var result = false;

        var hitMap = this.view.hitMap,
            gridUnit = this.view.gridUnit,
            coastMap = this.entity.game.gridMapCoastSubSet,
            map = this.entity.game.playerData.map;

        var xMin = "undefined" === typeof x ? this.x : x,
            xMax = xMin + this.width;

        var yMin = ("undefined" === typeof y ? this.y : y) - this.entity.definition.offsetY * gridUnit,
            yMax = yMin + this.height + this.entity.definition.offsetY * gridUnit,
            thisEntity = this.entity;

        if ('undefined' !== typeof thisEntity.definition.xOffsetLeft) { xMin += thisEntity.definition.xOffsetLeft * gridUnit; }
        if ('undefined' !== typeof thisEntity.definition.xOffsetRight) { xMax += thisEntity.definition.xOffsetRight * gridUnit; }

        // offmap?
        if (xMax > map.width * gridUnit || yMax > map.height * gridUnit) {
            return true;
        }

        var yi, xi, i, collidingEntityView, collidingEntitiesViews;

        var isEnemyColliding = function(collidingEntity) {
            return !collidingEntity.is(['path', 'farm']);
        };

        var rect = {
            "x": Math.floor(xMin / gridUnit - map.width / 2),
            "y": Math.floor(yMin / gridUnit - map.height / 2),
            "width": Math.floor((xMax - xMin) / gridUnit),
            "height": Math.floor((yMax - yMin) / gridUnit)
        };

        if (this.entity.game.isAreaOnCoast(rect)) {
            return true;
        }

        for (yi = yMin; yi < yMax; yi += gridUnit) {
            for (xi = xMin; xi < xMax; xi += gridUnit) {
                if(thisEntity.is('enemy')) {
                    collidingEntitiesViews = hitMap[yi] && hitMap[yi][xi];
                    if (collidingEntitiesViews) {
                        for (i = 0; i < collidingEntitiesViews.length; i++) {
                            collidingEntityView = collidingEntitiesViews[i];
                            if (collidingEntityView !== this && isEnemyColliding(collidingEntityView.entity)) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
        return false;
    };

    EntityView.prototype.invalidate = function () {
        this.image = this.entity.definition.image;
        this.cacheImageFrame();
        this.invalidatePosition();
        return this;
    };

    EntityView.prototype.invalidatePosition = function(){
        var clearRect = {
                x: this.x,
                y: this.y,
                width: this.width,
                height: this.height
            };

        this.view.removeFromHitmap(this);


        this.x = (this.entity.x + this.view.mapWidth / 2) * this.view.gridUnit;
        this.y = (this.entity.y + this.entity.definition.offsetY + this.view.mapHeight / 2) * this.view.gridUnit;

        this.view.addToHitmap(this);

        this.view.bufferCanvasChanges.push(this, clearRect);
        utils.publish('view:invalidate');
        return this;
    };


    utils.can('touch-view', function (view) {
        if(view.view.mode === wooga.castle.GameModesManager.Mode.MOVE) {
            return view.view.isFocusedEntityView(view);
        }
        return !view.view.isFocusedEntityView(view) && !view.busy;
    });

}());
