/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga, console */
(function() {
    "use strict";

    // If you want to prevent dragging, uncomment this section
    /*
     function preventBehavior(e)
     {
     e.preventDefault();
     };
     document.addEventListener("touchmove", preventBehavior, false);
     */

    /* If you are supporting your own protocol, the var invokeString will contain any arguments to the app launch.
     see http://iphonedevelopertips.com/cocoa/launching-your-own-application-via-a-custom-url-scheme.html
     for more details -jm */
    /*
     function handleOpenURL(url)
     {
     // TODO: do something with the url passed in.
     }
     */




    /* When this function is called, PhoneGap has been initialized and is ready to roll */
    /* If you are supporting your own protocol, the var invokeString will contain any arguments to the app launch.
     see http://iphonedevelopertips.com/cocoa/launching-your-own-application-via-a-custom-url-scheme.html
     for more details -jm */
    function onDeviceReady() {
        // do your thing!
        //navigator.notification.alert("PhoneGap is working");

        if (wooga.castle.config) {
            wooga.castle.config.wrapperIOS = true;
        }

        var utils = wooga.castle.utils;

        if( window.devicePixelRatio === 2){
            document.querySelector('[name=viewport]').setAttribute('content', "initial-scale=0.5, maximum-scale=0.5, user-scalable=no;");
        }
        if (navigator.userAgent.indexOf('iPad') !== -1){
            utils.addClass(document.body, 'ipad');
        }

        // init orientation
        if (window.orientation === 0 || window.orientation === 180){
            utils.removeClass(document.body, 'landscape');
        } else {
            utils.addClass(document.body, 'landscape');
        }

    }


    window.addEventListener("load", function() {
                                document.addEventListener("deviceready", onDeviceReady, false);
                            }, false);
    window.addEventListener("orientationchange", function(){
                                //wooga.castleIOS.utils.updateOrientation();
                            }, false);


}());
