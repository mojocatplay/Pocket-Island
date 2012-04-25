/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */

(function () {
    "use strict";

    var utils = wooga.castle.utils,
        gu = wooga.castle.GRID_UNIT;

    function UnlockableAreaView (view, entity) {
        wooga.castle.EntityView.call(this, view, entity);

        this.entity.addEventHandler('unlock', this.onUnlock, this);
        this.entity.addEventHandler('countdown', this.countdown, this);
        this.entity.addEventHandler('finishContract', this.finishContract, this);

        this.nth = this.entity.key.replace(/\D/g, '');

        this.wasScrolledOn = false;

        this.addEventHandler("dragend", function () {
             this.wasScrolledOn = true;
        }, this);

        this.addEventHandler('touchend', function () {
            if (!this.wasScrolledOn) {
                if (this.entity.contractTimeLeft === 0) {
                    this.entity.unlock();
                } else {
                    var populationToUnlock = this.entity.definition.unlock - wooga.castle.game.getPopulation();
                    if (populationToUnlock > 0) {
                        var msg = "You need " + populationToUnlock + " more houses to unlock this area!";
                        if (populationToUnlock === 1){
                            msg = msg.replace('houses', 'house');
                        }
                        wooga.notify(msg, 'unlockies');
                    }
                }
            }
            this.wasScrolledOn = false;
        }, false);
    }

    utils['extends'](UnlockableAreaView, wooga.castle.EntityView);

    UnlockableAreaView.prototype.draw = function (ctx, x, y) {
        var domNode = document.createElement('figure'),
            node = this.setupDomNode(domNode);

        node.setupDomNodeTitle(domNode);
        node.setupDomNodePopulationForUnlock(domNode.querySelector('header'));

        document.getElementById('game_overlay').appendChild(domNode);

        this.domNode = domNode;
        this.domTextNode = domNode.querySelector("div p");
        this.draw = function () {};
    };

    UnlockableAreaView.prototype.countdown = function() {
        this.domTextNode.innerHTML = "Revealed in " + utils.formatTime(this.entity.contractTimeLeft);
    };

    UnlockableAreaView.prototype.finishContract = function() {
        this.domTextNode.innerHTML = "Touch to reveal the area";
        wooga.notify(this.entity.definition.name + " is ready to be revealed!", 'discover');
    };

    UnlockableAreaView.prototype.setupDomNode = function (domNode) {
        var style = domNode.style;
        utils.addClass(domNode, 'unlockable-dom-node');
        domNode.setAttribute("data-zone-number", this.nth);
        style.left = this.x + 'px';
        style.top = this.y + 'px';
        style.width = this.width + 'px';
        style.height = this.height + 'px';
        style.backgroundImage = "url(" + this.image.src + ')';
        style.backgroundPosition = this.entity.definition.spritex * gu + 'px ' + this.entity.definition.spritey * gu + 'px';
        domNode.addEventListener('webkitAnimationEnd', utils.bind(function () {
            this.domNode.style.display = 'none';
        }, this), false);
        domNode.id = "unlockable-" + this.nth;
        return this;
    };

    UnlockableAreaView.prototype.setupDomNodeTitle = function (domNode) {
        var label = document.createElement("header");
        domNode.appendChild(label);
        var title = document.createElement('h1');
        title.innerHTML = this.entity.definition.name.replace(/^\d\s\-/, '');
        title.setAttribute("data-zone-number", this.nth);
        label.appendChild(title);
        return this;
    };

    UnlockableAreaView.prototype.setupDomNodePopulationForUnlock = function (domNode) {
        var unlockPopulation = document.createElement('div');
        unlockPopulation.innerHTML = '<p>Unlocked at population ' + this.entity.definition.unlock;
        domNode.appendChild(unlockPopulation);
        return this;
    };

    UnlockableAreaView.prototype.onUnlock = function () {
        utils.addClass(this.domNode, 'unlocked');
        wooga.notify("You have unlocked " + this.entity.definition.name, 'discover');
    };

    wooga.castle.UnlockableAreaView = UnlockableAreaView;

}());
