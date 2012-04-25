/*jslint white:true, plusplus:true, nomen:true, vars:true, browser:true */
/*global wooga */
var rated = false;
var rateAfterSeconds = 1800;
// "Purple Software" identifies iPhone apps and MUST be here, see:
// http://stackoverflow.com/questions/3124080/app-store-link-for-rate-review-this-app#comment9608624_3167015
var rateAppUrl = "http://itunes.apple.com/WebObjects/MZStore.woa/wa/viewContentsUserReviews?id=506729389&onlyLatestVersion=false&type=Purple+Software";

var rateApp = function () {
    "use strict";

    var title = "Magic Land HD";
    var message = "Do you like Magic Land HD? \nRate it now and get 4000 gold! \n \n \ue32f\ue32f\ue32f\ue32f\ue32f\n ";

    var yesHandler = function() {
        wooga.castle.game.increase('gold', 4000);
        window.location.href = rateAppUrl;
    };

    var noHandler = function() {
        // TODO: make nice
    };
    wooga.yesno(message, yesHandler, noHandler, title);

};

window.wooga.castle.utils.subscribe('game/ready', function () {
    "use strict";
    if (wooga.castle.isNativeWrapper()) {
        window.setInterval(function () {
            var pl = window.wooga.castle.playerData.totalPlayTime;
            if (pl > window.rateAfterSeconds && pl < (window.rateAfterSeconds + 60) && !window.rated) {
                window.rated = true;
                window.rateApp();
            }
        }, 5000);
    }

});
