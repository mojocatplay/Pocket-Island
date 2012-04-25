/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */
(function () {
    "use strict";
    var utils = wooga.castle.utils,
        disabler = function(){return false;},

    HUD = function (game, view) {

        this.game = game;
        this.view = view;
        this.elements = {
            goalButton: document.getElementById('hud-goals')
        };
        this.createHUD();
        this.initButtons();

        this.playerUpdateHandler();

        utils.subscribe('game/ready', function() {
            setTimeout(function() {
                document.getElementById('ui').removeAttribute('style');
            }, 1000);
        }, this);

        game.subscribe("player/update", this.playerUpdateHandler, this);
        game.subscribe("goal/subgoal-complete", this.subgoalCompleteHandler, this);
        game.subscribe("goal/subgoal-collected", this.subgoalCollectedHandler, this);
        game.subscribe('goal/new', this.addStarNotification, this);
        game.subscribe('goals/complete', this.handleGoalComplete, this);
        view.subscribe('goals/no-goals', this.handleNoGoals, this);
        this.initGoalsAttentionGrabber();

        game.subscribe('popup/info', this.popupHandler, this);

        if (wooga.castle.switches.cheatmode) {
            this.createCheatHUD();
        }


    };

    HUD.prototype.createCheatHUD = function () {

        var hudRoot = this.elements.goalButton;

        var timeIncButton = document.createElement("button");
        timeIncButton.className = "time_inc";
        timeIncButton.innerHTML += "+1h";

        utils.addTouchHandler(timeIncButton, this.incTime, this);

        hudRoot.appendChild(timeIncButton);

    };

    //TODO this does not belong here!
    HUD.prototype.incTime = function () {

        var hour = 1000 * 60 * 60;


        this.game.entities.forEach(function (entity) {

            if (entity.contract) {

                if (entity instanceof wooga.castle.House) {

                    if (entity.contractStartTime) {
                        entity.pauseContract();
                        entity.contractStartTime -= hour;
                        entity.unpauseContract();
                    }

                }

                if (entity instanceof wooga.castle.FarmField) {

                    if (entity.contractStartTime) {
                        entity.contractStartTime -= hour;
                        entity.checkContract();
                    }

                }

            }

        }, this);

    };

    HUD.prototype.createHUD = function () {

        this.goldElement = document.querySelector("#coins");
        this.foodElement = document.querySelector("#food .info");
        this.xpElement = document.querySelector("#level .info");
    };

    HUD.prototype.playerUpdateHandler = function () {

        var playerData = wooga.castle.playerData,
            xp = wooga.castle.xp,
            xpe = this.xpElement,
            xpProgress = (xp.xpToLevelUP()-xp.xp)+" XP to Level "+(xp.level+1),
            population = this.game.getPopulation(),
            populationString = population + (this.game.castle? '/' + this.game.castle.definition.population : '' ),
            populationRatio = (this.game.castle? population / this.game.castle.definition.population : 1 ),
            foodProgress;

        this.goldElement.innerHTML = playerData.gold;

        if (this.foodElement.innerHTML.indexOf(String(playerData.food)) === -1){
           this.foodElement.innerHTML  =  'Food: ' + playerData.food;
           if(playerData.food === 0) {
               foodProgress = 0;
           } else {
                foodProgress = Math.round((Math.log(playerData.food)*Math.log(playerData.food))*1.7); // TODO: temporary as long we have no food storage
                utils.addClass(this.foodElement.parentNode, "active");
                var that = this;
                setTimeout(function () {
                    utils.removeClass(that.foodElement.parentNode, 'active');
                }, 1);
           }
           if (foodProgress > 100) { foodProgress = 100; }
           document.querySelector('#food .progress').style.width = foodProgress + "%";
        }

        document.querySelector('#population .info').innerHTML = "Current Population: " + population + "<br>Castle allows: " + (this.game.castle? this.game.castle.definition.population : '');
        document.querySelector('#population .progress').style.width = 100  + "%";
        document.querySelector('#population #ratio').innerHTML = populationString;

        if (xpe.innerHTML.indexOf(String(xpProgress)) === -1){
            xpe.innerHTML = xpProgress;

            document.querySelector("#level .bar").title = xp.level;
            document.querySelector('#level .progress').style.width = Math.round(100 * (xp.xp / xp.xpToLevelUP())) + "%";

            utils.addClass(xpe.parentNode, "active");
            setTimeout(function () {
                utils.removeClass(xpe.parentNode, 'active');
            }, 1);
        }

    };

    HUD.prototype.addGoalButtonNotif = function (config) {

    };

    HUD.prototype.getGoalIcon = function (lineID) {
        return this.elements.goalButton.querySelector('a[data-line-id="' + lineID + '"]');
    };

    HUD.prototype.handleNoGoals = function (message) {
        this.elements.goalButton.style.display = 'none';
    };


    HUD.prototype.subgoalCompleteHandler = function (message) {
        if(! message) {
            return;
        }
        this.addGoalNotification(this.getGoalIcon(message.line.line.id));
        this.shakeGoalIcon();
        return this;
    };

    HUD.prototype.subgoalCollectedHandler = function (message) {
        if(! message) {
            return;
        }
        this.removeGoalNotification(this.getGoalIcon(message.line.line.id));
        return this;
    };


    HUD.prototype.addGoalNotification = function (elem, string) {
        if(elem) {
            if (!string) {
                var currentNotifCount = elem ? parseInt(elem.getAttribute('data-notif-count'), 10) : null;
                if(isNaN(currentNotifCount)){
                    currentNotifCount = 1;
                } else {
                    currentNotifCount++;
                }
                string = currentNotifCount;
            }
            elem.setAttribute('data-notif-count', string);
        }
        return this;
    };

    HUD.prototype.removeGoalNotification = function (elem) {
        if(elem) {
            var currentNotifCount = elem ? parseInt(elem.getAttribute('data-notif-count'), 10) : null;
            if(! isNaN(currentNotifCount)){
                currentNotifCount--;
                if(0 === currentNotifCount){
                    elem.removeAttribute('data-notif-count');
                } else {
                    elem.setAttribute('data-notif-count', currentNotifCount);
                }
            }
        }
        return this;
    };

    HUD.prototype.addStarNotification = function (message) {
        var element = this.getGoalIcon(message.line.line.id),
            t,
            fn = function (ev) {
                if (t) {
                    window.clearTimeout(t);
                }
                if (utils.hasClass(ev.target, 'goalIcon')) {
                    ev.target.removeAttribute('data-notif-count');
                    ev.target.removeEventListener(wooga.castle.click_event_string, fn, false);
                }
            };
        element.addEventListener(wooga.castle.click_event_string, fn, false);
        t = setTimeout(utils.bind(function () {
            this.addGoalNotification(element, "\u2605");
            this.shakeGoalIcon();
        }, this), 3000);
        return this;
    };


    HUD.prototype.handleGoalComplete = function(message){
    };

    HUD.prototype.handleNewGoal = function (message) {
        this.addGoalButtonNotif({
            text: 'New Goal',
            'class': 'new-goal',
            "line": message.line
        });
    };

    HUD.prototype.initButtons = function () {

        utils.addTouchHandler(document.querySelector("#showShopButton"), function () {
            if(utils.can('enter-shop')) {
                this.view.publish("shop/show");
            }
        }, this);

        utils.addTouchHandler(document.querySelector("#showCursorButton"), function () {
            if(utils.can('enter-roads')) {
                this.view.publish("roadsMode/set");
            }
        }, this);

    };

    HUD.prototype.popupHandler = function (config) {
        var that = this;
        wooga.castle.net.get(wooga.castle.utils.urlFor(config.url)).addCallback(function(response) {
            that.showPopup(config, response, false);
        });
    };


    HUD.prototype.showPopup = function (config, response, doReload) {
        var html = response.data;
        var fn = function (message) {
            var node = document.createElement('div');
            node.innerHTML = html;
            node.querySelector('p').innerHTML = config.text;
            node.querySelector('.share').addEventListener(wooga.castle.capabilities.touch ? 'touchend' : 'click', function (ev) {
                ev.preventDefault();
                wooga.castle.Overlay.hide();
                node.style.display = 'none';
                if(node.parentNode) {
                    node.parentNode.removeChild(node);
                }
                if(doReload) {
                    window.location.reload();
                }
            }, false);
            wooga.castle.Overlay.show();
            document.body.appendChild(node);
        };
        fn.call(this);
    };



    HUD.prototype.hide = function () {
        utils.addClass(document.querySelector('#ui'), 'hide');
    };

    HUD.prototype.show = function () {
        utils.removeClass(document.querySelector('#ui'), 'hide');
    };


    HUD.prototype.initGoalsAttentionGrabber = function(){
        var shakeGoalIconFn = utils.bind(this.shakeGoalIcon, this);
        var i;
        var resetFn = utils.bind(function (ev) {
            clearTimeout(i);
            utils.removeClass(this.elements.goalButton, 'shake');
            i = setTimeout(shakeGoalIconFn, HUD.GOALS_ATTENTION_GRABBER_TIMEOUT);
        }, this);

        this.elements.goalButton.addEventListener('webkitAnimationEnd', resetFn, false);
        this.elements.goalButton.addEventListener('click', resetFn, false);
        i = setTimeout(shakeGoalIconFn, HUD.GOALS_ATTENTION_GRABBER_TIMEOUT);
    };

    HUD.prototype.shakeGoalIcon = function () {
        this.getShakerFunction(this.elements.goalButton)();
        return this;
    };

    HUD.prototype.getShakerFunction = function (element) {
        return function () {
            wooga.castle.utils.addClass(element, 'shake');
        };
    };

    HUD.GOALS_ATTENTION_GRABBER_TIMEOUT = 3 * 60 * 1000;


    var Overlay = function () {
        if(Overlay._instance) {
            return;
        }
        var overlay = document.getElementById('#enforce-modal');
        if(! overlay) {
            overlay = document.createElement('div');
            overlay.id = 'enforce-modal';
            utils.addClass(overlay, 'hidden');
            document.body.appendChild(overlay);
        }
        this.overlay = overlay;
        Overlay._instance = this;
    };
    Overlay.instance = function () {
        return (Overlay._instance||new Overlay());
    };
    Overlay.get = function () {
        return Overlay.instance().overlay;
    };
    Overlay.show = function () {
        if(utils.can('show-overlay')) {
            utils.removeClass(Overlay.get(), 'hidden');
            utils.can('show-overlay', disabler);
        }
        return Overlay;
    };
    Overlay.hide = function () {
        utils.addClass(Overlay.get(), 'hidden');
        utils.can.remove('show-overlay', disabler);
        return Overlay;
    };
    wooga.castle.Overlay = Overlay;


    var OverlayUrlBar = function () {
            if(OverlayUrlBar._instance){
                return;
            }
            var overlayUrlBar = document.getElementById('enforce-urlBarRemove');
            if(! overlayUrlBar) {
                overlayUrlBar = document.createElement('div');
                overlayUrlBar.id = 'enforce-urlBarRemove';
                utils.addClass(overlayUrlBar, 'hidden');
                document.body.appendChild(overlayUrlBar);
            }
            this.overlayUrlBar = overlayUrlBar;
            OverlayUrlBar._instance = this;
        };
    OverlayUrlBar.instance = function () {
        return (OverlayUrlBar._instance||new OverlayUrlBar());
    };
    OverlayUrlBar.get = function () {
        return OverlayUrlBar.instance().overlayUrlBar;
    };
    OverlayUrlBar.show = function () {
        utils.removeClass(OverlayUrlBar.get(), 'hidden');
        return OverlayUrlBar;
    };
    OverlayUrlBar.hide = function () {
        utils.addClass(OverlayUrlBar.get(), 'hidden');
        return OverlayUrlBar;
    };
    wooga.castle.OverlayUrlBar = OverlayUrlBar;



    var UIBlocker = function(){
        var blocker = document.querySelector('#uiblocker');
        if(! blocker){
            blocker = document.createElement('div');
            blocker.id = 'uiblocker';
            utils.addClass(blocker, 'hidden');
            document.body.appendChild(blocker);
        }

        this.spinner = (function(node){
            var spinner = node.querySelector('.spinner');
            if(! spinner){
                spinner = document.createElement('div');
                spinner.className = 'spinner';
                node.appendChild(spinner);
            }
            return spinner;
        }(blocker));

        this.blocker = blocker;
    };


    UIBlocker.prototype.show = function(){
        utils.removeClass(this.blocker, 'hidden');
    };


    UIBlocker.prototype.hide = function(){
        utils.addClass(this.blocker, 'hidden');
    };


    HUD.UIBlocker = UIBlocker;


    document.addEventListener('DOMContentLoaded', function(){
        wooga.castle.UIBlocker = new UIBlocker();
    }, false);

    wooga.castle.HUD = HUD;

}());
