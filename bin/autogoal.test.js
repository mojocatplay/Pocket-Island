var assert = require('assert'),
    autogoal = require('./autogoal.js');
function bfe () {
    autogoal.g.__goals = [
        {
            "name": "a goal name",
            "finished": "Contratulatory text",
            "icon": "king01.png",
            "reward": 100,
            "rewardType": "xp",
            "scheme": "intro",
            "level": 10
        },
        {
            "name": "a goal name two",
            "finished": "Contratulatory text",
            "icon": "king02.png",
            "reward": 100,
            "rewardType": "xp",
            "scheme": "hjk",
            "level": 10
        }
    ];
    autogoal.s.__subgoals = [
        {
            "name": "a subgoal name",
            "hint": "a subgoal hint",
            "reward": 50,
            "action": 'harvest',
            "amount": 1,
            "target": "melon",
            "scheme": "intro",
            "_scheme": "intro",
            "level": 1
        },
        {
            "name": "a subgoal name two",
            "hint": "a subgoal hint",
            "reward": 30,
            "action": 'contract',
            "amount": 2,
            "target": "poor_house",
            "scheme": "intro",
            "_scheme": "intro",
            "level": 2
        },
        {
            "name": "a subgoal name three",
            "hint": "a subgoal hint",
            "reward": 30,
            "action": 'buy',
            "amount": 2,
            "icon": "hell",
            "target": "villager",
            "scheme": "build",
            "_scheme": "build",
            "level": 1
        }
    ];
}
beforeEach( function () {
    bfe();
} );

describe('entities parsing', function () {
    it("loads entities properly", function (be) {
        var entities = autogoal.E.entities();
        expect(typeof entities).toEqual("object");
    });

    it("finds an entity", function(be) {
        expect(typeof autogoal.E.entity('villager')).toEqual("object");
    });
});

describe('single subgoal validator generation', function () {
    it("creates basic validators", function () {
        var validator = autogoal.subgoal_utils.basic_validator('harvest'),
            longKey = "entity.definition.class", validatorValue = "farm";
        expect(validator[longKey]).toEqual(validatorValue);
    });
    it("creates extended validators", function () {
        expect(autogoal.subgoal_utils.validator({
                "action": "harvest",
                "target": "melon"
            })["contract.seedName"]).toEqual( "farming/seed-melon");
    });
    it("creates extended validators for houses", function () {
        expect(autogoal.subgoal_utils.validator({
                "action": "contract",
                "target": "wizard"
            })["entity.key"]).toEqual("buildings/wizards_house");
    });
    it("creates extended validators for whackables", function () {
        expect(autogoal.subgoal_utils.validator({
                "action": "whack",
                "target": "tree-small"
            })["entity.key"]).toEqual("nature/tree-small-b");
    });
    it("creates validators for AND class type constraings", function () {
        expect(autogoal.subgoal_utils.validator({
                "action": "move",
                "target": "*farm"
        })["entity.definition.class"]).toEqual("farm");
    });
});

describe('single subgoal gets rewards', function () {
    it('sets the rewards', function () {
        var reward = autogoal.subgoal_utils.rewards({"reward": 10})[0];
        expect(reward.type).toEqual('gold');
    });
});

describe('single subgoal generator', function () {
    it("maps action strings", function () {
        expect(autogoal.subgoal_utils.map_action("harvest")).toEqual("game:contract/collect");
    });
    it("overrides action based on target", function () {
        expect(autogoal.subgoal_utils.action({"action": "whack", "target": "troll"}).event).toEqual('game:enemy/kill'); //action gets overwritten at the last moment in the subgoal processor
    });
    it("autmagically adds amount IF missing", function () {
        var subgoal = autogoal.subgoal_utils.subgoal({
                "action": "whack", "target": "troll"
            });
        expect(subgoal.amount).toEqual(1);
        subgoal = autogoal.subgoal_utils.subgoal({
                "action": "whack", "target": "troll",
                "amount": 3
            });
        expect(subgoal.amount).toEqual(3);
    });
    it("stitches a subgoal together", function () {
        var subgoal = autogoal.subgoal_utils.subgoal({
                "action": "whack", "target": "troll", "name": "", "hint": ""
            });
        expect(typeof subgoal).toEqual('object');
        expect(subgoal.action).toEqual('game:enemy/kill');
        expect(subgoal.type).toBeDefined();
        expect(subgoal.subgoalText).toBeDefined();
        expect(subgoal.subgoalHint).toBeDefined();
    });
    it("renders the title correctly", function () {

        var subgoal = autogoal.subgoal_utils.subgoal({
                "action": "whack", "target": "troll", "name": "whack troll #x", "hint": "", "icon": "troll-icon"
            });
        expect(subgoal.subgoalText).toEqual("whack troll 1x");

    });
    it("adds an icon to the subgoal", function () {
        var subgoal = autogoal.subgoal_utils.subgoal({
                "action": "buy", "target": "villager", "name": "buy a villager house", "hint": ""
            });
        expect(subgoal.icon).toBeDefined();
        expect(subgoal.icon.indexOf('villager')).not.toEqual(-1);
    });
    it("adds icon only if none was specified", function () {

        var subgoal = autogoal.subgoal_utils.subgoal({
                "action": "buy", "target": "villager", "name": "buy a villager house", "hint": "",
                "icon": 'xxx'
            });
        expect(subgoal.icon).toEqual('xxx');
    });
    it("creates validator even if no target is passed", function () {
        var subgoal = autogoal.subgoal_utils.subgoal({
                "name": "a subgoal name three",
                "hint": "a subgoal hint",
                "reward": 30,
                "action": 'buy',
                "amount": 2,
                "icon": "villager_house",
                "target": "",
                "scheme": "general",
                "_scheme": "general",
                "level": 1
            });
        expect(subgoal).toBeDefined();
        expect(subgoal.action).toEqual('game:entity/buy');
        expect(subgoal.objects).toBeDefined();
        expect(subgoal.objects['entity.definition.class']).toEqual('house');
    });
});

describe('subgoal finder', function () {
    it("has a pool of subgoals", function () {
        var subgoals = autogoal.s.subgoals();
        expect(typeof subgoals).toEqual("object");
        expect(subgoals.length).not.toEqual(0);
    });
    it("finds subgoal by scheme", function () {
        var subgoals = autogoal.s._find({
                "scheme": "intro"
            });
        expect(subgoals).toBeDefined();
        expect(subgoals.length).not.toEqual(0);
        var empty = autogoal.s._find({
                "scheme": "x" + Math.random()
            });
        expect(empty.length).toEqual(0);
    });
    it("finds requested number of subgoals for constraints", function () {
        var setIntroWith1 = autogoal.s.find(1, {"scheme": "intro"}),
            a
            ;
        expect(setIntroWith1.length).toEqual(1);
    });
    it("finds requested number of subgoals for constraints", function () {
        var setIntroWith2 = autogoal.s.find(2, {"scheme": "intro", level: 20}),
            a
            ;
        expect(setIntroWith2.length).toEqual(2);
    });
    it("finds requested number of subgoals for constraints", function () {
        var setIntroWith = autogoal.s.find(3, {"scheme": "intro", level: 20}),
            a
            ;
        expect(setIntroWith.length).toEqual(2);
    });
    it("filters by requested level", function () {
        var set = autogoal.s.find(2, {"scheme": "intro", "level": 1});
        expect(set.length).toEqual(1);
    });
    it("cares for multiple schemes", function () {
        var set = autogoal.s.find(2, {"scheme": "intro-build"});
        expect(set.length).not.toEqual(0);
        var hasIntro = set.some(function (sg) {return sg._scheme === "intro";}),
            hasBuild = set.some(function (sg) {return sg._scheme === "build";});
        expect(hasIntro).toEqual(true);
        expect(hasBuild).toEqual(true);
    });
});

describe('12 is not smaller than 2', function () {

    beforeEach(function () {

        autogoal.g.__goals = [
            {
                "name": "a goal name",
                "finished": "Contratulatory text",
                "icon": "king01.png",
                "reward": 100,
                "rewardType": "xp",
                "scheme": "intro",
                "level": 10
            },
            {
                "name": "a goal name two",
                "finished": "Contratulatory text",
                "icon": "king02.png",
                "reward": 100,
                "rewardType": "xp",
                "scheme": "hjk",
                "level": 10
            }
        ];
        autogoal.s.__subgoals = [
            {
                "name": "a subgoal name",
                "hint": "a subgoal hint",
                "reward": 50,
                "action": 'harvest',
                "amount": 1,
                "target": "melon",
                "scheme": "intro",
                "_scheme": "intro",
                "level": 1
            },
            {
                "name": "a subgoal name two",
                "hint": "a subgoal hint",
                "reward": 30,
                "action": 'contract',
                "amount": 2,
                "target": "poor_house",
                "scheme": "intro",
                "_scheme": "intro",
                "level": "2"
            },
            {
                "name": "a subgoal name three",
                "hint": "a subgoal hint",
                "reward": 30,
                "action": 'buy',
                "amount": 2,
                "icon": "hell",
                "target": "villager",
                "scheme": "intro",
                "_scheme": "intro",
                "level": "12"
            }
        ];
    });

    it("casts strings to numbers when checking for unlock level", function () {
        var set = autogoal.s.find(3, {"scheme": "intro", "level": "2"});
        expect(set.length).toEqual(2);
    });

});

describe("goal builder", function () {
    beforeEach(bfe);
    it("has a pool of goals", function () {
        var goals = autogoal.g.goals();
        expect(typeof goals).toEqual("object");
        expect(goals.length).not.toEqual(0);
    });
    it("stitches the parts to form a goal", function () {
        var goal = autogoal.g.goal(2, autogoal.g.goals()[0]);
        expect(goal.subgoals.length).toEqual(2);
        expect(goal.rewards).toBeDefined();
        expect(goal.storyTitle).toBeDefined();
        expect(goal.finishedText).toBeDefined();
    });
    it("drops goals with no subgoals", function () {
        var goal = autogoal.utils.merge({}, autogoal.g.goals()[1]);
        var orig_scheme = goal.scheme;
        goal.scheme = "xxjj  " + Math.random();
        var subgoals = autogoal.g.subgoals(1, goal);
        expect(subgoals.length).toEqual(0);
        goal.scheme = orig_scheme;
    });

    it("generates subgoals for goal constraints", function () {
        var goal = [].concat(autogoal.g.goals())[0];
        var subgoals = autogoal.g.subgoals(2, goal);
        expect(subgoals.length).toEqual(2);
    });
});
