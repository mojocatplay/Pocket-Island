/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga, buster, assert, refute */

(function() {

    "use strict";

    buster.testCase("wooga.castle.Viewport test case", {
        setUp: function() {
            var head = document.querySelector("head");
            var meta = document.createElement("meta");
            meta.setAttribute("name", "viewport");
            meta.setAttribute("id", "viewport");
            meta.setAttribute("content", "initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no");
            head.appendChild(meta);

            this.vp = wooga.castle.Viewport;

        },

        tearDown: function() {
            var meta = document.getElementById("viewport");
            meta.parentNode.removeChild(meta);
        },

        "test getScale returns a positive number": function () {
            assert.isPositive(this.vp.getScale());
        },

        "test setScale changes the meta tag": function() {
            var clock = this.useFakeTimers();
            this.vp.setScale(5);
            // setScale is asynchronous
            clock.tick(10);
            assert.contains(document.getElementById("viewport").getAttribute("content"), "5");
            clock.restore();
        },

        "test reset method resets the meta tag to the original value returned by getScale()": function() {
            var clock = this.useFakeTimers();
            this.vp.setScale(9);
            clock.tick(10);
            // reset is asynchronous too
            this.vp.reset();
            clock.tick(10);
            refute.contains(document.getElementById("viewport").getAttribute("content"), "9");
            assert.contains(document.getElementById("viewport").getAttribute("content"), this.vp.getScale());
            clock.restore();
        },

        "test getClientSize returns an object with positive numerical properties": function() {
            var size = this.vp.getClientSize();
            assert.isPositive(size.width);
            assert.isPositive(size.height);
        },

        "test maximize sets document body size to the values returned by getClientSize": function() {
            var clock = this.useFakeTimers();
            this.vp.maximize();
            clock.tick(200);
            var targetSize = this.vp.getClientSize();

            var bodyWidth = parseInt(document.body.style.width, 10);
            var bodyHeight = parseInt(document.body.style.height, 10);
            assert.equals(targetSize.width, bodyWidth);
            assert.equals(targetSize.height, bodyHeight);
            clock.restore();
        }
    });

}());