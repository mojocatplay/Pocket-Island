/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */
(function () {
    "use strict";
    var utils = wooga.castle.utils,
        AnimsFactory = function (view, config) {

            if (!view) {
                return;
            }

            this.view = view;
            this.rootNode = document.createElement('div');
            this.rootNode.id = 'doobers';
            view.rootNode.appendChild(this.rootNode);

            var game = wooga.castle.Game.instance();

            this.view.subscribe("entity/contract/collecting", function (message) {
                this.createAnim({
                    entityView: message.entityView,
                    text: message.text,
                    callback: message.callback
                });
            }, this);

            game.subscribe("contract/collect", function(message){
                var feedback = message.entity.definition['class'] === 'farm' ? ["contracts/food", 'food'] : ["contracts/gold", 'coins'];
                message.feedback = feedback;
                this.showFeedback(utils.extend({amount: message.entity.contractValue}, message)).showXPFeedback(message);
            }, this);

            game.subscribe('entity/destroy', function(message){
                message.rewards.forEach(function(reward){
                    this.showFeedback(utils.extend({ amount: reward.amount, feedback: this.getFeedbackSettings(reward.type) }, message));
                }, this);
                return;
            }, this);

            game.subscribe('castle/upgrade', function(message){
                this.castleUpgradeTransition(message.entityView);
                this.createAnim({
                    entityView: message.entityView,
                    text: message.text
                });
            }, this);

            wooga.castle.subscribe('game/drain-gold', function(message){
                wooga.castle.DooberTooltip.get('coins').add(-message.amount);
                if(! message.entityView){
                    return;
                }
                this.supply(message.entityView, {
                    icon: "contracts/gold",
                    type: "coins"
                });
            }, this);

            wooga.castle.subscribe('game/drain-food', function(message){
                wooga.castle.DooberTooltip.get('food').add(-message.amount);
            });


            this.view.subscribe('entity/whacking', function(message){
                this.createAnim(message);
            }, this);

			game.subscribe("enemy/collectReward", function(message){
				message.entityView = this.view.entitiesViews[message.entity.id];
				var rewards = message.rewards, i;
				for  (i = 0; i < rewards.length; ++i) {
				    if('xp' === rewards[i].type) {
				         this.showXPFeedback(message);
				    }
				    if ('gold' === rewards[i].type) {
                        var feedback = ["contracts/gold", 'coins'];
                        message.feedback = feedback;
                        message.amount = rewards[i].amount;
                        this.showFeedback(message);
                    }
                }

            }, this);

            game.subscribe("house/throwOutKey", function(message){
                var feedback = ["unlock/key", 'lock'];
                message.feedback = feedback;
                message.destination = "#" + message.destination + " header";
                message.amount = 1;
                this.showItemFeedback(message);
                delete message.amount;
            }, this);

            game.subscribe("goals/collectReward", function(message){
                var rewards = message.rewards, i;
                for  (i = 0; i < rewards.length; ++i) {
                    if ('gold' === rewards[i].type) {
                        var feedback = ["contracts/gold", 'gold-in-goal-sceen'];
                        message.feedback = feedback;
                        message.amount = rewards[i].amount;
                        this.showFeedback(message);
                    }
                }
            }, this);

            game.subscribe("contract/start", function (message) {
                if(message.entity.contract.requiredFood){
                    this.foodSupply(message.entity.entityView); //had to plug that in via dependency injection
                }
            }, this);

            game.subscribe('entity/whack-rewards', function(message){
                var copy = utils.extend({}, message);
                copy.entityView = message.entity.entityView;
                if(! copy.entityView){
                    return;
                }
                message.rewards.forEach(function(reward){

                    this.showFeedback(utils.extend({ amount: reward.amount, feedback: this.getFeedbackSettings(reward.type) }, copy));

                }, this);
            }, this);

            this.view.subscribe("ship/upgrading", function (message) {
                this.createAnim({
                    entityView: message.entityView,
                    text: message.text,
                    callback: message.callback
                });
            }, this);

            utils.subscribe("house/drop", function (message) {
                var feedback = [message.item, 'lock'];
                message.feedback = feedback;
                message.destination = "#game_overlay .ship.actionIcon";
                message.amount = 1;
                this.showItemFeedback(message);
                delete message.amount;
            }, this);
        };

    AnimsFactory.prototype.castleUpgradeTransition = function(entityView) {
        var castleOverlay = document.createElement('div'),
            style = castleOverlay.style,
            view = this.view,
            gridUnit = view.gridUnit,
            iconDefinition = view.game.entitiesDefinition['buildings/castle_construction'],
            frame = entityView.getImageFrameForDefinition(iconDefinition),
            rootNode = document.getElementById('game_overlay'),
            top, left;

        castleOverlay.className = 'feedback_anim ';
        var castleImage = iconDefinition.image.cloneNode();
        castleOverlay.appendChild( castleImage );


        top = entityView.y;
        left = entityView.x;
        style.webkitTransform = "translate3d(" + (left) + "px," + (top) + "px,0)";

        rootNode.appendChild(castleOverlay);


        setTimeout(function () {
            style.opacity = 0;
            utils.removeOnAnimationEnd(castleOverlay);
        }, 10);

    };

    AnimsFactory.prototype.getFeedbackSettings = function(type){
        var settings = [];
        switch(type){
            case 'gold':
                settings = ['contracts/gold', 'coins'];
                break;
            case 'food':
                settings = ['contracts/food', 'food'];
                break;
            case 'xp':
                settings = ['contracts/level', 'level'];
                break;
        }
        return settings;
    };

    AnimsFactory.prototype.createAnim = function (config) {

        var that = this,
            entityView = config.entityView,
            element = document.createElement("div"),
            textElement = document.createElement("div"),
            progressElement = document.createElement("div"),
            rootNode = document.getElementById('game_overlay'),
            v = this.view;

        element.className = "anim";
        textElement.className = "text";
        progressElement.className = "progress";

        textElement.innerHTML = config.text;
        element.style.left = entityView.x + entityView.width / 2 + "px";
        element.style.top = entityView.y + "px";
        element.appendChild(textElement);
        element.appendChild(progressElement);

        rootNode.appendChild(element);

        element.addEventListener("webkitAnimationEnd", function animationEndHandler (event) {
            if (event.target === element) {
                element.removeEventListener("webkitAnimationEnd", animationEndHandler, false);
                rootNode.removeChild(element);
                if( typeof config.callback === "function") {
                    config.callback();
                }
            }
        }, false);
        return element;
    };


    AnimsFactory.prototype.showFeedback = function (config) {

        var feedbackicon = document.createElement('div'),
            view = this.view,
            rootNode = this.rootNode,
            gridUnit = view.gridUnit,
            destination = document.querySelector('#' + config.feedback[1]),
            iconDefiniition = view.game.entitiesDefinition[config.feedback[0]],
            amount = this.figureAmount(config),
            entityView = config.entityView,
            style = feedbackicon.style,
            top, left,
            amountText;

        if (amount) {


            feedbackicon.className = 'feedback_anim to_' + config.feedback[1];
            feedbackicon.appendChild( iconDefiniition.image.cloneNode() );
            amountText = document.createTextNode(amount);
            feedbackicon.appendChild((function(){
                var node = document.createElement('span');
                node.innerText = '+';
                return node;
            }()));
            feedbackicon.appendChild(amountText);


            var map = wooga.castle.game.playerData.map;

            var topIn = (typeof entityView !== 'undefined') ?  entityView.y : (config.top  + config.height/2);
            var leftIn = (typeof entityView !== 'undefined') ?  entityView.x : (config.left + config.width/2);
            var width = (typeof entityView !== 'undefined') ?  entityView.width : 0;
            var height = (typeof entityView !== 'undefined') ?  entityView.height : 0;

            top = (view.scrollTop + topIn + ( height * 0.5 ) ) -0.5 * iconDefiniition.height * gridUnit;
            left = ((view.scrollLeft + leftIn + ( width* 0.5 ) )  -0.5 * iconDefiniition.width * gridUnit );

            style.top = style.left = 0;
            style.webkitTransform = "translate3d(" + (left) + "px," + (top) + "px,0)";

            rootNode.appendChild(feedbackicon);

            setTimeout(function(){
                style.webkitTransform = "translate3d(" + (destination.offsetLeft + 10) + "px," + (destination.offsetTop) + "px,0)";

                utils.removeOnAnimationEnd(feedbackicon, function () {
                    wooga.castle.DooberTooltip.get(config.feedback[1]).add(amount);
                });
            }, 1);
        }
        return this;
    };



    var oAnimationTemplate =
            '@-webkit-keyframes {oName} {\n' +
                '0%   { -webkit-transform: translateX(0); }\n' +
                '100% { -webkit-transform: translateX({oEnd}px); }\n' +
            '}';
    var iAnimationTemplate =
            '@-webkit-keyframes {iName} {\n' +
                '0%   { -webkit-transform: translateY(0); }\n' +
                '50%  { -webkit-transform: translateY({iMid}px); }\n' +
                '100% { -webkit-transform: translateY({iEnd}px); }\n' +
            '}';

    var animationsTimeout = 3000;
    var animationsConfig = {
            coins: {
                oEnd: -50,
                iMid: -50,
                iEnd: 50
            },
            level: {
                oEnd: 60,
                iMid: -50,
                iEnd: 35
            },
            food: {
                oEnd: 70,
                iMid: -125,
                iEnd: 40
            },
            lock: {
                oEnd: 70,
                iMid: -125,
                iEnd: 40
            }
        };

    [oAnimationTemplate, iAnimationTemplate].forEach(function (template) {
        Object.keys(animationsConfig).forEach(function (key) {
            var animationRules = template.replace(/\{\w+\}/g, function (matchedStr) {
                    switch (matchedStr) {
                        case "{oName}": return key + "OuterAnimation";
                        case "{iName}": return key + "InnerAnimation";
                        default: return animationsConfig[key][matchedStr.slice(1, -1)];
                    }
                });

            document.styleSheets[0].insertRule(animationRules, 0);
        });
    });


    AnimsFactory.prototype.showItemFeedback = function (config) {

        var feedbackicon = document.createElement('div'),
            view = this.view,
            rootNode = document.getElementById('game_overlay'),
            gridUnit = view.gridUnit,
            destination = document.querySelector(config.destination),
            iconDefiniition = view.game.entitiesDefinition[config.feedback[0]],
            amount = this.figureAmount(config),
            entityView = config.entityView,
            style = feedbackicon.style,
            top, left,
            amountText,
            finished = false;


        feedbackicon.className = 'feedbacker to_' + config.feedback[1];
        feedbackicon.appendChild( iconDefiniition.image.cloneNode() );


        top = ( entityView.y + ( entityView.height * 0.5 ) ) -0.5 * iconDefiniition.height * gridUnit;
        left = ( entityView.x + ( entityView.width * 0.5 ) )  -0.5 * iconDefiniition.width * gridUnit ;

        style.top = top + "px";
        style.left = left + "px";

        feedbackicon.style.webkitTransform = "translate3d(0px,0px,0)";

        setTimeout(function () {
            var position = animationsConfig[config.feedback[1]];
            feedbackicon.style.webkitTransform = "translate3d(" + position.oEnd + "px," + position.iEnd + "px,0)";
        }, 50 );

        var finisher = function () {
            if (!finished) {
                finished = true;
                var finalDestination3d = utils.offset(destination);
                var trstr = "translate3d(" + (-(feedbackicon.offsetLeft - finalDestination3d.left )+ destination.offsetWidth - 58) + "px,"
                            + ( -(feedbackicon.offsetTop - finalDestination3d.top )) + "px,0)";

                style.webkitTransition = '3s, opacity 2s 1s';
                style.webkitTransform = trstr;
                style.opacity = 1;
                feedbackicon.addEventListener('webkitTransitionEnd', function(ev){
                    if(feedbackicon.parentNode){
                        feedbackicon.parentNode.removeChild(feedbackicon);
                        // TODO refactor this to be general!!!1
                        wooga.castle.game.publish('unlockable/keyTouch', {});
                    }
                }, false);
            }
        };

        utils.addTouchHandler(feedbackicon, function () {
            finisher();
        });

        rootNode.appendChild(feedbackicon);
        config.element = feedbackicon;
        config.element._click = finisher;
        return this;
    };


    AnimsFactory.prototype.figureAmount = function(config){
        var normalized = false;
        if(config.feedback){
            normalized = config.feedback[0].split('/').pop();
            if("level" === normalized){
                normalized = 'XP';
            }
        }
        return parseInt(config.amount || (config.contract ? config.contract['provided' + normalized.charAt(0).toUpperCase() + normalized.slice(1)] : 1), 10);
    };


    AnimsFactory.prototype.foodSupply = function(entityView){
        return this.supply(entityView, {
                "icon": "contracts/food",
                "type": "food"
            });
    };

    AnimsFactory.prototype.supply = function(entityView, config){
        var feedbackicon = document.createElement('div'),
            style = feedbackicon.style,
            view = this.view,
            gridUnit = view.gridUnit,
            destination = document.querySelector('#' + config.type),
            iconDefiniition = view.game.entitiesDefinition[config.icon],
            rootNode = this.rootNode,
            top, left;

        feedbackicon.className = 'feedback_anim ' + config.type + 'ie';
        feedbackicon.appendChild( iconDefiniition.image.cloneNode() );

        style.top = style.left = 0;
        style.webkitTransform = "translate3d(" + (destination.offsetLeft + 10) + "px," + (destination.offsetTop) + "px,0)";

        rootNode.appendChild(feedbackicon);

        setTimeout(function () {
            top = (view.scrollTop + entityView.y + ( entityView.height * 0.5 ) );
            left = ((view.scrollLeft + entityView.x + ( entityView.width * 0.5 ) )  -0.5 * iconDefiniition.width * gridUnit );
            style.webkitTransform = "translate3d(" + (left) + "px," + (top) + "px,0)";
            style.opacity = 1;
            utils.removeOnAnimationEnd(feedbackicon);
        }, 1);
    };

    AnimsFactory.prototype.showXPFeedback = function(message){
        return this.showFeedback({
            "entityView": message.entityView,
            "contract": message.contract,
            "amount": message.amount,
            "feedback": ["contracts/level", "level"]
        });
    };

    wooga.castle.AnimsFactory = AnimsFactory;

}());
