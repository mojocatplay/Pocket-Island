/*jslint browser:true */
/*global wooga */
(function (wc) {
    "use strict";

    function Rock(game, config) {
        wc.Whackable.call(this, game, config);
        if (!arguments.length) {
            return this;
        }
    }

    wc.utils['extends'](Rock, wooga.castle.Whackable);
    wc.Rock = Rock;
}(wooga.castle));
