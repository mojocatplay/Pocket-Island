/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */

(function () {

    "use strict";

    var PathFinder = wooga.castle.PathFinder = function () {};

    // TODO [szafranek]: Make these two functions methods of Entity
    var houseFilter = function(entity) {
        var defClass = entity.definition["class"];
        return defClass === "house" || defClass === "uhouse";
    };

    var roadFilter = function(entity) {
        return entity.key === "paths/road";
    };


    PathFinder.initRoadsGraph = function() {
        var roadStart = wooga.castle.RoadsMode.getRoadRootPosition(wooga.castle.game.castle);
        return PathFinder.generateGraph(wooga.castle.game.gridMap, roadStart.x, roadStart.y, null, Math.random());
    };

    PathFinder.generateGraph = function (gridMap, x, y, previousNode, dirtyFlag) {

        if (gridMap[y] && gridMap[y][x]) {

            var cell = gridMap[y][x];

            if (cell.dirtyFlag !== dirtyFlag) {

                var roadEntity = cell.filter(roadFilter)[0];

                cell.dirtyFlag = dirtyFlag;

                if (roadEntity) {
                    var neighbors = [];
                    var resultNode = {
                        entity: roadEntity,
                        distance: previousNode ? Infinity : 0,
                        neighbors: neighbors
                    };
                    if (previousNode) {
                        neighbors.push(previousNode);
                    }

                    var neighborCellCoords = [{x: x, y: y-1}, {x: x+1, y: y}, {x: x, y: y+1}, {x: x-1, y: y}];
                    neighborCellCoords.forEach(function(neighborCoord) {
                        var neighborGraph = PathFinder.generateGraph(gridMap, neighborCoord.x, neighborCoord.y, resultNode, dirtyFlag);
                        if (neighborGraph) {
                            neighbors.push(neighborGraph);
                        }
                    });

                    cell.node = resultNode;
                    return resultNode;
                }
            }
        }
    };


    PathFinder.calculateDistances = function(node) {
        node.neighbors.forEach(function(neighbor) {
            if (node.distance + 1 < neighbor.distance) {
                neighbor.distance = node.distance + 1;
                PathFinder.calculateDistances(neighbor);
            }
        });
    };

    PathFinder.findPath = function(graphHead, endNode) {
        var currentNode = endNode;
        var result = [currentNode];

        var selectNearestNeighbor = function(neighbor) {
            if (neighbor.distance === currentNode.distance - 1) {
                currentNode = neighbor;
                result.push(currentNode);
            }
        };

        while (currentNode.distance > 0) {
            currentNode.neighbors.forEach(selectNearestNeighbor);
        }

        return result.reverse();
    };


    PathFinder.findHouseConnections = function(gridMap, graphHead, connectedHouses, dirtyFlag) {
        connectedHouses = connectedHouses || [];
        dirtyFlag = dirtyFlag || Math.random();
        var results = [];
        var x = graphHead.entity.x;
        var y = graphHead.entity.y;
        if (gridMap[y] && gridMap[y][x]) {
            var cell = gridMap[y][x];
            if (cell.connectedRoadDirtyFlag !== dirtyFlag) {
                cell.connectedRoadDirtyFlag = dirtyFlag;
                var neighborCellCoords = [{x: x, y: y - 1}, {x: x, y: y + 1}, {x: x - 1, y: y}, {x: x + 1, y: y}];
                neighborCellCoords.forEach(function(coord) {
                    if (gridMap[coord.y] && gridMap[coord.y][coord.x]) {
                        var neighborCell = gridMap[coord.y][coord.x];
                        var houses = neighborCell.filter(houseFilter);
                        if (houses.length) {
                            if (connectedHouses.indexOf(houses[0]) === -1) {
                                connectedHouses.push(houses[0]);
                                results.push(graphHead);
                            }
                        } else {
                            var road = neighborCell.filter(roadFilter)[0];
                            if (road) {
                                var connectedRoadPatches = PathFinder.findHouseConnections(gridMap, neighborCell.node, connectedHouses, dirtyFlag);
                                Array.prototype.push.apply(results, connectedRoadPatches);
                            }
                        }
                    }
                });
            }
        }
        return results;
    };


}());
