var FIXTURES = FIXTURES || {};
FIXTURES.entitiesConfig = {
    "buildings/villager_house": {
        "class": "uhouse",
        "name": "Villager's House",
        "url": "buildings0.png",
        "spritey": 8,
        "icon": "buildings/villager_house-icon.png",
        "width": 3,
        "height": 3,
        "offsetY": -1,
        "selectable": true,
        "draggable": true,
        "unlockCondition": "level",
        "unlockValue": 1,
        "unlockCost": 10,
        "goldCost": 500,
        "diamondCost": 1,
        "destroyGainGold": 167,
        "contract": {
            "requiredFood": 0,
            "requiredTime": 300000,
            "providedGold": 15,
            "providedXP": 1
        }
    },
    "buildings/bakery": {
        "class": "house",
        "name": "Bakery",
        "url": "buildings20.png",
        "spritey": 14,
        "icon": "buildings/bakery-icon.png",
        "width": 4,
        "height": 4,
        "offsetY": -2,
        "selectable": true,
        "draggable": true,
        "unlockCondition": "level",
        "unlockValue": 1,
        "unlockCost": 10,
        "goldCost": 800,
        "diamondCost": 1,
        "destroyGainGold": 267,
        "contract": {
            "requiredFood": 15,
            "requiredTime": 60000,
            "providedGold": 35,
            "providedXP": 1
        }
    },
    "buildings/lighthouse": {
        "class": "statichouse",
        "name": "Swamp Lighthouse",
        "url": "special.png",
        "spritey": 5,
        "icon": "buildings/royal_summer_house-icon.png",
        "width": 4,
        "height": 6,
        "offsetY": -4,
        "xOffsetLeft": 1,
        "xOffsetRight": -1,
        "selectable": true,
        "draggable": false,
        "unlockCondition": "item",
        "unlockValue": "unlock/key",
        "unlockCost": 1,
        "goldCost": 0,
        "diamondCost": 10,
        "destroyGainGold": 0,
        "contract": {
            "requiredFood": 0,
            "requiredTime": 82800000,
            "providedGold": 600,
            "providedXP": 20
        }
    },
    "farming/basic_plot": {
        "class": "farm",
        "name": "Farm plot",
        "url": "farming.png",
        "spritey": 0,
        "icon": "farming/basic_plot-icon.png",
        "width": 2,
        "height": 2,
        "offsetY": 0,
        "selectable": true,
        "draggable": true,
        "goldCost": 100,
        "destroyGainGold": 50,
        "unlockCondition": "level",
        "unlockValue": -1
    }

};
