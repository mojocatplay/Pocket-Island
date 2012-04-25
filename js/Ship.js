/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */
(function () {
    "use strict";
    var utils = wooga.castle.utils,
        House = wooga.castle.House,
        Ship = function (game, config) {
            this.clicked = config.clicked;
            this.parent.call(this, game, config);
            utils.subscribe('house/drop', function (e) {
                if (e.item === this.definition.requiredItem) {
                    this._setUpgradeable(true);
                    this.fireEvent('contract startable');
                }
            }, this);
            this._setUpgradeable((this.contractState !== Ship.ContractState.STARTED) && game.playerData.collectedItems.indexOf(this.definition.requiredItem) !== -1);
            utils.subscribe('game:drydock/get required item', this._answerGetRequiredItem, this);
        };

    utils['extends'](Ship, House);

    Ship.ContractState = utils.extend({}, House.ContractState);

    Ship.prototype._answerGetRequiredItem = function (message) {
        if (message.item !== this.definition.requiredItem) {
            message.item = null;
        }
    };

    Ship.prototype.startContract = function () {

        if (this.contractState === House.ContractState.IDLE) {
            this.contractState = House.ContractState.STARTED;
            this.contractStartTime = Date.now();

            this.contractTimeout = setTimeout(utils.bind(this.finishContract, this), this.contract.requiredTime);

            this.game.publish("contract/start", {
                entity: this,
                contract: this.contract,
                update: {
                    state: this.contractState,
                    startTime: this.contractStartTime
                }
            });
            if (this.upgradable) {
                this.game.publish('drydock/started-stage-repair', {
                    entity: this
                });
                this._setUpgradeable(false);
            }
            wooga.castle.publish('request-save');

            this.fireEvent("contractChange");
        }

    };

    Ship.prototype.upgrade = function () {
        var nextDef = {
            "key": this.definition.upgradeTo,
            "x": this.x,
            "y": this.y
        };
        var entity = this.game.createEntity(nextDef);
        this.entityView.bindToEntity(entity);
        this.game.removeEntity(this);
        if (!entity.definition.upgradeTo) {
            entity.x -= 2;
            entity.y += 4;
        }
        this.game.updateMapData();
        entity.fireEvent('upgrade');
        wooga.castle.publish('request-save');
        return this;
    };

    Ship.prototype.collectContract = function () {
        wooga.castle.House.prototype.collectContract.apply(this, arguments);
        this._setUpgradeable(false);
        if (this.definition.upgradeTo) {
            this.upgrade();
        }
    };

    Ship.prototype.getInfoModeString = function () {
        var result;
        if (this.contractState === House.ContractState.STARTED) {
            result = '<div class="progress"><div style="width: 0%;"></div></div><p>Repair complete in <span id="timeLeft">'+utils.formatTime(this.getContractTimeLeft())+'</span></p>';
        }
        else if (this.definition.upgradeTo) {
            result = "<p>Search Mysterious buildings for " + wooga.castle.entityDefinitions[this.definition.requiredItem].name + " first</p>";
        } else {
            result = "<p>Find the missing Captain to set sail...</p>";
        }
        return result;
    };

    Ship.prototype._setUpgradeable = function (isUpgradable) {
        this.upgradable = isUpgradable;
        this.selectable = !this.upgradable;
        return this;
    };

    Ship.prototype.destructor = function () {
        wooga.castle.House.prototype.destructor.call(this);
        utils.unsubscribe('game:drydock/get required item', this._answerGetRequiredItem, this);
    };

    Ship.prototype.toSerializable = function () {
        var result = House.prototype.toSerializable.call(this);
        result.clicked = this.clicked;
        return result;
    };

    wooga.castle.Ship = Ship;

}());
