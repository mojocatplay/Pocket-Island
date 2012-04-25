/*jslint white:true, plusplus:true, nomen:true, vars:true, browser:true */
/*global buster, wooga, FIXTURES */

var assert = buster.assertions.assert;
var refute = buster.assertions.refute;

(function() {
    "use strict";
    buster.testCase("PathFinder test case", {

        setUp: function() {
            var defaultGridMap = JSON.parse(JSON.stringify(FIXTURES.gridMap));

            // Faking castle, used to determine road starting point
            wooga.castle.game = {
                castle: {
                    definition: {
                        rootRoadPosition: {
                            x: 2,
                            y: 5
                        }
                    },
                    x: -12,
                    y: 2
                },
                gridMap: defaultGridMap
            };
        },

        tearDown: function() {

        },

        "test findHouseConnections returns an array of road patches connected to buildings": function() {
            var graph = wooga.castle.PathFinder.initRoadsGraph();
            var connectedRoads = wooga.castle.PathFinder.findHouseConnections(wooga.castle.game.gridMap, graph);
            assert.equals(connectedRoads.length, 4);
        },

        "test initRoadsGraph returns a graph of roads and connected neighbors": function() {
            // Each node in the graph looks like this:
            // {
            //     entity: entityReference
            //     neighbors: [node, node, ...]
            // }

            var graph = wooga.castle.PathFinder.initRoadsGraph();

            assert.equals(graph.neighbors.length, 1);

            var sameCoords = function(nodeA, nodeB) {
                if (nodeA.x === nodeB.x && nodeA.y === nodeB.y) {
                    return true;
                }
                return false;
            };


            var entities = FIXTURES.entities;
            var secondNodeNeighbors = graph.neighbors[0].neighbors;

            assert((sameCoords(secondNodeNeighbors[0].entity, entities[10]) && sameCoords(secondNodeNeighbors[1].entity, entities[1])) ||
                (sameCoords(secondNodeNeighbors[0].entity, entities[1]) && sameCoords(secondNodeNeighbors[1].entity === entities[10])));
            assert(graph.neighbors[0].neighbors[0].neighbors[0].neighbors[0]);
        },


        "test calculateDistances for roads with branches": function() {
            var graph = wooga.castle.PathFinder.initRoadsGraph();

            wooga.castle.PathFinder.calculateDistances(graph);

            var currentNode = graph.neighbors[0];
            var intermediateNodesHaveTwoNeighbors = true;
            var distance = 0;
            while (currentNode.neighbors[1]) {
                distance = currentNode.distance;
                currentNode = currentNode.neighbors[1];
            }

            // This test is valid ONLY for roads without branches, where the second neighbor is the subsequent node.

            var distanceToOneButLastNode = 11;
            assert.equals(distance, distanceToOneButLastNode);

        },

        "test findPath returns a path between two points": function () {
            var graph = wooga.castle.PathFinder.initRoadsGraph();
            wooga.castle.PathFinder.calculateDistances(graph);

            var endNode= wooga.castle.game.gridMap[2][-3].node;
            var path = wooga.castle.PathFinder.findPath(graph, endNode);
            var i, l, assertionResult = true;

            for (i=0, l = path.length; i < l; i++) {
                if (path[i].distance !== i) {
                    assertionResult = false;
                }
            }

            assert(assertionResult);
        }

    });
}());
