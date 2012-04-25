/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */

(function () {
    "use strict";
    var utils = wooga.castle.utils;


    wooga.castle.FarmFieldView = function (view, entity) {

        wooga.castle.EntityView.call(this, view, entity);

        entity.addEventHandler("contractActivate", function () {
            this.cacheImageFrame();
            view.bufferCanvasChanges.push(this);
        }, this);

        entity.addEventHandler("contractCollect", function () {
            view.bufferCanvasChanges.push(this);
        }, this);

        this.addEventHandler("touch", this.touchHandler);

        var gridUnit = this.view.gridUnit;

        var foodIconDefinition = this.view.game.entitiesDefinition["contracts/food"];
        this.foodIconImage = foodIconDefinition.image;
        this.foodIconWidth = foodIconDefinition.width * gridUnit;
        this.foodIconHeight = foodIconDefinition.height * gridUnit;
        this.foodIconOffsetX = (this.width - this.foodIconWidth) / 2;
        this.foodIconOffsetY = (this.height - this.foodIconHeight - this.entity.definition.offsetY * gridUnit) / 2;

        this.setActionIcon();
        this.entity.addEventHandler("contractChange", this.setActionIcon, this);

    };

    var FarmFieldView = wooga.castle.FarmFieldView;

    FarmFieldView.SpriteMap = {
        "seeds/melon": 1,
        "seeds/bean": 2,
        "seeds/clover": 3,
        "seeds/pumpkin": 4,
        "seeds/strawberry": 5,
        "seeds/grapes": 6,
        "seeds/wheat": 7
    };

    FarmFieldView.prototype = new wooga.castle.EntityView();
    FarmFieldView.prototype.parent = wooga.castle.EntityView;
    FarmFieldView.prototype.constructor = FarmFieldView;

    FarmFieldView.prototype.moved = function(){
        this.parent.prototype.moved.call(this);
        this.setActionIcon();
    };

    FarmFieldView.prototype.createActionIcon = function () {

        this.icon = document.createElement("div");

        this.icon.className = "actionIcon";

        utils.addTouchHandler(this.icon, this.touchHandler, this);

        document.getElementById("game_overlay").appendChild(this.icon);

    };

    FarmFieldView.prototype.setActionIcon = function () {

        if (!this.icon) {
            this.createActionIcon();
        }

        var icon = this.icon;

        icon.style.display = "";

        var ContractState = wooga.castle.FarmField.ContractState;
        switch (this.entity.contractState) {

            case ContractState.FINISHED:

                icon.style.background = "url(" + this.foodIconImage.src + ")";
                icon.style.width = this.foodIconWidth + "px";
                icon.style.height = this.foodIconHeight + "px";
                icon.style.top = this.y + this.foodIconOffsetY + "px";
                icon.style.left = this.x + this.foodIconOffsetX + "px";

                break;

            default:

                icon.style.display = "none";
        }

    };

    FarmFieldView.prototype.touchHandler = function () {
        if (utils.can('touch-view', this)) {

            if(! utils.can('entity/contract/change', this)) {
                return;
            }

            var ContractState = wooga.castle.FarmField.ContractState;
            switch (this.entity.contractState) {

                case ContractState.IDLE:
                    if(utils.can('enter-shop')) {
                        var that = this;
                        setTimeout(function () {
                            that.view.publish("shop/show", {
                                department: "farming",
                                targetEntity: that.entity
                            });
                        }, 50);  // TODO: ironically this solves the touch-feed issue on farm field - may need to be adapted

                    }
                    break;

                case ContractState.FINISHED:
                    this.busy = true;
                    this.view.publish("entity/contract/collecting", {
                        entityView: this,
                        text: "Harvesting...",
                        callback: utils.bind(this.collectContract, this)
                    });
                    break;
            }
            this.cacheImageFrame();
        }
    };


    FarmFieldView.prototype.collectContract = function () {
        this.entity.collectContract(this);
        this.busy = false;
        this.cacheImageFrame();
    };



    FarmFieldView.prototype.isFocusable = function () {
        return this.entity.contractState === wooga.castle.FarmField.ContractState.STARTED;
    };


    FarmFieldView.prototype.cacheImageFrame = function () {
        var entityDefinition = this.entity.seedName ?
                     this.entity.game.entitiesDefinition[this.entity.seedName]:
                     this.entity.definition;
        this.defaultImageFrame = this.getImageFrameForDefinition(entityDefinition);
        return this;
    };

    FarmFieldView.prototype.drawDynamic = function (x, y) {

        wooga.castle.EntityView.prototype.drawDynamic.call(this, x, y);

        if (this.view.mode !== wooga.castle.GameModesManager.Mode.MOVE &&
                this.view.mode !== wooga.castle.GameModesManager.Mode.SHOP_PREVIEW &&
                this.view.mode !== wooga.castle.GameModesManager.Mode.ROADS &&
                this.view.mode !== wooga.castle.GameModesManager.Mode.SEED &&
                this.entity.game.playerData.doneTutorial) {

            if (this.entity.contractState === wooga.castle.FarmField.ContractState.FINISHED) {
                if (this.amimateContractIcons) {
                    var factor = 1 + Math.sin(Date.now() / 250) * 0.09;
                    this.icon.style.webkitTransform = "scale3d(" + factor + ", " + factor + ", 0)";
                } else {
                    this.icon.style.webkitTransform = "scale3d(" + 1 + ", " + 1 + ", 0)";
                }

                if (this.iconCircle + 5000 < Date.now()) {
                    this.amimateContractIcons = (this.amimateContractIcons === true) ? false : true;
                    this.iconCircle = Date.now();
                }
            }
        }

        if (this.showBoostInfo) {
            this.drawBoostInfo();
        }

    };

    FarmFieldView.prototype.destructor = function () {
        this.parent.prototype.destructor.call(this);
        if( this.icon && this.icon.parentNode ){
            this.icon.parentNode.removeChild(this.icon);
        }
    };

    utils.can('enter-shop', function () {
        return wooga.castle.game.worldView.mode === wooga.castle.GameModesManager.Mode.BASIC;
    });
}());
