/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */
// this file knows all .. so the individual modules don't have to
(function (wc) {
    "use strict";
    var utils = wc.utils,
        switches = {},
        ExitFlasherMixin = {};


    ExitFlasherMixin._grabAttention = function (callback, scope) {
        /* this mixing is to be used on screens, which all have this.element or rootNode set  */
        var el = this.element || this.node,
            className = 'grab-attention';
        utils.addClass(el, className);
        window.setTimeout(function () {
            utils.removeClass(el, className);
            if (callback) {
                callback.call(scope);
            }
        }, 3000);
        return this;
    };

    ExitFlasherMixin._setAttentionGrabberTimeout = function () {
        var el = this.element || this.node,
            handler = {handleEvent: utils.bind(function (ev) {
                this._setAttentionGrabberTimeout();
            }, this)};
        if (!this._shaker) {
            this._shaker = utils.bind(function () {
                this._grabAttention(this._setAttentionGrabberTimeout, this);
            }, this);
            el.addEventListener('click', handler, true);
            el.addEventListener('touchstart', handler, true);
        }
        this._clearAttentionGrabberTimeout()._shaker_timeout = window.setTimeout(this._shaker, 7000);

        return this;
    };

    ExitFlasherMixin._clearAttentionGrabberTimeout = function () {
        if (this._shaker_timeout) {
            window.clearTimeout(this._shaker_timeout);
        }
        return this;
    };

    utils.mixin(wc.GoalScreen, ExitFlasherMixin);
    utils.mixin(wc.Shop, ExitFlasherMixin);
    utils.mixin(wc.CastleCompleteScreen, ExitFlasherMixin);


    utils.subscribe('game/ready', function (message) {
        if (wc.playerData.doneTutorial) {
            [].forEach.call(document.querySelectorAll('.comic, .intro'), function (element) {
                if (element && element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            });
        }
        utils.subscribe('game:moveMode/activated', function () {
            this.inMoveMode = true;
        }, switches);
        utils.subscribe('game:moveMode/deactivated', function () {
            this.inMoveMode = false;
        }, switches);
        utils.subscribe('view:goals/show', function (message) {
            message.screen._setAttentionGrabberTimeout();
        });
        utils.subscribe('view:goals/close', function (message) {
            message.screen._clearAttentionGrabberTimeout();
        });
        utils.subscribe('view:shop/visible', function (message) {
            message.shop._setAttentionGrabberTimeout();
        });
        utils.subscribe('view:shop/hidden', function (message) {
            message.shop._clearAttentionGrabberTimeout();
        });
        utils.subscribe('view:castle-upgrade/show', function (message) {
            message.screen._setAttentionGrabberTimeout();
        });
        utils.subscribe('view:castle-upgrade/hide', function (message) {
            message.screen._clearAttentionGrabberTimeout();
        });

    });

    //dummy
}(wooga.castle));
