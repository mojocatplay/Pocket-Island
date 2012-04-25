/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */
(function (wc) {
    "use strict";


    var utils = wc.utils,

        DrydockGoalLine, RewardsScreen, DrydockGoalScreen,

        Goal = wc.Goal,

        Goals = wc.Goals,

        GoalScreen = wc.GoalScreen,

        GoalLine = wc.GoalLine,

        Ship = wc.Ship,

        DrydockGoals = function (game, view, config) {
            config = config || {};
            this.game = game;
            this.view = view;
            this.config = config;
            this.rootNode = config.rootNode || view.rootNode;
            this.drydock = this.getDrydock();
            var line = (function (c) {
                var i;
                for(i in c) {
                    if (c.hasOwnProperty(i)) {
                        break;
                    }
                }
                if (!i) {
                    return i;
                } else {
                    c[i].id = i;
                    return c[i];
                }
            }(config));
            this.line = line ? new DrydockGoalLine(this, line, this.getLineGoalID(line.id)) : null;
            this.view.subscribe('drydock/show', function (message) {
                if(wooga.castle.drydockGoals && wooga.castle.switches.enabledrydock && this.line){
                        this.show();
                } else {
                    wooga.castle.publish('entity/coming-soon', message.entityView);
                }
            }, this);
            this.view.subscribe('drydock/hide', this.hide, this);
        };


    DrydockGoals.prototype.build = function (template) {
        if(! this.line) {
            return;
        }
        this.template = template;
        this.line.build();
        this.invalidateShipState();
    };

    DrydockGoals.prototype.show = function () {
        if(this.line) {
            if( (this.line.goal)
                && this.line.goal.state === Goal.State.GOAL_STATE_COLLECTED
                && (this.drydock.contractState === Ship.ContractState.FINISHED) ){

                var contract = this.drydock.contract;
                var screenData = {
                    storyTitle: "Upgrade Complete!",
                    rewards: contract.rewards,
                    rootNode: this.rootNode
                };
                this.screen = new RewardsScreen(this.view, screenData).build(wc.Goals.template, DrydockGoals.prepareL10n(wc.Goals.l10n));
                this.screen.addEventHandler('hide', function () {
                    this.drydock.upgrade();
                    this.drydock = this.getDrydock();
                    this.line.progressLine();
                    wooga.castle.publish('request-save');
                }, this);
                this.screen.show();
            } else {
                this.line.show();
            }
        }
        return this;
    };

    DrydockGoals.prototype.hide = function () {
        if(! this.line) {
            return;
        }
        this.line.hide();
        return this;
    };

    DrydockGoals.prototype.getDrydock = function () {
        return this.game.entities.filter(function (e) {
            return e.definition['class'] === "ship";
        })[0];
    };

    DrydockGoals.prototype.invalidateShipState = function () {
        if(this.line.goal && this.line.goal.state === Goal.State.GOAL_STATE_COLLECTED){
            if(Ship.ContractState.IDLE === this.drydock.contractState) {
                this.drydock.startContract();
            }
        }
        return this;
    };

    DrydockGoals.prototype.saveLine = function (lineID, goalID) {
        this.game.playerData.goalLines[lineID] = goalID;
        return this;
    };

    DrydockGoals.prototype.getLineGoalID = function (lineID) {
        return this.game.playerData.goalLines[lineID];
    };

    DrydockGoals.prototype.finishLine = function () {
        var d = this.drydock;

        d.move({x: -7, y: 14});
        d.entityView.invalidate();

        wc.playerData.goalLines[this.line.id] = -1;
        this.line = null;
    };
    DrydockGoals.prototype.imageSrcFor = Goals.prototype.imageSrcFor;

    DrydockGoals.prepareL10n = function (l10n) {
        return utils.extend({}, l10n, {
            SHARE_GOAL_COMPLETED: "Start",
            REPAIRING: "Repairing",
            GOAL_COMPLETED: "Rewards",
            PLEASE_WAIT_UNTIL_CONSTRUCTION_IS_COMPLETE: "Please wait until construction is complete"
        });
    };
    wc.DrydockGoals = DrydockGoals;

    wc.subscribe('goals/template-loaded', function (goalsInstance) {
        if( wc.drydockGoals && wc.switches.enabledrydock){
            var game = goalsInstance.game,
                dg = new DrydockGoals(game, game.worldView, wc.drydockGoals);
            dg.build(wc.Goals.tempalte);
        }
    });

    var DrydockGoal = function (data, manager) {
        this.parent.call(this, data, manager);
        this.events.SUBGOALS_COMPLETE = DrydockGoal.Events.SUBGOALS_COMPLETE;
        this.events.GOAL_COMPLETE = DrydockGoal.Events.GOAL_COMPLETE;
    };

    utils['extends'](DrydockGoal, Goal);

    DrydockGoal.Events = utils.extend({}, Goal.Events, {
        GOAL_COMPLETE: 'drydockgoal/complete',
        SUBGOALS_COMPLETE: 'drydockgoal/subgoals-complete'
    });

    DrydockGoal.State = utils.extend({}, Goal.State);

    wc.DrydockGoal = DrydockGoal;

    DrydockGoalLine = function (manager, config, goalID) {
        this.parent.apply(this, arguments);
    };

    utils['extends'](DrydockGoalLine, GoalLine);

    DrydockGoalLine.prototype.createGoal = function (goalData) {
        return new DrydockGoal(goalData, this);
    };

    DrydockGoalLine.prototype.provideGoalsScreen = function (goal, l10n) {
        goal.repairing_img = this.manager.game.entitiesDefinition['contracts/repairing'].image.src;
        return this.parent.prototype.provideGoalsScreen.call(this, goal, DrydockGoals.prepareL10n(l10n));
    };

    DrydockGoalLine.prototype.provideGoalScreenClass = function () {
        return DrydockGoalScreen;
    };

    DrydockGoalLine.prototype.advance = function () {
        this.goal.advance();
        this.screen.invalidate();
        this.manager.invalidateShipState();
        if( this.goal.state === Goal.State.GOAL_STATE_COLLECTED ){
            this.goal.collectRewards();
            this.hide();
        }
        return this;
    };

    DrydockGoalLine.prototype.progressLine = function () {
        this.goal.destructor();
        this.screen.destructor();
        GoalLine.prototype.progressLine.call(this);
    };


    DrydockGoalScreen = function () {
        return GoalScreen.apply(this, arguments);
    };

    utils['extends'](DrydockGoalScreen, GoalScreen);

    DrydockGoalScreen.prototype.build = function () {
        var result = GoalScreen.prototype.build.apply(this, arguments);
        utils.addClass(this.element, 'drydock');
        return result;
    };

    DrydockGoalScreen.prototype.invalidate = function () {
        var result = GoalScreen.prototype.invalidate.call(this);
        if(this.goal.state === DrydockGoal.State.GOAL_STATE_COLLECTED){
            if( this.timer ){
                return;
            }
            var fn = (function (drydock, target) {
                var total = drydock.definition.contract.requiredTime,
                    start = drydock.contractStartTime,
                    zeroPad = function (num) {
                        return (num < 10 ? "0" : "") + num;
                    };
                return function () {
                    var ms = total - (Date.now() - start),
                        date = new Date(ms);
                    if(ms < 0) {
                        return;
                    }
                    target.innerHTML = zeroPad(date.getUTCHours()) + "h:" + zeroPad(date.getUTCMinutes()) + "m:" + zeroPad(date.getUTCSeconds()) + 's';
                };
            } (this.manager.manager.drydock, this.element.querySelector('.drydock-screen-repairing .specification h6')));
            this.timer = setInterval(fn, 995);
            fn();
        }
        var cs = wc.Viewport.getClientSize();
        this.element.style.maxHeight = cs.height + 'px';
        [].map.call(this.element.querySelectorAll('.screen'), function (screen) {
            screen.style.maxHeight = cs.height + 'px';
        });
        return result;
    };

    DrydockGoalScreen.prototype.hide = function () {
        GoalScreen.prototype.hide.call(this);
        if(this.timer){
            clearInterval(this.timer);
            this.timer = null;
        }
        return this;
    };


    RewardsScreen = function (view, config) {
        this.config = config;
        this.view = view;
        this.manager = {
            screenRootNode: config.rootNode
        };
        this.flags = {collected: false};
    };

    utils['extends'](RewardsScreen, DrydockGoalScreen);
    utils.mixin(RewardsScreen, utils.ObservableMixin);

    RewardsScreen.prototype.provideTemplateData = function () {
        return {
            l10n: utils.extend({}, this.l10n, {SHARE_GOAL_COMPLETED: "Collect"}),
            data: this.config
        };
    };

    RewardsScreen.prototype.invalidate = function () {
        this.setDOMState();
        return this;
    };

    RewardsScreen.prototype.setDOMState = function () {
        this.element.setAttribute('data-state', 3);
        return this;
    };

    RewardsScreen.prototype.advanceButtonHandler = function () {
        this.fireEvent('advance');
        this.hide();
        return this;
    };

    RewardsScreen.prototype.cancelButtonHandler = function () {
        this.fireEvent('cancel');
        this.hide();
        return this;
    };

    RewardsScreen.prototype.collectRewards = function () {
        if(! this.flags.collected){
            (this.config.rewards||[]).forEach(function (reward) {
                this.view.game.increase(reward.type, reward.amount, this);
            }, this);
            this.flags.collected = true;
        }
        return this;
    };

    RewardsScreen.prototype.show = function () {
        this.fireEvent('show');
        this.collectRewards();
        this.parent.prototype.show.call(this);
    };

    RewardsScreen.prototype.hide = function () {
        this.fireEvent('hide');
        this.parent.prototype.hide.call(this);
        return this;
    };



}(wooga.castle));
