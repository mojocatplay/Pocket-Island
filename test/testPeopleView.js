/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga, buster, assert, refute */

(function () {
    "use strict";

    buster.testCase("PeopleView test case", {
        "setUp": function () {
        },

        "test getHitMapCells for element exactly fitting the grid": function() {
            var x = 0,
                width = 32,
                y = 32,
                height = 32;
            var actual = wooga.castle.PeopleView.getHitMapCells(x, y, width, height, 32);
            var expected = {
                startX: 0,
                endX: 32,
                startY: 32,
                endY: 64
            };
            assert.equals(expected, actual);
        },

        "test getHitMapCells for element overlapping more than one grid": function() {
            var x = 16,
                width = 32,
                y = 48,
                height = 32;
            var actual = wooga.castle.PeopleView.getHitMapCells(x, y, width, height, 32);
            var expected = {
                startX: 0,
                endX: 64,
                startY: 32,
                endY: 96
            };
            assert.equals(expected, actual);
        },

        "test getHitMapCells for element with irregular shape overlapping more than one grid": function() {
            var x = 16,
                width = 48,
                y = 48,
                height = 16;
            var actual = wooga.castle.PeopleView.getHitMapCells(x, y, width, height, 32);
            var expected = {
                startX: 0,
                endX: 64,
                startY: 32,
                endY: 64
            };
            assert.equals(expected, actual);
        },

        "test zIndexSort correctly sorts element set 1": function() {
            wooga.castle.GRID_UNIT = 32;
            var entities = [{
                height: 256,
                y: 320, // 576
                zIndex: 0,
                id: "castle"
            }, {
                height: 32,
                y: 574.0683415982, // 606
                zIndex: 5,
                id: "person"
            }, {
                height: 160,
                y: 448, // 608
                zIndex: 10,
                id: "troll"
            }, {
                height: 32,
                y: 576, // 608
                zIndex: 0,
                id: "road"
            }, {
                height: 128,
                y: 576, // 704
                zIndex: 0,
                id: "tree"
            }];

            entities.sort(wooga.castle.PeopleView.zIndexSort);

            assert.equals("castle", entities[0].id);
            assert.equals("road", entities[1].id);
            assert.equals("person", entities[2].id);
            assert.equals("troll", entities[3].id);
            assert.equals("tree", entities[4].id);
        },

        "test zIndexSort correctly sorts element set 2": function() {
            wooga.castle.GRID_UNIT = 32;
            var entities = [{
                height: 256,
                y: 320, // 576
                zIndex: 0,
                id: "castle"
            }, {
                height: 160,
                y: 448, // 608
                zIndex: 10,
                id: "troll"
            }, {
                height: 32,
                y: 576, // 608
                zIndex: 0,
                id: "road"
            }, {
                height: 32,
                y: 554.2, // 586.2
                zIndex: 0,
                id: "person"
            }, {
                height: 128,
                y: 576, // 704
                zIndex: 0,
                id: "tree"
            }];

            entities.sort(wooga.castle.PeopleView.zIndexSort);

            assert.equals("castle", entities[0].id);
            assert.equals("road", entities[1].id);
            assert.equals("person", entities[2].id);
            assert.equals("troll", entities[3].id);
            assert.equals("tree", entities[4].id);
        }

    });

}());
