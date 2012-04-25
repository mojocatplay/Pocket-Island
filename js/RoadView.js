/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */
(function () {
    "use strict";
    var utils = wooga.castle.utils;


    wooga.castle.RoadView = function (view, entity) {

        wooga.castle.EntityView.call(this, view, entity);

        this.roadType = 0;
        this.updateImage();

    };

    var RoadView = wooga.castle.RoadView;

    RoadView.prototype = new wooga.castle.EntityView();
    RoadView.prototype.constructor = RoadView;

    RoadView.prototype.setRoadType = function (roadType) {
        if (roadType !== this.roadType) {

            this.roadType = roadType;

            this.updateImage();

            this.view.bufferCanvasChanges.push(this);

        }
    };

    RoadView.prototype.updateImage = function () {
        this.spritey = this.view.game.entitiesDefinition["paths/road-" + this.roadType].spritey;
        this.image = this.view.game.entitiesDefinition["paths/road-" + this.roadType].image;
    };

    RoadView.prototype.getImageFrame = function(){
        return {
            x: 0,
            y: this.spritey * this.view.gridUnit,
            width: this.width,
            height: this.height
        };
    };

}());
