/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */

(function () {
    "use strict";

    var utils = wooga.castle.utils;

    wooga.castle.UnlockableAreaKeyHandler = function (game) {

        utils.subscribe('game:population/change', function (message) {
            var pop = game.getPopulation();
            game.entities.forEach(function (e) {
                if(e.is('unlockable') && e.definition.unlock === pop && e.contractState === "inactive") {
                    var unlockAreaCssId = "unlockable-" + e.entityView.nth;
                    game.updateMapData();
                    var send = {
                        entity: message,
                        entityView: message.entityView,
                        destination: unlockAreaCssId
                    };
                    game.publish("house/throwOutKey", send);
                    setTimeout(send.element._click, 10 * 1000);
                }
            });
        });
    };


}());
