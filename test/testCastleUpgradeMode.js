/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga, buster, assert, refute */

(function() {

    "use strict";

    buster.testCase("wooga.castle.CastleCompleteScreen test case", {
        "test setProfessionalInfo that sets the infoPanel string": function() {

            var setProInfo = wooga.castle.CastleCompleteScreen.prototype.setProfessionalInfo,
                node = document.createElement('div');

            setProInfo(node, 1);
            assert.contains(node.innerHTML, " 1 Professional ");

            setProInfo(node, 10);
            assert.contains(node.innerHTML, " 10 Professionals ");

        }
    });

}());