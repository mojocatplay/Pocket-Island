/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */

/*
 * Browser viewport settings.
 */
(function() {
    "use strict";

    wooga.castle.Viewport = {
        getScale: function(){
            var scale = 1 / (window.devicePixelRatio || 1);
            return wooga.castle.capabilities.iPad && (0.5 === scale)? 0.75 : scale;
        },
        setScale: function(to){
            // Instead of copying the whole content here, string replacement could be used instead.
            setTimeout(function(){
                document.querySelector("#viewport").setAttribute("content", "width=device-width, height=device-height, initial-scale=" + to + ", minimum-scale=" + to + ", maximum-scale=" + to + ", user-scalable=no");
            }, 0);
        },
        reset: function(){
            this.setScale(this.getScale());
        },
        getClientSize: function(){
            return {
                width: window.innerWidth,
                height: window.innerHeight
            };
        },
        maximize: function(){
            var self = this;
            setTimeout(function () {
                // This is not a magic number. It's necessary for overflow.
                document.body.style.height = "10000px";
                window.scrollTo(0, 0);
            }, 50);

            setTimeout(function () {
                var clientSize = self.getClientSize();
                document.body.style.width = clientSize.width + "px";
                document.body.style.height = clientSize.height + "px";
            }, 100);
        }
    };

}());
