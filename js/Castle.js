/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */
(function () {
    "use strict";
    var Castle = function (game, config) {
        this.parent.call(this, game, config);
    };

    Castle.prototype = new wooga.castle.Entity();

    Castle.prototype.constructor = Castle;

    Castle.prototype.parent = wooga.castle.Entity;

    Castle.prototype.getInfoModeString = function() {
        return '<p><span class="population">Supported Population: ' + this.definition.population + '</span></p>';
    };

    wooga.castle.Castle = Castle;

}());
