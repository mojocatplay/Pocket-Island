/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */
(function(){
    "use strict";
    var Whackable = function(game, config){
        wooga.castle.Entity.call(this, game, config);
        if (! arguments.length) {
            return this;
        }
        this.whacks = this.definition.whacks;
    };

    var utils = wooga.castle.utils;
    wooga.castle.utils['extends'](Whackable, wooga.castle.Entity);

    Whackable.prototype.whack = function(){
        if(! utils.can('whack', this)){
            return false;
        }
        this.whacks--;
        this.game.publish('entity/whack', {entity: this});
        this.reward('whack');
        if(! this.whacks){
            this.game.publish('entity/whack-complete', {entity: this});
            this.reward('complete');
        }
        return true;
    };

    Whackable.prototype.reward = function(rewardKey){
        var rewards = (this.definition.rewards||0)[rewardKey];
        if(rewards){
            Array.prototype.map.call(rewards, function(reward){
                this.game.increase(reward.type, reward.amount, this);
            }, this);
            this.game.publish('entity/whack-rewards', {
                entity: this,
                rewards: rewards
            });
        }
    };


    function lumberjacks (whackable) {
        if(whackable.entity){
            if(/tree/.test(whackable.entity.key)){
                return !lumberjacks.tree;
            }
        }
        return true;
    }

    utils.can('whack', lumberjacks);

    utils.subscribe('game/ready', function(message) {
        utils.subscribe('view:entity/whacking', function (message) {
            if(/tree/.test(message.entityView.entity.key)){
                lumberjacks.tree = true;
            }
        }).subscribe('game:entity/whack', function (message) {
            if(/tree/.test(message.entity.key)){
                lumberjacks.tree = false;
            }
        });
    });

    wooga.castle.Whackable = Whackable;
}());
