/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */
(function () {

    "use strict";

    var utils = wooga.castle.utils,


    InPlaceActionsMenu = function (entityView, config, mode) {
        this.manager = entityView;
        this.config = config;
        this.mode = mode;
        this.rig();
        this.build();
    };

    InPlaceActionsMenu.prototype.manager = null;
    InPlaceActionsMenu.prototype.heap = {};

    InPlaceActionsMenu.prototype.rig = function () {
        var target = this.manager;
        this.manager.view.isFocusedEntityView = function (entityView) {
            return entityView === target;
        };
        this.manager.view.subscribe('entity/blur', this.destructor, this);
    };

    InPlaceActionsMenu.prototype.build = function () {
        var node = document.createElement('div'),
            manager = this.manager,
            view = manager.view,
            actions = this.config.actions;


        manager.addEventHandler("dragstart", function (event) {
            this.hide();
        }, this);

        manager.addEventHandler("dragend", function () {
            this.show();
        }, this);

        node.setAttribute('class', 'in-place-actions');
        this.node = node;
        this.addActionButtons(node, actions);
        view.addEventHandler('moved', this.position, this);
        node.addEventListener('click', utils.bind(function (ev) {
            ev.preventDefault();
            if(utils.hasClass(ev.target, 'disabled')) {
                return;
            }
            var action = ev.target.getAttribute('data-actionname');
            if (this.mode.handle) {
                this.mode.handle(action, this);
            }
            switch(action) {
                case "move":
                    this.destructor();
                    break;
                case "destroy":
                    break;
                default:
                    break;
            }

        }, this), false);
        this.position();

        var gameOverlay = document.getElementById("game_overlay");
        gameOverlay.appendChild(node);
    };

    InPlaceActionsMenu.prototype.position = function () {
        var style = this.node.style,
            entity = this.manager,
            top = entity.y + entity.height,
            left = entity.x + entity.width * 0.5;

        style.webkitTransform = 'translate3d(' + left + 'px, ' + top + 'px, 0)';
    };

    InPlaceActionsMenu.prototype.addActionButtons = function (node, actions) {
        var actionNames = Object.keys(actions),
            self = this;
        utils.addClass(node, 'has-' + Math.max(actionNames.length, 2));
        actionNames.map(function (action) {
            var a = document.createElement('a');
            a.href = '#';
            a.setAttribute('data-actionname', action);
            utils.addClass(a, 'action ' + action);
            node.appendChild(a);
            self.setActionEnabled(action, !actions[action].disabled);
        });
    };

    InPlaceActionsMenu.prototype.setActionEnabled = function (action, isEnabled) {
        var a = this.node.querySelector('.' + action);
        if(a) {
            utils.toggleClass(a, 'disabled', !isEnabled);
        }
    };

    InPlaceActionsMenu.prototype.destructor = function () {
        if(this.node && this.node.parentNode) {
            this.node.parentNode.removeChild(this.node);
        }
        this.manager.view.unsubscribe('entity/blur', this.destructor, this);
        this.manager.view.isFocusedEntityView = this.manager.view.isFocusedEntityViewDefault;
        this.manager.view.removeEventHandler('moved', this.position, this);
    };

    InPlaceActionsMenu.prototype.hide = function () {
        this.node.style.display = 'none';
    };

    InPlaceActionsMenu.prototype.show = function () {
        this.position();
        this.node.style.display = 'block';
    };


    utils.subscribe('game/ready', function (message) {
        var view = message.view;
        utils.subscribe('view:entity/focused', function (message) {

            var clickHandler = utils.bind(function (ev) {
                ev.preventDefault();
                if(utils.hasClass(ev.target, 'disabled')) {
                    return;
                }
                var action = ev.target.getAttribute('data-actionname');
                if (this.handle) {
                    this.handle(action, this);
                }
            }, message.infoMode);
            var action;
            for (action in message.entityView.actions) {
                if (message.entityView.actions.hasOwnProperty(action)) {
                    var a = document.createElement("a");
                    a.className = action;
                    a.setAttribute('href', '#');
                    a.innerHTML = action;
                    a.setAttribute('data-actionname', action);
                    utils.addClass(a, 'action ' + action);
                    if (/\//.test(action)) {
                        a.style.backgroundImage = 'url(' + utils.getEntityImageUrl(action) + ')';
                        utils.addClass(a, 'custom');
                    }

                    a.addEventListener('click', clickHandler, false);

                    message.infoMode.menu.appendChild(a);
                }
            }


        });
        utils.subscribe('view:entity/yesno', function (message) {
            var eyn = new wooga.castle.EntityYesNo(message);
        });
    });



    var EntityYesNo = function (config) {
        var hud = document.createElement('div'),
            infoPanel = document.createElement("div"),
            menu = document.createElement('div');
        utils.addClass(hud, 'hud_mode destroy_entity yesno');
        infoPanel.className = "infoPanel";
        infoPanel.innerHTML = '<p class="specification">' + config.message + '</p>';
        menu.className = 'menu';
        hud.appendChild(infoPanel);
        this.rootNode = hud;
        this.infoPanel = infoPanel;
        document.getElementById("game_overlay").appendChild(hud);

        var clickHandler = utils.bind(function (ev) {
            ev.preventDefault();
            if (!utils.hasClass(ev.target, 'disabled')) {
                var action = ev.target.getAttribute('data-actionname');
                if (this.handle) {
                    this.handle(action, this);
                }
            }
            return false;
        }, this);

        var actions = utils.extend({
            "cancel": true,
            "confirm": true
            }, config.actions || {});
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

                menu.appendChild(a);
            }
        }
        this.infoPanel.appendChild(menu);
        var e = config.entityView,
            entity = config.entity,
            top = e.y,
            left = e.x + e.width * 0.5,
            gridUnit = e.view.gridUnit;

        if(left < gridUnit*5) {
            left = gridUnit*5; // TODO: make this value configurable
        }

        if(left > 1430) {
            left = 1490 - (gridUnit * 5); // TODO: make this better
        }

        this.rootNode.style.webkitTransform = entity.is('decoration') ?
            'translate3d(' + left + 'px, ' + top - entity.definition.influenceArea * gridUnit + 'px, 0)':
            'translate3d(' + left + 'px, ' + top + 'px, 0)';

        this.config = config;

        utils.publish('view:request-mode', {mode: 'yesnoer'});
        utils.addClass(this.rootNode, 'active');
        this.callbacks = {
            "confirm": config.confirm || function () {},
            "cancel": config.cancel || function () {}
        };
    };


    EntityYesNo.prototype.handle = function (actionMessage) {
        this.callbacks[actionMessage]();
        this.destroy();
    };


    EntityYesNo.prototype.destroy = function () {
        utils.removeClass(this.rootNode, 'active');
        this.rootNode.parentNode.removeChild(this.rootNode);
        utils.publish('view:request-mode', {mode: wooga.castle.GameModesManager.Mode.BASIC});
    };

    wooga.castle.EntityYesNo = EntityYesNo;

    wooga.castle.InPlaceActionsMenu = InPlaceActionsMenu;

}());
