/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */
(function () {
    "use strict";
    var utils = wooga.castle.utils;

    wooga.castle.SeedMode = function (manager, config) {

        this.manager = manager;

        this.parentNode = config.rootNode;

        this._build();

    };

    var SeedMode = wooga.castle.SeedMode;

    SeedMode.IMAGES_BASE_URL = wooga.castle.IMAGES_BASE_URL; // TODO: get it out of here!

    SeedMode.prototype._build = function () {

        var hud = document.createElement("div");
        hud.className = "hud_mode seed";

        this.infoPanel = document.createElement("div");
        this.infoPanel.className = "infoPanel";
        hud.appendChild(this.infoPanel);

        this.infoPanel.innerHTML = '<div class="specification plant"><p>Touch Empty Farm Plot <br>to plant seed</p><i class="gold"></i></div>';

        this.seedImage = document.createElement("img");
        this.infoPanel.appendChild(this.seedImage);

        this.closeButton = document.createElement("button");
        this.closeButton.className = "close";
        hud.appendChild(this.closeButton);

        utils.addTouchHandler(this.closeButton, this.deactivate, this);

        this.parentNode.appendChild(hud);

        this.rootNode = hud;

    };

    SeedMode.prototype.touchHandler = function (event) {

        if (event.target instanceof wooga.castle.FarmFieldView &&
            (event.target.entity.contractState === wooga.castle.FarmField.ContractState.IDLE)) {

            if(this.manager.game.hasStat('gold', this.manager.game.entitiesDefinition[this.seedName].contract.requiredGold)) {
                this.activateContract(event.target.entity);
                wooga.castle.publish("gold/drain", {
                        entityView: event.target,
                        text: "- " + this.manager.game.entitiesDefinition[this.seedName].contract.requiredGold + " gold"
                    });

            } else {
                wooga.castle.publish('game/not-enough-gold', {
                    entityView: event.target,
                    text: "Not enough gold!"
                });
            }
            this.invalidate();
        } else {

            this.deactivate();

        }

    };

    SeedMode.prototype.activateContract = function (farmField) {
        farmField.activateContract(this.seedName);
        var entity = wooga.castle.Entity.findEntityDefinitionByPath(this.manager.game, this.seedName);
        this.invalidate();
        farmField.startContract();

        // if its the last farm field on the map, end seed mode
        var idleFarms = this.manager.game.entities.filter(function (entity) {
            if (entity instanceof wooga.castle.FarmField) {
                if (entity.contractState === wooga.castle.FarmField.ContractState.IDLE) {
                    return true;
                }
            }
            return false;
        }, this);

        if (idleFarms.length === 0) {
            this.invalidate();
            this.deactivate();
        }
    };

    SeedMode.prototype.activate = function (config) {

        this.seedName = config.entityName;
        this.seedImage.setAttribute("src", utils.urlFor( SeedMode.IMAGES_BASE_URL + this.manager.game.entitiesDefinition[this.seedName].icon ));
        this.manager.view.addEventHandler("touch", this.touchHandler, this);

        this.show();

        if (config.targetFarmField) {
            this.activateContract(config.targetFarmField);
            wooga.castle.publish("gold/drain", {
                entityView: config.targetFarmField.entityView,
                text: "- " + this.manager.game.entitiesDefinition[this.seedName].contract.requiredGold + " gold"
            });
        }

        this.invalidate();

    };


    SeedMode.prototype.invalidate = function(){
        this.infoPanel.querySelector('.specification .gold').innerHTML = wooga.castle.playerData.gold;
    };

    SeedMode.prototype.deactivate = function () {

        this.manager.view.removeEventHandler("touch", this.touchHandler, this);

        this.manager.game.publish('seedMode/deactivated', this);

        this.hide();

        this.manager.setMode(wooga.castle.GameModesManager.Mode.BASIC);

    };

    SeedMode.prototype.show = function () {
        this.invalidate();
        this.rootNode.style.display = "block";
    };

    SeedMode.prototype.hide = function () {
        this.rootNode.style.display = "none";
    };

}());
