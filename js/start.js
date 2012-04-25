/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga, EJS, $, console */

(function() {

    "use strict";

    wooga.castle.GRID_UNIT = 48;
    wooga.castle.IMAGES_BASE_URL = "images/entities/";

    wooga.castle.capabilities = {
        touch: /(iPod|iPhone|iPad|Android)/.test(navigator.userAgent),
        iPod: /** this is how you test: disable the next comment */ /**true || */navigator.userAgent.indexOf('iPod') !== -1,
        android: /Android/i.test(navigator.userAgent),
        "desktop": !(/(iPod|iPhone|iPad|Android)/.test(navigator.userAgent)),
        iPad: /iPad/.test(navigator.userAgent)
    };

    wooga.castle.capabilities.iPad = wooga.castle.capabilities.iPad || wooga.castle.capabilities.desktop;

    wooga.castle.click_event_string = wooga.castle.capabilities.touch? "touchend" : "click";

    if (wooga.castle.capabilities.desktop && !wooga.castle.switches.iframed) {
        window.stop();
        document.location = 'ipad.html';
    }


    wooga.castle.isNativeWrapper = function() {
        var result = !wooga.castle.capabilities.desktop && !wooga.castle.capabilities.android && (! /Safari/.test(navigator.userAgent));
        wooga.castle.isNativeWrapper = function () {
            return result;
        };
        return result;
    };

    // Enables :active CSS pseudoclass
    document.addEventListener('touchstart', function () {}, false);


    document.addEventListener('DOMContentLoaded', function checkVersion(){
        wooga.castle.Viewport.reset();
        wooga.castle.Viewport.maximize();

        if(wooga.castle.capabilities.iPod) {
            var loader = document.getElementById('loadingScreen');
            loader.querySelector('p').innerHTML = "Oops! Magic Land is currently not supported on the iPod.";
            loader.querySelector('.progress').style.display = document.querySelector('.comic').style.display = "none";
            return;
        }
        if(wooga.castle.capabilities.iPad){
            wooga.castle.utils.addClass(document.body, 'ipad');
        }

        document.querySelector('.comic .button.share').addEventListener(wooga.castle.click_event_string, function (e) {
            // hide comic. show intro
            document.querySelector('.comic').style.display = "none";
            document.querySelector('.intro').style.display = "block";
            e.preventDefault();
        }, false);
        document.querySelector('.intro .button').addEventListener(wooga.castle.click_event_string, function (e) {
            document.querySelector('.intro').style.display = "none";
            e.preventDefault();
        }, false);

        wooga.castle.utils.addClass(document.body, (wooga.castle.utils.isSPA() || wooga.castle.isNativeWrapper()) ? 'fullscreen' : "browser");


        function gameStarter(playerData){
            if (playerData && playerData !== "null") {
                if (typeof playerData === "string") {
                    wooga.castle.playerData = JSON.parse(playerData);
                } else {
                    wooga.castle.playerData = playerData;
                }
            }

            setTimeout(function () {
                wooga.castle.init(wooga.castle.playerData, wooga.castle.Viewport.getClientSize());
            }, 200);
        }

        wooga.gameStarter = gameStarter;

        (function () {
            wooga.castle.Storage.config = wooga.castle.isNativeWrapper() ? 'ios' : 'local';

            var restoredPlayerData = wooga.castle.Storage.restore('playerData'),
                comic = document.querySelector('.comic'),
                intro = document.querySelector('.intro');

            if (!restoredPlayerData) {// Migration for users that have their data stored under the old format "playerData_UUID"
                restoredPlayerData = wooga.castle.Storage.restore('playerData_' + localStorage.uuid);
            }

            if (restoredPlayerData || wooga.castle.switches.nowelcome) {
                comic.style.display = intro.style.display = 'none';
                comic.style.visibility = intro.style.visibility = 'hidden';
            } else {
                comic.style.display = 'block';
            }
            gameStarter(restoredPlayerData);
        }());

    }, false);

}());

