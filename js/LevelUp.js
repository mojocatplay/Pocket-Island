/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga, EJS */
(function () {
    "use strict";
    var utils = wooga.castle.utils,
        disabled = function () {return false;},
        endpoints = {
          "LEVEL_UP_TEMPLATE": utils.urlFor('templates/level-up.html')
        },
        stack = [];
    var LevelUP = function () {
        var data = {
                level: wooga.castle.xp.level,
                rewards: wooga.castle.xp.rewards(),
                unlocked: LevelUP.unlockedAt(wooga.castle.xp.level)
            };
        this.data = data;
        setTimeout(function (levelup) {
            levelup.build();
        }, 20, this);
    };

    LevelUP.prototype.build = function () {
        var wrap;
        wrap = document.createElement('div');
        wrap.id = 'level-up-wrapper';
        utils.addClass(wrap, 'hidden');
        var ejs = new EJS({ text: LevelUP.template });
        wrap.innerHTML = ejs.render({"data": this.data});
        this.rig(wrap);
        setTimeout(function () {
            utils.when('show-overlay', function () {
                LevelUP.game.worldView.rootNode.parentNode.appendChild(wrap);
                wooga.castle.Overlay.show();
                utils.removeClass(wrap, 'hidden');
            });
        }, 25);
        this.wrap = wrap;
        return this;
    };

    LevelUP.unlockedAt = function (level) {
        var entity, entityName, found = [], es = this.game.entitiesDefinition;
        for(entityName in es) {
            if (es.hasOwnProperty(entityName)) {
                entity = es[entityName];
                if("level" === entity.unlockCondition && level === entity.unlockValue) {
                    // we only show one unlocked item now
                    found.push(utils.extend({ iconURL: utils.urlForEntityImage(entity.icon)}, entity));
                    break;
                }
            }
        }
        return found;
    };


    LevelUP.prototype.collectReward = function () {
        if (utils.isArray(this.data.rewards)) {
            this.data.rewards.map(function (reward) {
                wooga.castle.game.increase(reward.type, reward.amount);
            });
        }
        return this;
    };

    LevelUP.prototype.rig = function (element) {
        var continueButton = element.querySelector('button.share');

        if(continueButton){
            continueButton.addEventListener('click', utils.bind(function (ev) {
                this.collectReward();
                this.hide();
                var t = ev.touches? ev.touches[0] || ev : ev;
                utils.clickBuster.preventGhostClick(t.clientX, t.clientY);
            }, this), false);
        }

        return this;
    };

    LevelUP.prototype.hide = function () {
        utils.addClass(this.wrap, 'hidden');
        wooga.castle.Overlay.hide();
    };

    wooga.castle.subscribe('game/init', function (message) {
        LevelUP.game = message.game;
        wooga.castle.net.getCached(endpoints.LEVEL_UP_TEMPLATE).addCallback(function (response) {
            LevelUP.template = response.data;
        });
        LevelUP.game.subscribe('player/level-up', function () {
            var levelUp = new wooga.castle.LevelUP();
        });

    });

    wooga.castle.LevelUP = LevelUP;

}());
