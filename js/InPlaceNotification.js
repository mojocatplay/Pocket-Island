/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */
(function () {
    "use strict";
    var utils = wooga.castle.utils,
        _instance;

    function figurePositionPX (entityView) {
        return {
            left: entityView.x + (entityView.width * 0.5),
            top: entityView.y - (entityView.entity ? (entityView.entity.definition.offsetY || 0) * wooga.castle.GRID_UNIT : 0)
        };
    }

    var InPlaceNotification = function (view) {
        if(_instance) {
            throw "InPlaceNotificaiton is a singleton";
        }
        _instance = this;
        this.view = view;

        this.rootNode = document.getElementById('game_overlay');

        utils.subscribe('game/ready', function (message) {

             utils.subscribe('view:drydock/show', function (message) {
                message.negative = true;
                message.text = "Complete more goals first!";
                _instance.show(message);
            });


            wooga.castle.subscribe('game/not-enough-food', function (message) {
                if (message.entityView.entity.contract) {
                    var missingFoodAmount = message.entityView.entity.contract.requiredFood - wooga.castle.playerData.food;
                    message.text = "You need " + missingFoodAmount + " more food!";
                } else {
                    message.text = "You need more food!";
                }

                message.negative = true;
                _instance.show(message);
            });

            wooga.castle.subscribe('game/not-enough-gold', function (message) {
                message.negative = true;
                _instance.show(message);
            });

            view.game.subscribe('contract/start', function (message){
                if('ship' === message.entity.definition['class']){
                    setTimeout(function () {
                        _instance.show({entityView: message.entity.entityView, text: "Repair Started!"});
                    }, 25);
                }
            });

            wooga.castle.subscribe('entity/coming-soon', function(message){
                _instance.show({entityView: message, text: "Coming Soon..."});
            });

            wooga.castle.subscribe('gold/drain', function(message){
                message.negative = false;
                _instance.show(message);
            });
            wooga.castle.subscribe('food/drain', function(message){
                message.negative = false;
                _instance.show(message);
            });

            utils.subscribe('view:root-road-tap', function (message) {
                _instance.show( utils.extend({"text": "Cannot remove that!", "negative": true}, message) );
            });

            utils.subscribe('game:road/cant-place-here', function (message) {
                _instance.show( utils.extend({"text": "Can't place road here", "negative": true}, message) );
            });

            utils.subscribe('game:building/connected', function (message) {
                _instance.showBuildingConnectedTimeout = window.setTimeout(function () {
                    _instance.show(utils.extend({
                        "text": "Building Connected",
                        "negative": true
                    }, message));
                }, 20);
            });

            utils.subscribe('game:entity/buy', function (message) {
                if (_instance.showBuildingConnectedTimeout) {
                    window.clearTimeout(_instance.showBuildingConnectedTimeout);
                }
                _instance.show(utils.extend({
                    "text": '-' +  message.entity.definition.goldCost + ' gold',
                    "negative": true
                }, message, {entityView: message.entity.entityView}));
            });

        }, this);

    };

    InPlaceNotification.instance = function(){return _instance;};

    InPlaceNotification.prototype.show = function (config) {
        var text = config.text,
            image = config.image,
            el = document.createElement('div'),
            root = _instance.rootNode,
            position = figurePositionPX(config.entityView);
        el.setAttribute('class', 'quick-notif');
        utils.addClass(el, 'flyout');
        el.style.left = position.left + 'px';
        el.style.top = position.top + 'px';

        if (image) {
            el.style.backgroundImage = 'url(' + image.src + ')';
        }
        if (text) {
            el.innerHTML = text;
        }

        el.addEventListener('webkitAnimationEnd', function (ev) {
            if (ev.target === el && el.parentNode) {
                 el.parentNode.removeChild(el);
            }
        });

        root.appendChild(el);
        return this;
    };


    wooga.castle.InPlaceNotification = InPlaceNotification;

    wooga.castle.subscribe('game/worldViewInit', function (message) {
        var notification = new InPlaceNotification(message.view);
    });

}());
