/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */
(function () {
    "use strict";
    var utils = wooga.castle.utils;

    wooga.castle.DecorationView = function (view, entity) {

        wooga.castle.EntityView.call(this, view, entity);

       var that = this;
        this.entity.game.subscribe("decoration/showBoost", function(message) {
            if (message.entityView === this) {
                this.entity.applyBoosts(message.x, message.y);
                var that = this;
                this.entity.effectedEntities.forEach(function(entity) {
                    if((entity instanceof wooga.castle.House && that.entity.definition.goldBoost > 0) ||
                            (entity instanceof wooga.castle.FarmField && that.entity.definition.foodBoost > 0)) {
                        entity.entityView.showBoostInfo = true;
                    }
                });
            }
        }, this);

        this.entity.game.subscribe("decoration/hideBoost", function(message) {
            if (message.entityView === this) {
                this.entity.effectedEntities.forEach(function(entity) {
                   if (entity instanceof wooga.castle.House ||
                           entity instanceof wooga.castle.FarmField) {
                       entity.entityView.showBoostInfo = false;
                   }
               });
           }
        }, this);
    };

    var DecorationView = wooga.castle.DecorationView;
    DecorationView.prototype = new wooga.castle.EntityView();
    DecorationView.prototype.constructor = DecorationView;


    DecorationView.prototype.drawInfluence = function () {
        var ctx = this.ctx;

        var gridUnit = this.view.gridUnit,
            view = this.view,
            radius = this.entity.definition.influenceArea;

        var xMin = (this.x - radius * gridUnit) + view.scrollLeft,
            xMax = (this.x + this.width +  radius * gridUnit) + view.scrollLeft,
            yMin = (this.y - (this.entity.definition.offsetY + radius) * gridUnit) + view.scrollTop,
            yMax = (this.y + this.height + radius * gridUnit) + view.scrollTop;

        this.drawRoundedRect(xMin, xMax, yMin, yMax);
        // if the above is to expensive, then use ctx.strokeRect(xMin, yMin, xMax - xMin, yMax - yMin) instead

        var colorInfluence ="rgba(86, 255, 255, 0.15)";
        ctx.fillStyle = colorInfluence;
        ctx.fillRect(xMin, yMin, xMax - xMin, yMax - yMin);
    };


    DecorationView.prototype.drawDynamic = function (x, y) {

        wooga.castle.EntityView.prototype.drawDynamic.call(this, x, y);
        if ((this.view.mode === wooga.castle.GameModesManager.Mode.INFO && (this.dynamic || this.entity.preview)) ||
                (this.view.mode === wooga.castle.GameModesManager.Mode.MOVE && this.isDraggable) ||
                (this.view.mode === wooga.castle.GameModesManager.Mode.SHOP_PREVIEW && this.isDraggable)) {
            this.drawInfluence();
        }
    };


    DecorationView.prototype.drawRoundedRect = function (xMin, xMax, yMin, yMax) {
        var ctx = this.ctx,
            gridUnit = this.view.gridUnit,
            cornerRad = gridUnit/5,
            colorStroke ="rgba(86, 255, 255, 0.7)";

        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.strokeStyle = colorStroke;

        ctx.beginPath();
        ctx.moveTo(xMin , yMin + cornerRad);
        ctx.arc(xMin + cornerRad, yMin + cornerRad, cornerRad, (Math.PI/180) * 180, (Math.PI/180) * 270, false);
        ctx.lineTo(xMax - cornerRad, yMin);
        ctx.arc(xMax - cornerRad, yMin + cornerRad, cornerRad, (Math.PI/180) * 270, 0, false);
        ctx.lineTo(xMax, yMax - cornerRad);
        ctx.arc(xMax - cornerRad, yMax - cornerRad, cornerRad, 0, (Math.PI/180) * 90, false);
        ctx.lineTo(xMin + cornerRad, yMax);
        ctx.arc(xMin  + cornerRad, yMax - cornerRad, cornerRad, (Math.PI/180) * 90, (Math.PI/180) * 180, false);
        ctx.lineTo(xMin, yMin + cornerRad);
        ctx.stroke();
        ctx.closePath();
    };


    DecorationView.prototype.moveTo = function (xy) {

        wooga.castle.EntityView.prototype.moveTo.call(this, xy, true);

        this.entity.game.publish("decoration/showBoost", {
            entityView: this,
            x: Math.floor(this.x / this.view.gridUnit - this.entity.game.playerData.map.width / 2),
            y: Math.floor(this.y / this.view.gridUnit - this.entity.game.playerData.map.height / 2) - this.entity.definition.offsetY
        });

    };

}());
