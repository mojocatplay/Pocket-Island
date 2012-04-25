/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */
(function () {
    "use strict";
    var utils = wooga.castle.utils,
        _instance = null;

    var l10n = {
            "OK": "OK",
            "_AFTER_SUBGOALS_BUTTON_TEXT": "Pay {count} <i></i>",
            "GOAL_COMPLETED": "Goal Completed!",
            "SHARE_GOAL_COMPLETED": "Share",
            "COLLECT_REWARDS": "Collect",
            "ALREADY_FINISHED": 'You\'ve already completed that goal.'
        };
    var endpoints = {
        "TEMPLATE_URL": utils.urlFor( "templates/goals.html" ),
        "ICON_URL": utils.urlFor( 'images/hud/tasklist.png' )
    };

    var Goals;

    var GoalLine = function(manager, line, goalID){

        if(! manager){
            return;
        }
        this.line = line;
        this.goalID = goalID;
        this.goal = null;
        this.manager = manager;
        if( this.manager ){
            this.screenRootNode = this.manager.rootNode;
        }
        if( ! goalID ){
            this.goalID = this.getNextGoalID();
            this.publishNewGoalOnBuild();
        }
    };


    GoalLine.State = {
        "COMPLETE": -1
    };


    GoalLine.prototype.getNextGoalID = function () {
        var goalID,
            goalIDs = Object.keys(this.line.goals).map(function(string){
                return string.split('/').pop();
            }),
            index = -1;
        if(! this.goalID){
           goalID = goalIDs[0];
        } else {
            index = goalIDs.indexOf(this.goalID);
            if( goalIDs.length <= index + 1){
                goalID = -1;
            }
            else {
                goalID = goalIDs[index + 1];
            }
        }
        return goalID;
    };


    GoalLine.prototype.imageSrcFor = function (arg) {
        return this.manager.imageSrcFor(arg);
    };

    GoalLine.prototype.build = function () {

        var goal = this.getCurrentGoal();
        if(! goal) {
            if(GoalLine.State.COMPLETE === this.goalID) {
                this.finishLine(); // with the new logic, this should happen only once. When you're old. Very old.
            }
            return;
        }
        this.goal = goal;
        this.goal.wireIn(this.manager.game, this.manager.view);
        this.screen = this.provideGoalsScreen(goal, l10n);
        if(this._isNewGoal){
            this._isNewGoal = false;
            setTimeout( function(){
                goal.announce();
            }, 25);
        }
        this.built = true;
        return this;
    };

    GoalLine.prototype.provideGoalsScreen = function (goal, l10n) {
        return (new (this.provideGoalScreenClass())(this, goal)).build(Goals.template, l10n);
    };

    GoalLine.prototype.provideGoalScreenClass = function () {
        return wooga.castle.GoalScreen;
    };

    GoalLine.prototype.show = function () {
        if(utils.can('enter-goals')){
            this.screen.show();
            this.manager.view.publish('goals/show', {
                line: this,
                goal: this.goal,
                screen: this.screen
            });
        }
        return this;
    };

    GoalLine.prototype.hide = function () {
        this.screen.hide();
        return this;
    };

    GoalLine.prototype.getCurrentGoal = function () {
        var goalData = this.get(this.goalID),
            goal;
        if(goalData){
            goal = this.createGoal(goalData);
        }
        return goal;
    };

    GoalLine.prototype.createGoal = function (goalData) {
        return new wooga.castle.Goal(goalData, this);
    };

    GoalLine.prototype.get = function (goalID) {
        return ((this.line || 0).goals || 0)["goals/" + goalID];
    };

    GoalLine.prototype.advance = function (advancePressed) {
        var goal = this.goal;
        goal.advance();
        this.screen.invalidate();
        if( goal.state === wooga.castle.Goal.State.GOAL_STATE_COLLECTED ){
            this.hide()
                .completeGoal()
                .progressLine();
        }
        return this;
    };


    GoalLine.prototype.publishNewGoalOnBuild = function () {
        this._isNewGoal = true;
        this.built = false;
        if( this.manager ) {
            this.manager.saveLine(this.line.id, this.goalID);
        }
        return this;
    };


    GoalLine.prototype.completeGoal = function () {
        this.goal.collectRewards();
        this.goal.destructor();
        this.screen.hide().destructor();
        return this;
    };


    GoalLine.prototype.progressLine = function () {
        this.goalID = this.getNextGoalID();
        this.goal = null;
        this.built = false;
        this.publishNewGoalOnBuild();
        this.build();
        return this;
    };


    GoalLine.prototype.getGoalIcon = function () {
        return endpoints.ICON_URL;
    };

    GoalLine.prototype.finishLine = function () {
        this.manager.finishLine(this);
    };


    Goals = function (game, view, config) {

            if (_instance) {
                throw "Goals is a singleton";
            }

            _instance = this;

            this.game = game;
            this.view = view;
            this.subscribed = {};
            this.element = null;
            this.template = null;
            this.rootNode = config.rootNode;

            this.getCurrentLines();
            wooga.castle.net.getCached(endpoints.TEMPLATE_URL).addCallback(function (response) {
                Goals.template = response.data;
                this._build();
                wooga.castle.publish('goals/template-loaded', this);
            }, this);



            this.view.subscribe('goals/show', function () {
            }, this);

            this.game.subscribe(wooga.castle.Goal.Events.NEW, function(message) {
                if(message.line && message.line.updateIcon){
                    message.line.updateIcon();
                }
            });

            this.game.subscribe('player/level-up', function (message) {
                setTimeout(utils.bind(this.maybeStartNewLines, this), 250);
            }, this);

            this.game.subscribe('goal/collect-rewards', function (message) {
                setTimeout(utils.bind(this.maybeStartNewLines, this), 250);
            }, this);

            this.game.subscribe('goal/subgoals-complete', function (message) {
                if(message.line.icon){
                    utils.addClass(message.line.icon, 'complete');
                }
            }, this);

        };

    Goals.l10n = l10n;


    Goals.prototype.maybeStartNewLines = function () {
        var line;
        Object.keys(wooga.castle.goals).forEach(function (lineID) {
            line = wooga.castle.goals[lineID];
            if( this.userCanStartLine(line) && !this.userStartedLine(lineID)){
                this.activateLine(lineID, line).build();
            }
        }, this);
        line = null;
    };

    Goals.prototype.userStartedLine = function (lineID) {
        return 'undefined' !== typeof wooga.castle.playerData.goalLines[lineID];
    };

    Goals.prototype.userCanStartLine = function (line) {
        var pd = wooga.castle.playerData;
        return (!line.unlockLevel || (line.unlockLevel <= pd.level)) && (!line.unlockGoal || this.userCompletedGoal(line.unlockGoal));
    };

    Goals.prototype.userCompletedGoal = function (goalID) {
        var pd = wooga.castle.playerData;
        return pd.goals[goalID] && pd.goals[goalID].state === wooga.castle.Goal.State.GOAL_STATE_COLLECTED;
    };



    Goals.prototype.activateLine = function (lineID, line, atGoal) {

        line.id = lineID;
        var goalLine = new GoalLine(this, line, atGoal || 0);
        this.lines.push(goalLine);
        if(this.drawer){
            this.drawer.buildIcon(goalLine);
        }
        return goalLine;
    };


    Goals.prototype.getCurrentLines = function () {
        var game = this.game, lines = game.playerData.goalLines,
            goalLines = [], line, goals = wooga.castle.goals;
        this.lines = [];
        Object.keys(lines).map(function(lineID) {
            if(goals.hasOwnProperty(lineID) && GoalLine.State.COMPLETE !== lines[lineID] ){
                this.activateLine(lineID, goals[lineID], lines[lineID]);
            }
        }, this);
    };

    Goals.prototype.saveLine = function (lineID, goalID) {
        this.game.playerData.goalLines[lineID] = goalID;
    };

    Goals.prototype._build = function () {
        this.lines.map(function (line) {
            if (!line.built) {
                line.build();
            }
        });
        this.drawer = new wooga.castle.GoalsDrawer(this);
        wooga.castle.publish('goals/ready');
    };

    Goals.instance = function () {
        return _instance;
    };


    Goals.prototype.show = function () {
        (this.lines.length === 1 ? this.lines[0] : this.drawer).show();
    };

    Goals.prototype.hide = function () {
        this.drawer.hide();
    };

    Goals.getLineForGoal = function (goalID) {
        var foundLine;
        Object.keys(wooga.castle.goals).forEach(function (lineKey) {
            if( foundLine ) {
                return false;
            }
            var line = new GoalLine(null, wooga.castle.goals[lineKey]);
            if(line.get(goalID)){
                foundLine = lineKey;
            }
        }, this);
        return foundLine;
    };

    Goals.prototype.finishLine = function (line){
        wooga.castle.playerData.goalLines["line/" + line.id] = GoalLine.State.COMPLETE;
        if( line.icon && line.icon.parentNode ){
            line.icon.parentNode.removeChild(line.icon);
        }
        this.lines = this.lines.filter(function (oldLine) {
            return oldLine.id !== line.id;
        });
    };


    Goals.prototype.imageSrcFor = function(key){
        var icon, entity;
        if(['gold', 'food'].indexOf(key) !== -1 ){
            icon = utils.urlFor('/images/popup-' + wooga.castle.GRID_UNIT + '/' + key + (key === 'gold' ? 'Cost' : '') + '.png');
        } else {
            entity = this.game.entitiesDefinition[key];
            icon = entity ? (entity.icon ? utils.urlForEntityImage(entity.icon) : entity.image.src )
                :
            utils.urlForEntityImage(key);
        }
        return icon;
    };


    wooga.castle.GoalLine = GoalLine;
    wooga.castle.Goals = Goals;
}());



