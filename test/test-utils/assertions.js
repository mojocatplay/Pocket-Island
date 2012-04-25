/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global buster */


// global shortcuts for all tests
var assert = buster.assertions.assert;
var refute = buster.assertions.refute;


(function() {
    "use strict";
    buster.assertions.add("contains", {
        assert: function(stack, needle) {
            return stack.indexOf(needle) > -1;
        },
        assertMessage: "Expected ${1} to be found in ${0}!",
        refuteMessage: "Expected ${1} to be not found in ${0}!",
        expect: "toContain"
    });


    buster.assertions.add("isPositive", {
        assert: function(number) {
            return !isNaN(number) && number > 0;
        },
        assertMessage: "Expected ${0} to be a positive number.",
        refuteMessage: "Expected ${0} to be not a positive number!",
        expect: "toBePositive"
    });


}());