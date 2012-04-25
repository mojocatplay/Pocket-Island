/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */
(function () {
    "use strict";
    var utils = wooga.castle.utils,
        disabler = utils.disabler;

    wooga.castle.ShopPreviewMode = function (manager, config) {

        this.manager = manager;

        this.parentNode = config.rootNode;

        this._build();

    };

    var ShopPreviewMode = wooga.castle.ShopPreviewMode;
    utils['extends'](ShopPreviewMode, wooga.castle.MoveMode);

    ShopPreviewMode.prototype._build = function () {

        var hud = document.createElement("div");
        hud.className = "hud_mode shop";

        this.infoPanel = document.createElement("div");
        this.infoPanel.className = "infoPanel";
        hud.appendChild(this.infoPanel);

        var entityName = this.entity;
        this.infoPanel.innerHTML = '<button class="close"></button><div class="specification"><h6>Place Your New <span></span></h6><p>Use finger to choose position, <br>then press Accept.</p></div>';

        this.closeButton = document.createElement("button");
        this.closeButton.className = "close";
        utils.addTouchHandler(this.closeButton, this.cancel, this);
        hud.appendChild(this.closeButton);

        this.parentNode.appendChild(hud);

        this.rootNode = hud;

    };

    ShopPreviewMode.prototype.activate = function (config) {

        var position = this.manager.view.getCenterCoordinates();
        var filterMessage = {center: position};
        this.manager.view.publish('shop/get preview center', filterMessage);
        position = filterMessage.center;

        var entity = this.manager.game.createEntity({
                key: config.entityName,
                x: position.x,
                y: position.y,
                preview: true
            });

        var entityView = this.manager.view.createEntityView(entity);

        entityView.isDraggable = true;

        this.manager.view.isFocusedEntityView = function (ev) {
            return ev === entityView;
        };

        this.entity = entity;
        this.entityView = entityView;

        var entityName = entity.getCallableName();
        entityName = entityName[0].toUpperCase() + entityName.slice(1);
        this.infoPanel.querySelector('h6 span').innerHTML = entityName;

        entityView.actionsMenu = new wooga.castle.InPlaceActionsMenu(entityView, {
            "actions": {"cancel": true, "confirm": true}
        }, this);

        entityView.addEventHandler("dragend", this.onDragEnd, this);
        entityView.addEventHandler("touch", this.onTouch, this);
        entityView.view.addEventHandler('touch', this.worldTouchListener, this);
        this.target = this.entityView;
        this.onDragEnd();

        this.show();
        this.locked = false;
        this.manager.game.publish("shopPreviewMode/activated", this);

        this.entity.game.publish("decoration/showBoost",{
            entityView: entityView,
            x: position.x,
            y: position.y
        });

        utils.can('touch-entity', disabler);
        utils.can('entity/contract/change', disabler);

    };

    ShopPreviewMode.prototype.deactivate = function () {

        this.manager.view.isFocusedEntityView = this.manager.view.isFocusedEntityViewDefault;

        this.entityView.isDraggable = false;

        this.entityView.removeEventHandler("dragend", this.onDragEnd, this);
        this.entityView.removeEventHandler("touch", this.onTouch, this);
        this.entityView.view.removeEventHandler('touch', this.worldTouchListener, this);

        if( this.entityView.actionsMenu ) {
            this.entityView.actionsMenu.destructor();
        }

        // hide boost info in influence area of decoration
        if (this.entityView instanceof wooga.castle.DecorationView) {
            this.entityView.entity.game.publish("decoration/hideBoost", {
                 entityView: this.entityView
            });
        }


        this.hide();

        this.locked = false;
        this.manager.setMode(wooga.castle.GameModesManager.Mode.BASIC);
        this.manager.game.publish("shopPreviewMode/deactivated", this);

        utils.can.remove('touch-entity', disabler);
        utils.can.remove('entity/contract/change', disabler);
    };

    ShopPreviewMode.prototype.confirm = function () {
        if (this.entityView.isColliding()) {
            return;
        }

        var view = this.manager.view,
            mapX = this.entityView.x / view.gridUnit - view.mapWidth / 2,
            mapY = this.entityView.y / view.gridUnit - this.entity.definition.offsetY - view.mapHeight / 2;
        this.mapX = mapX;
        this.mapY = mapY;

        delete this._action;
        if(! utils.can("shoppreviewmode/accept", this)) {
            return;
        }

        this.deactivate();
        view.bufferCanvasChanges.push(this.entityView);

        this.entity.buy({
            x: mapX,
            y: mapY
        });

        if (this.entity.is("farm") && this.manager.game.hasStat('gold', this.entity.definition.goldCost)) {
            var message = {
                entityName: this.entity.key
            };
            utils.publish("view:shop/preview", message);
        }

    };

    ShopPreviewMode.prototype.cancel = function () {
        if(! utils.can("shoppreviewmode/cancel", this)) {
            delete this._action;
            return;
        }
        this.deactivate();

        this.manager.view.removeEntityView(this.entityView);
        this.manager.game.removeEntity(this.entity);
    };


    ShopPreviewMode.prototype.onDragEnd = function () {
        this.parent.prototype.onDragEnd.call(this);
        this.entityView.actionsMenu.setActionEnabled( 'cancel', utils.can("shoppreviewmode/cancel", this));
    };


}());
