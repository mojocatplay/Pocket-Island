/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */
(function () {
    "use strict";
    var utils = wooga.castle.utils,
    CastleView = function (view, entity) {
        this.parent.call(this, view, entity);
        this.actionsMenu = null;
        this.initEventHandlers();
        this.entity.selectable = true;
        this.wasPrevConstruction = false;
        this.underConstructionImage = this.view.game.entitiesDefinition["buildings/castle_construction"].image;
        this.setUnderConstruction( wooga.castle.playerData.upgradingCastle );
        this.actions = {
            "upgrade": {
                "disabled": !this.entity.definition.upgradeTo
            }
        };
        this.events = utils.extend({}, CastleView.Events);
    };

    CastleView.Events = {
        UPGRADE: 'castle/upgrade'
    };

    CastleView.prototype = new wooga.castle.EntityView();

    CastleView.prototype.parent = wooga.castle.EntityView;

    utils.mixin(CastleView, utils.ObservableMixin);

    CastleView.prototype.constructor = CastleView;

    CastleView.prototype.actionsMenu = null;

    CastleView.prototype.initEventHandlers = function () {
        this.addEventHandler("touch", this.touchHandler, this);
    };

    CastleView.prototype.touchHandler = function (ev) {};

    CastleView.prototype.isFocusable = function () {
        return true;
    };

    CastleView.prototype.setUnderConstruction = function (isUnderConstruction) {
        this.isUnderConstruction = isUnderConstruction;
        this.image = isUnderConstruction ? this.underConstructionImage
            : this.entity.definition.image;
        if( isUnderConstruction ) {
            this.makeDynamic();
        }

        this.cacheImageFrame();
        this.makeStatic();
    };

    CastleView.prototype.getImageFrame = function(){

        if(! this.isUnderConstruction ){
            return this.parent.prototype.getImageFrame.call(this);
        } else {
            return {x:0, y:0, width: this.width, height: this.height};
        }

    };

    CastleView.prototype.upgrade = function () {
        var nextDef = {
            "key": this.entity.definition.upgradeTo,
            "x": this.entity.x,
            "y": this.entity.y
        },
            game = this.view.game;

        var entity = game.createEntity(nextDef);

        this._entity = this.entity;
        this.entity = entity;
        this.entity.entityView = this;

        game.removeEntity(this._entity);
        game.updateMapData();
        this.actions.upgrade.disabled = !this.entity.definition.upgradeTo;

        wooga.castle.CastleCompleteScreen.instance().destructor();

        this.setUnderConstruction(wooga.castle.playerData.upgradingCastle = false); //TODO set the playerData value somewhere else!

        wooga.castle.Game.instance().publish(this.events.UPGRADE, {
                            entityView: this,
                            entity: this.entity,
                            text: "Upgrading..."
                        });
    };

    wooga.castle.CastleView = CastleView;

}());
