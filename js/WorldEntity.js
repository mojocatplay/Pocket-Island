/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */
(function () {
    "use strict";
    var utils = wooga.castle.utils;

    wooga.castle.WorldEntity = function (game) {

        if (!game) {
            return;
        }

        this.game = game;

        this.selectable = false;

    };

    var WorldEntity = wooga.castle.WorldEntity;

    utils.mixin(WorldEntity, utils.ObservableMixin);

}());
