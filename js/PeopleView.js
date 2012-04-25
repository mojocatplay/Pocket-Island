/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */

(function () {

    "use strict";

    var PeopleView = wooga.castle.PeopleView = function (people, worldView, gameModesManager) {

        this._people = people;
        this._worldView = worldView;
        this._gameModesManager = gameModesManager;

        this.id = 'people view';
        this.x = 0;
        this.y = 0;
        this.width = worldView.mapWidthPx;
        this.height = worldView.mapHeightPx;

        this.views = [];

        var isRenderingPathDirty = false;

        people.addEventHandler('create', function (event) {
            if (event.target instanceof wooga.castle.Person) {
                this.createPersonView(event.target);
                isRenderingPathDirty = true;
            }
        }, this);

        people.addEventHandler("remove", function (event) {
            var viewIndex;
            this.views.forEach(function (entityView, nth) {
                if (event.target === entityView.entity) {
                    viewIndex = nth;
                }
            });

            this.views.splice(viewIndex, 1);

            isRenderingPathDirty = true;

        }, this);

        people.addEventHandler('move', function () {
            if (this.canDraw()) {
                this._worldView.enableRendering();
            }
            isRenderingPathDirty = true;
        }, this);

        people.entities.forEach(this.createPersonView, this);

        var that = this;
        setInterval(function () {
            if (isRenderingPathDirty && that.canDraw()) {
                that.updateRenderingPath();
                isRenderingPathDirty = false;
            }
        }, 250);

        this.updateRenderingPath();
        this.addToWorldView();

    };

    PeopleView.prototype.canDraw = function() {
        return !this._worldView.isScrolling && this._gameModesManager.mode === wooga.castle.GameModesManager.Mode.BASIC;
    };

    PeopleView.prototype.addToWorldView = function () {
        this._worldView.entitiesViews[this.id] = this;
        this._worldView.filterVisibleViews();
    };

    PeopleView.prototype.createPersonView = function (person) {
        this.views.push(new wooga.castle.PersonView(person, this._worldView));
    };

    PeopleView.prototype.drawStatic = function () {};

    PeopleView.prototype.drawDynamic = function () {
        if (this.canDraw()) {
            this.draw();
        }
    };

    PeopleView.prototype.draw = function () {

        var ctx = this._worldView.ctx,
            scrollLeft = this._worldView.scrollLeft,
            scrollTop = this._worldView.scrollTop,
            i,
            rect,
            entityView;

        ctx.save();

        ctx.beginPath();
        this.views.forEach(function(rect) {
            ctx.rect(rect.x + scrollLeft, rect.y + scrollTop, rect.width, rect.height);
        });
        ctx.clip();

        this.renderingPath.forEach(function(entityView) {
            entityView.draw(ctx, entityView.x + scrollLeft, entityView.y + scrollTop);
        });
        ctx.restore();

    };

    PeopleView.prototype.updateRenderingPath = function () {

        var renderingPath = [];

        var gridUnit = wooga.castle.GRID_UNIT;

        var i, j, view, gridCoords;

        this.views.forEach(function(view) {
            gridCoords = PeopleView.getHitMapCells(view.x, view.y, view.width, view.height, gridUnit);

            for (j = gridCoords.startY; j < gridCoords.endY; j += gridUnit) {
                for (i = gridCoords.startX; i < gridCoords.endX; i += gridUnit) {
                    wooga.castle.utils.pushIfUnique(renderingPath, this._worldView.hitMap[j][i]);
                }
            }

            renderingPath.push(view);

        }, this);

        this.renderingPath = renderingPath.sort(PeopleView.zIndexSort);

    };

    PeopleView.getHitMapCells = function(x, y, width, height, gridUnit) {

        var startX = x - x % gridUnit;
        var endX = x + width;
        if (endX % gridUnit) {
            endX += gridUnit - endX % gridUnit;
        }

        var startY = y - y % gridUnit;
        var endY = y + height;
        if (endY % gridUnit) {
            endY += gridUnit - endY % gridUnit;
        }

        return {
            startX: startX,
            endX: endX,
            startY: startY,
            endY: endY
        };

    };

    PeopleView.zIndexSort = function (a, b) {

        var gridUnit = wooga.castle.GRID_UNIT;

        var bottomEdgeA = a.y + a.height;
        var bottomEdgeB = b.y + b.height;

        if (bottomEdgeA % gridUnit) {
            bottomEdgeA -= bottomEdgeA % gridUnit - gridUnit;
        }
        if (bottomEdgeB % gridUnit) {
            bottomEdgeB -= bottomEdgeB % gridUnit - gridUnit;
        }

        return bottomEdgeA - bottomEdgeB || a.zIndex - b.zIndex;

    };

}());
