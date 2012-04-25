/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */

(function () {

    "use strict";

    var utils = wooga.castle.utils;

    var GameModesManager = wooga.castle.GameModesManager = function (game, view, hud, config) {
        this.game = game;
        this.view = view;
        this.hud = hud;

        this.mode = GameModesManager.Mode.BASIC;

        var commonModeConfig = {rootNode: config.rootNode};

        this.infoMode = new wooga.castle.InfoMode(this, commonModeConfig);

        this.moveMode = new wooga.castle.MoveMode(this, commonModeConfig);

        this.shopPreviewMode = new wooga.castle.ShopPreviewMode(this, commonModeConfig);

        this.seedMode = new wooga.castle.SeedMode(this, commonModeConfig);

        this.roadsMode = new wooga.castle.RoadsMode(this, commonModeConfig);

        this.castleUpgradeMode = new wooga.castle.CastleUpgradeMode(this, commonModeConfig);

        this.destroyMode = new wooga.castle.DestroyMode(this, commonModeConfig);

        view.addEventHandler("touch", function touchHandler(event) {

            var entityView = event.target;
            if (this.mode === GameModesManager.Mode.BASIC && entityView.isFocusable() && utils.can('focus any entity')) {
                this.view.publish('entity/focus', entityView);
                this.setMode(GameModesManager.Mode.INFO, {
                    target: entityView
                });
            } else if (-1 !== [GameModesManager.Mode.INFO, GameModesManager.Mode.DESTROY].indexOf(this.mode)) {
                this.view.publish('entity/blur');
                this[ (GameModesManager.Mode.INFO === this.mode ? 'info' : 'destroy') + 'Mode'].deactivate();
                touchHandler.call(this, event);
            }

        }, this);

        view.addEventHandler("longtouch", function(event) {
            var entityView = event.target;

            if ((this.mode === GameModesManager.Mode.BASIC) && entityView.entity.draggable) {
                this.setMode(GameModesManager.Mode.MOVE, {
                    target: entityView
                });
                entityView.fireEvent('dragstart');
                entityView.addEventHandler('touchend', function touchendHandler(ev) {
                    entityView.dragend();
                    entityView.removeEventHandler('touchend', touchendHandler);
                });
            }
        }, this);

        view.subscribe("shop/preview", function (message) {
            this.setMode(GameModesManager.Mode.SHOP_PREVIEW, {
                entityName: message.entityName
            });
        }, this);

        view.subscribe("shop/seed", function (message) {
            this.setMode(GameModesManager.Mode.SEED, {
                entityName: message.entityName,
                targetFarmField: message.targetEntity
            });
        }, this);

        view.subscribe("roadsMode/set", function (message) {
            this.setMode(GameModesManager.Mode.ROADS);
        }, this);

        view.subscribe("castleUpgradeMode/set", function (message) {
            this.setMode(GameModesManager.Mode.CASTLE_UPGRADE, {
                target: message.target
            });
        }, this);
        view.subscribe("castleUpgradeScreen/close", function (message) {
            this.setMode(GameModesManager.Mode.BASIC);
        }, this);

        view.subscribe('request-mode', function (message) {
            this.setMode(message.mode, message);
        }, this);

        this.setMode(GameModesManager.Mode.BASIC);
    };

    utils.mixin(GameModesManager, utils.ObservableMixin);

    GameModesManager.Mode = {
        BASIC: "basic",
        INFO: "info",
        MOVE: "move",
        SHOP: "shop",
        SHOP_PREVIEW: "shop-preview",
        SEED: "seed",
        ROADS: "roads",
        CASTLE_UPGRADE: "castle-upgrade",
        DESTROY: "destroy-arr",
        YESNO: "yesnoer"
    };

    GameModesManager.prototype.setMode = function (mode, config) {
        if (mode !== GameModesManager.Mode.BASIC) {
            this.hud.hide();
        }
        utils.removeClass(document.body, this.mode);
        this.mode = mode;

        this.view.mode = mode;
        document.body.setAttribute('data-mode', mode);
        utils.addClass(document.body, this.mode);

        switch (mode) {

            case GameModesManager.Mode.BASIC:
                this.hud.show();
                break;

            case GameModesManager.Mode.INFO:
                this.infoMode.activate(config);
                break;

            case GameModesManager.Mode.SHOP:
                // do nothing. perhaps "Shop" should be refactored to match the other modes
                break;

            case GameModesManager.Mode.MOVE:
                if(utils.can('move-entity', config.target.entity)) {
                    this.moveMode.activate(config);
                } else {
                    this.setMode(GameModesManager.Mode.BASIC);
                    return;
                }
                break;

            case GameModesManager.Mode.SHOP_PREVIEW:
                this.shopPreviewMode.activate(config);
                break;

            case GameModesManager.Mode.SEED:
                this.seedMode.activate(config);
                break;

            case GameModesManager.Mode.ROADS:
                this.roadsMode.activate(config);
                break;

            case GameModesManager.Mode.CASTLE_UPGRADE:
                this.castleUpgradeMode.activate(config);
                break;
            case GameModesManager.Mode.DESTROY:
                this.destroyMode.activate(config);
                break;

            case GameModesManager.Mode.YESNO:
                break;

        }
        this.view.publish('mode-change', this);
    };

}());
