/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */
(function () {
    "use strict";
    var utils = wooga.castle.utils,
        Spawner = function (game, view) {
            this.game = game;
            this.view = view;
        },
        treeKeys = [
            'nature/tree-small-d',
            'nature/tree-small-b',
            'nature/tree-small-y',
            'nature/tree-small-r',
            'nature/tree-big-2-b',
            'nature/tree-big-2-d',
            'nature/tree-big-2-y',
            'nature/tree-big-2-r',
            'nature/tree-big-1-b',
            'nature/tree-big-1-d',
            'nature/tree-big-1-y',
            'nature/tree-big-1-r'
        ];


    Spawner.prototype.spawnStartup = function () {
        if (this.getAllowedEnemies()) {
            this.spawn('characters/troll');
        }
    };



    Spawner.prototype.getAllowedEnemies = function(expected) {
        expected = typeof expected === "undefined" ? 1 : expected;
        var existingEnemies = this.game.entities.filter(function(e){
            return e.definition['class'] === 'enemy';
        });
        return Math.max(expected - existingEnemies.length, 0);
    };

    Spawner.prototype.spawnRandomEnemies = function(howMany) {
        var allowed = this.getAllowedEnemies(howMany);
        var enemies = ['characters/troll', 'characters/giant', 'characters/goblins'];
        while (allowed > 0) {
            this.spawn(enemies[Math.floor(Math.random() * enemies.length)]);
            allowed--;
        }
    };

    Spawner.prototype.spawn = function (key) {
        var worldView = this.view,
            game = this.game;

        var entity = game.createEntity({key: key, x:0, y:0});
        var view = worldView.createEntityView(entity);

        if (view.findNewPosition()) {
            view.invalidatePosition();
        } else {
            worldView.removeEntityView(view);
            game.removeEntity(entity);
        }
    };


    Spawner.prototype.spawnAtLocation = function (config) {
        var view = this.view.createEntityView(this.game.createEntity(config));
        if(config.invalidate || config.invalidate === undefined) {
            view.invalidatePosition();
        }
        return view;
    };

    Spawner.prototype.handleSpawnAtLocationPublish = function (message) {
        message.spawned = this.spawnAtLocation(message);
    };

    Spawner.getRandomTreeKey = function () {
        return treeKeys[Math.floor(Math.random() * treeKeys.length)];
    };

    wooga.castle.Spawner = Spawner;

    wooga.castle.subscribe('map is alterable', function(message){
        var spawner = new Spawner(message.game, message.worldView);
        spawner.spawnStartup();
        utils.subscribe('spawn', spawner.spawn, spawner);
        utils.subscribe('spawn/tree', function () {
            this.spawn(Spawner.getRandomTreeKey());
        }, spawner);
        utils.subscribe('spawn enemy', spawner.spawnRandomEnemies, spawner);
        utils.subscribe('spawn at location', spawner.handleSpawnAtLocationPublish, spawner);
    });

}());
