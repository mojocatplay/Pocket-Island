/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */
(function () {
    "use strict";

    var utils = wooga.castle.utils;
    var counter;

    wooga.castle.InfoMode = function (manager, config) {

        this.manager = manager;

        this.parentNode = config.rootNode;

        this.build();

    };

    var InfoMode = wooga.castle.InfoMode;

    InfoMode.prototype.build = function () {

        var hud = document.createElement("div");
        hud.className = "inPlace-info";

        this.closeButton = document.createElement("button");
        this.closeButton.className = "close";
        hud.appendChild(this.closeButton);

        this.infoPanel = document.createElement("div");
        this.infoPanel.className = "info";
        hud.appendChild(this.infoPanel);

        this.menu = document.createElement("div");
        this.menu.className = "menu";
        hud.appendChild(this.menu);

        utils.publish('view:hud/infomode-opened');


        utils.addTouchHandler(this.closeButton, this.deactivate, this);

        document.getElementById("game_overlay").appendChild(hud);

        this.rootNode = hud;
    };

    InfoMode.prototype.activate = function (config) {
        this.target = config.target;
        var entity = this.target.entity;

        if (entity.is('castle') && wooga.castle.playerData.upgradingCastle) {
            wooga.castle.CastleCompleteScreen.instance().show();
            this.deactivate();
            this.manager.setMode(wooga.castle.GameModesManager.Mode.BASIC);
            return;
        }

        if (entity.is('decoration')) {
            this.target.makeDynamic();
        }

        this.infoPanel.innerHTML = '<h1>' + entity.getProperName() + '</h1><div class=specification>' + entity.getInfoModeString() + '</div>';

        // RADAR: [szafranek] Why is this HERE? Moving it to worldView and listening to "entity/focused" looks better to me.
        this.manager.view.isFocusedEntityView = function (entityView) {
            return entityView === config.target;
        };

        if (entity.contractState === wooga.castle.House.ContractState.STARTED) {
            this.showProgressBar(entity.contractStartTime, entity.contract.requiredTime);
        } else if (entity.contractState === wooga.castle.House.ContractState.CONSTRUCTION) {
            this.showProgressBar(entity.constructionStartTime, entity.contract.constructionTime);
        }

        utils.publish('view:entity/focused', {
            "entity": entity,
            "entityView": entity.entityView,
            "infoMode": this
        });

        this.showBoosts(entity);

        this.show();

    };

    InfoMode.prototype.showProgressBar = function(millisecondsStart, millisecondsTotal) {
        var progress = document.querySelector('.progress div'),
            timer = document.getElementById('timeLeft');
        progress.style.width = Math.floor(((Date.now() - millisecondsStart) / millisecondsTotal) * 100) + "%";

        counter = setInterval(function () {
            var timeFromStart = Date.now() - millisecondsStart;
            if((timeFromStart / millisecondsTotal) >= 1) {
                clearInterval(counter);
            }
            timer.innerHTML = utils.formatTime(millisecondsTotal - timeFromStart);
            progress.style.width = Math.floor((timeFromStart / millisecondsTotal) * 100) + "%";
        }, 1000);

    };

    InfoMode.prototype.showBoosts = function(entity) {
        if (entity.is("decoration")) {
            entity.game.publish("decoration/showBoost", {
                 entityView: entity.entityView,
                 x: entity.x,
                 y: entity.y
            });
        }
        if (entity.is("farm") || entity.is("any house")) {
            if (entity.boost) {
                entity.entityView.showBoostInfo = true;
            }
        }
    };


    InfoMode.prototype.deactivate = function () {

        this.manager.view.isFocusedEntityView = this.manager.view.isFocusedEntityViewDefault;

        if(this.target.entity.is('decoration')) {
            this.target.makeStatic();
        }

        this.menu.innerHTML = "";

        clearInterval(counter);

        if( this.target.actionsMenu ) {
            this.target.actionsMenu.destructor();
        }

        // hide boost info in influence area of decoration
        if (this.target instanceof wooga.castle.DecorationView) {
            this.target.entity.game.publish("decoration/hideBoost", {
                 entityView: this.target
            });
        }
        // hide boost of houses or farmfields in info mode
        if (this.target instanceof wooga.castle.FarmFieldView ||
                this.target instanceof wooga.castle.HouseView) {
            if (this.target.entity.boost) {
                this.target.entity.entityView.showBoostInfo = false;
                this.target.entity.entityView.makeStatic();
            }
        }
        this.hide();
        this.manager.setMode(wooga.castle.GameModesManager.Mode.BASIC);
        utils.publish('view:hud/infomode-closed');
    };

    InfoMode.prototype.position = function () {
        var style = this.rootNode.style,
            entityView = this.target,
            top = entityView.y,
            left = Math.min(this.manager.view.mapWidthPx - 160, Math.max(entityView.x + entityView.width * 0.5, 160)),
            gridUnit = entityView.view.gridUnit,
            reverse = false;


        if(entityView.entity.is("castle")) {
            top = top+70; // TODO: improve this!
        }
        if(entityView.y < 600){
            top += entityView.height;
            reverse = true;
        }
        utils.toggleClass(this.rootNode, "reversed", reverse);
        // draw in InPlaceInfoMode below influence of decorations
        if (entityView.entity.is("decoration")){
            var topUnderArea = top + (entityView.entity.definition.influenceArea * gridUnit * (reverse ? 1 : -1));
            style.webkitTransform = 'translate3d(' + left + 'px, ' + topUnderArea + 'px, 0)';
        } else {
            style.webkitTransform = 'translate3d(' + left + 'px, ' + top + 'px, 0)';
        }

    };

    InfoMode.prototype.show = function () {
        this.position();
        this.rootNode.style.display = "block";
    };

    InfoMode.prototype.hide = function () {
        this.rootNode.style.display = "none";
    };

    InfoMode.prototype.handle = function (actionMessage, actionsMenu) {
        switch(actionMessage) {
            case "move":
                this.deactivate();
                this.manager.setMode(wooga.castle.GameModesManager.Mode.MOVE, {
                    target: this.target
                });
                break;
            case "destroy":
                this.deactivate();
                this.manager.setMode(wooga.castle.GameModesManager.Mode.DESTROY, {
                    target: this.target
                });
                break;
            case "upgrade":
                this.deactivate();
                this.manager.setMode(wooga.castle.GameModesManager.Mode.CASTLE_UPGRADE, {
                    target: this.target
                });
                break;
            default:
                wooga.log(actionMessage + ' is unhandled');
                break;
        }
    };



}());
