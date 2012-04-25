#!/usr/bin/env node
var fs = require('fs'),
    paths = {
        "entities": "config/entities.json",
        "goals": "docs/goals.csv",
        "subgoals": "docs/subgoals.csv",
        "save_goals_to": "config/goals.json"
    },
    actionsMap = {
                "harvest": "game:contract/collect",
                "plant": "game:contract/start",
                "connect": "game:building/connected",
                "contract": "game:contract/start",
                "collect": "game:contract/collect",
                "whack": "game:entity/whack-complete",
                "buy": "game:entity/buy",
                "move": "game:entity/move",
                "boost": "game:boosts/maybe-change",
                "upgrade": "game:castle/upgrade"
            };

function _entityDefinitions () {
    if(! _entityDefinitions.entities ) {
        _entityDefinitions.entities = JSON.parse( fs.readFileSync(paths.entities));
    }
    return _entityDefinitions.entities;
}

function sift (needle, haystack) {
    for( var i in haystack ){
        if(-1 !== i.indexOf(needle) && haystack[i]){
            haystack[i].key = haystack[i].key || i; //otherwise, we will never have access to it
            return haystack[i];
        }
    }
    return null;
}

function _entityDefinition (key) {
    if("undefined" === typeof _entityDefinition.cache[key]) {
        _entityDefinition.cache[key] = sift(key, _entityDefinition.cache) || sift(key, _entityDefinitions());
    }
    return _entityDefinition.cache[key];
}

_entityDefinition.cache = {};

function csv_parser (path, key_translation) {
    var raw_data = fs.readFileSync(path, 'utf-8'),
        lines = raw_data.split("\n"),
        keys, objects = [],
	breakAt = lines.indexOf('');
    key_translation = key_translation || {};
    if (-1 !== breakAt){
        lines = lines.slice(0, breakAt);
    }
    keys = lines.shift().split(',');
    lines.forEach(function (line) {
        var obj = {}, values = line.split(',');
        keys.forEach(function (key, nth) {
            if("" !== key){
                obj[ key_translation[key] || key ] = values[nth];
            }
        });
        objects.push(obj);
    });
    return objects;
}

var utils = {
    "merge": function (a, b) {
        [].slice.call(arguments, 1).forEach(function (extObj) {
            for (var property in extObj) {
                a[property] = extObj[property];
            }
        });
        return a;
    },
    "pluck": function (array) {
        return array.length? array.splice(Math.floor(Math.random() * array.length), 1)[0] : undefined;
    }
}

var E = {
        "entity": _entityDefinition,
        "entities": _entityDefinitions,
        "sift": sift
    },
    subgoal_utils = {
        "map_action": function (string) {
            return actionsMap[string];
        },
        "basic_validator": function (string) {
            var mapping = {
                "harvest": {
                    "entity.definition.class": "farm"
                },
                "plant": {
                    "entity.definition.class": "farm"
                },
                "contract": {
                    "entity.definition.class": "house"
                },
                "connect": {
                },
                "collect": {
                    "entity.definition.class": "house"
                },
                "whack": {
                    "entity.definition.class": "whackable"
                },
                "buy": {
                    "entity.definition.class": "house"
                },
                "move": {

                }
            };
            return mapping[string] || {};
        },
        "validator": function (subgoal) {
            var validator = subgoal_utils.basic_validator(subgoal.action),
                re, entityClass, target;
            if(subgoal.target){
                re = /^\*/;
                if(re.test(subgoal.target)){
                    entityClass = subgoal.target.replace(re, '');
                    validator['entity.definition.class'] = entityClass;
                    if('boost' === subgoal.action){
                        validator['entity.boost'] = subgoal.amount;
                        subgoal.amount = 1;
                    } else if ("connect" === subgoal.action) {
                        validator['definition.class'] = validator['entity.definition.class'];
                        validator['connected'] = true;
                        delete validator['entity.definition.class'];
                    }
                } else {
                    target = E.entity(subgoal.target) || 0;
                    switch(subgoal.action){
                        case "harvest":
                        case "plant":
                            validator['contract.seedName'] = target.key;
                            break;
                        case "buy":
                            validator = {'entity.key': target.key};
                            break;
                        case "connect":
                            validator = {'key': target.key, "connected": true};
                            break;
                        case "boost":
                            validator["entity.boost"] = subgoal.amount;
                            if(target){
                                validator['entity.key'] = target.key;
                            }
                            subgoal.amount = 1;
                            break;
                        case "whack":
                            if (/characters/i.test(target.key)) {
                                validator = {'entity.key': target.key};
                            }
                        default:
                            validator['entity.key'] = target.key;
                    }
                }
            }
            return validator;
        },
        "action": function (subgoal) {
            subgoal.event = subgoal_utils.map_action(subgoal.action);
            if(subgoal.target){
                re = /^\*/;
                if(! re.test(subgoal.target)){
                    var target = E.entity(subgoal.target) || 0;
                    if (/characters/i.test(target.key)) {
                        subgoal.event = "game:enemy/kill";
                    }
                }
		if ('*enemy' === subgoal.target) {
		    //hooray for edge cases!
		    subgoal.event = "game:enemy/kill";
		}
            }
            return subgoal;
        },
        "amount": function (subgoal) {
            return subgoal.amount || 1;
        },
        "rewards": function (config) {
            var reward = [];
            if("object" !== typeof config.reward){
               reward.push({"type": config.rewardType||"gold", "amount": config.reward});
            }
            return reward;
        },
        "subgoal": function (data) {
            var subgoal = subgoal_utils.action(data),
                target;
            subgoal.objects = subgoal_utils.validator(subgoal);
            subgoal.amount = subgoal_utils.amount(subgoal);
            subgoal.rewards = subgoal_utils.rewards(subgoal);
            subgoal.subgoalText = (subgoal.name+"").replace(/#/g, subgoal.amount);
            subgoal.subgoalHint = subgoal.hint;
            subgoal.type = subgoal.type || "listen";
            subgoal.action = subgoal.event;
            if(! subgoal.icon){
                target = E.entity(subgoal.target);
                if(! target) {
                    console.error(subgoal.target + ' was not found!!');
                } else {
                    subgoal.icon = target.icon;
                }
            }
            delete subgoal.hint;
            delete subgoal.name;
            delete subgoal.target;
            delete subgoal.reward;
            delete subgoal.scheme;
            return subgoal;
        }
    },
    subgoal_finder = {
        "subgoals": function () {
            if(! subgoal_finder.__subgoals){
                subgoal_finder.__subgoals = csv_parser(paths.subgoals, {
                    "Name": "name",
                    "Reward": "reward",
                    "Reward_Type": "rewardType",
                    "Finished": "finished",
                    "Min_Level": "level",
                    "Level": "level",
                    "Hint": "hint",
                    "Target": "target",
                    "Amount": "amount",
                    "Action": "action",
                    "Scheme": "scheme",
                    "type": 'type'
                });
                // uncomment to turn on alteration verification
                // subgoal_finder.o = ff(subgoal_finder.__subgoals);
            }
            return subgoal_finder.__subgoals;
        },
        /** subgoals alteration verifier
        "___v": function () {
            if (subgoal_finder.o !== ff(subgoal_finder.__subgoals)) {
                console.error('fuck!');
            }
        },
        */
        "_find": function (constraints) {
            return [].concat(subgoal_finder.subgoals().filter(subgoal_finder.__seeker(constraints))).map(function (e) {
                return utils.merge({}, e);
            });
        },
        "__seeker": function (config) {
            return (function (c) {
                return function (candidate) {
                    return (candidate.scheme === c.scheme) && ( c.level ? parseInt(candidate.level||0, 10) <= parseInt(c.level, 10) : true );
                };
            } (config));
        },
        "find": function (count, constraints) {

            var schemes = constraints.scheme.split('-'),
                total = count,
                found = [], pool = [];

            schemes.forEach( function (scheme) {
                var set = subgoal_finder._find(utils.merge({}, constraints, {"scheme": scheme}));
                if(set.length){
                    found.push(utils.pluck(set));
                    pool = pool.concat(set);
                    total--;
                }
            });
            // turns on step by step subgoal data alteration verification
            // subgoal_finder.___v();


            while((total * pool.length) > 0) {
                found.push(utils.pluck(pool));
            }

            return found;
        }
    },
    goals_builder = {
        //returns definitions!
        "goals": function () {
            if(! goals_builder.__goals){
                goals_builder.__goals = csv_parser(paths.goals, {
                    "Name": "name",
                    "Reward": "reward",
                    "Reward_Type": "rewardType",
                    "Finished": "finished",
                    "Min_Level": "level",
                    "Scheme": "scheme"
                });
            }
            return goals_builder.__goals;
        },
        //returns definitions!
        "subgoals": function (count, goal) {
            return subgoal_finder.find(count, goal);
        },
        "_subgoalIDGenerator": function (seed) {
            return function (subgoal, nth) {
                subgoal.subgoalID = seed + "s" + (nth+1);
            };
        },
        "goal": function (subgoal_count, goal_data) {
            var goal = utils.merge({}, goal_data);
            goal.subgoals = goals_builder.subgoals(subgoal_count, goal).map(subgoal_utils.subgoal);
            goal.subgoals.forEach(goals_builder._subgoalIDGenerator(goal.goalID));
            goal.rewardType = goal.rewardType || "xp";
            goal.rewards = subgoal_utils.rewards(goal);
            goal.storyTitle = goal.name;
            goal.finishedText = goal.finished;
            goal.Icon = '';
            delete goal.finished;
            delete goal.name;
            delete goal.reward;
            delete goal.rewardType;
            delete goal.scheme;
            return goal;
        },
        "generate": function (config) {
            var all = goals_builder.goals().concat([]),
                goals = {};
            all.splice(config.count || all.length);
            all.map(function (goal_data, nth) {
                goal_data.goalID = 1e2 + nth;
                var goal = goals_builder.goal(config.subgoal_count[0], goal_data);
                if(goal && goal.subgoals && goal.subgoals.length > 0){
                    this['goals/' + goal.goalID] = goal;
                }
            }, goals);
            return goals;
        }
    };

function __build (goals_no, min_subgoal_no, max_subgoal_no) {
    fs.writeFile(paths.save_goals_to, JSON.stringify(
        {"line/1": {"goals": goals_builder.generate({
            "count": goals_no,
            "subgoal_count": [min_subgoal_no, max_subgoal_no]
        })}}));
}

module.exports = {
    "E": E,
    "utils": utils,
    "subgoal_utils": subgoal_utils,
    "s": subgoal_finder,
    "g": goals_builder,
    "build": __build
};

/** poorman's crc
var ff = function (a) {
    return a.reduce(function (v, c) {
        return v + c.scheme;
    }, '');
};
*/

__build(120, 2, 7);
