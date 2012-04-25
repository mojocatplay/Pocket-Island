/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */
(function () {
    "use strict";
    wooga.castle.migrations = [
        {
            version : 1,
            name : 'adding a version info attribute',
            run : function(user){
                user.dataVersion = user.dataVersion || 1;
            }
        },
          {
            version : 2,
            name : 'migrating removed rock-goal',
            run : function(user){
                if(user.goals && user.goals["7016"] && (user.goals['7016'] !== -1)){
                   user.goals["7016"] = null;
                   delete user.goals["7016"];

                    user.goals["7017"] =    {
                                        "state":1,
                                        "subgoals":{
                                            "7017s0":0,
                                            "7017s1":0
                                                }
                                            };
                }
            }
        },
        {version: 3, name: "changing to goal lines", run: function (user) {
            if(! user.goalLines){
                var lines = {};
                Object.keys(user.goals||{}).map(function (goalID) {
                    var lineID = wooga.castle.Goals.getLineForGoal(goalID);
                    lines[lineID] = goalID;
                });
                user.goalLines = lines;
            }
        }},
        {version: 4, name: "no moar goals", run: function (user) {
            user.goalLines = {"line/4000": 0};
            user.goals = {};
        }},
        {version: 5, name: "remove campsite", run: function (user) {
            var campsite = user.map.entities.map(function (entity) {
                if(entity.key.indexOf('campsite') !== -1){
                    entity.key = 'buildings/castle_1';
                }
            });
        }},
        {version: 6, name: "no moar goals, again", run: function (user) {
            user.goalLines = {"line/1": 0};
            user.goals = {};
        }},
        {version: 7, name: "no moar goals, again", run: function (user) {
            user.goalLines = {"line/1": 0};
            user.goals = {};
        }},
        {version: 8, name: "adding unlockablee", run: function (user) {
            var unlockies = [
                    {
                        "key": "unlock/1"
                    },
                    {
                        "key": "unlock/2"
                    },
                    {
                        "key": "unlock/3"
                    },
                    {
                        "key": "unlock/4"
                    },
                    {
                        "key": "unlock/5"
                    }
                ];
            user.map.entities = user.map.entities.concat(unlockies);
        }},
        {version: 9, name: "new trees", run: function (user) {
            var terms = ['b', 'd', 'y', 'r'];
            user.map.entities = user.map.entities.map(function (e) {
                e.key = e.key === 'nature/tree-small' ? "nature/tree-small-" + terms[Math.floor(Math.random() * terms.length)] : (
                    e.key === "nature/tree-big" ? 'nature/tree-big-' + (Math.random() < 0.5 ? 1 : 2) + '-' + terms[Math.floor(Math.random() * terms.length)] : e.key
                );
                return e;
            });
        }},
        {version: 10, name: "adding collected items bucket", run: function (user) {
            user.collectedItems = user.collectedItems || [];
        }},
        {version: 11, name: "translating playerData coordinates to new mapHeight", run: function (user) {
            user.map.height = 36;
            user.map.entities.forEach(function(entity){
                if("undefined" !== typeof entity.y) {
                    entity.y += 2;
                }
            });
        }},
        {version: 12, name: "all your rocks are one rock are belong to me", run: function (user) {
            user.map.entities.map(function (e) {

                if (e.key.indexOf('rock') !== -1) {
                    e.key = 'nature/rock';
                }
                return e;
            });
        }}
    ];
}());
