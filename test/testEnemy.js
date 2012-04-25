/*jslint white:true, plusplus:true, nomen:true, vars:true, browser:true */
/*global buster, sinon, wooga */

var assert = buster.assertions.assert;
var refute = buster.assertions.refute;

(function() {
    "use strict";
    buster.testCase(" test case", {

        setUp: function() {
            var trollConfig = {
                key: "characters/troll",
                x: 0,
                y: 0
            };

            var game = {
                publish: function() {},
                increase: function() {},
                entitiesDefinition: {
                    "characters/troll": {
                        selectable: false,
                        draggable: false
                    }
                }
            };

            this.gamePublishStub = sinon.stub(game, "publish");
            this.gameIncreaseStub = sinon.stub(game, "increase");

            this.troll = new wooga.castle.Enemy(game, trollConfig);

        },

        tearDown: function() {

        },

        "test collectRewards publishes rewards": function() {
            var rewards = [{
                    amount: 1,
                    type: "xp"
                }, {
                    amount: 999,
                    type: "food"
                }
            ];

            this.troll.collectRewards(rewards);

            assert.calledTwice(this.gameIncreaseStub);

            assert(this.gamePublishStub.calledWith("enemy/collectReward", {
                entity: this.troll,
                rewards: rewards
            }));

        },

        "test collectReward doesn't publish rewards when called without rewards": function() {
            this.troll.collectRewards([]);
            refute.called(this.gameIncreaseStub);
        }

    });
}());
