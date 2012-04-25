/*jslint white:true, plusplus:true, nomen:true, vars:true, browser:true */
/*global buster, sinon, wooga */

var assert = buster.assertions.assert;
var refute = buster.assertions.refute;

(function() {
    "use strict";
    buster.testCase("Spawner test case", {

        setUp: function() {
            this.game = {
                entities: [],
                createEntity: function(config) {
                    this.entities.push({
                        definition: {
                            "class": "enemy"
                        },
                        key: config.key
                    });
                },
                removeEntity: function(entity) {
                    this.entities.splice(this.entities.indexOf(entity), 1);
                }
            };

            this.view = {
                views: [],
                createEntityView: function(entity) {
                    this.views.push({entity: entity});
                    return {
                        findNewPosition: function() {
                            return true;
                        },
                        invalidatePosition: function() {}
                    };
                },
                removeEntityView: function(view) {
                    this.views.splice(this.views.indexOf(view), 1);
                }
            };

            this.spawner = new wooga.castle.Spawner(this.game, this.view);
        },
        tearDown: function() {},

        "test spawn creates a new entity and view": function() {
            this.spawner.spawn("godzilla");
            this.spawner.spawn("borg");
            this.spawner.spawn("jar jar binks");

            assert.equals(this.game.entities.length, 3);
            assert.equals(this.view.views.length, 3);
        },

        "test getAllowedEnemies returns a difference between expected and existing number of enemies": function() {
            this.spawner.spawnRandomEnemies(5);
            assert.equals(this.spawner.getAllowedEnemies(12), 7);

            assert.equals(this.spawner.getAllowedEnemies(3), 0);
        },

        "test spawnRandomEnemies creates a given number of random enemies": function() {
            this.spawner.spawnRandomEnemies(100);

            var trolls = this.game.entities.filter(function(enemy) {
                return enemy.key.indexOf("troll") > -1;
            });

            var goblins = this.game.entities.filter(function(enemy) {
                return enemy.key.indexOf("goblins") > -1;
            });

            var giants = this.game.entities.filter(function(enemy) {
                return enemy.key.indexOf("giant") > -1;
            });

            assert(trolls.length);
            assert(goblins.length);
            assert(giants.length);
        }

    });
}());
