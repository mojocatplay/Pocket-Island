/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga, PhoneGap */
(function() {
    "use strict";
    if (typeof PhoneGap !== "undefined") {
        var LocalNotification = function() {};

        LocalNotification.prototype.add = function(options) {

            var defaults = {
                date: false,
                message: '',
                hasAction: true,
                action: 'View',
                badge: 0,
                id: 0
            };
            var key;
            for (key in defaults) {
                if (defaults.hasOwnProperty(key)) {
                    if (typeof options[key] !== "undefined") {
                        defaults[key] = options[key];
                    }
                }
            }
            if (typeof defaults.date === 'object') {
                defaults.date = Math.round(defaults.date.getTime()/1000);
            }
            PhoneGap.exec("LocalNotification.addNotification", defaults);
        };

        LocalNotification.prototype.cancel = function(id) {
            PhoneGap.exec("LocalNotification.cancelNotification", id);
        };

        LocalNotification.prototype.cancelAll = function(id) {
            PhoneGap.exec("LocalNotification.cancelAllNotifications");
        };

        PhoneGap.addConstructor(function() {
            if(!window.plugins) {
                window.plugins = {};
            }
            window.plugins.localNotification = new LocalNotification();
        });
    }
}());