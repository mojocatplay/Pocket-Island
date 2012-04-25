/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */
(function () {
    "use strict";
    var utils = wooga.castle.utils,
        jumpTimeout = 30 * 1000;

    function Enemy(game, config) {

        wooga.castle.Entity.call(this, game, config);

        this.hp = this.definition.hp;
        this.punchesLeftUntilKill = this.definition.hp;
    }

    wooga.castle.Enemy = Enemy;
    utils["extends"](Enemy, wooga.castle.Entity);
    utils.mixin(Enemy, utils.ObservableMixin);

    Enemy.prototype.punch = function () {
        this.game.publish("enemy/whack", {entity: this});
        this.hp--;
        if (this.hp === 0) {
           this.remove();
        }
    };

    Enemy.prototype.collectRewards = function(rewards) {
        var i;
        for  (i = 0; i < rewards.length; ++i) {
            this.game.increase(rewards[i].type, rewards[i].amount, this);
        }
        if (rewards.length) {
            this.game.publish("enemy/collectReward", {
                entity: this,
                rewards : rewards
            });
        }
    };

    Enemy.prototype.remove = function () {
        this.game.publish("enemy/kill", {
            entity: this
        });

        this.fireEvent("remove");

        this.game.removeEntity(this);
    };

}());
