/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */

(function () {
    "use strict";

    var utils = wooga.castle.utils,
        disabler = function () { return false; };

    wooga.castle.MoveMode = function (manager, config) {

        this.manager = manager;

        this.parentNode = config.rootNode;

        this.build();

    };


    var MoveMode = wooga.castle.MoveMode;

    MoveMode.prototype.build = function () {

        var hud = document.createElement("div");
        hud.className = "hud_mode move";

        this.infoPanel = document.createElement("div");
        this.infoPanel.className = "infoPanel";
        hud.appendChild(this.infoPanel);

        this.infoPanel.innerHTML = '<div class="specification"><h6>Drag <span class=entityclass></span></h6><p>Use your finger to choose the position, then press Accept</p></div>';

        this.closeButton = document.createElement("button");
        this.closeButton.className = "close";
        hud.appendChild(this.closeButton);
        utils.addTouchHandler(this.closeButton, this.cancel, this);

        this.parentNode.appendChild(hud);

        this.rootNode = hud;

    };

    MoveMode.prototype.handle = function (actionMessage, actionsMenu) {
        if("confirm" === actionMessage) {
            this.confirm();
        } else if("cancel" === actionMessage) {
            this.cancel();
        }
    };


    MoveMode.prototype.worldTouchListener = function(ev){
        if(ev.stopPropagation || this.locked){
            return false;
        }
        this.target.beforeMove();
        this.target.moveTo(ev, false);
        this.target.moved();
        this.onDragEnd();
    };


    MoveMode.prototype.activate = function (config) {

        var target = config.target;

        this.target = target;

        this.manager.view.isFocusedEntityView = function (entityView) {
            return entityView === target;
        };

        utils.can('touch-entity', disabler);
        utils.can('entity/contract/change', disabler);

        this.infoPanel.querySelector('.entityclass').innerHTML = target.entity.getCallableName();
        this.manager.view.addEventHandler('touch', this.worldTouchListener, this);

        target.isDraggable = true;
        target.makeDynamic();

        this.targetStartX = target.x;
        this.targetStartY = target.y;


        target.actionsMenu = new wooga.castle.InPlaceActionsMenu(target, {
            "actions": {"cancel": true, "confirm": true}
        }, this);

        target.addEventHandler("dragend", this.onDragEnd, this);
        target.addEventHandler("touch", this.onTouch, this);
        this.onDragEnd();

        this.show();
        this.locked = false;
        this.manager.game.publish("moveMode/activated", this);
    };

    MoveMode.prototype.deactivate = function () {
        utils.can.remove('entity/contract/change', disabler);
        utils.can.remove('touch-entity', disabler);
        this.manager.view.isFocusedEntityView = this.manager.view.isFocusedEntityViewDefault;

        this.target.removeEventHandler("dragend", this.onDragEnd, this);
        this.target.removeEventHandler("touch", this.onTouch, this);
        this.manager.view.removeEventHandler('touch', this.worldTouchListener, this);

        this.target.isDraggable = false;
        this.target.makeStatic();

        if( this.target.actionsMenu ) {
            this.target.actionsMenu.destructor();
        }

        // hide boost info in influence area of decoration
        if (this.target instanceof wooga.castle.DecorationView) {
            this.target.entity.game.publish("decoration/hideBoost", {
                 entityView: this.target
            });
        }

        this.target = null;
        this.locked = false;

        this.hide();

        this.manager.setMode(wooga.castle.GameModesManager.Mode.BASIC);
        this.manager.game.publish("moveMode/deactivated", this);
    };

    MoveMode.prototype.onTouch = function (ev) {
        if(ev.stopPropagation || this.locked){
            return false;
        }
        ev.stopPropagation = true;
        if(!this.target.isColliding()){
            this.locked = true;
            setTimeout(utils.bind(this.confirm, this), 100);
        }
    };

    MoveMode.prototype.show = function () {
        this.rootNode.style.display = "block";
    };

    MoveMode.prototype.hide = function () {
        this.rootNode.style.display = "none";
    };

    MoveMode.prototype.confirm = function () {

        var target = this.target;
        var gridUnit = this.manager.view.gridUnit;

        if ((target.x !== this.targetStartX) || (target.y !== this.targetStartY)) {
            target.moved();

            target.entity.move({
                x: target.entity.x + (target.x - this.targetStartX) / gridUnit,
                y: target.entity.y + (target.y - this.targetStartY) / gridUnit
            });
            if( target.entity.fireEvent ){
                target.entity.fireEvent('entity/moved');
            }

        }

        this.deactivate();

    };

    MoveMode.prototype.cancel = function () {
        if(this.locked) {
            return false;
        }

        this.manager.view.removeFromHitmap(this.target);

        this.target.x = this.targetStartX;
        this.target.y = this.targetStartY;

        this.manager.view.addToHitmap(this.target);
        this.target.moved();

        this.deactivate();

    };

    MoveMode.prototype.onDragEnd = function () {
        var target = this.target;
        utils.publish('view:entity/ensureVisible', target);
        var isColliding = target.isColliding();
        target.actionsMenu.setActionEnabled('confirm', !isColliding);
    };

    utils.can('move-entity', function (entity) {
        return entity.definition['class'] !== 'castle';
    });

}());
