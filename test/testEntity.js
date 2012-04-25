/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga, buster, sinon, assert, refute */
(function() {
    "use strict";

    buster.testCase("wooga.castle.Entity test case", {

        setUp: function() {
            this.game = {
                entitiesDefinition: FIXTURES.entitiesConfig
            }
        },

        "test that the is method returns expected value for any house": function() {
           var config = {
               "key": "buildings/villager_house"
           };
           var uhouse = new wooga.castle.Entity(this.game, config);
           assert(uhouse.is("any house"));
           var farm = new wooga.castle.Entity(this.game, {"key": "farming/basic_plot"});
           refute(farm.is("any house"));
        },

        "test that the is method returns expected value for movable house": function() {
           var config = {
               "key": "buildings/villager_house"
           };
           var uhouse = new wooga.castle.Entity(this.game, config);
           assert(uhouse.is("movable house"));
           var lighthouse = new wooga.castle.Entity(this.game, {"key": "buildings/lighthouse"});
           refute(lighthouse.is("movable house"));
        },

        "test is method against array as params": function() {
           var config = {
               "key": "buildings/villager_house"
           };
           var uhouse = new wooga.castle.Entity(this.game, config);
           refute(uhouse.is(["house", "farm"]));
           assert(uhouse.is(["movable house", "farm"]));
           assert(uhouse.is(["any house", "house"]));
        }

    });

}());
