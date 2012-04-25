/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */
(function () {
    "use strict";
    var utils = wooga.castle.utils,
        multiplier = wooga.castle.GRID_UNIT / 24,
        _instance = null,
    getCurrentStep = function () {
        return 0;
    },
    Tutorial = function (game, config) {
        _instance = this;
        this.game = game;
        game.worldView.allowDrag(false);
        this.config = config;
        this.currentStep = getCurrentStep();
        this.step();
    };

    Tutorial.prototype.config = {};
    Tutorial.prototype.game = null;
    Tutorial.prototype.currentStep = 0;
    Tutorial.prototype.screen = null;
    Tutorial.getCurrentStep = getCurrentStep;

    Tutorial.instance = function () {
        return _instance;
    };

    Tutorial.prototype.show = function () {
        if (this.screen) {
            this.screen.fireEvent('resize');
        }
        document.body.setAttribute('data-in-tutorial', true);
        this.screen.node.style.display = 'block';
        return this;
    };

    Tutorial.prototype.hide = function () {
        this.screen.node.style.display = 'none';
        return this;
    };

    Tutorial.prototype.step = function () {
        if (this.config[this.currentStep - 1] && this.config[this.currentStep - 1].subroutine) {
            Tutorial.Hilite.subroutines[this.config[this.currentStep - 1].subroutine + "Cleanup"].call(this);
        }

        var config = this.config[this.currentStep],
            screen;


        if(! config) {
            if(this.currentStep) {
                document.body.removeAttribute('data-in-tutorial');
                this.game.playerData.doneTutorial = true;
                wooga.castle.Storage.save('doneTutorial', this.game.playerData.doneTutorial);
                this.game.worldView.allowDrag(true);
                this.game.publish('tutorial/done');
            }
            return;
        }
        screen = new Tutorial.Screen(this, config);
        this.screen = screen;
        if (this.currentStep === 0) {
            screen.show();
        }

        if (config.subroutine) {
            Tutorial.Hilite.subroutines[config.subroutine].call(this);
        }
    };

    Tutorial.prototype.next = function () {
        var oldscreen = this.screen;
        this.currentStep += 1;
        oldscreen.destructor();
        this.step();
        setTimeout(utils.bind(this.screen.show, this.screen), 300);
        this.screen.show();
    };

    Tutorial.prototype.back = function () {
        var oldscreen = this.screen;
        this.currentStep -= 1;
        if (this.currentStep < 0) {
            this.currentStep = 0;
        }
        Tutorial.setCurrentStep(this.currentStep);
        this.step();
        oldscreen.destructor();
    };

    Tutorial.Screen = function (manager, config) {
        if(! config) {
            return;
        }
        this.listeners = [];

        this.manager = manager;
        this.config = config;
        this.build();
        this.setupScrolling();
        this.makeArrow(config.arrow);
        this.makeHilite(config.hilite);
        this.makeDialog(config);
        this.addHideListener(config.hide);
        this.addProgressor(config.next);
        this.addRegressor(config.back);
        this.addShowListener(config.show);
        this.setupCanAnswer(config.can);
    };

    Tutorial.Screen.prototype.manager = null;
    Tutorial.Screen.prototype.config = null;
    Tutorial.Screen.prototype.node = null;
    Tutorial.Screen.prototype.arrow = null;
    Tutorial.Screen.prototype.listeners = [];
    Tutorial.Screen.prototype.canAnswer = null;
    Tutorial.Screen.prototype.domhandlers = {
      "resize": function (ev) {
        this.fireEvent('resize');
      },
      "drag": function () {
        this.fireEvent('drag');
      }
    };

    utils.mixin(Tutorial.Screen, utils.ObservableMixin);

    Tutorial.Screen.prototype.build = function () {
        var node = document.createElement('div');
        node.setAttribute('class', 'tutscreen step_' + this.manager.currentStep);
        node.setAttribute('data-tutorial_screen_id', this.manager.currentStep);
        this.setupDOMListeners();
        this.node = this.manager.config.root.appendChild(node);
    };

    Tutorial.Screen.prototype.setupScrolling = function () {
        var worldView = this.manager.game.worldView;
        if(this.config.center){
            worldView.allowDrag(true);
            worldView.centerToTile.apply(worldView, this.config.center);
            this.listen('view:centered', this.onViewCentered);
        }

        worldView.allowDrag(!!this.config.scroll);
        this.listen('view:shop/get preview center', this.getPreviewCenter);
    };

    Tutorial.Screen.prototype.onViewCentered = function(view){
        var center = this.config.center || [-16, 5],
            wasDragAllowed = view.isDragAllowed;
        view.allowDrag(true);
        view.centerToTile.apply(view, center);
        view.allowDrag(wasDragAllowed);
        this.fireEvent('recentered', center);
    };

    Tutorial.Screen.prototype.getPreviewCenter = function (message) {
        var center = this.config.center || [-14, 5];
        message.center = {x: center[0], y: center[1]};
    };

    Tutorial.Screen.prototype.makeArrow = function (config) {
        if(! config) {
            return;
        }
        this.arrow = new Tutorial.Arrow(this, config);
        this.node.appendChild(this.arrow.arrow);
    };

    Tutorial.Screen.prototype.makeHilite = function (config) {
        if(! config) {
            return;
        }

        config.x = config.position[0];
        config.y = config.position[1];
        this.hilite = new Tutorial.Hilite(this, config);
        this.node.appendChild(this.hilite.hilite);
    };

    Tutorial.Screen.prototype.makeDialog = function(config) {
        this.makeText(config.text);
        this.makeChar();
    };

    Tutorial.Screen.prototype.makeText = function (string) {
        if(! string) {
            return;
        }
        var textNode = document.createElement('div');
        textNode.setAttribute('class', 'tutorial-text');
        textNode.innerHTML = this.text = string;
        var self = this;

        if(wooga.castle.switches.cheatmode) {
            textNode.addEventListener(wooga.castle.capabilities.touch ? 'touchend' : 'click', function () {
                self.manager.next();
            }, false);
        }
         //ignore textY for iPads
        if( this.config.textY && !wooga.castle.capabilities.iPad) {
            textNode.style.webkitTransform = 'translate(0,' + (this.config.textY ||0)+ 'px)';
        }
        this.textNode = this.node.appendChild(textNode);
    };

    Tutorial.Screen.prototype.makeChar = function() {
        var charNode = document.createElement('div');
        charNode.setAttribute('class', 'tutorial-char');
        var self = this;

        if(wooga.castle.switches.cheatmode) {
            charNode.addEventListener(wooga.castle.capabilities.touch ? 'touchend' : 'click', function () {
                self.manager.next();
            }, false);
        }
        if( this.config.textY ) {
            charNode.style.webkitTransform = 'translate(0,' + (this.config.textY ||0)+ 'px)';
        }
        this.charNode = this.node.appendChild(charNode);
    };

    Tutorial.Screen.prototype.setupCanAnswer = function (config) {
        if(! config) {
            return;
        }
        if(! utils.isArray(config)) {
            config = [config];
        }
        var self = this;
        this.canAnswer = function (message) {
            var preliminary = (config.indexOf(message._action) !== -1);

            return preliminary && self.validate("can", message);
        };
        utils.can('*', this.canAnswer);
    };

    Tutorial.Screen.prototype.addHideListener = function (eventString) {
        if(eventString) {
            this.listen(eventString, function (message) {
                this.hide();
            });
        }
    };

    Tutorial.Screen.prototype.addShowListener = function (eventString) {
        if(eventString) {
            var fn = function (message) {
                if(message) {
                    if(! this.validate("show", message)) {
                        return;
                    }
                }
                this.show();
            };
            this.listen(eventString, fn);
        }
    };

    Tutorial.Screen.prototype.addProgressor = function (eventString) {
        if(eventString) {
            this.listen(eventString, function (message) {
                if(this.validate("next", message)) {
                    this.next();
                } else {
                    this.hide();
                }

            });
        }
    };

    Tutorial.Screen.prototype.addRegressor = function (eventString) {
        if(eventString) {
            this.listen(eventString, function (message) {
                this.back();
            });
        }
    };

    Tutorial.Screen.prototype.validate = function (key, message) {
        var validators, validator, i, l;

        if (this.config.valid) {
            validators = this.config.valid[key];
        }
        var result = !validators;

        if(validators) {
            if(! utils.isArray(validators)) {
                validators = [validators];
            }
            result = true;
            for(i = 0, l = validators.length; result && i < l; i++) {
                validator = validators[i];
                result = (utils.deep(message, validator.key) === validator.value);
            }

        }
        return result;
    };

    Tutorial.Screen.prototype.listen = function (event, fn) {
        var i;
        if(! event) {
            return;
        }
        if(! utils.isArray(event)) {
            event = [event];
        }
        i = event.length - 1;
        do{
            this._listen(event[i], fn);
            i--;
        } while (i >= 0);
    };

    Tutorial.Screen.prototype._listen = function (string, fn) {
        var publisher = wooga.castle,
            parts = string.split(':');
        if(parts.length === 2) {
            publisher = utils.getPublisher(parts[0]);
            string = parts[1];
        }
        this.listeners.push([publisher, string, fn]);
        publisher.subscribe(string, fn, this);
    };

    Tutorial.Screen.prototype.setupDOMListeners = function () {
        var self = this;
        window.addEventListener('resize', function () {
            self.domhandlers.resize.call(self);
        }, false);
        Tutorial.canvas().addEventHandler('drag', this.domhandlers.drag, this);
    };

    Tutorial.Screen.prototype.removeDOMListeners = function () {
        window.removeEventListener('resize', this.domhandlers.resize, false);
        Tutorial.canvas().removeEventHandler('drag', this.domhandlers.drag, this);

        if(this.domhandlers.back) {
            this.removeEventHandler('resize', this.domhandlers.back.resize, this);
            this.removeEventHandler('drag', this.domhandlers.back.drag, this);
        }
    };

    Tutorial.Screen.prototype._unlisten = function () {
        this.listeners.forEach(function (map) {
            map[0].unsubscribe(map[1], map[2], this);
        }, this);
    };

    Tutorial.Screen.prototype.destructor = function () {
        var node = this.node;
        this._unlisten();
        this.removeDOMListeners();

        if(this.arrow instanceof Tutorial.Arrow) {
            this.arrow.remove();
            delete this.arrow;
        }

        if(this.hilite instanceof Tutorial.Hilite) {
            this.hilite.remove();
            delete this.hilite;
        }

        if( node && node.parentNode ) {
            node.parentNode.removeChild(node);
        }

        if (this.canAnswer) {
            utils.can.remove('*', this.canAnswer);
        }
        this.canAnswer = null;
    };

    Tutorial.Screen.prototype.show = function () {
        if (this.arrow) {
            this.fireEvent('resize');
        }
        this.node.style.display = 'block';
    };

    Tutorial.Screen.prototype.hide = function () {
        this.node.style.display = 'none';
    };

    Tutorial.Screen.prototype.next = function () {
        this.manager.next();
    };

    Tutorial.Screen.prototype.back = function () {
        this.manager.back();
    };


    Tutorial.position = function (config) {
        var coords = {},
            position = config.position,
            canvas,
            gridUnit;
        if(utils.isArray(position)) {
            canvas = Tutorial.canvas();
            gridUnit = canvas.gridUnit;
            coords.left = canvas.scrollLeft + ( canvas.mapWidth * 0.5  + position[0] ) * gridUnit ;
            coords.top = canvas.scrollTop + ( canvas.mapHeight * 0.5  + position[1] ) * gridUnit;

        } else if(config.node) {
            if(! utils.isVisible(config.node)) {
                coords = false;
            } else {
                coords = utils.offset(config.node);
            }
        }
        if(coords) {

            coords.left += multiplier * (config.left || 0);
            coords.top += multiplier * (config.top || 0);

        }
        return coords;
    };


    Tutorial.canvas = function () {
        var canvas = wooga.castle.Game.instance().worldView;
        Tutorial.canvas = function () {return canvas;};
        return canvas;
    };


    Tutorial.Arrow = function (manager, config) {
        this.manager = manager;
        this.config = config;
        if(! config) {
            return;
        }
        this.build();
    };

    Tutorial.Arrow.prototype.manager = null;
    Tutorial.Arrow.prototype.config = null;
    Tutorial.Arrow.prototype.arrow = null;

    Tutorial.Arrow.prototype.build = function () {
        var config = this.config,
            elQuery = config.position,
            rotation = config.rotation||0,
            arrow, arrowPic;
        if(typeof elQuery === "string") {
            this.node = document.querySelector(elQuery);
        }
        this.arrow = arrow = document.createElement('div');
        arrow.setAttribute('class', 'tutarrow');
        arrow.style.webkitTransform = "rotate(-" + rotation + "deg)";

        arrowPic = document.createElement('figure');

        arrowPic.setAttribute('class', 'arrow');
        if (config.type && config.type === "right") {
            arrowPic.setAttribute('class', 'arrow right');
        }

        arrow.appendChild(arrowPic);

        this.manager.addEventHandler('drag', this.position, this);
        this.manager.addEventHandler('resize', this.position, this);
        this.manager.addEventHandler('recentered', this.position, this);
        this.position();
    };

    Tutorial.Arrow.prototype.queryToCoords = function () {
        return Tutorial.position(utils.extend({
            "node": this.node
        }, this.config));
    };

    Tutorial.Arrow.prototype.position = function () {
        var coords = this.queryToCoords(),
            arrow = this.arrow.style;
        if(false === coords) {
            arrow.display = 'none';
        } else {
            arrow.display = 'block';
            arrow.top = coords.top + 'px';
            arrow.left = coords.left + 'px';
        }
    };

    Tutorial.Arrow.prototype.remove = function () {
        if( this.arrow.parentNode ) {
            this.arrow.parentNode.removeChild(this.arrow);
        }
        this.manager.removeEventHandler('drag', this.position, this);
        this.manager.removeEventHandler('resize', this.position, this);
    };



    Tutorial.Hilite = function (manager, config) {
        this.manager = manager;
        this.config = config;
        if(! config) {
            return;
        }
        this.build();
    };

    Tutorial.Hilite.prototype.manager = null;
    Tutorial.Hilite.prototype.config = null;
    Tutorial.Hilite.prototype.hilite = null;

    Tutorial.Hilite.prototype.build = function () {
        var config = this.config,
            elQuery = config.position,
            canvas = Tutorial.canvas(),
            gridUnit = canvas.gridUnit,
            hilite;
        if(typeof elQuery === "string") {
            this.node = document.querySelector(elQuery);
        }
        this.hilite = hilite = document.createElement('div');
        hilite.setAttribute('class', 'tuthilite');
        hilite.style.height = config.height * gridUnit + 'px';
        hilite.style.width = config.width * gridUnit + 'px';
        this.manager.addEventHandler('drag', this.position, this);
        this.manager.addEventHandler('resize', this.position, this);
        this.manager.addEventHandler('recentered', this.position, this);
        this.position();
    };

    Tutorial.Hilite.prototype.queryToCoords = function () {
        return Tutorial.position(utils.extend({
            "node": this.node
        }, this.config));
    };

    Tutorial.Hilite.prototype.position = function () {
        var coords = this.queryToCoords(),
            hilite = this.hilite.style;
        if(false === coords) {
            hilite.display = 'none';
        } else {
            hilite.display = 'block';
            hilite.top = coords.top + 'px';
            hilite.left = coords.left + 'px';
        }
    };

    Tutorial.Hilite.prototype.remove = function () {
        if( this.hilite.parentNode ) {
            this.hilite.parentNode.removeChild(this.hilite);
        }
        this.manager.removeEventHandler('drag', this.position, this);
        this.manager.removeEventHandler('resize', this.position, this);
    };

    Tutorial.Hilite.subroutines = {
        "_housePlacementCorrections": function (event) {
            var worldView = this.game.worldView;
            var entityView = worldView.moveEntityView;
            var gridUnit = worldView.gridUnit;
            var hilite = this.config[this.currentStep].hilite;
            var position = worldView.clientXYtoWorldXY(event);
            if ((position.x >= hilite.position[0]) && (position.x < hilite.position[0] + hilite.width) && (position.y >= hilite.position[1]) && (position.y < hilite.position[1] + hilite.height)) {
                entityView.beforeMove();
                entityView.x = (hilite.position[0] + worldView.mapWidth / 2) * gridUnit;
                entityView.y = (hilite.position[1] + entityView.entity.definition.offsetY + worldView.mapHeight / 2) * gridUnit;
                entityView.fireEvent('moved', entityView);
                entityView.moved();
            }
        },
        "housePlacementCorrections": function () {
            this.game.worldView.addEventHandler('touch', Tutorial.Hilite.subroutines._housePlacementCorrections, this);
        },
        "housePlacementCorrectionsCleanup": function () {
            this.game.worldView.removeEventHandler('touch', Tutorial.Hilite.subroutines._housePlacementCorrections, this);
        }
    };

    wooga.castle.subscribe('game/ready', function (message) {
        if(wooga.castle.playerData.doneTutorial || wooga.castle.switches.nowelcome) {
            return;
        }
        var config = utils.extend(wooga.castle.tutorial, {
            "root": message.domNode
        }), t;
        t = (new Tutorial(message.game, config)).hide();
        wooga.castle.publish('tutorial/ready', {instance: t});
}, this);

    wooga.castle.Tutorial = Tutorial;
}());
