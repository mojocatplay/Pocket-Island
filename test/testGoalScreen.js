/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga, buster, assert, refute */

(function() {

    "use strict";

    buster.testCase("wooga.castle.GoalScreen test case", {
        setUp: function() {
            this.ready = {
                complete: true,
                collected: false
            };
            this.open = {
                complete: false,
                collected: false
            };
            this.collected = {
                complete: true,
                collected: true
            };

            this.gs = new wooga.castle.GoalScreen();
            this.compareSortOrder = function (arrayA, arrayB) {
                var result = true, i;
                for (i = 0; i < arrayA.length; i++) {
                    if (arrayA[i] !== arrayB[i]) {
                        result = false;
                        break;
                    }
                }
                return result;
            };
        },

        "test sortSubgoals orders random subgoals in the order: ready, open and collected": function () {
            var subgoals = [this.collected, this.open, this.ready, this.collected, this.ready, this.open];
            var sortedSubgoals = [this.ready, this.ready, this.open, this.open, this.collected, this.collected];

            subgoals.sort(this.gs.sortSubgoals);

            assert(this.compareSortOrder(subgoals, sortedSubgoals));
        },

        "test sortSubgoals doesn't change the order of correctly sorted subgoals": function() {
            var subgoals = [this.ready, this.open, this.collected];
            var sortedSubgoals = [this.ready, this.open, this.collected];

            subgoals.sort(this.gs.sortSubgoals);

            assert(this.compareSortOrder(subgoals, sortedSubgoals));
        },


        "test getElementBySubgoalId returns the correct DOM node": function() {
            document.body.innerHTML += '<ul><li id="subgoal-123"></li><li id="subgoal-234"></li><li id="subgoal-345"></li></ul>';
            var id = "234";
            var element = this.gs.getElementBySubgoalId(id);
            assert.equals(element.id, "subgoal-234");
        },

        "test rerenderSubgoals updates the order of subgoal elements": function() {
            document.body.innerHTML += '<ul id="subgoals"><li id="subgoal-2"></li><li id="subgoal-3"></li><li id="subgoal-1"></li></ul>';
            this.gs.goal = {
                subgoals: [{subgoalID: 1}, {subgoalID: 2}, {subgoalID: 3}]
            };
            this.gs.rerenderSubgoals();
            var subgoals = document.querySelectorAll("#subgoals li");
            assert.equals(subgoals[0].id, "subgoal-1");
            assert.equals(subgoals[1].id, "subgoal-2");
            assert.equals(subgoals[2].id, "subgoal-3");

        }



    });

}());