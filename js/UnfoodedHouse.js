/*jslint white:true, browser:true, plusplus:true, nomen:true */
/*global wooga */
(function (wc) {
    "use strict";
    var utils = wc.utils;

    function UnfoodedHouse(game, config) {
        wc.House.apply(this, arguments);
    }

    utils['extends'](UnfoodedHouse, wc.House);

    UnfoodedHouse.prototype.activateContract = function () {
        wc.House.prototype.activateContract.call(this);
        this.startContract();
    };

    UnfoodedHouse.prototype.collectContract = function (managingView) {
        wc.House.prototype.collectContract.call(this, managingView);
        this.startContract();
    };

    UnfoodedHouse.prototype.unpauseContract = function () {
        wc.House.prototype.unpauseContract.call(this);
        if (this.contractState === wc.House.ContractState.IDLE) {
            this.startContract();
        }
    };


    UnfoodedHouse.prototype.getCallableName = function () {
        return "house";
    };

    UnfoodedHouse.prototype.toSerializable = function () {
        var state = wc.House.prototype.toSerializable.call(this);
        state.contract = {
            state: this.contractState,
            startTime: this.contractStartTime,
            pauseTime: this.contractPauseTime
        };
        return state;
    };

    wc.UnfoodedHouse = UnfoodedHouse;

}(wooga.castle));
