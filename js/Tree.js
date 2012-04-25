/*jslint white:true, browser:true, plusplus:true, nomen:true */
/*global wooga */
(function(){
    "use strict";
    function Tree(game, config){
        wooga.castle.Whackable.call(this, game, config);
        if (! arguments.length) {
            return this;
        }
    }

    var utils = wooga.castle.utils;
    wooga.castle.utils['extends'](Tree, wooga.castle.Whackable);


    Tree.prototype.reward = function(rewardKey){
        wooga.castle.Whackable.prototype.reward.call(this, rewardKey);

        if ("complete" === rewardKey && Math.random() < 0.25) {
            var rewards = ['characters/troll', 'characters/giant', 'characters/goblins',
                "decorations/flower_daisy", "decorations/flower_rose", "decorations/flower_dalia", "decorations/flower_sunflower"];
            utils.publish('spawn at location', {
                "key": rewards[Math.floor(Math.random() * rewards.length)],
                "x": this.x, "y": this.y
            });
        }
    };


    wooga.castle.Tree = Tree;
}());
