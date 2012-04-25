/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */
(function(){
    "use strict";
    var WhackableView = function(view, entity){
        this.parent.call(this, view, entity);
        this.addEventHandler('touch', this.touchHandler, this);
        if(! entity.definition.hasWhackStates){
            this.getImageFrame = this.parent.prototype.getImageFrame;
        } else {
            this.frame = 0;
        }
    },

    utils = wooga.castle.utils;
    utils['extends'](WhackableView, wooga.castle.EntityView);


    WhackableView.prototype.touchHandler = function(ev){
        if(! utils.can('whack', this)){
            return false;
        }
        if(!this.busy){
            if(this.view.game.drain('food', 15, this)){
                this.busy = true;
                this.makeDynamic();
                this.view.publish('entity/whacking', {
                    "entityView": this,
                    "text": this.getWhackActionName(),
                    "callback": utils.bind(function(){
                        this.entity.whack();
                        this.busy = false;
                        this.makeStatic();
                        this.frame = this.entity.definition.whacks - this.entity.whacks;
                        utils.publish("food/drain", {amount: 15, text: "-15 Food", entityView: this});
                    }, this)
                });
            }
        }
    };


    WhackableView.prototype.getWhackActionName = function(){
        return (/rock/i).test(this.entity.key) ? 'Smashing' : 'Chopping';
    };


    WhackableView.prototype.getImageFrame = function(touchableFrame){
        var frame = touchableFrame ? 0 : this.frame;
        return {
            x: frame * this.width,
            y: (this.entity.definition.spritey || 0) * this.view.gridUnit,

            height: this.height,
            width: this.width
        };
    };


    wooga.castle.subscribe('game/ready', function(message){
        var game = message.game;
        game.subscribe('entity/whack-complete', function(message){
            var view = message.entity.entityView;
            if(! view){
                return;
            }
            view.view.removeEntityView(view);
            game.removeEntity(message.entity);
            game.updateMapData();
        });
    }, this);


    wooga.castle.WhackableView = WhackableView;

    utils.can('whack', function(entityView){
        return utils.can('touch-entity', entityView);
    });

}());
