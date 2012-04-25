/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */

(function() {
    "use strict";

    var utils = wooga.castle.utils;

    utils.formatTime = function (msec) {
      var sec, min, h, d;
      if(msec <= 0) {
        return "0:00";
      } else {
        sec = Math.floor(msec/1000);
        if(sec < 60) {
            if(sec < 10) { sec="0"+sec; }
            return '0:'+sec;
        } else {
            min = Math.floor(sec/60);
            sec = sec%60;
            if(sec < 10) { sec="0"+sec; }
            if(min < 60) {
                return min+':'+sec;
            } else {
                h = Math.floor(min/60);
                min = min%60;
                if(min < 10) { min="0"+min; }
                return h+':'+min+':'+sec;
            }
        }
      }
    };

    utils.roundTime = function (msec) {
      var sec, min, h, d;
      if(msec <= 0) {
        return "0sec.";
      } else {
        sec = Math.floor(msec/1000);
        if(sec < 60) {
          return sec+"&thinsp;sec.";
        } else {
          min = Math.floor(sec/60);
          if(min < 60) {
            return min+"&thinsp;min.";
          } else {
            h = Math.floor(min/60);
            if(h < 24) {
              return h+"h";
            } else {
              d = Math.floor(h/24);
              return d+"days";
            }
          }
        }
      }
    };
}());
