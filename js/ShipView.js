/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */
(function(wc){
    "use strict";
    var ShipView = function(view, entity){
        this.parent.call(this, view, entity);
        this.actions = {};
        this.actions[this.entity.definition.requiredItem] = true;
    },

    HouseView = wooga.castle.HouseView,
    utils = wooga.castle.utils;

    utils['extends'](ShipView, HouseView);

    ShipView.prototype.touchHandler = function(ev){
        if (wooga.castle.playerData.doneTutorial && !this.entity.clicked) {
            this.entity.clicked = true;
            this.entity.game.updateMapData();
            this.setActionIcon();
            wooga.castle.publish('request save');
        }
        if (this.entity.upgradable) {
            utils.publish('view:entity/yesno', {
                entityView: this,
                entity: this.entity,
                message: "Do you want to upgrade for " + this.entity.definition.upgradeCost + " gold?",
                confirm: utils.bind(this.entity.startContract, this.entity)
            });
        } else if (this.entity.contractState === wooga.castle.Ship.ContractState.FINISHED) {
            if(!this.busy) {
                this.busy = true;
                var self = this;
                setTimeout(utils.bind(self.collectContract, self), 500);
            }
        }
    };

    ShipView.prototype.setActionIcon = function () {
        if(! this.icon){
            this.createActionIcon();
        }
        var contractState = this.entity.contractState,
            states = wc.Ship.ContractState,
            display = this.entity.upgradable ? "block" : "none",
            iconDef;
        if (this.entity.clicked) {
            switch(contractState){
                case states.FINISHED:
                    iconDef = this.iconDefinitions.collect;
                    display = 'block';
                    break;
                case states.IDLE:
                    iconDef = this.iconDefinitions.start;
                    break;
                case states.STARTED:
                    iconDef = this.iconDefinitions.running;
                    display = 'none';
                    break;
                default:
                    display = 'none';
            }
        } else {
            display = 'block';
            iconDef = this.iconDefinitions.please_touch_me;
        }
        this._changeActionIconByDefinition(iconDef);
        this.icon.style.display = display;
        this.icon.className = 'ship actionIcon ' + contractState;
    };

    ShipView.prototype._initIconDefinitions = function () {

        this.iconDefinitions = this.iconDefinitions||{};

        var startContractIconDefinition = this._initIconDefinition("contracts/repair");
        this.iconDefinitions.start = startContractIconDefinition;
        this.iconDefinitions.collect = this._initIconDefinition("contracts/repaired");
        this.iconDefinitions.running = this._initIconDefinition("contracts/repairing");
        this.iconDefinitions.please_touch_me = this._initIconDefinition("contracts/exclamation");
        return this;
    };

    ShipView.prototype.bindToEntity = function (entity) {
        var clicked;
        if(this.entity){
            //the other ovent handlers are removed in the super function
            this.entity.removeEventHandler('upgrade', this.invalidate, this);
            this.entity.removeEventHandler('contract startable', this.onContractStartable, this);
            clicked = this.entity.clicked;
        }
        this.parent.prototype.bindToEntity.call(this, entity);
        entity.addEventHandler('upgrade', this.upgrade, this);
        entity.addEventHandler('contract startable', this.onContractStartable, this);
        entity.clicked = clicked || entity.clicked;
        this.busy = false;
        this.actions = {};
        this.actions[this.entity.definition.requiredItem] = true;
    };


    ShipView.prototype.onContractStartable = function () {
        this.setActionIcon();
    };

    ShipView.prototype.invalidate = function () {
        //make sure we don't accidentally hide the icon.
        this.parent.prototype.invalidate.call(this);
        if (!this.iconDefinitions) {
            this._initIconDefinitions();
        }
        this.setActionIcon();
    };

    ShipView.prototype.isFocusable = function () {
        return !this.busy && this.entity.selectable && (this.entity.contractState !== wooga.castle.Ship.ContractState.FINISHED);
    };

    ShipView.prototype.upgrade = function () {
        this.view.publish('ship/upgrading', {
            entityView: this,
            text: 'Finishing',
            callback: utils.bind(this.invalidate, this)
        });
        return this;
    };

    wooga.castle.ShipView = ShipView;


}(wooga.castle));
