/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */
(function () {
    "use strict";
    var utils = wooga.castle.utils;

    var House;

    wooga.castle.House = function (game, config) {

        wooga.castle.Entity.call(this, game, config);
        if(! arguments.length){
            return this;
        }
        this.contract = this.definition.contract;

        if (config.contract) { // restoring upon startup
            if (config.constructionStartTime) {
                this.constructionStartTime = config.constructionStartTime;
                if (this.constructionStartTime + this.contract.constructionTime > Date.now()) {
                    this.contractState = House.ContractState.CONSTRUCTION;
                    this.constructionCountdown();
                } else {
                    this.finishConstruction();
                }
            } else {
                this.restoreContract(config.contract);
            }
        }

        this.addEventHandler('destroy', this.beforeDestroy, this);

    };

    House = wooga.castle.House;
    utils['extends'](House, wooga.castle.Entity);

    House.ContractState = {
        CONSTRUCTION: "construction",
        CONSTRUCTED: "constructed",
        INACTIVE: "inactive",
        IDLE: "idle", // waiting to be fed
        STARTED: "started",
        PAUSED: "paused", // not connected to road
        FINISHED: "finished"
    };

    House.prototype.resetConnection = function() {
        this.wasConnected = this.connected;
        this.connected = false;
        this.pauseContract();
    };

    House.prototype.disconnect = function(firstRun) {
        this.connected = false;
        this.pauseContract();
        if (this.wasConnected && !firstRun) {
            this.game.publish('building/disconnected', this);
        }
        this.wasConnected = false;
    };

    House.prototype.connect = function(firstRun) {
        this.connected = true;
        this.unpauseContract();
        if (!this.wasConnected && !firstRun) {
            this.fireEvent('connected to road');
            this.game.publish('building/connected', this);
        }
        this.wasConnected = true;
    };

    //
    // Construction
    //
    House.prototype.startConstruction = function() {
        this.contractState = House.ContractState.CONSTRUCTION;
        this.fireEvent("startConstruction");
        this.constructionStartTime = Date.now();
        this.constructionCountdown();
        this.game.publish("construction/start", {
            entity: this
        });
    };

    House.prototype.constructionCountdown = function() {
        var timeLeft = this.constructionStartTime ? this.getConstructionTimeLeft() : this.contract.constructionTime;
        this.constructionTimeout = setTimeout(utils.bind(this.finishConstruction, this), timeLeft);
    };

    House.prototype.finishConstruction = function() {
        this.contractState = House.ContractState.CONSTRUCTED;
        this.constructionTimeLeft = 0;
        this.fireEvent("finishConstruction");
    };

    House.prototype.acceptConstruction = function() {
        delete this.constructionStartTime;
        this.fireEvent("acceptConstruction");

        this.activateContract();
        if (!this.connected) {
            this.pauseContract();
        }
    };


    // End of construction

    House.prototype.activateContract = function () {
        this.contractState = House.ContractState.IDLE;

        this.game.publish("contract/update", {
            entity: this,
            update: {
                state: this.contractState
            }
        });
        this.fireEvent("contractChange");
    };

    House.prototype.startContract = function () {
        if (this.contractState === House.ContractState.INACTIVE || this.contractState === House.ContractState.IDLE) {

            if (this.game.drain('food', this.contract.requiredFood, this.entityView)) {

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

                this.fireEvent("contractChange");

            }
        }

        this.contractValue = this.contract.providedGold + Math.round(this.contract.providedGold * (this.boost/100));
    };

    House.prototype.restoreContract = function(contract) {
        var now = Date.now();
        this.contractState = contract.state;

        this.contractStartTime = Math.min(contract.startTime || 0, now);
        this.contractPauseTime = Math.min(contract.pauseTime || 0, now);
        this.contractValue = this.contract.providedGold;
        if (this.contractState === House.ContractState.STARTED) {
            var timeLeft = this.getContractTimeLeft();
            if (timeLeft > 0) {
                this.contractTimeout = setTimeout(utils.bind(this.finishContract, this), timeLeft);
            } else {
                this.finishContract();
            }
        }

    };


    House.prototype.finishContract = function () {

        this.contractState = House.ContractState.FINISHED;

        this.game.publish("contract/update", {
            entity: this,
            update: {
                state: this.contractState
            }
        });

        this.fireEvent("contractChange");

    };

    House.prototype.pauseContract = function () {
        if (this.contractState === House.ContractState.INACTIVE ||
            this.contractState === House.ContractState.IDLE ||
            this.contractState === House.ContractState.STARTED ||
            this.contractState === House.ContractState.FINISHED) {

            this.contractState = House.ContractState.PAUSED;
            clearTimeout(this.contractTimeout);
            this.contractPauseTime = Date.now();
            this.game.publish("contract/update", {
                entity: this,
                update: {
                    state: this.contractState,
                    pauseTime: this.contractPauseTime
                }
            });
            this.fireEvent("contractChange");
        }
    };

    House.prototype.unpauseContract = function () {
        if (this.contractState === House.ContractState.PAUSED) {
            if (this.contractStartTime) {
                var now = Date.now();
                this.contractStartTime += now - this.contractPauseTime;

                var timeLeft = this.getContractTimeLeft();
                if (timeLeft > 0) {
                    this.contractState = House.ContractState.STARTED;
                    this.contractTimeout = setTimeout(utils.bind(this.finishContract, this), timeLeft);
                } else {
                    this.contractState = House.ContractState.FINISHED;
                }
            } else {
                this.contractState = House.ContractState.IDLE;
            }

            this.contractPauseTime = null;

            this.game.publish("contract/update", {
                entity: this,
                update: {
                    state: this.contractState,
                    startTime: this.contractStartTime,
                    pauseTime: null
                }
            });
            this.fireEvent("contractChange");
        }
    };


    House.prototype.collectContract = function (managingView) {

        this.contractState = House.ContractState.IDLE;
        this.contractStartTime = null;

        this.game.publish("contract/collect", {
            entity: this,
            entityView: managingView,
            contract: this.contract,
            update: {
                state: this.contractState,
                startTime: null
            }
        });

        this.fireEvent("contractChange");

    };

    House.prototype.getContractTimeLeft = function() {
        return this.contractStartTime + this.contract.requiredTime - Date.now();
    };

    House.prototype.getConstructionTimeLeft = function() {
        return this.constructionStartTime + this.contract.constructionTime - Date.now();
    };

    House.prototype.getContractValue = function () {
        var gold = this.contractValue;

        if (this.contract) {
            this.contractValue = this.contract.providedGold + Math.round(this.contract.providedGold * (this.boost/100));
            if (this.contractState !== House.ContractState.FINISHED  && this.contractState !== House.ContractState.IDLE) {
                gold = this.contractValue;
            }
        }
        return gold;
    };


    House.prototype.getInfoModeString = function() {
        var result;
        switch (this.contractState) {
            case House.ContractState.STARTED:
                var gold = this.getContractValue();
                result = '<div class="progress"><div style="width: 0%;"></div></div><p>Gives you '+ gold +' coins in <span id="timeLeft">'+utils.formatTime(this.getContractTimeLeft())+'</span></p>';
                break;
            case House.ContractState.CONSTRUCTION:
                result = '<div class="progress"><div style="width: 0%;"></div></div><p>Construction finishes in <span id="timeLeft">'+utils.formatTime(this.getConstructionTimeLeft())+'</span></p>';
                break;
            default:
                result = '<p>Please connect to road</p>';
        }

        return result;
    };

    House.prototype.toSerializable = function () {
        var result = wooga.castle.Entity.prototype.toSerializable.call(this);
        result.contract = this.contract;
        result.constructionStartTime = this.constructionStartTime;
        return result;
    };

    House.prototype.beforeDestroy = function(){
        if( this.contract ){
            this.contractState = House.ContractState.INACTIVE;
            this.contractStartTime = null;
            this.contract = null;
            clearTimeout(this.contractTimeout);
        }
        delete this.constructionStartTime;
        clearTimeout(this.constructionTimeout);
    };

    House.prototype.destructor = function () {
        this.fireEvent('destroy', {entity: this});
    };


}());
