/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */
(function () {
    "use strict";
    var utils = wooga.castle.utils,

    DestroyMode = function (manager, config) {
        this.manager = manager;
        this.parentNode = config.rootNode;
        this.build();

    };

    DestroyMode.prototype.build = function () {
        var hud = document.createElement('div'),
            infoPanel = document.createElement("div");
        utils.addClass(hud, 'hud_mode destroy_entity');
        infoPanel.className = "infoPanel";
        infoPanel.innerHTML = '<p class="specification">Sell <span class="entityclass"></span> <span class="whatyouget"></span></p><div class="menu"></div>';
        hud.appendChild(infoPanel);
        this.rootNode = hud;
        this.infoPanel = infoPanel;
        document.getElementById("game_overlay").appendChild(hud);

        var clickHandler = utils.bind(function (ev) {
            ev.preventDefault();
            if(utils.hasClass(ev.target, 'disabled')) {
                return;
            }
            var action = ev.target.getAttribute('data-actionname');
            if (this.handle) {
                this.handle(action, this);
            }
            switch(action) {
                case "cancel":
                    break;
                case "confirm":
                    break;
                default:
                    break;
            }

        }, this);

        var actions = {
            "cancel": true,
            "confirm": true
            };
        var action;

        for (action in actions) {
            if (actions.hasOwnProperty(action)) {
                var a = document.createElement("a");
                a.className = action;
                a.setAttribute('href', '#');
                a.innerHTML = action;
                a.setAttribute('data-actionname', action);
                utils.addClass(a, 'action ' + action);

                a.addEventListener('click', clickHandler, false);

                this.infoPanel.querySelector('.menu').appendChild(a);
            }
        }

        this.game = wooga.castle.Game.instance();
    };

    DestroyMode.prototype.handle = function (actionMessage, actionsMenu) {
        if("confirm" === actionMessage) {
            this.confirm();
        } else if("cancel" === actionMessage) {
            this.cancel();
        }
    };

    DestroyMode.prototype.confirm = function () {
        var def = this.target.entity.definition,
            game = this.game,
            target = this.target,
            entity = target.entity,
            goldGain = DestroyMode.goldGain(target),
            foodGain = DestroyMode.foodGain(target),
            message = {entity: entity, entityView: target, rewards: []};

        if(goldGain){
            game.increase('gold', goldGain, target);
            message.rewards.push({type: 'gold', amount: goldGain});
        }
        if(foodGain){
            game.increase('food', foodGain, target);
            message.rewards.push({type: 'food', amount: foodGain});
        }

        entity.fireEvent('destroy');
        game.publish('entity/destroy', message);
        game.worldView.publish('entityView/destroy', message);
        game.removeEntity(entity);
        game.worldView.removeEntityView(target);
        if('function' === typeof target.destructor){
            target.destructor();
        }
        game.updateMapData();
        game.publish('player/update'); //TODO this used for side effects, replace with new request-save
        this.deactivate();

    };

    DestroyMode.prototype.cancel = function () {
        this.deactivate();
    };

    DestroyMode.goldGain = function(target){
        return Math.floor(target.entity.definition.goldCost * 0.5) + (target.entity.contract && target.entity.contract.requiredGold && target.entity.contractStartTime ? target.entity.contract.requiredGold : 0);
    };

    DestroyMode.foodGain = function (target) {
         return (target.entity.contractStartTime && target.entity.contract && target.entity.contract.requiredFood ) ? target.entity.contract.requiredFood : 0;
    };

    DestroyMode.prototype.activate = function (config) {
        var target = this.target = config.target;
        this.manager.view.isFocusedEntityView = function (entityView) {
            return entityView === target;
        };

        this.infoPanel.querySelector('.entityclass').innerHTML = target.entity.getCallableName();

        var gainGold = DestroyMode.goldGain(target),
            gainFood = DestroyMode.foodGain(target);
        this.infoPanel.querySelector('.whatyouget').innerHTML = "for " + gainGold + " coins" +
            ( (gainFood) ? " and " + gainFood + " food" : '')
            + '.' ;

        this.show();
        utils.publish('view:entity/ensureVisible', target);

    };

    DestroyMode.prototype.deactivate = function () {
        this.manager.view.isFocusedEntityView = this.manager.view.isFocusedEntityViewDefault;
        if( this.target.actionsMenu ) {
            this.target.actionsMenu.destructor();
        }
        this.target = null;
        this.hide();
        this.manager.setMode(wooga.castle.GameModesManager.Mode.BASIC);
    };

     DestroyMode.prototype.position = function () {
         var style = this.rootNode.style,
             entity = this.target,
             top = entity.y,
             left = entity.x + entity.width * 0.5,
             gridUnit = entity.view.gridUnit;

         if(left < entity.view.gridUnit*5) {
             left = entity.view.gridUnit*5; // TODO: make this value configurable
         }

         if(left > 1430) {
             left = 1490-(entity.view.gridUnit*5); // TODO: make this better
         }

         if (entity instanceof wooga.castle.DecorationView){
             var topUnderArea = top - entity.entity.definition.influenceArea * gridUnit;
             style.webkitTransform = 'translate3d(' + left + 'px, ' + topUnderArea + 'px, 0)';
         } else {
             style.webkitTransform = 'translate3d(' + left + 'px, ' + top + 'px, 0)';
         }
     };


    DestroyMode.prototype.show = function () {
        this.position();
        utils.addClass(this.rootNode, "active");
    };

    DestroyMode.prototype.hide = function () {
        utils.removeClass(this.rootNode, "active");
    };


    wooga.castle.DestroyMode = DestroyMode;

}());
