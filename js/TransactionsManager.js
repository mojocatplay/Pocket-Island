/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga, console */
(function () {
    "use strict";
    var utils = wooga.castle.utils,
        net = wooga.castle.net,
        TransactionsManager;

    wooga.castle.TransactionsManager = function (game) {
        this.game = game;

        if(wooga.castle.switches.noPersistency) {
            console.log("In noPersistency mode, no one can hear you scream. Also, we don't save your stuff");
            return;
        }


        function saveLocal () {

            if(! game.playerData.doneTutorial ) {
                return;
            }

            var key = 'playerData';

            wooga.castle.Storage.save(key, game.playerData);
        }


        function timeoutSaver(throttle, timeout){
            var t, T;
            return function(callback, scope){
                var fn = function fn(){
                    callback.call(scope);
                    T = setTimeout(fn, timeout);
                };
                if(t){
                    clearTimeout(t);
                }
                if(T){
                    clearTimeout(T);
                }
                t = setTimeout(function(){
                    callback.call(scope);
                    T = setTimeout(fn, timeout);
                }, throttle);
            };
        }

        var _LSSaver = timeoutSaver(TransactionsManager.SAVE_LOCALLY_THROTTLE, TransactionsManager.SAVE_LOCALLY_TIMEOUT, 'LS');

        function LSsave () {
            _LSSaver(saveLocal);
        }



        var save = function(){
            var localSaver = new LSsave();
        };

        save();

        var saveAfter = [
            'game:contract/',
            'game:player/update',
            'game:entity/buy',
            'game:goal/',
            'game:goals/',
            'invited/',
            "request-save"
        ];

        saveAfter.forEach(function(event){
            wooga.castle.utils.subscribe(event, save);
        });

    };


    TransactionsManager = wooga.castle.TransactionsManager;

    TransactionsManager.SAVE_LOCALLY_TIMEOUT = 30 * 1000;
    TransactionsManager.SAVE_LOCALLY_THROTTLE = 2 * 1000;


}());
