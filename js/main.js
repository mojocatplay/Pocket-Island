/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga, console */
(function () {
    "use strict";
    var utils = wooga.castle.utils;

    wooga.castle.switches = wooga.castle.switches || {};
    wooga.castle.capabilities = wooga.castle.capabilities || {};

    var preloadEntitiesImages = function (entitiesDefinition, playerData) {

            var result = new utils.Deferred();

            var loadedImagesCount = 0;
            var totalImagesCount = 0;
            var notified = false;

            var map = [], imap = {};

            Object.keys(entitiesDefinition).forEach(function (i) {

                var entityDefinition = entitiesDefinition[i];

                if (entityDefinition.url) {

                    var src = utils.urlForEntityImage(entityDefinition.url);

                    if (map.indexOf(entityDefinition.url) === -1) {

                            map.push(entityDefinition.url);
                            totalImagesCount++;

                            imap[entityDefinition.url] = entityDefinition.image = new Image();

                            var onFailure = function (reason) {
                                    if (!notified) {
                                        notified = true;
                                        wooga.notify('An error prevented the game from loading!', 'error');
                                    }
                                };

                            entityDefinition.image.addEventListener("load", function () {
                                if (++loadedImagesCount === totalImagesCount) {
                                    result.callback();
                                }
                            }, false);

                            entityDefinition.image.addEventListener("error", function (e) {
                                onFailure("image parsing error: " + entityDefinition.image.src.slice(0, 50));
                            }, false);

                            entityDefinition.image.src = src;

                    } else {

                        entityDefinition.image = imap[entityDefinition.url];

                    }

                }

            });



            return result;

        };


    wooga.castle.init = function (playerData, clientSize) {

        // start tutorial
        if(! (wooga.castle.switches.nowelcome || playerData.doneTutorial)){

            var fn = function (message) {
                var node = document.createElement('div');

                node.style.display = 'none';
                if(node.parentNode) {
                    node.parentNode.removeChild(node);
                }
                var tinstance = wooga.castle.Tutorial.instance();
                if(tinstance){
                    setTimeout(function(){
                        tinstance.show();
                    }, 25);
                } else {
                    wooga.castle.subscribe('tutorial/ready', function (message) {
                        setTimeout(function () {
                            message.show();
                        }, 25);
                    });
                }
                document.body.appendChild(node);
            };

            if(wooga.castle.gameReady) {
                fn.call(this);
            } else {
                wooga.castle.subscribe('game/ready', fn, this);
            }
        }


        if (wooga.castle.switches.fast) {
            var edk;
            for(edk in wooga.castle.entityDefinitions){
                if (wooga.castle.entityDefinitions.hasOwnProperty(edk)) {
                    var entityDefinition = wooga.castle.entityDefinitions[edk];
                    if (entityDefinition.contract) {
                        entityDefinition.contract.requiredTime *= 0.0001;
                    }
                }
            }
        }

        preloadEntitiesImages(wooga.castle.entityDefinitions, playerData).addCallback(function () {
            wooga.castle.initGame(playerData, clientSize);
        });
    };

    wooga.castle.initGame = function (playerData, clientSize) {
        utils.can('hardware/info', utils.disabler);

        var rootNode = wooga.castle.rootNode = document.getElementById("game"),
            mlmContent = document.getElementById('mlm-content');

        var game = new wooga.castle.Game({
                playerData: playerData,
                entitiesDefinition: wooga.castle.entityDefinitions
            });


        game.subscribe('player/level-up', function () {
            preloadEntitiesImages(wooga.castle.entityDefinitions, playerData);
        });

        var worldView = new wooga.castle.WorldView(game, {
                rootNode: rootNode,
                gridUnit: wooga.castle.GRID_UNIT,
                mapWidth: wooga.castle.playerData.map.width, // TODO: does it really belong here?
                mapHeight: wooga.castle.playerData.map.height,
                offsetWidth: clientSize.width,
                offsetHeight: clientSize.height
            });

        var hud = new wooga.castle.HUD(game, worldView);

        var gameModesManager = new wooga.castle.GameModesManager(game, worldView, hud, {
                rootNode: rootNode
            });

        var shop = new wooga.castle.Shop(game, worldView, {
                rootNode: mlmContent
            }, gameModesManager);

        var goals = new wooga.castle.Goals(game, worldView, {
                rootNode: mlmContent
            });

        var animsFactory = new wooga.castle.AnimsFactory(worldView);
        var notifs = new wooga.castle.NotificationHandler(game);

        var transactionsManager = new wooga.castle.TransactionsManager(game);

        var unlockableAreaKeyHandler = new wooga.castle.UnlockableAreaKeyHandler(game);

        utils.addClass(document.body, "gridUnit-" + window.wooga.castle.GRID_UNIT);

        if(Math.abs(window.orientation) === 90){
            utils.addClass(document.body, 'landscape');
        }

        if(wooga.castle.capabilities.IOS){
            utils.addClass(document.body, 'ios');
        }

        game.init();

        document.body.style.backgroundImage = 'none';

        var people = new wooga.castle.People(game);
        var peopleView = new wooga.castle.PeopleView(people, worldView, gameModesManager);


        rootNode.style.display = 'block';
        var readyMessage = {
          "game": game,
          "hud": hud,
          "worldView": worldView,
          "rootNode": rootNode,
          "domNode": mlmContent
        };
        wooga.castle.publish('map is alterable', readyMessage);

        setTimeout( function(){
            wooga.castle.gameReady = true;
            wooga.castle.publish('game/ready', readyMessage);
            window.scrollTo(0,0);
            wooga.castle.tokens.set(playerData.tokens||[]);
        }, 16);

    };


    (function(scope){

        var _tokens = [];

        function setTokens(tokens){
            _tokens = tokens;
        }

        function isValidToken(token){
            return _tokens.indexOf(token) !== -1;
        }

        function save(){
            wooga.castle.playerData.tokens = _tokens;
            wooga.castle.game.publish('player/update');
        }

        function invalidateToken(token){
            _tokens = _tokens.filter(function(search){
                return search !== token;
            });
            save();
        }

        function generate(){
            var token;
            do {
                token = Math.random();
            } while(-1 !== _tokens.indexOf(token));
            _tokens.push(token);
            save();
            return token;
        }

        scope.tokens = {
            set: setTokens,
            valid: isValidToken,
            remove: invalidateToken,
            generate: generate
        };

    }(wooga.castle));

    (function(){
        var temp, pubSubMixin = wooga.castle.utils.PubSubMixin;
        for(temp in pubSubMixin){
            if (pubSubMixin.hasOwnProperty(temp)) {
                wooga.castle[temp] = utils.bind(pubSubMixin[temp], wooga.castle);
            }
        }
    }());


    wooga.castle.scrollLock = function(setEnabled){
        if(setEnabled){
            if(! wooga.castle.scrollLock.enabled){
                document.body.addEventListener('touchmove', wooga.castle.scrollLock.fn, false);
                wooga.castle.scrollLock.enabled = true;
            }
        } else {
            document.body.removeEventListener('touchmove', wooga.castle.scrollLock.fn, false);
            wooga.castle.scrollLock.enabled = false;
        }
    };

    wooga.castle.scrollLock.fn = function(ev){
        ev.preventDefault();
    };

}());
