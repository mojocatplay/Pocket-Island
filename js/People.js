/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */

(function () {

    "use strict";

    var utils = wooga.castle.utils;

    var People = wooga.castle.People = function (game) {

            this._game = game;

            this.entities = [];

            this.updateGraph();

            this.addEventHandler("path walked", function (event) {
                event.target.remove();
                this.respawn();
            }, this);

            this.addEventHandler("remove", function (event) {
                this.entities.splice(this.entities.indexOf(event.target), 1);
            }, this);


            wooga.castle.subscribe('game/ready', this.initPopulation, this);

            game.subscribe("tutorial/done", this.resetPopulation, this);

            game.subscribe("building/connected", this.resetPopulation, this);
            game.subscribe("building/disconnected", this.resetPopulation, this);

            game.subscribe("road/add", this.updateGraph, this);
            game.subscribe("road/remove", this.updateGraph, this);

        };

    utils.mixin(People, utils.ObservableMixin);

    People.prototype.updateGraph = function () {

        var PathFinder = wooga.castle.PathFinder;

        // Must be regenarated after map change
        this.graph = PathFinder.initRoadsGraph();

        PathFinder.calculateDistances(this.graph);

    };

    People.prototype.spawn = function() {
        var PathFinder = wooga.castle.PathFinder;

        var possibleDestinations = PathFinder.findHouseConnections(this._game.gridMap, this.graph);

        if (possibleDestinations.length) {

            var roadRoot = wooga.castle.RoadsMode.getRoadRootPosition(this._game.castle);
            var groupConfig = [], destination, i, iMax, path;

            for (i = 0, iMax = Math.min(possibleDestinations.length, 2); i < iMax; i++){
                destination = possibleDestinations.splice(Math.floor(Math.random() * possibleDestinations.length), 1)[0];
                path = PathFinder.findPath(this.graph, destination);
                groupConfig.push({
                    x: roadRoot.x,
                    y: roadRoot.y,
                    delay: (i + 1) * 6000 + Math.random() * 1500,
                    path: path,
                    speed: 0.05
                });
            }
            this.generateGroup(groupConfig);
        }
    };

    People.prototype.respawn = function() {
        if (!this.entities.length) {
            var that = this;
            that.spawnTimeout = setTimeout(function() {
                that.spawn();
            }, 6000 + Math.random() * 1500);
        }
    };

    People.prototype.initPopulation = function () {
        if (this._game.playerData.doneTutorial) {
            this.spawn();
        }
    };


    People.prototype.resetPopulation = function() {
        this.removePopulation();
        this.initPopulation();
    };

    /**
     * Generates number of people (a group).
     *
     * @param {Array} peopleConfigs An array of Objects with person configuration properties.
     * @returns {Array} An array of wooga.castle.Person instances.
     */
    People.prototype.generateGroup = function (peopleConfigs) {
        peopleConfigs.forEach(function(config) {
            this.generatePerson(config);
        }, this);
    };

    /**
     * Generates a person.
     *
     * @param {Object} config An Object with person configuration properties.
     * @returns {wooga.castle.Person} Person instance.
     */
    People.prototype.generatePerson = function (config) {

        var person = new wooga.castle.Person(this, config);

        this.entities.push(person);

        return person;

    };

    People.prototype.removePopulation = function() {

        clearTimeout(this.spawnTimeout);

        while (this.entities.length) {
            this.entities[this.entities.length - 1].remove();
        }

    };


}());
