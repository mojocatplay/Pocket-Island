/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */

(function () {

    "use strict";

    var DRAG_THRESHOLD = 10;
    var LONG_TOUCH_DELAY = 750;

    var utils = wooga.castle.utils;

    wooga.castle.WorldView = function (game, config) {

        wooga.castle.View.call(this);

        var self = this,
            that = this;
        this.isDragAllowed = true;
        this.focusedEntityView = undefined;

        var updateOrientation = function () {
            wooga.castle.Viewport.maximize();
            setTimeout(function () {
                var clientSize = wooga.castle.Viewport.getClientSize();
                that.offsetWidth = clientSize.width;
                that.offsetHeight = clientSize.height;
                if (that.canvas) {
                    that.canvas.width = clientSize.width;
                    that.canvas.height = clientSize.height;
                }
                that.center();
                if(! wooga.castle.capabilities.desktop){
                    utils.toggleClass(document.body, 'landscape', (clientSize.width > clientSize.height)); // poor man landscape check to workaround fb 3.x bug
                }
		self.isScrolled = true;
                utils.publish('view:orientation/change');
            }, 100);
        };
        wooga.castle.updateOrientation = updateOrientation;

        window.addEventListener('orientationchange', updateOrientation, false);


        wooga.castle.OverlayUrlBar.instance();
        wooga.castle.OverlayUrlBar.hide();
        var touch = wooga.castle.capabilities.touch;

        var scrollLocker = function () {

            var itWasMeWhoScrolled = true,
                removeUrlBar = function () {
                    if(itWasMeWhoScrolled){
                        itWasMeWhoScrolled = false;
                        return;
                    }
                    wooga.castle.OverlayUrlBar.show();
                },
                resetItWasMeWhoScrolledTimeout,
                setItWasMeWhoScrolled = function () {
                    if (resetItWasMeWhoScrolledTimeout) {
                        clearTimeout(resetItWasMeWhoScrolledTimeout);
                    }
                    itWasMeWhoScrolled = true;
                    resetItWasMeWhoScrolledTimeout = setTimeout(function () {
                        itWasMeWhoScrolled = false;
                    }, 1000);
                };
            if( !utils.isSPA() ) {
                window.addEventListener('scroll', removeUrlBar, false);
            }

            document.querySelector('#enforce-urlBarRemove').addEventListener(touch? 'touchend' : 'click', function () {
                setItWasMeWhoScrolled();
                window.scrollTo(0,0);
                wooga.castle.OverlayUrlBar.hide();
            }, false);
            wooga.castle.OverlayUrlBar.hide();
        };

        wooga.castle.subscribe('game/ready', scrollLocker);


        this.game = game;
        this.entity = game.worldEntity;

        this.rootNode = config.rootNode;

        this.gridUnit = config.gridUnit;

        this.mapWidth = config.mapWidth; // TODO: change unit to px
        this.mapHeight = config.mapHeight;

        this.mapWidthPx = this.mapWidth * this.gridUnit;
        this.mapHeightPx = this.mapHeight * this.gridUnit;


        this.offsetWidth = config.offsetWidth;
        this.offsetHeight = config.offsetHeight;

        this.scrollLeft = 0;
        this.scrollTop = Math.round(-(this.mapHeight * this.gridUnit - this.offsetHeight));

        this.rendering = true;

        this.mode = wooga.castle.GameModesManager.Mode.BASIC; //TODO use the setMode api

        this.entitiesViews = {}; // TODO: why is this a hash again? it's often used as an array, so it would be faster if it was an array
        this.visibleEntitiesViews = [];
        this.bufferCanvasChanges = [];

        this.addEventHandler('scrolled', function(){
            this.isScrolled = true;
        }, this);

        this.hitMap = [];
        var i, j;
        for (i = 0; i < this.mapHeight; i++) {
            this.hitMap[i * this.gridUnit] = [];
            for (j = 0; j < this.mapWidth; j++) {
                this.hitMap[i * this.gridUnit][j * this.gridUnit] = [];
            }
        }

        this.isFocusedEntityViewDefault = function (entityView) { return false; }; // do not overwrite! it's a helper function - useful when you want to revert changed isFocusedEntityView to a default function (this one)
        this.isFocusedEntityView = this.isFocusedEntityViewDefault; // if overwritten then this function should always return true if no argument is supplied

        this.createCanvas();
        this.createBufferCanvas();
        this.createGridCanvas();
        // TODO: make available via dev menu
        //this.createInfoCanvas();

        this.initWorldInteractions();
        this.initScrollability();

        this.initRenderingLoop();

        this.addEventHandler("dragend", this.filterVisibleViews);

        game.subscribe("game/init", this.onGameInit, this);

        this.moveEntityView = null;
        game.subscribe("moveMode/activated", this.setMoveEntityView, this);
        game.subscribe("moveMode/deactivated", function(message){
            this.removeMoveEntityView(message);
            this.enableRendering();
        }, this);

        game.subscribe("shopPreviewMode/activated", this.setMoveEntityView, this);
        game.subscribe("shopPreviewMode/deactivated", function(message){
            this.removeMoveEntityView(message);
            this.enableRendering();
        }, this);

        this.subscribe('mode-change', function(){
            this.forceGrid();
            this.enableRendering();
        }, this);

        this.subscribe('entity/focus', function(message){
            this.ensureEntityIsVisible(message);
            this.enableRendering();
        }, this);

        this.subscribe('entity/ensureVisible', function(message){
            this.ensureEntityIsVisible(message);
            this.enableRendering();
        }, this);

        wooga.castle.publish('game/worldViewInit', {
            view: this
        });

        // rendering
        this.initializeRenderSubscriptions();
    };

    var WorldView = wooga.castle.WorldView;

    WorldView.prototype = new wooga.castle.View();
    WorldView.prototype.constructor = WorldView;

    utils.mixin(WorldView, utils.PubSubMixin);
    utils.mixin(WorldView, wooga.castle.WorldViewScrollabilityMixin);


    WorldView.TRANSPARENCY_THRESHOLD = 20;

    WorldView.prototype.initializeRenderSubscriptions = function() {
        wooga.castle.subscribe("game/ready", this.enableRendering, this);

        utils.subscribe("spawn", this.enableRendering, this);
        // handle road/add and road/remove
        utils.subscribe("game:road/", this.enableRendering, this);
        utils.subscribe("game:entity/whack", this.enableRendering, this);
        utils.subscribe("game:entity/whack-complete", this.enableRendering, this);
        utils.subscribe("game:contract/collect", this.enableRendering, this);
        utils.subscribe("game:contract/start", this.enableRendering, this);

        this.subscribe("invalidate", this.enableRendering, this);
        this.subscribe("entity/moved", this.enableRendering, this);
        // handle info mode start & end
        this.subscribe("hud/", this.enableRendering, this);

        // stop animating after whacked
        this.subscribe('enemy/animation-start', function(){
            this.enableAnimating();
        }, this);
        this.subscribe('enemy/animation-end', function(){
            this.stopAnimating();
            this.enableRendering(); // needed to clear the last animation frame
        }, this);
    };

    WorldView.prototype.createCanvas = function () {

        var canvas = document.createElement("canvas");

        canvas.width = this.offsetWidth;
        canvas.height = this.offsetHeight;

        canvas.getContext("2d").shadowColor = "rgba(255, 255, 255, 1)";

        this.rootNode.appendChild(canvas);

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

    };

    WorldView.prototype.createBufferCanvas = function () {

        var bufferCanvas = document.createElement("canvas");

        bufferCanvas.width = this.mapWidthPx;
        bufferCanvas.height = this.mapHeightPx;

        this.bufferCanvas = bufferCanvas;
        this.bufferCtx = bufferCanvas.getContext("2d");

    };


    WorldView.prototype.setGridVisible = function (isVisible) {
        utils.toggleClass(this.gridCanvas, 'hidden', isVisible);
    };

    WorldView.prototype.createGridCanvas = function () {
        var canvas = document.createElement("canvas"),
            ctx = canvas.getContext("2d");
        canvas.id = 'grid-map';
        canvas.width = this.mapWidthPx;
        canvas.height = this.mapHeightPx;

        this.drawWorldGrid(ctx);
        this.gridCanvas = canvas;
        this.rootNode.parentNode.appendChild(canvas);
    };

    WorldView.prototype.createInfoCanvas = function () {
        var canvas = document.createElement("canvas"),
            ctx = canvas.getContext("2d");
        canvas.id = 'info-grid';
        canvas.width = this.mapWidthPx;
        canvas.height = this.mapHeightPx;

        this.drawInfoGrid(ctx);
        this.infoCanvas = canvas;
        this.rootNode.parentNode.appendChild(canvas);
    };


    WorldView.prototype.onGameInit = function (message) {

        message.game.worldView = this;

        this.game.entities.forEach(function (entity) {
            this.createEntityView(entity, true);
        }, this);

        this.filterVisibleViews();
        this.redrawBufferCanvas();

    };


    WorldView.prototype.createEntityView = function (entity, _skipRendering) {

        var entityView;

        switch (entity.definition["class"]) {
            case "castle":
                entityView = new wooga.castle.CastleView(this, entity);
                break;
            case "house":
            case "uhouse":
                entityView = new wooga.castle.HouseView(this, entity);
                break;
            case "statichouse":
                entityView = new wooga.castle.SpecialBuildingView(this, entity);
                break;
            case "ship":
                entityView = new wooga.castle.ShipView(this, entity);
                break;
            case "farm":
                entityView = new wooga.castle.FarmFieldView(this, entity);
                break;
            case "enemy":
                entityView = new wooga.castle.EnemyView(this, entity);
                break;
            case "path":
                entityView = new wooga.castle.RoadView(this, entity);
                break;
            case "decoration":
                entityView = new wooga.castle.DecorationView(this, entity);
                break;
            case "whackable":
            case "tree":
            case "rock":
                entityView = new wooga.castle.WhackableView(this, entity);
                break;
            case "unlockable":
                entityView = new wooga.castle.UnlockableAreaView(this, entity);
                break;
            default:
                entityView = new wooga.castle.EntityView(this, entity);
        }

        this.addToHitmap(entityView);

        this.entitiesViews[entity.id] = entityView;

        if (!_skipRendering) {

            this.filterVisibleViews();

            this.bufferCanvasChanges.push(entityView);

        }

        return entityView;

    };

    WorldView.prototype.removeEntityView = function (entityView) {

        this.removeFromHitmap(entityView);

        delete this.entitiesViews[entityView.entity.id];

        this.filterVisibleViews();

        this.bufferCanvasChanges.push(entityView);

    };

    WorldView.prototype.filterVisibleViews = function () {
        var i, entityView;

        this.visibleEntitiesViews = [];

        for (i in this.entitiesViews) {
            if(this.entitiesViews.hasOwnProperty(i)) {
                entityView = this.entitiesViews[i];
                if (this.isEntityOnScreen(entityView) || entityView.isDraggable) {
                    // note: during move mode draggable entities that are off-screen need
                    // to be redrawn, so that they can be placed by tapping
                    this.visibleEntitiesViews.push(entityView);
                }
            }
        }

    };

    WorldView.prototype.isEntityOnScreen = function (entityView) {

        return ((entityView.x < -this.scrollLeft + this.offsetWidth) &&
                (entityView.x + entityView.width  > -this.scrollLeft) &&
                (entityView.y < -this.scrollTop + this.offsetHeight) &&
                (entityView.y + entityView.height > -this.scrollTop));

    };


    WorldView.prototype.getPanningMargins = function () {
        if(! this._panningMargins){
            var gu = this.gridUnit;
            this._panningMargins = {
                "left": 3 * gu,
                "right": 3 * gu,
                "top": 7 * gu,
                "bottom": 4 * gu
            };
        }
        return this._panningMargins;
    };


    WorldView.prototype.ensureEntityIsVisible = function (entityView) {
        var ex = entityView.x, ey = entityView.y,
            ew = entityView.width, eh = entityView.height,
            sl = this.scrollLeft, st = this.scrollTop,
            w = this.offsetWidth, h = this.offsetHeight,
            margins = this.getPanningMargins(),
            okl = (ex > -sl + margins.left),//left bound. Other OK's you can understand now.
            okr = (ex + ew < -sl + w - margins.right),
            okt = (ey > -st + margins.top),
            okb = (ey + eh < -st + h - margins.bottom),

            targetl, targett;

        if(! (okl && okr && okt && okb)){
            if(! okl){
                targetl = -ex + margins.left;
            }
            if(! okr){
                targetl = -(ex + ew + margins.right) + w;
            }
            if(! okt){
                targett = -ey + margins.top;
            }
            if(! okb){
                targett = -(ey + eh + margins.bottom) + h;
            }

            if(targetl){
                this.setScrollLeft(targetl);
            }
            if(targett){
                this.setScrollTop(targett);
            }

            if (targetl || targett) {
                this.fireEvent('scrolled', this);
            }
        }
        return this;
    };

    WorldView.prototype.stopRendering = function() {
        this.rendering = false;
    };

    WorldView.prototype.enableRendering = function() {
        this.rendering = true;
    };

    WorldView.prototype.stopAnimating = function() {
        this.animating = false;
    };

    WorldView.prototype.enableAnimating = function() {
        this.animating = true;
    };

    WorldView.prototype.initRenderingLoop = function () {

        var that = this,
            self = this,
            ctx = this.ctx;

        var bgStyle = document.getElementById("bg").style;
        var overlayStyle = document.getElementById("game_overlay").style;
        var gridStyle = this.gridCanvas.style;
        //var infoStyle = this.infoCanvas.style;
        this.scrollTo(this.scrollLeft, this.scrollTop);

        var prevNow, tick = 0;

        self.rendering = false;
        self.animating = false;

        var loop = function () {
            tick++;

            // TODO: make available via dev menu
            //if(tick %  50 === 0) {
            //    self.drawInfoGrid(self.infoCanvas.getContext('2d'));
            //}

            //console.log('loop', self.rendering, self.animating);

            if (self.rendering || self.animating || self.isScrolled) {

                if (that.isScrolled) {
                    var translation = "translate3d(" + that.scrollLeft + "px, " + that.scrollTop + "px, 0)";
                    bgStyle.webkitTransform = translation;
                    overlayStyle.webkitTransform = translation;
                    gridStyle.webkitTransform = translation;
                    //infoStyle.webkitTransform = translation;
                    that.isScrolled = false;
                }

                // update static elements buffer
                that.updateBufferCanvas();

                // calculate visible rectangle

                var w = Math.min(that.offsetWidth, that.mapWidthPx, that.mapWidthPx + that.scrollLeft);
                var h = Math.min(that.offsetHeight, that.mapHeightPx, that.mapHeightPx + that.scrollTop);

                ctx.clearRect(0, 0, that.offsetWidth, that.offsetHeight);

                // render static elements (only rectangular part calculated before)
                ctx.drawImage(
                        that.bufferCanvas,
                        Math.max(0, -that.scrollLeft), Math.max(0, -that.scrollTop), w, h,
                        Math.max(0, that.scrollLeft), Math.max(0, that.scrollTop), w, h);

                // render dynamic elements
                that.visibleEntitiesViews.forEach(function (entityView) {
                    entityView.drawDynamic(
                            that.scrollLeft + entityView.x,
                            that.scrollTop + entityView.y
                    );
                });

            }

            // always stop unless we're animating (enemy)
            if(!self.animating) {
                self.stopRendering();
            }

            setTimeout(loop, 1000/30);
        };


        prevNow = Date.now();
        loop();
    };

    WorldView.prototype.drawWorldGrid = function(ctx){
        var gridUnit = this.gridUnit,
            xi, yi,
            mw = this.mapWidth,
            mh = this.mapHeight;

        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctx.lineWidth = gridUnit/24;

        for (xi = 1; xi < mw; xi++) {
            ctx.beginPath();
            ctx.moveTo(xi * gridUnit, 0);
            ctx.lineTo(xi * gridUnit, this.mapHeightPx);
            ctx.stroke();
            ctx.closePath();
        }

        for (yi = 1; yi < mh; yi++) {
            ctx.beginPath();
            ctx.moveTo(0, yi * gridUnit);
            ctx.lineTo(this.mapWidthPx, yi * gridUnit);
            ctx.stroke();
            ctx.closePath();
        }
    };

    WorldView.prototype.drawInfoGrid = function(ctx){
        var gu = this.gridUnit,
            xi, xl, yi, yl, x, y,
            mw = this.mapWidth,
            mh = this.mapHeight,
            coastMap = this.game.gridMapCoastSubSet,
            hitMap = this.hitMap,
            mapRel = this.game.mapRel,
            def, hit, isCoast,
            canvasWidth = ctx.canvas.width;

        ctx.canvas.width = canvasWidth;
        ctx.strokeStyle = "#ff0000";
        ctx.font = "12px Arial";
        ctx.lineWidth = 1;

        for(yi = mapRel.y.first, yl = mapRel.y.last; yi < yl; yi++) {
            for(xi = mapRel.x.first, xl = mapRel.x.last; xi < xl; xi++) {
                x = (xi + mw/2) * gu;
                y = (yi + mh/2) * gu;
                isCoast = coastMap[yi][xi];
                hit = hitMap[y][x];
                if(isCoast) {
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
                    ctx.fillRect(x, y, gu, gu);
                } else {
                    ctx.strokeRect(x, y, gu, gu);
                }
                ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
                ctx.fillText(xi + "/" + yi, x, y - gu + 12);
            }
        }
        ctx.strokeStyle = "#0000ff";
        this.visibleEntitiesViews.forEach(function(view){
            // filter out people view
            if(view.entity) {
                def = view.entity.definition;
                ctx.fillStyle = '#ffff00';
                ctx.fillRect(view.x, view.y, view.width, view.height);
                // draw base
                ctx.fillStyle = '#ff0000';
                ctx.fillRect(view.x, view.y - def.offsetY * gu, view.width, view.height + def.offsetY * gu);
                // display name
                ctx.fillStyle = '#000';
                ctx.fillText(view.entity.key, view.x, view.y + 12, view.width);
            }
        });
    };


    var pushIfUniqueEntityView = function(entityView) {
            utils.pushIfUnique(this, [entityView]);
        };

    WorldView.prototype.updateBufferCanvas = function () {
        if (this.bufferCanvasChanges.length) {

            var ctx = this.bufferCtx;

            ctx.save();

            ctx.beginPath();

            var i, change;

            for (i = 0; i < this.bufferCanvasChanges.length; i++) {
                change = this.bufferCanvasChanges[i];
                ctx.rect(change.x, change.y, change.width, change.height);
            }

            ctx.clip();

            this.staticClearRect(0, 0, this.bufferCanvas.width, this.bufferCanvas.height);

            var collidingEntitiesViews = [];

            while (this.bufferCanvasChanges.length) {
                this.getCollidingEntitiesViews(this.bufferCanvasChanges.shift()).forEach(pushIfUniqueEntityView, collidingEntitiesViews);
            }

            collidingEntitiesViews.sort(function (a,b) {
                var akey = a.entity.definition['class'], bkey = b.entity.definition['class'];
                return ((akey === 'path' || akey === 'farm') ?  -1 : (bkey === 'path' || bkey === 'farm') ? 1 : ((a.y + a.height) - (b.y + b.height)));
            }).forEach(function (entityView) {
                entityView.drawStatic();
            });

            ctx.restore();

        }

    };

    WorldView.prototype.getCollidingEntitiesViews = function (rect) {

        var result = [];

        var gridUnit = this.gridUnit;

        var xMin = Math.max(rect.x, 0);
        var xMax = Math.min(rect.x + rect.width, this.mapWidthPx);

        var yMin = Math.max(rect.y, 0);
        var yMax = Math.min(rect.y + rect.height, this.mapHeightPx);

        var i, j;
        for (i = yMin; i < yMax; i += gridUnit) {
            for (j = xMin; j < xMax; j += gridUnit) {
                if (this.hitMap[i] && this.hitMap[i][j]) {
                    this.hitMap[i][j].forEach(pushIfUniqueEntityView, result);
                }
            }
        }

        return result;

    };

    WorldView.prototype.addToHitmap = function (entityView) {

        var gridUnit = this.gridUnit;

        var xMin = Math.max(entityView.x, 0);
        var xMax = Math.min(entityView.x + entityView.width, this.mapWidthPx);

        var yMin = Math.max(entityView.y, 0);
        var yMax = Math.min(entityView.y + entityView.height, this.mapHeightPx);

        var i, j;
        for (i = yMin; i < yMax; i += gridUnit) {
            for (j = xMin; j < xMax; j += gridUnit) {
                this.hitMap[i][j].push(entityView);
            }
        }

    };

    WorldView.prototype.removeFromHitmap = function (entityView) {

        var gridUnit = this.gridUnit,
            removedEntityId = entityView.entity.id;

        var xMin = Math.max(entityView.x, 0);
        var xMax = Math.min(entityView.x + entityView.width, this.mapWidthPx);

        var yMin = Math.max(entityView.y, 0);
        var yMax = Math.min(entityView.y + entityView.height, this.mapHeightPx);


        var i, j;
        var filterFn = function(entityView) {
            return entityView.entity.id !== removedEntityId;
        };
        for (i = yMin; i < yMax; i += gridUnit) {
            for (j = xMin; j < xMax; j += gridUnit) {
                if (this.hitMap[i] && this.hitMap[i][j]) {
                    this.hitMap[i][j] = this.hitMap[i][j].filter(filterFn);
                }
            }
        }

    };

    WorldView.prototype.redrawBufferCanvas = function () {

        // WARNING: This is most cpu consuming operation ever - only use it to initialize the buffer!

        this.staticClearRect(0, 0, this.bufferCanvas.width, this.bufferCanvas.height);

        var entityId;
        for (entityId in this.entitiesViews) {
            if (this.entitiesViews.hasOwnProperty(entityId)) {
                this.entitiesViews[entityId].drawStatic();
            }
        }

    };

    WorldView.prototype.staticClearRect = function (x, y, width, height) {
        this.bufferCtx.clearRect(x, y, width, height);
    };

    WorldView.prototype.initWorldInteractions = function () {

        var element = document.body;

        if (wooga.castle.capabilities.touch) {
            wooga.castle.scrollLock(true);
            element.addEventListener("touchstart", this, false);
            element.addEventListener("touchmove", this, false);
            element.addEventListener("touchend", this, false);
        } else {
            element.addEventListener("mousedown", this, false);
            element.addEventListener("mousemove", this, false);
            element.addEventListener("mouseup", this, false);
        }

    };

    WorldView.prototype.handleEvent = (function () {

        var startX,
            startY,
            isTouch,
            isLongTouch,
            isDrag,
            longTouchTimeout,
            touchedView;

        return function (event) {

            if (event.target.nodeName.toLowerCase() !== "canvas" && !utils.hasClass(event.target, "actionIcon")) {
                return;
            }

            var touch = event.touches ? event.touches[0] : event;
            if (touch && touch.clientX) {
                touch = {
                    clientX: touch.clientX,
                    clientY: touch.clientY
                };
            }

            switch (event.type) {

                case "touchstart":
                case "mousedown":

                    startX = touch.clientX;
                    startY = touch.clientY;

                    isTouch = true;
                    isLongTouch = false;
                    isDrag = false;

                    touchedView = this.findEntityViewByClientXY(startX, startY);

                    longTouchTimeout = setTimeout(function () {

                        isTouch = false;
                        isLongTouch = true;

                        touchedView.longtouch({
                            x: startX,
                            y: startY
                        });

                    }, LONG_TOUCH_DELAY);

                    touchedView.fireEvent('touchstart');

                    break;

                case "touchmove":
                case "mousemove":

                    if (isDrag || (( isLongTouch || isTouch ) && // isTouch is useful for mouse pointer events (for touch not so much)
                            (Math.abs(touch.clientX - startX) > DRAG_THRESHOLD ||
                            Math.abs(touch.clientY - startY) > DRAG_THRESHOLD))) {

                        if (isDrag) {
                            this.enableRendering();

                            touchedView.drag({
                                x: touch.clientX,
                                y: touch.clientY
                            });

                        } else {
                            this.enableRendering();
                            clearTimeout(longTouchTimeout);

                            isTouch = false;
                            isLongTouch = false;
                            isDrag = true;

                            touchedView.dragstart({
                                x: touch.clientX,
                                y: touch.clientY
                            });

                        }

                    }

                    break;

                case "touchend":
                case "mouseup":

                    clearTimeout(longTouchTimeout);

                    if (isTouch) {
                        touchedView.touch({
                            x: startX,
                            y: startY
                        });
                    }

                    if (isDrag) {
                        touchedView.dragend();
                    }

                    touchedView.touchend();

                    isTouch = false;
                    isLongTouch = false;
                    isDrag = false;

                    if (event.type === "touchend") {
                        utils.clickBuster.preventGhostClick(startX, startY);
                    }

                    touchedView = this;

                    break;

            }

        };

    }());

    WorldView.prototype.clientXYtoWorldXY = function (position) {
        return {
            x: Math.floor((position.x - this.scrollLeft) / this.gridUnit - this.mapWidth / 2),
            y: Math.floor((position.y - this.scrollTop) / this.gridUnit - this.mapHeight / 2)
        };
    };

    WorldView.prototype.getCenterCoordinates = function () {
        return {
            x: Math.floor((-this.scrollLeft + this.offsetWidth / 2) / this.gridUnit - this.mapWidth / 2),
            y: Math.floor((-this.scrollTop + this.offsetHeight / 2) / this.gridUnit - this.mapHeight / 2)
        };
    };



    WorldView.prototype.setMoveEntityView = function (message) {
        this.moveEntityView = 'undefined' !== typeof message.target ? message.target : message.entityView ;
    };

    WorldView.prototype.removeMoveEntityView = function (message) {
        this.moveEntity = null;
    };

    WorldView.prototype.findEntityViewByClientXY = (function () {

        var testCtx = document.createElement("canvas").getContext("2d");

        return function (clientX, clientY) {

            var result = this,
                x = clientX - this.scrollLeft,
                y = clientY - this.scrollTop,
                gridUnit = this.gridUnit;

                var entityView, image, imageData, relativeX, relativeY, transparencyByte,
                i = 0, areaIncrease = 0;

            // in move mode increase the draggeble area around entities of 2x2 and smaller
            if ((this.mode === wooga.castle.GameModesManager.Mode.MOVE || this.mode === wooga.castle.GameModesManager.Mode.SHOP_PREVIEW) &&
                        this.moveEntityView !== null) {

                if (this.moveEntityView instanceof wooga.castle.DecorationView) {
                    // for decration set to influence area
                    areaIncrease = this.moveEntityView.entity.definition.influenceArea;
                } else if (this.moveEntityView.entity.definition.width <= 2 &&
                        this.moveEntityView.entity.definition.height + this.moveEntityView.entity.definition.offsetY <= 2) {
                    // for entities <= 2x2 increase touchable size by one tile
                    areaIncrease = 1;
                }

                if (x >= this.moveEntityView.x - areaIncrease * gridUnit &&
                        x < (this.moveEntityView.x + this.moveEntityView.width + areaIncrease * gridUnit) &&
                        y >= this.moveEntityView.y - areaIncrease * gridUnit - this.moveEntityView.entity.definition.offsetY * gridUnit &&
                        y < (this.moveEntityView.y + this.moveEntityView.height + areaIncrease * gridUnit )) {
                    return this.moveEntityView;
                }
            }


            var foundEntities = this.hitMap[y - (y % gridUnit)][x - (x % gridUnit)] || [];
            foundEntities = foundEntities.sort(function (a,b) {
                return (b.y + b.height) - (a.y + a.height);
            });


            var entitiesLength = foundEntities.length;
            for (i = 0; i < entitiesLength; i++) { // TODO: heavily optimize it!!!
                entityView = foundEntities[i];

                if (!this.isFocusedEntityView() || this.isFocusedEntityView(entityView)) {
                    // clouds from unlockable areas are always on top
                    if (entityView.entity.is("unlockable")) {
                        return entityView;
                    }
                    var frame = entityView.getImageFrame(true);

                    relativeX = x - entityView.x;
                    relativeY = y - entityView.y;

                    image = entityView.image;

                    testCtx.canvas.width = frame.width;
                    testCtx.canvas.height = frame.height;
                    testCtx.clearRect(0, 0, frame.width, frame.height);

                    testCtx.drawImage(image,
                                      frame.x, frame.y, frame.width, frame.height,
                                      0, 0, frame.width, frame.height);

                    imageData = testCtx.getImageData(0, 0, frame.width, frame.height);
                    transparencyByte = imageData.data[(relativeY * frame.width + relativeX) * 4 + 3];

                    if (transparencyByte > WorldView.TRANSPARENCY_THRESHOLD) {
                        // take the first entity that is not transparent at this picking point
                        return entityView;
                    }
                }
            }
            return result;

        };

    }());

    WorldView.prototype.isFocusable = function () {
        return this.entity.selectable;
    };

    WorldView.prototype.allowDrag = function (isDragAllowed) {
        this.isDragAllowed = isDragAllowed;
    };

    WorldView.prototype.forceGrid = function () {
        var switcher = true,
            modes = wooga.castle.GameModesManager.Mode;
        switch( this.mode ){
            case modes.MOVE:
            case modes.SHOP_PREVIEW:
            case modes.ROADS:
                switcher = false;
                break;
        }
        utils.toggleClass(this.gridCanvas, 'invisible', switcher);
    };


}());
