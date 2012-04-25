/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga, buster, assert, refute */
(function () {
    "use strict";

    buster.testCase("Test Case for Goals.js", {
        "setUp": function () {
            this.goalsStub = {
                "game": {
                    "entitiesDefinition": {
                        "this/is/the/key": {
                            "icon": "this/is/the/magic.png"
                        }
                    }
                }
            };
            wooga.castle.GRID_UNIT = 12;
            wooga.castle.IMAGES_BASE_URL = '/images/entities-12/';
            this.imageSrcFor = wooga.castle.Goals.prototype.imageSrcFor;
        },
        "test imageSrcFor for known stat": function () {
            assert.equals("/images/popup-12/goldCost.png", this.imageSrcFor.call(this.goalsStub, "gold"));
        },

        "test imageSrcFor for full entity key": function () {
            assert.equals("/images/entities-12/this/is/the/magic.png",
                            this.imageSrcFor.call(this.goalsStub, "this/is/the/key"));
        }
    });

}());
