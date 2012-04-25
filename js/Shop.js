/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga, EJS */
(function () {
    "use strict";
    var utils = wooga.castle.utils;

    var disabler = function () {return false;},
        nav, hud_goals;

    var Shop;

    wooga.castle.Shop = function (game, view, config, manager) {
        this.manager = manager;
        this.game = game;
        this.view = view;

        this.element = undefined;


        this.shopItems = wooga.castle.Shop.shopItems = wooga.castle.shopItems;
        this.template = undefined;
        this.rootNode = config.rootNode;

        wooga.castle.net.getCached(Shop.TEMPLATE_URL).addCallback(function (response) {
            this.template = response.data;
            if (this.shopItems) {
                this._build();
            }
        }, this);

        this.view.subscribe("shop/show", function (message) {

            this.targetEntity = null; // TODO: that's not the place (probably), unless this is really the only point through which the shop can be triggered

            if (message) {

                this.targetEntity = message.targetEntity;

                if (message.department) {
                    this.activateDepartment(Shop.DEPARTMENT_ID_PATTERN.replace("{id}", message.department));
                }

                if (message.department && this.targetEntity) {
                    this.lockActiveDepartment();
                }

            }
            this.show();

        }, this);

        utils.subscribe('game/ready', this.invalidate, this);

    };

    Shop = wooga.castle.Shop;

    Shop.TEMPLATE_URL = utils.urlFor("templates/shop.html");
    Shop.DEFAULT_DEPARTMENT_INDEX = 0;
    Shop.DEPARTMENT_ID_PATTERN = "shop-{id}";
    Shop.IMAGES_BASE_URL = wooga.castle.IMAGES_BASE_URL;

    Shop.prototype._build = function () {

        var ejs = new EJS({ text : this.template });

        var l10n = { // TODO
                "shop": "shop",
                "houses": "houses",
                "farming": "farming",
                "farms": "farms",
                "decoration": "decoration",
                "specials": "specials"
            };

        nav = document.querySelector('nav');
        hud_goals = document.getElementById('hud-goals');
        var defaultDepartmentId, ddi = 0;

        var shopItems = {}, i;

        var setItemProperties = function (itemKey) {

            var item = this.game.entitiesDefinition[itemKey] || 0;

            var result;

            switch (item["class"]) {

                case "house":
                case "uhouse":
                    result = {
                        title: item.name,
                        imgSrc: utils.urlFor(Shop.IMAGES_BASE_URL + item.icon),
                        name: itemKey,
                        "class": item["class"],
                        goldCost: item.goldCost,
                        population: item.population || 1,
                        contractRequiredFood: item.contract.requiredFood,
                        contractRequiredTime: utils.roundTime(item.contract.requiredTime), // milliseconds -> minutes
                        contractProvidedGold: item.contract.providedGold
                    };
                    break;

                case "farm":
                    result = {
                        title: item.name,
                        imgSrc: utils.urlFor(Shop.IMAGES_BASE_URL + item.icon),
                        name: itemKey,
                        "class": item["class"],
                        goldCost: item.goldCost
                    };
                    break;

                case "seeds":
                    result = {
                        title: item.name,
                        imgSrc: utils.urlFor(Shop.IMAGES_BASE_URL + item.icon),
                        name: itemKey,
                        "class":item["class"],
                        goldCost: item.goldCost,
                        contractRequiredTime: utils.roundTime(item.contract.requiredTime), // milliseconds -> minutes
                        contractRequiredGold: item.contract.requiredGold,
                        contractProvidedFood: item.contract.providedFood
                    };
                    break;

                case "decoration":
                    result = {
                        title: item.name,
                        imgSrc: utils.urlFor(Shop.IMAGES_BASE_URL + item.icon),
                        name: itemKey,
                        "class": item["class"],
                        goldCost: item.goldCost,
                        influenceArea: item.influenceArea,
                        goldBoost: item.goldBoost,
                        foodBoost: item.foodBoost
                    };
                    break;

            }

            result.unlockCondition = item.unlockCondition;
            result.unlockValue = item.unlockValue;

            return result;

        };

        for (i in this.shopItems) {
            if (this.shopItems.hasOwnProperty(i)) {
                if (ddi++ === Shop.DEFAULT_DEPARTMENT_INDEX) {
                    defaultDepartmentId = i;
                }

                shopItems[i] = this.shopItems[i].map(setItemProperties, this);

                shopItems[i].sort(this.sortShopItems);
            }
        }

        var shopWrapper = document.createElement("div");
        shopWrapper.id = "shop";
        shopWrapper.innerHTML = ejs.render({
            l10n: l10n,
            shopItems: shopItems
        });

        utils.addTouchHandler(shopWrapper.querySelector("div.head button.cancel"), function () {
            if(utils.can('shop/close')) {
                this.hide(true);
            }
        }, this);

        this._departmentsListElement = shopWrapper.querySelector("ul.departments_list");
        utils.addTouchHandler(this._departmentsListElement, this._departmentsListTouchHandler, this);

        this._departmentsElement = shopWrapper.querySelector("div.departments");
        utils.addTouchHandler(this._departmentsElement, this._departmentsTouchHandler, this);


        var departmentsElements = shopWrapper.querySelectorAll("ul.department");


        if(wooga.castle.capabilities.iPad) {
            Array.prototype.forEach.call(departmentsElements, utils.enableScrollabilityX, true);
        } else {
            Array.prototype.forEach.call(departmentsElements, utils.enableScrollability);
        }

        var upgradeCastleButton = shopWrapper.querySelector("#upgrade-castle .button");
        utils.addTouchHandler(upgradeCastleButton, function () {
            var castleView = this.game.castle.entityView;

            this.view.scrollTo(-castleView.x, -castleView.y);
            this.view.filterVisibleViews();

            this.hide();
            if (wooga.castle.playerData.upgradingCastle) {
                wooga.castle.CastleCompleteScreen.instance().show();
                this.deactivate();
                this.manager.setMode(wooga.castle.GameModesManager.Mode.BASIC);
            }
            else {
                this.view.publish("castleUpgradeMode/set", {
                    target: castleView
                });
            }


        }, this);


        this.rootNode.appendChild(shopWrapper);

        this.element = shopWrapper;


        this.activateDepartment(Shop.DEPARTMENT_ID_PATTERN.replace("{id}", defaultDepartmentId), true);

        utils.subscribe('game:player/update', function () {
            this.invalidate();
        }, this);

    };

    Shop.prototype.sortShopItems = function(a, b) {
        return (a.unlockValue === b.unlockValue) ? a.goldCost - b.goldCost : a.unlockValue - b.unlockValue;
    };


    Shop.prototype._departmentsTouchHandler = function (event) {

        utils.clickBuster.preventGhostClick(event.x, event.y);

        var realTarget = null;

        var target = event.target;
        while (target !== this._departmentsElement) {
            if (target.nodeName === "LI") {
                realTarget = target;
                break;
            } else {
                target = target.parentNode;
            }
        }

        if (realTarget) {
            if (this.activateShopPreviewMode(realTarget.getAttribute("data-itemname"))) {
                this.hide(false);
            }
        }

    };

    Shop.prototype.isPopulationMaxed = function() {
        return this.game.getPopulation() >= this.game.castle.definition.population;
    };

    Shop.prototype.activateShopPreviewMode = function (entityName) {

        if(! utils.can('shop/preview', {entityName: entityName, targetEntity: this.targetEntity})){
            return;
        }

        var edef = this.game.entitiesDefinition[entityName],
            goldCost = edef.goldCost || edef.contract.requiredGold,
            entityLevel = edef.unlockCondition === "level" ? edef.unlockValue : 1,
            isHouseLike = ['house', 'uhouse'].indexOf(edef['class']) !== -1,
            requiredPopulation = isHouseLike ? edef.population || 1 : 0;

        if(wooga.castle.playerData.level < entityLevel) {
            setTimeout(function () {
                wooga.notify("You can purchase this item at level " + entityLevel + " or above!", 'level');
            }, 1);
            return false;
        }

        if(! this.game.hasStat('gold', goldCost)) {
            setTimeout(function () {
                wooga.notify(utils.goldDeltaMessage(goldCost, 'buy this!'), 'gold');
            }, 1);
           return false;
        }

        if (isHouseLike && (this.game.getPopulation() + requiredPopulation > this.game.castle.definition.population)) {

            setTimeout(function () {
                wooga.notify("You need to upgrade your castle to support more population.", 'population');
            }, 1);

            return false;

        }

        var message;

        switch (edef["class"]) {

            case "house":
            case "uhouse":
            case "farm":
            case "decoration":
                message = {
                    entityName: entityName
                };
                if(utils.can("shop/preview", message)) {
                    utils.can('shop/preview', utils.disabler);
                    utils.subscribe('game:shopPreviewMode/deactivated', function () {
                            utils.can.remove('shop/preview', utils.disabler);
                        utils.can.remove('shop/seed', utils.disabler);
                    });

                    this.view.publish("shop/preview", message);
                } else {
                    return false;
                }
                break;

            case "seeds":
                message = {
                    entityName: entityName,
                    targetEntity: this.targetEntity
                };
                if(utils.can("shop/seed", message)) {
                    utils.can('shop/seed', utils.disabler);
                    utils.subscribe('game:seedMode/deactivated', function () {
                        utils.can.remove('shop/preview', utils.disabler);
                        utils.can.remove('shop/seed', utils.disabler);
                    });
                    this.view.publish("shop/seed", message);
                } else {
                    return false;
                }
                break;
        }



        return true;

    };

    Shop.prototype._departmentsListTouchHandler = function (event) {

        utils.clickBuster.preventGhostClick(event.x, event.y);

        var realTarget = null;

        var target = event.target;
        while (target !== this._departmentsListElement) {
            if (target.nodeName === "A") {
                realTarget = target;
                break;
            } else {
                target = target.parentNode;
            }
        }

        if (realTarget) {
            this.activateDepartment(realTarget.getAttribute("href").replace("#", ""));
            event.preventDefault();
        }
    };

    Shop.prototype.activateDepartment = function (departmentId, skipCan /*TODO super hack*/) {
        if(! ( utils.can('change shop departments', departmentId) || skipCan)){
            return;
        }

        var activeElements = this.element.querySelectorAll(".departments .active, .departments_list .active");
        if (activeElements) {
            Array.prototype.forEach.call(activeElements, function (element) {
                element.className = element.className.replace("active", "");
            });
        }

        utils.addClass(this.element.querySelector("a[href$=" + departmentId + "]"), "active");
        utils.addClass(document.getElementById(departmentId), "active");

        this.invalidate();

        this.view.publish('shop/change-department', {
            "departmentID": departmentId
        });

    };

    Shop.prototype.lockActiveDepartment = function () {
        utils.addClass(this.element, "locked");
    };

    Shop.prototype.unlockAllDepartments = function () {
        utils.removeClass(this.element, "locked");
    };

    Shop.prototype.show = function () {
        this.manager.setMode(wooga.castle.GameModesManager.Mode.SHOP);
        utils.can('show-overlay', disabler);
        this.view.rendering = false;
        if(wooga.castle.capabilities.iPad) {
            nav.style.visibility = hud_goals.style.visibility = "hidden";
        }
        var el = this.element,
            shop = this;
        setTimeout(function(){
            el.querySelector('.departments').style.display = '';
        }, 10);
        this.view.publish('shop/visible', {shop: this});
        utils.addClass(el,"active");
    };

    Shop.prototype.hide = function (eventDriven) {
        var shop = this;
        this.element.querySelector('.departments').style.display = 'none';
        utils.removeClass(this.element,"active");
        utils.can.remove('show-overlay', disabler);
        this.unlockAllDepartments();
        var message = eventDriven ? 'shop/close' : 'shop/hide';
        if (eventDriven) {
            this.manager.setMode(wooga.castle.GameModesManager.Mode.BASIC);
        }
        setTimeout( function () {
            shop.view.rendering = true;
            shop.view.publish(message, {shop: shop});
            shop.view.publish('shop/hidden', {shop: shop});

            if(wooga.castle.capabilities.iPad) {
                nav.style.visibility = hud_goals.style.visibility = "visible";
            }
        }, 48);
    };

    Shop.prototype.invalidate = function () {
        var goldEl = document.querySelector("#shop .head .gold"),
            population = this.game.getPopulation(),
            maxPopulation = (this.game.castle.definition || {}).population || 0;
        if (goldEl) {
            goldEl.innerHTML = this.game.playerData.gold;
        }
        utils.toggleClass(document.getElementById('shop-houses'), 'population-maxed', this.isPopulationMaxed());
        if(this.isPopulationMaxed()){
            var castleEntityName = wooga.castle.CastleUpgradeMode.getEntityName().toLowerCase();
            [].map.call(this.element.querySelectorAll('.entity-name'), function (child) {
                child.innerHTML = castleEntityName;
            }, this);
        }

        var activeHouse = this.element.querySelector('.active[href$="#shop-houses"]');
        this.element.querySelector('#upgrade-castle').style.display = activeHouse && this.isPopulationMaxed() ? 'block' : 'none';

        Array.prototype.forEach.call(this.element.querySelectorAll('.departments .department li'), function (el) {
            var cost = el.dataset ? el.dataset.cost : parseInt(el.getAttribute('data-cost'), 10),
                requiredPopulation = parseInt(el.dataset ? el.dataset.population : el.getAttribute('data-population'), 10),
                level = el.dataset ? el.dataset.level : parseInt(el.getAttribute('data-level'), 10),
                wouldMax = (population + requiredPopulation) > maxPopulation;
            if(level > 1) {
                var sw = wooga.castle.playerData.level < level;
                utils.toggleClass(el, 'unalevelable', sw);
                if( sw ) {
                    el.setAttribute('title', "Requires level " + level + '!');
                }
            }
            utils.toggleClass(el, 'unaffordable', !wooga.castle.game.hasStat('gold', cost));
            utils.toggleClass(el, 'population-maxed', wouldMax);
            if (wouldMax) {
                el.setAttribute('title', 'Population is too high!');
            }
        }, this);
    };

}());
