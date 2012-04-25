/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga, EJS */
(function (window, document) {

    "use strict";
    var utils = wooga.castle.utils;
    utils.can('have goal screen', utils.disabler);

    var GoalScreen = function (manager, goal) {
        this.manager = manager;
        this.goal = goal;
        this.elementsCache = {};
    };

    GoalScreen.prototype.build = function (template, l10n) {
        var ejs = new EJS({ text: template }),
            wrapper = document.createElement('div'),
            lang = utils.extend({}, l10n);

        lang.AFTER_SUBGOALS_BUTTON_TEXT = lang._AFTER_SUBGOALS_BUTTON_TEXT;

        this.l10n = lang;

        wrapper.innerHTML = ejs.render(this.provideTemplateData());
        wrapper.className = 'goals';
        this.element = wrapper;
        if(this.manager.screenRootNode) {
            this.manager.screenRootNode.appendChild(this.element);
        }
        this.wireIn();
        utils.can.remove('have goal screen', utils.disabler);
        return this;
    };

    GoalScreen.prototype.destructor = function () {
        var e = this.element;
        if( e && e.parentNode ){
            e.parentNode.removeChild(e);
        }
        return this;
    };

    GoalScreen.prototype.wireIn = function () {
        var map = Array.prototype.map;
        this.elementsCache = {
            "current_stat_displays": this.element.getElementsByClassName('current'),
            "pay_goal_buttons": this.element.querySelectorAll('.pay .pay'),
            "pay_goal_current_stat_displays": this.element.querySelectorAll('.pay .current'),
            "subgoals": this.element.getElementsByClassName('subgoal')
        };
        map.call(this.element.querySelectorAll(".button.collect-goal"), function (button) {
            utils.addTouchHandler(button, this.advanceButtonHandler, this);
        }, this);

        map.call(this.element.querySelectorAll("button.cancel"), function (button) {
            utils.addTouchHandler(button, this.cancelButtonHandler, this);
        }, this);

        map.call(this.element.querySelectorAll(".pay .pay"), function(button) {
            utils.addTouchHandler(button, this.handlePayButtonTap, this);
        }, this);

        map.call(this.elementsCache.subgoals, function (subgoal) {
            utils.addTouchHandler(subgoal, function (ev) {

                var subgoalElement = utils.parents(ev.target, '.subgoal');
                    subgoal = this.subgoalForHTMLEntity(subgoalElement);
                if(subgoal.complete && !subgoal.collected){
                    var node = subgoalElement.querySelector('.description');
                    var width = node.offsetWidth;
                    var height = node.offsetHeight;

                    wooga.castle.game.publish("goals/collectReward", {
                        rewards: subgoal.rewards,
                        width: width,
                        height: height,
                        top: utils.getElementTop(node),
                        left: utils.getElementLeft(node)
                    });
                    this.goal.collectSubgoal(subgoal);
                    this.invalidate();
                    this.element.className += " ";

                }
            }, this);
        }, this);

        this.scrollingUtils = utils.enableScrollability(this.element.querySelector('ul.subgoal-list'));
        utils.addClass(this.element, 'hidden');
    };

    GoalScreen.prototype.advanceButtonHandler = function (ev) {
        if(utils.can('advance goal screen', this)){
            this.manager.advance(true);
        }
    };

    GoalScreen.prototype.cancelButtonHandler = function (ev) {
        if(utils.can('close-goals')){
            this.manager.hide();
        }
    };

    var getSubgoalId = function(element) {
        return element.id.split('-').pop();
    };

    GoalScreen.prototype.subgoalForHTMLEntity = function (subgoalElement) {
        return this.goal.subgoals.filter(function (subgoal) {
            return getSubgoalId(subgoalElement) === subgoal.subgoalID;
        })[0];
    };

    GoalScreen.prototype.handlePayButtonTap = function (ev) {

        var subgoal = this.subgoalForHTMLEntity(utils.parents(ev.target, '.subgoal'));

        if( this.manager.manager.game.drain(subgoal.action, subgoal.amount) ){
            subgoal.have = subgoal.amount;
            this.invalidate();
        }

        ev.preventDefault();
    };

    GoalScreen.prototype.invalidate = function () {
        this.goal.maybeUpdateState().saveSubgoalStats();
        var state = this.goal.state;
        this.setDOMState();
        var map = Array.prototype.map;
        map.call(this.elementsCache.current_stat_displays, function (stat) {
            var cls = stat.className.split(/\s/g).filter(function (className) {
                return (/gold|food|level/i).test(className);
            })[0];
            if(cls){
                stat.innerText = wooga.castle.game.getStat(cls);
            }
        });

        if( wooga.castle.Goal.State.GOAL_STATE_STARTED === state) {
            this.invalidateStats();
            map.call(this.elementsCache.pay_goal_buttons, function (button) {
                var li = utils.parents(button, 'li.pay');
                if(! utils.hasClass(li, 'done')) {
                    var subgoalID = li.id.split('-').pop();
                    var subgoal = this.goal.subgoals.filter(function (subgoal) {
                        return subgoalID === subgoal.subgoalID;
                    })[0];
                    utils.toggleClass(li, 'unaffordable', !this.manager.manager.game.hasStat(subgoal.action, subgoal.amount));
                }
            }, this);
            map.call(this.elementsCache.pay_goal_current_stat_displays, function (el) {
                var li = utils.parents(el, 'li.pay');
                if(! utils.hasClass(li, 'done')) {
                    var subgoalID = li.id.split('-').pop();
                    var subgoal = this.goal.subgoals.filter(function (subgoal) {
                        return subgoalID === subgoal.subgoalID;
                    })[0];
                    el.innerHTML = Math.min(subgoal.amount, utils.deep(wooga.castle.playerData, el.getAttribute('data-stat')));
                }
            }, this);
        }

        var goal = this.goal;
        map.call(this.elementsCache.subgoals, function (subgoalElement) {
            var subgoal = this.subgoalForHTMLEntity(subgoalElement);
            if(subgoal.complete){
                utils.addClass(subgoalElement, 'done');
            }
            if(subgoal.collected){
                utils.addClass(subgoalElement, 'collected');
            }

        }, this);

        this.scrollingUtils.animateTo(0);

        this.element.calssName += " ";
    };

    GoalScreen.prototype.setDOMState = function () {
        this.element.setAttribute('data-state', this.goal.htmlState());
    };

    GoalScreen.prototype.invalidateStats = function () {
        this.goal.subgoals.forEach(function (subgoal, i) {
            this.element.querySelector('#subgoal-' + subgoal.subgoalID + ' .have').innerText = subgoal.have;
            if(subgoal.have >= subgoal.amount) {
                utils.addClass(this.element.querySelector('#subgoal-' + subgoal.subgoalID), 'done');
            }
        }, this);
    };

    GoalScreen.prototype.show = function () {
        this.goal.subgoals.sort(this.sortSubgoals);
        this.rerenderSubgoals();
        wooga.castle.Overlay.show();
        this.invalidate();
        utils.removeClass(this.element, 'hidden');
        return this;
    };

    GoalScreen.prototype.getElementBySubgoalId = function(id) {
        return document.getElementById("subgoal-" + id);
    };

    GoalScreen.prototype.rerenderSubgoals = function() {
        var self = this;
        this.goal.subgoals.forEach(function(sb) {
            var subgoalEl = self.getElementBySubgoalId(sb.subgoalID);
            subgoalEl.parentNode.appendChild(subgoalEl);
        });
    };

    GoalScreen.prototype.hide = function () {
        utils.addClass(this.element, 'hidden');
        wooga.castle.Overlay.hide();
        utils.publish('view:goals/close', {screen: this, line: this.manager});
        return this;
    };

    /*
     * Sorts subgoals in the following order: ready, open, collected.
     */
    GoalScreen.prototype.sortSubgoals = function(a, b) {
        return a.collected === b.collected ? b.complete - a.complete : a.collected - b.collected;
    };

    GoalScreen.prototype.provideTemplateData = function () {
        return {
            "l10n": this.l10n,
            "data": this.goal
        };
    };

    wooga.castle.GoalScreen = GoalScreen;

    utils.can('advance goal screen', function (screen) {
        var states = wooga.castle.Goal.State;
         return [
                states.GOAL_STATE_NEW,
                states.GOAL_STATE_SUBGOALS_COMPLETE,
                states.GOAL_STATE_COLLECTED
            ].indexOf(screen.goal.htmlState()) !== -1;
    });

}(window, document));
