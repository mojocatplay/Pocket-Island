/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */
(function (wc) {
    "use strict";
    var utils = wooga.castle.utils;

    function SpecialBuildingView(view, entity) {
        wc.HouseView.call(this, view, entity);
        this.actions = {};
        this.entity = entity;

        this.hiddenImageDef = this.view.game.entitiesDefinition[this.entity.key + '-hidden'];
        this.hiddenImage = this.hiddenImageDef.image;
        this.hiddenImageWidth = this.hiddenImageDef.width;
        this.hiddenImageHeight = this.hiddenImageDef.height;

        this.unlockedImageDef = this.view.game.entitiesDefinition[this.entity.key];
        this.unlockedImage = this.unlockedImageDef.image;
        this.unlockedImageWidth = this.unlockedImageDef.width;
        this.unlockedImageHeight = this.unlockedImageDef.height;
    }

    utils['extends'](SpecialBuildingView, wc.HouseView);


    SpecialBuildingView.prototype.changeStateImages = function (isConnectedToRoad) {

        this.invalidate();

        if(this.entity.isHidden && !isConnectedToRoad) {
            this.image = this.hiddenImage;
            var gridUnit = this.view.gridUnit;
            this.x += (this.unlockedImageWidth - this.hiddenImageWidth) * gridUnit;
            this.y += (this.unlockedImageHeight - this.hiddenImageHeight) * gridUnit;

            this.updateImageFrame(this.hiddenImageWidth, this.hiddenImageHeight);

        } else {
            var def = this.view.game.entitiesDefinition[this.entity.key];
            def.image = this.unlockedImage;
            this.image = this.unlockedImage;

            this.updateImageFrame(this.unlockedImageWidth, this.unlockedImageHeight);

            if(this.entity.isHidden) {
               this.notifyDiscover();
            }

            this.entity.isHidden = false;

            wooga.castle.game.publish('player/update');
        }
    };


    SpecialBuildingView.prototype.notifyDiscover = function () {
        var article = 'the ';
        if (this.entity.key === "buildings/ozzystent") {
            article = '';
        }
        wooga.notify('You have rescued ' + article + this.entity.definition.name, 'discover');
    };


    SpecialBuildingView.prototype.updateImageFrame = function (width, height) {
        var gridUnit = this.view.gridUnit;
        this.defaultImageFrame.width = width * gridUnit;
        this.defaultImageFrame.height = height * gridUnit;

        this.image.height = width * gridUnit;
        this.image.width = height * gridUnit;
    };

    wc.SpecialBuildingView = SpecialBuildingView;

}(wooga.castle));

