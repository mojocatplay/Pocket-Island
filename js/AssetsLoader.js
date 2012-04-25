/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */
(function () {
    "use strict";
    var utils = wooga.castle.utils;

    var AssetsLoader = function (config) {
            this.callback = config.callback;
            this.progressMeter = document.querySelector('#loadingScreen .progress > span');
            this.progressCounter = document.querySelector('#loadingScreen p');
            this.init();
        };

    AssetsLoader.prototype.init = function () {

        if (! AssetsLoader.loaded && document.documentElement.hasAttribute("manifest") && !wooga.castle.capabilities.android) {

//            window.applicationCache.addEventListener('checking', function () { console.log("checking"); }, false);
            window.applicationCache.addEventListener('error', utils.bind(this.onFailure, this), false);
            window.applicationCache.addEventListener('noupdate', utils.bind(this.onSuccess, this), false);
//            window.applicationCache.addEventListener('downloading', utils.bind(this.onDownloading, this), false);
            window.applicationCache.addEventListener('progress', utils.bind(this.onProgress, this), false);
            window.applicationCache.addEventListener('updateready', utils.bind(this.onUpdateReady, this), false);
            window.applicationCache.addEventListener('cached', utils.bind(this.onSuccess, this), false);
            window.applicationCache.addEventListener('obsolete', utils.bind(this.onFailure, this), false);
            this.progressMeter.style.visibility = 'visible';

        } else {
            this.onSuccess();
        }

    };

    var progress = 0;

    var visualizeProgress = function () {
            return progress;
        };

    AssetsLoader.prototype.onProgress = function (ev) {
        var perc = 0;
        if(ev && ev.total){
            perc = Math.floor(ev.loaded / ev.total * 100);
        } else {
            perc = progress;
        }
        this.progressMeter.style.width = ((perc*0.80)+20) + "%"; // Loading Bar starts at 20%
        this.progressCounter.innerHTML = "Loading..." + perc + "%";
        progress += 1;
        if(progress >= 100){
            this.onSuccess();
            this.callback = function(){};
            this.onProgress = function(){};
        }
    };

    AssetsLoader.prototype.onUpdateReady = function () {
        this.progressMeter.innerHTML = "Loading... almost there!";
        try{
            window.applicationCache.swapCache();
            window.location.reload();
        } catch (e) {
            this.progressMeter.innerHTML = "Please reload the page";
            this.progressMeter.addEventListener('click', function(){
                window.location.reload();
            }, false);
        }
    };

    AssetsLoader.prototype.onSuccess = function () {
        document.getElementById('loadingScreen').style.display = "none";
        this.callback();
    };

    AssetsLoader.prototype.onFailure = function () {
        document.getElementById('loadingScreen').style.display = "none"; // TODO: Error message?
        this.callback();
    };

    var hiddenListener = new AssetsLoader({callback: function(){
        AssetsLoader.loaded = true;
    }});

    wooga.castle.AssetsLoader = AssetsLoader;

}());
