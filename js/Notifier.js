/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */

(function (wc) {

    "use strict";
    var utils = wc.utils;
    var refs = {};

    function show (message, ch) {


        var root = document.getElementById('game'), hideStr,
            div, channel = 'channel-' + ch;

        if (refs[channel] && refs[channel].div && utils.hasClass(refs[channel].div, channel)) {
            div = refs[channel].div;
            clearTimeout(refs[channel].timeout);
            div.innerHTML = message;
            refs[channel].timeout = setTimeout(refs[channel].fn, 6*1000);
            root.appendChild(div);
        } else {
            refs[channel] = {};
            div = document.createElement('div');
            div.className = 'notification channel-' + ch;
            div.innerHTML = message;
            refs[channel].div = div;

            root.appendChild(div);
            hideStr = 'translate(' + (div.offsetWidth + 20) + 'px, 0)';
            refs[channel].fn = function () {
                if (refs[channel]) {
                    utils.removeOnTransitionEnd(refs[channel].div);
                    refs[channel].div.style.webkitTransform = hideStr;
                    delete refs[channel].fn;
                    delete refs[channel].div;
                    delete refs[channel];
                }
            };
            div.style.webkitTransform = hideStr;
            div.addEventListener('webkitTransitionEnd', function (ev) {
                if (refs[channel]) {
                    refs[channel].timeout = setTimeout(refs[channel].fn, 6*1000);
                }
            }, false);
            div.style.visibility = 'visible';
            window.setTimeout(function () {
                utils.addClass(div, 'ready');
                div.style.webkitTransform = 'translate(0px,0)';
            }, 1);
        }
    }

    wc.Notifier = {
        show: show
    };

}(wooga.castle));
