/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */

(function () {
    "use strict";
    var utils = wooga.castle.utils;

    var Goal = function (data, manager) {
        this.manager = manager;
        utils.extend(this, data);
        this.subscribed = {};
        this.events = utils.extend({}, Goal.Events);
        this.flags = utils.extend({}, Goal.Flags);
    };

    Goal.Events = {
        SUBGOALS_COMPLETE: 'goal/subgoals-complete',
        GOAL_COMPLETE: 'goals/complete',
        PROGRESS: 'goal/subgoal-updated',
        SUBGOAL_COMPLETE: 'goal/subgoal-complete',
        SUBGOAL_COLLECTED: 'goal/subgoal-collected',
        COLLECT_REWARDS: 'goal/collect-rewards',
        NEW: 'goal/new'
    };

    Goal.Flags = {
        "published_new": false,
        "progressed": false,
        "collected": false,
        "published_subgoals_complete": false,
        "published_collect": false,
        "published_complete": false,

        "SUBGOAL_COLLECTED": -1
    };

    Goal.State = {
        "GOAL_STATE_NEW": 1, //deprecated
        "GOAL_STATE_STARTED": 2,
        "GOAL_STATE_SUBGOALS_COMPLETE": 3,
        "GOAL_STATE_COLLECTED": -1
    };

    Goal.prototype.game = null;
    Goal.prototype.view = null;
    Goal.prototype.subgoals = [];
    Goal.prototype.rewards = [];
    Goal.prototype.goalID = null;


    Goal.prototype.wireIn = function (game, view) {
        this.game = game;
        this.view = view;
        if (!wooga.castle.playerData.goals[this.goalID]) {
            wooga.castle.playerData.goals[this.goalID] = {state: this.state || Goal.State.GOAL_STATE_STARTED, subgoals: {}};
        }
        var stored = wooga.castle.playerData.goals[this.goalID];
        this.state = stored.state;
        if (this.state !== Goal.State.GOAL_STATE_COLLECTED) {
            if (!stored.subgoals) {
                stored.subgoals = {};
            }
            this.setupSubscribers();
            this.subgoals.map(this.setupSubgoalData, this);
        }

        this.maybeUpdateState();
        return this;
    };

    Goal.prototype.setupSubgoalData = function (subgoal) {
        var subgoalStat = this.getSubgoalStat(subgoal.subgoalID);
        subgoal.have = Goal.Flags.SUBGOAL_COLLECTED === subgoalStat ? subgoal.amount : subgoalStat;
        subgoal.amount = parseInt(subgoal.amount, 10);

        subgoal.imageSrc = (subgoal.icon && this.manager.imageSrcFor(subgoal.icon)) ||
            (this.type === "pay" ? this.getSrcForStat(this.action) : this.manager.imageSrcFor(subgoal.objects['entity.definition.key'] || subgoal.objects.value));


        subgoal.complete = subgoal.have === subgoal.amount;
        subgoal.collected = Goal.Flags.SUBGOAL_COLLECTED === subgoalStat;
        if(subgoal.complete && !subgoal.collected){
            utils.when('have goal icon', utils.bind(function () {
                this.game.publish(this.events.SUBGOAL_COMPLETE, {
                    entity: this,
                    goal: this,
                    line: this.manager,
                    subgoal: subgoal,
                    actionPerformed: ''
                });
            }, this));
        }
        if (subgoal.type === "have") {
            this.doHaveThing(subgoal);
        }

       if (/whack/i.test(subgoal.action)) {
           var probeKey = this._subgoalWantsTree(subgoal);
           // probekey is the value we'll be looking for
            if (!!probeKey) {
                var trees = wooga.castle.game.entities.filter(function (e) {return (/tree/i).test(e.key);});
                var stats = this._analyzeTrees(trees, subgoal, probeKey);
                if (!stats.OK) {
                    while (stats.shouldSpawn-- > 0) {
                        if ('whackable' === stats.shouldSpawnA.toLowerCase()) {
                            utils.publish('spawn/tree');
                        } else {
                            utils.publish('spawn', stats.shouldSpawnA);
                        }
                    }
                }
            }
       }


        return subgoal;
    };

    Goal.prototype.getSubgoalStat = function (ID) {
        var subgoal = this.game.playerData.goals[this.goalID] ? (this.game.playerData.goals[this.goalID].subgoals || 0)[ID] : null;
        var stat = subgoal ? parseInt(subgoal, 10) : 0;
        return isNaN(stat) ? 0 : stat;
    };

    Goal.prototype.setupSubscribers = function () {
        var subscribed = this.subscribed;
        this.subgoals.forEach(function (subgoal) {
            if (subgoal.type === "listen" || subgoal.type === "have") {
                var columnIndex = subgoal.action.indexOf(':');
                if (!subscribed[subgoal.action]) {
                    utils.subscribe(subgoal.action, this.maybeUpdateSubgoal, this);
                    subscribed[subgoal.action] = true;
                }
                if (columnIndex !== -1) {
                    subgoal._action = subgoal.action;
                    subgoal.action = subgoal.action.substring(columnIndex + 1);
                }
            }
        }, this);
        return this;
    };

    Goal.prototype.maybeUpdateSubgoal = function (message) {
        if (!message) {
            return this;
        }
        this.subgoals.forEach(function (subgoal) {
            if (subgoal.action === message._channel) {
                var objects = subgoal.objects,
                    publishMessage, i, check, valid;
                for (i in objects) {
                    if(objects.hasOwnProperty(i)){
                        check = String(utils.deep(message, i));
                        valid = String(objects[i]);
                        if (subgoal.have >= subgoal.amount) {
                            return;
                        }
                        if (check !== valid) {

                            if (!(i.indexOf('boost') !== -1 && parseInt(check, 10) >= parseInt(valid, 10))
                                && !(valid === "house" && check === "uhouse")) {
                                return;
                            }
                        }
                    }
                }

                subgoal.have++;
                this.saveSubgoalStats().maybeUpdateState();
                publishMessage = {
                    entity: this,
                    goal: this,
                    line: this.manager,
                    subgoal: subgoal,
                    actionPerformed: message._channel
                };
                this.game.publish(this.events.PROGRESS, publishMessage);
                if (subgoal.complete) {
                    this.game.publish(this.events.SUBGOAL_COMPLETE, publishMessage);
                }
            }
        }, this);
        return this;
    };

    Goal.prototype.collectSubgoal = function (subgoal) {
        if (subgoal.complete && !subgoal.collected) {
            if (subgoal.rewards) {
                subgoal.rewards.forEach(function (reward) {
                    this.game.increase(reward.type, reward.amount);
                }, this);
                this.game.publish(this.events.SUBGOAL_COLLECTED, {
                    "subgoal": subgoal,
                    "goal": this,
                    "line": this.manager
                });
            }
            subgoal.collected = true;
            this.saveSubgoalStats().maybeUpdateState();
        }
        return this;
    };

    Goal.prototype.announce = function () {
        this.game.publish(this.events.NEW, {
            goalID: this.goalID,
            goal: this,
            line: this.manager
        });
        return this;
    };

    Goal.prototype.maybeUpdateState = function () {
        var completed_subgoals = 0,
            collected_subgoals = 0,
            progress = this.flags.progressed,
            goal = this;
        goal.subgoals.forEach(function (subgoal) {
            progress = progress || (subgoal.have !== 0);
            if (subgoal.have >= subgoal.amount) {
                completed_subgoals++;
                subgoal.complete = true;
                subgoal.collected = subgoal.rewards ? !!subgoal.collected : true;
                if (subgoal.collected) {
                    collected_subgoals++;
                }
            }
        }, this);
        this.flags.progressed = progress;
        if (progress) {
            goal.state = goal.state === Goal.State.GOAL_STATE_COLLECTED ? Goal.State.GOAL_STATE_COLLECTED : Goal.State.GOAL_STATE_STARTED;
        }
        this.subgoals_completed = completed_subgoals >= goal.subgoals.length;

        if (this.state === Goal.State.GOAL_STATE_STARTED && this.subgoals_completed) {
            goal.advance();
        }

        return this;
    };

    Goal.prototype.saveSubgoalStats = function () {
        if(-1 === [Goal.State.GOAL_STATE_COLLECTED, Goal.State.GOAL_STATE_SUBGOALS_COMPLETE].indexOf(this.state)) {
            this.subgoals.forEach(function (subgoal) {
                wooga.castle.playerData.goals[this.goalID].subgoals[subgoal.subgoalID] = subgoal.collected ? Goal.Flags.SUBGOAL_COLLECTED : subgoal.have;
            }, this);
        }
        return this;
    };

    Goal.prototype.destroySubscribers = function () {
        var subscribed = this.subscribed, action;
        this.subgoals.forEach(function (subgoal) {
            action = subgoal._action || subgoal.action;
            if (subscribed[subgoal.action]) {
                this.game.unsubscribe(subgoal.action, this.maybeUpdateSubgoal, this);
                subscribed[subgoal.action] = false;
            }
        }, this);
        return this;
    };

    Goal.prototype.destroyLocalData = function () {
        var goal = this.game.playerData.goals[this.goalID];
        goal.state = Goal.State.GOAL_STATE_COLLECTED;
        delete goal.subgoals;
        return this;
    };

    Goal.prototype.destructor = function () {
        this.destroySubscribers().destroyLocalData();
    };

    Goal.prototype.getState = function () {
        return this.state;
    };

    Goal.prototype.advance = function () {
        switch(this.state) {
            case Goal.State.GOAL_STATE_NEW: // legacy
            case Goal.State.GOAL_STATE_STARTED:
                this.state = Goal.State.GOAL_STATE_SUBGOALS_COMPLETE;
                if (! this.flags.published_subgoals_complete) {
                    this.game.publish(this.events.SUBGOALS_COMPLETE, {
                        goalID: this.goalID,
                        line: this.manager,
                        goal: this
                    });
                    this.flags.published_subgoals_complete = true;
                }
                break;
            case Goal.State.GOAL_STATE_SUBGOALS_COMPLETE:
                this.state = Goal.State.GOAL_STATE_COLLECTED;
                break;
            default:
                break;
        }
        wooga.castle.publish('request-save');
        return this;
    };

    Goal.prototype.collectRewards = function () {
        if (this.flags.collected) {
            return this;
        }
        var rewards = (this.rewards||[]);
        this.advance();
        if (rewards.length) {
            Array.prototype.map.call(rewards, function (reward) {
                this.game.increase(reward.type, reward.amount, this);
            }, this);
            if (!this.flags.published_collect) {
                this.game.publish(this.events.COLLECT_REWARDS, {
                    goal: this,
                    rewards: rewards,
                    line: this.manager
                });
            }
            this.flags.published_collect = true;
        }
        this.flags.collected = true;
        if (!this.flags.published_complete) {
            this.game.publish(this.events.GOAL_COMPLETE, {goal: this, line: this.manager});
            this.flags.published_complete = true;
        }
        wooga.castle.publish('request-save');
        return this;
    };

    Goal.prototype.htmlState = function () {
        var state = this.state;
        switch(state) {
            case Goal.State.GOAL_STATE_SUBGOALS_COMPLETE:
                var a = this.subgoals.filter(function (subgoal) {
                    return subgoal.rewards && !subgoal.collected;
                });
                if (a.length !== 0) {
                    state = Goal.State.GOAL_STATE_STARTED;
                }
                break;
            default:
                break;
        }
        return state;
    };

    Goal.prototype.doHaveThing = function (subgoal) {
        this.game.entities.forEach(function (e) {
            var msg = {"_channel": subgoal.action,
                "entity": e,
                "entityView": e.entityView,
                "contract": e.contract,
                "key": e.key,
                "connected": e.connected
            };
            this.maybeUpdateSubgoal(msg);
        }, this);
        return this;
    };

    Goal.prototype._subgoalWantsTree = function (subgoal) {
        var key;
        for (key in subgoal.objects) {
            if (subgoal.objects.hasOwnProperty(key)) {
                if (/tree|whackable/i.test(subgoal.objects[key])) {
                    return key;
                }
            }
        }
        return false;
    };

    Goal.prototype._analyzeTrees = function (trees, subgoal, shortcut) {
        var valid = subgoal.objects[shortcut];
        shortcut = (shortcut||"").replace(/^entity\./, '');
        // out of the X you have on the map, how many fit the requirements for this goal?
        var suitableTrees = trees.filter(function (t) {
            return (utils.deep(t, shortcut) === valid);
        });

        return {
            "OK": suitableTrees.length >= subgoal.amount,
            "shouldSpawnA": valid,
            "shouldSpawn": subgoal.amount - suitableTrees.length
        };
    };

    wooga.castle.Goal = Goal;

}());
