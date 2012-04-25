var config = module.exports;

config["Magic Land Mobile"] = {
    environment: "browser",        // or "node"
    rootPath: "../",
    sources: [
        // "lib/**/*.js"   // Glob patterns supported
        // "js/*.js", // Paths are relative to rootPath
        "test/fixtures/*.js",
        "js/utils.js",
        "js/main.js",
        "js/CastleUpgradeMode.js",
        "js/Viewport.js",
        "js/View.js",
        "js/Entity.js",
        "js/EntityView.js",
        "js/GoalScreen.js",
        "js/Goals.js",
        "js/RoadsMode.js",
        "js/PathFinder.js",
        "js/PeopleView.js",
        "js/Spawner.js",
        "js/Enemy.js"
    ],
    tests: [
        "test/test*.js",
        "test/test-utils/*.js"
    ]
}
