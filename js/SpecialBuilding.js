/*jslint white:true, browser:true, plusplus:true, nomen:true */
/*global wooga */
(function (wc) {
    "use strict";
    var utils = wc.utils;

    function SpecialBuilding(game, config) {
        wc.UnfoodedHouse.call(this, game, config);
        this.draggable = false;
        this.contractPauseTime = this.contractPauseTime || 0;

        this.isHidden = (typeof config.isHidden !== 'undefined') ? config.isHidden : true;

    }
    utils['extends'](SpecialBuilding, wc.UnfoodedHouse);

    SpecialBuilding.prototype.getProperName = function () {
        return this.connected? this.parent.prototype.getProperName.call(this) : "Mysterious Building";
    };

    SpecialBuilding.prototype.disconnect = function(firstRun) {
        if(firstRun) {
            this.entityView.changeStateImages(false);
        }
        wc.House.prototype.disconnect.call(this, firstRun);
    };

    SpecialBuilding.prototype.connect = function(firstRun) {
        this.entityView.changeStateImages(true);
        wc.House.prototype.connect.call(this, firstRun);
    };

    wc.SpecialBuilding = SpecialBuilding;

}(wooga.castle));
