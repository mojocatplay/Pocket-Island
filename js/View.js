/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */

(function () {
    "use strict";

    var utils = wooga.castle.utils;

    wooga.castle.View = function () {};

    var View = wooga.castle.View;

    utils.mixin(View, utils.ObservableMixin);

    View.prototype.constructor = View;
    View.prototype.destructor = function () {};

    View.prototype.touch = function (event) {
        this.fireEvent("touch", event);
    };

    View.prototype.touchend = function (event) {
        this.fireEvent('touchend', event);
    };

    View.prototype.longtouch = function (event) {
        this.fireEvent("longtouch", event);
    };

    View.prototype.dragstart = function (event) {
        this.fireEvent("dragstart", event);
    };

    View.prototype.drag = function (event) {
        this.fireEvent("drag", event);
    };

    View.prototype.dragend = function (event) {
        this.fireEvent("dragend", event);
    };

}());
