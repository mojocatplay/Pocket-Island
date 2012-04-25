/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */
(function (wc) {
    "use strict";
    var utils = wc.utils;
    function XP( currentLevel, manager) {
        this.manager = manager;
        if((typeof currentLevel === 'number') || ! currentLevel) { // TODO: how is all this useful?
            this.setLevel(currentLevel || 1);
            this.setXP(0);
        }
        else {
            this.load(currentLevel);
        }
        if(this.level >= 4) {
            document.body.setAttribute('data-level-treshold', 4);
        }
    }

    XP.prototype.level = 1;
    XP.prototype.xp = 0;
    XP.prototype.manager = null;
    XP.prototype.xpToLevelUP = function (level) {
        if(! arguments.length) {
            level = this.level;
        }
        if(level === 0) {
            return 10;
        }
        var xp = this.xpToLevelUP(level - 1) + 1;
        this.xpToLevelUP = function () {return xp;};
        return xp;
    };

    XP.prototype.setLevel = function (level) {
        this.manager.playerData.level = this.level = level;
    };

    XP.prototype.maxEnergy = function (level) {
        if(! arguments.length) {
            level = this.level;
        }
        if(level === 0) {
            return 11; //TODO maybe add this to a configuration file?
        }
        return this.maxEnergy(level - 1) + 1;
    };

    XP.prototype.setXP = function (xp) {
        this.manager.playerData.xp = this.xp = xp;
    };

    XP.prototype.addXP = function (amount) {
        this.setXP(this.xp + amount);
        if(this.xp >= this.xpToLevelUP()) {
            this.levelUP();
        } else {
            this.write();
            this.manager.publish('player/update');
        }
    };

    XP.prototype.load = function (data) {
        this.setLevel( data.level );
        this.setXP( data.xp );
    };

    XP.prototype.write = function () {
        wc.game.playerData.level = this.level;
        wc.game.playerData.xp = this.xp;
    };

    XP.read = XP.prototype.read = function () {
        var data = {};

        data.level = parseInt(wc.game.playerData.level, 10);
        data.xp = parseInt(wc.game.playerData.xp, 10);

        return data;
    };

    XP.prototype.levelUP = function () {
        var carry = this.xp - this.xpToLevelUP();
        if( carry >= 0) {
            wooga.castle.xp = new XP({
                level: this.level +1,
                xp: 0
            }, this.manager);
            utils.publish('player/level-up', {
                'level': wooga.castle.xp.level
            });
            utils.publish('game:player/level-up', {
                'level': wooga.castle.xp.level
            });
            wc.xp.addXP(carry);
        }
    };

    XP.prototype.rewards = function () {
        return [];
    };

    (function (levels) {
        XP.levelInfo = levels;

        XP.prototype._xpToLevelUp = XP.prototype.xpToLevelUP;
        XP.prototype.xpToLevelUP = function (level) {
            if(! arguments.length) {
                level = this.level;
            }
            var xp = XP.levelInfo.predefined[level] ?
                    XP.levelInfo.predefined[level].xp :
                    this._xpToLevelUp(level);
            this.xpToLevelUP = function () {return xp;};
            return xp;
        };

        XP.prototype.rewards = function () {
            var rewards = XP.levelInfo.predefined[this.level] && XP.levelInfo.predefined[this.level].rewards ?
                            XP.levelInfo.predefined[this.level].rewards : {};
            this.rewards = function () {return rewards;};
            return rewards;
        };

        XP.prototype._maxEnergy = XP.prototype.maxEnergy;
        XP.prototype.maxEnergy = function (level) {
            if(! arguments.length) {
                level = this.level;
            }
            var maxe = XP.levelInfo.predefined[level] && XP.levelInfo.predefined[level].maxEnergy ?
                        XP.levelInfo.predefined[level].maxEnergy : this._maxEnergy(level);
            this.maxEnergy = function () {return maxe;};
            return maxe;
        };

    }( wc.levels ));


    wc.XP = XP;

}(wooga.castle));
