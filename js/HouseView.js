/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */
(function () {
    "use strict";
    var utils = wooga.castle.utils,
        EntityView = wooga.castle.EntityView,
        ContractState = wooga.castle.House.ContractState;

    wooga.castle.HouseView = function (view, entity) {
        if (! arguments.length) {
            return this;
        }
        this.bindToEntity(entity);
        EntityView.call(this, view, entity);

        this.busy = false;

        if (entity.contractState === ContractState.CONSTRUCTION ||  entity.contractState === ContractState.CONSTRUCTED) {
            this.useConstructionDefinition();
        }
        this.updateImage();

        this._initIconDefinitions().setActionIcon();

        this.addEventHandler("touch", this.touchHandler);
    };

    var HouseView = wooga.castle.HouseView;

    utils['extends'](HouseView, EntityView);

    HouseView.prototype.isFocusable = function () {
        var contractInProgress = (this.entity.contractState === ContractState.STARTED || this.entity.contractState === ContractState.PAUSED) &&
                (!this.entity.contractStartTime || (Date.now() - this.entity.contractStartTime > 100));

        var constructionInProgress = (this.entity.contractState === ContractState.CONSTRUCTION) && ((Date.now() - this.entity.constructionStartTime > 100));
        return contractInProgress || constructionInProgress;
    };

    HouseView.prototype.bindToEntity = function (entity) {
        if(this.entity) {
            this.entity.removeEventHandler("contractChange", this.setActionIcon, this);
            this.entity.removeEventHandler("destroy", this.setActionIcon, this);

            this.entity.removeEventHandler("startConstruction", this.startConstruction, this);
            this.entity.removeEventHandler("finishConstruction", this.finishConstruction, this);
            this.entity.removeEventHandler("acceptConstruction", this.acceptConstruction, this);
        }
        this.entity = entity; entity.entityView = this;
        this.entity.addEventHandler("contractChange", this.setActionIcon, this);
        this.entity.addEventHandler("destroy", this.setActionIcon, this);

        this.entity.addEventHandler("startConstruction", this.startConstruction, this);
        this.entity.addEventHandler("finishConstruction", this.finishConstruction, this);
        this.entity.addEventHandler("acceptConstruction", this.acceptConstruction, this);
        return this;
    };

    HouseView.prototype._initIconDefinitions = function () {

        this.iconDefinitions = this.iconDefinitions || {};

        this.iconDefinitions.start = this._initIconDefinition("contracts/contract");
        this.iconDefinitions.collect = this._initIconDefinition("contracts/gold");
        this.iconDefinitions.no_road = this._initIconDefinition("contracts/no_road");
        this.iconDefinitions.constructed = this._initIconDefinition("contracts/constructed");
        return this;
    };

    /**
     * @param   string    key     entity key as defined in entities.json
     * @return  object
     */
    HouseView.prototype._initIconDefinition = function (key) {
        if(this.iconDefinitions[key]){
            return this.iconDefinitions[key];
        }
        var gridUnit = this.view.gridUnit,
            w = this.width,
            h = this.height,
            icon = this.view.game.entitiesDefinition[key],
            defW = icon.width === -1 ? w : icon.width * gridUnit,
            defH = icon.height === -1 ? h : icon.height * gridUnit;
        return this._setIconOffsets({
            image: icon.image,
            width: defW,
            height: defH
        });
    };

    HouseView.prototype._setIconOffsets = function (icon) {
        icon.offset = {
            x: (this.width - icon.width) * 0.5,
            y: (this.height - icon.height - (this.entity.definition.offsetY || 0)*this.view.gridUnit) * 0.5
        };
        return icon;
    };



    HouseView.prototype.createActionIcon = function () {

        this.icon = document.createElement("div");

        this.icon.className = "actionIcon";

        document.getElementById("game_overlay").appendChild(this.icon);

    };

    HouseView.prototype.moved = function(){
        EntityView.prototype.moved.call(this);
        if(this.afterMovedTimeout){
            clearTimeout(this.afterMovedTimeout);
        }
        var self = this;
        this.afterMovedTimeout = setTimeout(function () {
            self.setActionIcon();
        }, 100);
    };

    HouseView.prototype.setActionIcon = function () {

        if (!this.icon) {
            this.createActionIcon();
        }

        var icon = this.icon;

        switch (this.entity.contractState) {

            case ContractState.CONSTRUCTED:
                this._changeActionIconByDefinition(this.iconDefinitions.constructed);
                icon.style.display = "";
                break;

            case ContractState.IDLE:
                this._changeActionIconByDefinition(this.iconDefinitions.start);
                icon.style.display = "";
                break;

            case ContractState.FINISHED:
                this._changeActionIconByDefinition(this.iconDefinitions.collect);
                icon.style.display = "";
                break;

            case ContractState.PAUSED:
                this._changeActionIconByDefinition(this.iconDefinitions.no_road);
                icon.style.display = "";
                break;

            default:
                icon.style.display = "none";
        }
        icon.className = this.entity.definition['class'] + " actionIcon " + this.entity.contractState;

    };

    HouseView.prototype.startConstruction = function() {
        this.useConstructionDefinition();
        this.updateImage();
    };

    HouseView.prototype.finishConstruction = function() {
        this.setActionIcon();
    };

    HouseView.prototype.acceptConstruction = function() {
        this.entity.definition = this.entity.defaultDefinition;
        this.updateImage();
    };

    HouseView.prototype.useConstructionDefinition = function() {
        var constructionDfn = this.view.game.entitiesDefinition["construction/"
            + this.entity.definition.width
            + "x" + (this.entity.definition.height + this.entity.definition.offsetY)];

        this.entity.defaultDefinition = utils.extend({}, this.entity.definition);

        this.entity.definition = utils.extend({}, this.entity.definition, constructionDfn);
    };

    HouseView.prototype.updateImage = function() {
        this.invalidate();
        this.image = this.entity.definition.image;
        this.width = this.entity.definition.width * this.view.gridUnit;
        this.height = this.entity.definition.height * this.view.gridUnit;

        this.setImageFrame(this.entity.definition);
    };

    HouseView.prototype._changeActionIconByDefinition = function (def) {
        if(def){
            def = this._setIconOffsets(def);
            var style = this.icon.style;
            style.background = "url(" + def.image.src + ") 50% 50% no-repeat";
            style.width = def.width + "px";
            style.height = def.height + "px";
            style.top = this.y + def.offset.y + "px";
            style.left = this.x + def.offset.x + "px";
        }
        return this;
    };

    HouseView.prototype.drawDynamic = function (x, y) {
        wooga.castle.EntityView.prototype.drawDynamic.call(this, x, y);

        if (this.showBoostInfo) {
            this.drawBoostInfo();
        }
    };

    HouseView.prototype.touchHandler = function () {


        if (utils.can('touch-view', this)) {

            if(! utils.can("entity/contract/change", this)) {
                return;
            }

            switch (this.entity.contractState) {

                case ContractState.CONSTRUCTED:
                    if(!this.busy) {
                        this.busy = true;
                        this.view.publish("entity/contract/collecting", {
                            entityView: this,
                            text: "Finishing...",
                            callback: utils.bind(function() {
                                this.entity.acceptConstruction();
                                this.busy = false;
                            }, this)
                        });
                    }
                    break;

                case ContractState.IDLE:
                    this.entity.startContract();
                    break;

                case ContractState.FINISHED:

                    if(!this.busy) {
                        this.busy = true;
                        this.view.publish("entity/contract/collecting", {
                            entityView: this,
                            text: "Collecting...",
                            callback: utils.bind(this.collectContract, this)
                        });
                    }
                    break;
            }
        }
    };

    HouseView.prototype.collectContract = function () {
        this.entity.collectContract(this);
        this.busy = false;
    };

}());
