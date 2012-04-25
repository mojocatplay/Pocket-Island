/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */
(function () {
    "use strict";
    var utils = wooga.castle.utils;

    var FarmField = function (game, config) {

        wooga.castle.Entity.call(this, game, config);

        if (!config.contract || (config.contract.state === FarmField.ContractState.IDLE)) {
            this.setIdle();
        } else {
            this.contractState = config.contract.state;

            this.activateContract(config.contract.seedName, true);
            this.contractValue = this.contract.providedFood;

            if (this.contractState === FarmField.ContractState.STARTED) {
                this.contractStartTime = config.contract.startTime;

                var timeLeft = this.contractStartTime + this.contract.requiredTime - Date.now();
                if (timeLeft > 0) {
                    this._timeout = setTimeout(utils.bind(this.finishContract, this), timeLeft);
                } else {
                    this.finishContract();
                }
            }
        }

    };

    FarmField.prototype = new wooga.castle.Entity();
    FarmField.prototype.constructor = FarmField;

    FarmField.ContractState = {
        IDLE: "idle",
        STARTED: "started",
        FINISHED: "finished"
    };

    FarmField.prototype.checkContract = function () {
        var timeLeft = this.contractStartTime + this.contract.requiredTime - Date.now();
        if (timeLeft > 0) {
            clearTimeout(this._timeout);
            this._timeout = setTimeout(utils.bind(this.finishContract, this), timeLeft);
        } else {
            this.finishContract();
        }
    };

    FarmField.prototype.activateContract = function (seedName, silent) {
        this.seedName = seedName;
        this.contract = this.game.entitiesDefinition[seedName].contract;
        this.contract.seedName = this.contract.seedName || seedName;

        if (!silent) {
            this.fireEvent("contractActivate");
            this.fireEvent("contractChange");
        }
    };

    FarmField.prototype.startContract = function () {

        this.contractState = FarmField.ContractState.STARTED;
        this.contractStartTime = Date.now();

        this._timeout = setTimeout(utils.bind(this.finishContract, this), this.contract.requiredTime);

        this.game.drain('gold', this.contract.requiredGold);

        this.game.publish("contract/start", {
            entity: this,
            contract: this.contract,
            update: {
                seedName: this.seedName,
                state: this.contractState,
                startTime: this.startTime
            }
        });

        this.contractValue = this.contract.providedFood + Math.round(this.contract.providedFood * (this.boost/100));

        this.fireEvent("contractChange");

    };

    FarmField.prototype.finishContract = function () {
        this.contractState = FarmField.ContractState.FINISHED;

        this.game.publish("contract/update", {
            entity: this,
            contract: this.contract,
            update: {
                state: this.contractState
            }
        });

        this.fireEvent("contractChange");
    };

    FarmField.prototype.collectContract = function (managingView) {

        var contract = this.contract;


        this.game.publish("contract/collect", {
            entity: this,
            entityView: managingView,
            contract: contract
        });

        this.fireEvent("contractCollect");
        this.setIdle();

    };

    FarmField.prototype.setIdle = function () {
        this.contract = null;
        this.contractStartTime = null;
        this.contractState = FarmField.ContractState.IDLE;
        this.seedName = null;

        this.fireEvent("contractChange");
    };

    FarmField.prototype.getContractValue = function () {
        var food = this.contractValue;

        if (this.contract) {
            this.contractValue = this.contract.providedFood + Math.round(this.contract.providedFood * (this.boost/100));
            if (this.contractState !== FarmField.ContractState.FINISHED && this.contractState !== FarmField.ContractState.IDLE) {
                food = this.contractValue;
            }
        }
        return food;
    };

    FarmField.prototype.getInfoModeString = function() {
        var timeLeft = this.contractStartTime + this.contract.requiredTime - Date.now();
        return '<div class="progress"><div style="width: 0%;"></div></div><p>Gives you '+ this.getContractValue() +' food in <span id="timeLeft">'+utils.formatTime(timeLeft)+'</span></p>';
    };


    wooga.castle.FarmField = FarmField;

}());
