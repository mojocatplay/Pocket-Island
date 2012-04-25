/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true, forin:true */
/*global wooga, alert, console */

var wooga = wooga || {};
wooga.castle = wooga.castle || {};
wooga.castle.config = wooga.castle.config || {};


(function () {

    "use strict";

    var DRAG_THRESHOLD = 25 * (window.devicePixelRatio || 1);

    var utils = {};

    utils.urlFor = function (path) {
        var manifest = wooga.castle.config.manifest;
        return manifest ? manifest[path] : path;
    };

    /**
     * @param subPath path relative to images/entities-XX/
     */
    utils.urlForEntityImage = function (subPath) {
        return utils.urlFor(wooga.castle.IMAGES_BASE_URL + subPath);
    };

    utils.bind = function (fn, scope) {
        return function () {
            fn.apply(scope, arguments);
        };
    };

    utils.mixin = function (constructor, mixin) {
        var property;
        for (property in mixin) {
            if (mixin.hasOwnProperty(property)) {
                constructor.prototype[property] = mixin[property];
            }
        }
    };

    utils.extend = function (obj) {
        Array.prototype.slice.call(arguments, 1).forEach(function (extObj) {
            var property;
            for (property in extObj) {
                // This "for in" loop is not filtered with hasOwnProperty to allow multi-level inheritance.
                // jslint has been informed by setting forin:true. Keep it only in this file.
                obj[property] = extObj[property];
            }
        });

        return obj;
    };

    utils.pushIfUnique = function(array, elements) {
        elements.forEach(function (element) {
            if (array.indexOf(element) < 0) {
                array.push(element);
            }
        });
    };

    utils.PubSubMixin = {

        subscribe: function (channel, subscriber, scope) {

            if (typeof this._PubSubBroker_subscribers === "undefined") {
                this._PubSubBroker_subscribers = {};
            }

            var subscribers = this._PubSubBroker_subscribers;

            if (typeof subscribers[channel] === "undefined") {
                subscribers[channel] = [];
            }

            subscribers[channel].push({
                fn: subscriber,
                scope: scope || this
            });

        },

        publish: function (channel, message) {

            var subscribers = this._PubSubBroker_subscribers;
            if (message) {
                message._channel = channel;
            }

            if (typeof subscribers !== "undefined") {

                var channels = Object.keys(subscribers).filter(function (key) {
                        return key[key.length - 1] === "/" ? channel.indexOf(key) === 0 : channel === key;
                    });

                channels.forEach(function (channel) {
                    subscribers[channel].forEach(function (subscriber) {
                        subscriber.fn.call(subscriber.scope, message);
                    });
                });

            }

        },

        unsubscribe: function ( channel, subscriber, scope ) {

            var subscribers = this._PubSubBroker_subscribers || {};

            if (typeof subscribers[channel] !== "undefined") {
                scope = scope||this;
                subscribers[channel] = subscribers[channel].filter(function (sub) {
                    return !(sub.fn === subscriber && scope === sub.scope);
                });
            }

        }


    };


    utils.ObservableMixin = {

        addEventHandler: function (type, handler, scope) {

            var handlers = this._Observable_handlers = this._Observable_handlers || {};

            handlers[type] = handlers[type] || [];

            handlers[type].push({
                fn: handler,
                scope: scope || this
            });

        },

        removeEventHandler: function (type, handler, scope) {

            scope = scope || this;

            var handlers = this._Observable_handlers;

            if (handlers && handlers[type]) {

                handlers[type] = handlers[type].filter(function (h) {
                    return (h.fn !== handler) || (h.scope !== scope);
                });

            }

        },

        fireEvent: function (type, data) {

            data = data || {};
            data.target = data.target || this;

            var stopPropagation = false;

            var handlers = this._Observable_handlers;
            if (handlers && handlers[type]) {
                handlers[type].forEach(function (handler) {
                    if (handler.fn.call(handler.scope, data) === false) {
                        stopPropagation = true;
                    }
                });
            }

            if (this.eventsBubbleTarget && !stopPropagation) {
                this.eventsBubbleTarget.fireEvent(type, data);
            }

        }

    };

    utils.Deferred = (function () {

        var Deferred = function () {
                this.state = Deferred.State.PENDING;
                this.callbacks = [];
                this.errbacks = [];
            };

        Deferred.State = {
            SUCCESS: 1,
            PENDING: 0,
            FAILURE: -1
        };

        Deferred.prototype.addCallback = function (fn, scope) {
            if (this.state === Deferred.State.PENDING) {

                this.callbacks.push({
                    fn: fn,
                    scope: scope
                });

            } else if (this.state === Deferred.State.SUCCESS) {

                fn.apply(scope, this.result);

            }

            return this;
        };

        Deferred.prototype.addErrback = function (fn, scope) {
            if (this.state === Deferred.State.PENDING) {

                this.errbacks.push({
                    fn: fn,
                    scope: scope
                });

            } else if (this.state === Deferred.State.FAILURE) {

                fn.apply(scope, this.result);

            }

            return this;
        };

        Deferred.prototype.callback = function () {
            if (this.state === Deferred.State.PENDING) {

                this.state = Deferred.State.SUCCESS;
                this.result = Array.prototype.slice.call(arguments);

                while (this.callbacks.length) {
                    var callback = this.callbacks.shift();
                    callback.fn.apply(callback.scope, this.result);
                }
            }
        };

        Deferred.prototype.errback = function () {
            if (this.state === Deferred.State.PENDING) {

                this.state = Deferred.State.FAILURE;
                this.result = Array.prototype.slice.call(arguments);

                while (this.errbacks.length) {
                    var errback = this.errbacks.shift();
                    errback.fn.apply(errback.scope, this.result);
                }
            }
        };

        return Deferred;

    }());


    var clickBuster = {

            TIMEOUT: 750,

            coordinates: [],

            preventGhostClick: function (x, y) {
                clickBuster.coordinates.push(x, y);
                window.setTimeout(clickBuster.pop, clickBuster.TIMEOUT);
            },

            pop: function () {
                clickBuster.coordinates.splice(0, 2);
            },

            onClick: function (event) {
                var i, x, y;
                for (i = 0; i < clickBuster.coordinates.length; i += 2) {
                    x = clickBuster.coordinates[i];
                    y = clickBuster.coordinates[i + 1];
                    if (Math.abs(event.clientX - x) < DRAG_THRESHOLD && Math.abs(event.clientY - y) < DRAG_THRESHOLD) {
                        event.stopPropagation();
                        event.preventDefault();
                    }
                }
            }

        };

    utils.clickBuster = clickBuster;

    document.addEventListener('click', clickBuster.onClick, true);

    utils.addTouchHandler = function (element, handler, scope) {

        var startX, startY;

        var reset, onClick, onTouchStart, onTouchMove;

        reset = function () {
            element.removeEventListener("touchend", onClick, false);
            document.body.removeEventListener("touchmove", onTouchMove, false);
        };

        onClick = function (event) {

            event.stopPropagation();

            reset();

            handler.call(scope || this, event);

            if (event.type === "touchend" ) {
                clickBuster.preventGhostClick(startX, startY);
            }

        };


        onTouchStart = function (event) {

            event.stopPropagation(); // It was commented out to allow dragging the map when touching contract icons. Possible source of problems, but if none found - remove this comment

            element.addEventListener("touchend", onClick, false);
            document.body.addEventListener("touchmove", onTouchMove, false);

            startX = event.touches[0].clientX;
            startY = event.touches[0].clientY;

        };

        onTouchMove = function (event) {
            if (Math.abs(event.touches[0].clientX - startX) > DRAG_THRESHOLD ||
                    Math.abs(event.touches[0].clientY - startY) > DRAG_THRESHOLD) {
                reset();
            }
        };


        element.addEventListener("touchstart", onTouchStart, false);
        element.addEventListener("click", onClick, true);

    };

    utils.addLongTouchHandler = function (element, handler, scope) {

        var timeout = null;
        var clearFn = function () {
            if (timeout) {
                clearTimeout(timeout);
            }
        };
        element.addEventListener('touchstart', function (ev) {
            timeout = window.setTimeout(function () {
                handler.call(scope, ev);
            }, 950);
        }, false);

        ['touchend', 'touchmove'].forEach(function (eventName) {
            element.addEventListener(eventName, clearFn, false);
        });
        return utils;

    };

    utils.enableScrollability = function (element) {

        var startTouchY = 0, startTouchX;
        var contentOffsetY, contentStartOffsetY;
        var _isDragging, mouseDown;


        var animateTo = function (offsetY) {
            contentOffsetY = offsetY;
            element.style.webkitTransform = "translate3d(0, " + offsetY + "px ,0)";
        };

        var snapToBounds = function () {

            var minY = element.offsetParent.offsetHeight - element.scrollHeight,
                maxY = 0;

            var newY;
            if(minY > 0) {
                newY = 0;
            } else {
                if (contentOffsetY > maxY) {
                    newY = maxY;
                } else if (contentOffsetY < minY) {
                    newY = minY;
                } else {
                    newY = contentOffsetY;
                }
            }

            animateTo(newY);

        };


        var isDragging = function (event) {
            var ev = event.touches ? event.touches[0] : event;
            _isDragging = Math.abs(ev.clientY - startTouchY);

            return utils.can('scroll element', element) && _isDragging > DRAG_THRESHOLD;
        };

        var onTouchStart = function (event) {
            var ev = event.touches ? event.touches[0] : event;
            startTouchX = ev.clientX;
            startTouchY = ev.clientY;
            contentStartOffsetY = contentOffsetY;

            _isDragging = false;
            mouseDown = true;
        };

        var onTouchMove = function (event) {
            if (!mouseDown) {
                return;
            }
            var ev = event.touches ? event.touches[0] : event;
                if (_isDragging || isDragging(ev)) {
                    animateTo(contentStartOffsetY + ev.clientY - startTouchY);
                }
            };

        var onTouchEnd = function () {
                if (_isDragging) {
                    snapToBounds();

                    utils.clickBuster.preventGhostClick(startTouchX, startTouchY);
                }
                mouseDown = false;
            };



        var mouse = wooga.castle.capabilities.desktop;
        element.addEventListener(mouse ? "mousedown" : "touchstart", onTouchStart, false);
        element.addEventListener(mouse ? "mousemove" : "touchmove", onTouchMove, false);
        element.addEventListener(mouse ? "mouseup" : "trouchend", onTouchEnd, false);

        animateTo(0);
        element.setAttribute('data-scrollability-enabled', 'true');

        return {
            "animateTo": animateTo,
            "element": element
        };


    };

    // TODO: combine this with enableScrollability

    utils.enableScrollabilityX = function (element, is_X) {

        is_X = true;

        var startTouchY = 0, startTouchX = 0;
        var contentOffsetDir, contentStartOffsetDir = 0;
        var _isDragging, mouseDown;

        var animateTo = function (offsetDir) {
            contentOffsetDir = offsetDir;
            if(is_X) {
                element.style.webkitTransform = "translate3d(" + offsetDir + "px, 0 ,0)";
            } else {
                element.style.webkitTransform = "translate3d(0, " + offsetDir + "px,0)";
            }
        };


        var snapToBounds = function () {
            var minX = element.offsetParent.offsetWidth - element.scrollWidth,
                minY = element.offsetParent.offsetHeight - element.scrollHeight,
                maxX = 0,
                maxY = 0;

            var newDir;
            if(is_X) {
                if(minX > 0) {
                    newDir = 0;
                } else {
                    if (contentOffsetDir > maxX) {
                        newDir = maxX;
                    } else if (contentOffsetDir < minX) {
                        newDir = minX;
                    } else {
                        newDir = contentOffsetDir;
                    }
                }
            } else {
                if(minY > 0) {
                    newDir = 0;
                } else {
                    if (contentOffsetDir > maxY) {
                        newDir = maxY;
                    } else if (contentOffsetDir < minY) {
                        newDir = minY;
                    } else {
                        newDir = contentOffsetDir;
                    }
                }
            }
            animateTo(newDir);

        };

        var isDragging = function (event) {
            var ev = event.touches ? event.touches[0] : event;
            _isDragging = is_X ? Math.abs(ev.clientX - startTouchX) : _isDragging = Math.abs(ev.clientY - startTouchY);
            return utils.can('scrollX element', element) && _isDragging > DRAG_THRESHOLD;
        };


        var onTouchStart = function (event) {
            var ev = event.touches ? event.touches[0] : event;
                startTouchX = ev.clientX;
                startTouchY = ev.clientY;
                contentStartOffsetDir = contentOffsetDir;

                _isDragging = false;
                mouseDown = true;
            };

        var onTouchMove = function (event) {
            if (!mouseDown) {
                return;
            }
            var ev = event.touches ? event.touches[0] : event;
            if (_isDragging || isDragging(ev)) {
                if(is_X) {
                    animateTo(contentStartOffsetDir + ev.clientX - startTouchX);
                } else {
                    animateTo(contentStartOffsetDir + ev.clientY - startTouchY);
                }
            }
            };

        var onTouchEnd = function () {
                if (_isDragging) {
                    snapToBounds();

                    utils.clickBuster.preventGhostClick(startTouchX, startTouchY);
                }
                mouseDown = false;
            };


        var mouse = wooga.castle.capabilities.desktop;
        element.addEventListener(mouse ? "mousedown" : "touchstart", onTouchStart, false);
        element.addEventListener(mouse ? "mousemove" : "touchmove", onTouchMove, false);
        element.addEventListener(mouse ? "mouseup" : "trouchend", onTouchEnd, false);

        animateTo(0);

    };

    utils.escapeForRegex = function escapeForRegex(text) {
        if (!escapeForRegex.specialsRE) {
            var specials = [
              '/', '.', '*', '+', '?', '|',
              '(', ')', '[', ']', '{', '}', '\\'
            ];
            escapeForRegex.specialsRE = new RegExp(
              '(\\' + specials.join('|\\') + ')', 'g'
            );
          }
          return text.replace(escapeForRegex.specialsRE, '\\$1');
    };

    utils.addClass = function (elem, className) {
        utils.removeClass(elem, className).className += ' ' + className;
        return elem;
    };

    utils.removeClass = function (elem, className) {
        var escapedClassNames = [];
        className.split(/\s+/g).forEach(function (_className) {
            escapedClassNames.push(utils.escapeForRegex(_className));
        });
        if(elem.className) {
          elem.className = elem.className.replace(new RegExp('\\b' + escapedClassNames.join('|') + '\\b', 'g'), '').replace(/^\s|\s$/g, '');
        }
        return elem;
    };

    utils.hasClass = function (elem, className) {
        return elem.className.match(new RegExp('\\b' + utils.escapeForRegex(className) + '\\b', 'g'));
    };

    utils.toggleClass = function (elem, className, toggle) {
        if (typeof toggle === "undefined") {
            toggle = !utils.hasClass(elem, className);
        }

        if(toggle) {
            utils.addClass(elem, className);
        } else {
            utils.removeClass(elem, className);
        }
        return elem;
    };


    wooga.notify = utils.notify = function (message, channel) {
        wooga.castle.Notifier.show(message, channel);
    };

    wooga.yesno = function (message, yes, no, title) {
        yes = yes || function () {};
        no = no || function () {};

        if (navigator.notification && navigator.notification.confirm) {
            navigator.notification.confirm(message, function(buttonIndex) {
                (buttonIndex === 2 ? yes : no)();
            }, title, "Cancel,OK");
        } else {
            (window.confirm(message) ? yes : no)();
        }
    };

    utils.sign = function (number) {
        return number ? ( number < 0 ? String(number) : '+' + number ) : "0";
    };
    utils.getPublisher = function (name) {
        var publisher = wooga.castle;
        switch(name) {
            case "game":
                publisher = wooga.castle.Game.instance();
                break;
            case "view":
                publisher = wooga.castle.Game.instance().worldView;
                break;
        }
        return publisher;
    };

    utils.isArray = function (obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    };

    utils.offset = function (el) {
        var left = 0, top = 0;
        do{
            left += el.offsetLeft||0;
            top += el.offsetTop||0;
        } while( (el = el.parentNode) !== null );
        return {"left": left, "top": top};
    };

    utils.isVisible = function (el) {
        return el.clientHeight && el.clientWidth;
    };

    utils.deep = function (obj, key) {
        var result = obj||0, subs = key.split('.'), i = 0;
        do{
            result = result[subs[i]];
        } while( ++i < subs.length && typeof result !== "undefined");
        return result;
    };

    utils.can = function (action, argument) {
        return utils.can[typeof argument === "function" ? "add" : "answer"](action, argument);
    };

    utils.can.add = function (action, filter) {
        var filters = utils.can._[action] || [];
        if(-1 === filters.indexOf(filter)) {
            filters.push(filter);
        }
        utils.can._[action] = filters;
        utils.when(action);
        return utils.can;
    };

    utils.can.remove = function (action, filter) {
        var filters = utils.can._[action] || [];
        filters = filters.filter(function (fn) {
            return fn !== filter;
        });
        utils.can._[action] = filters;
        utils.when(action);
        return utils.can;
    };

    utils.can.answer = function (action, message) {
        message = message || {};
        message._action = message._action || action;
        if("*" !== action && !utils.can('*', message)) {
            return false;
        }
        var filters = utils.can._[action]||[], l = filters.length, fn;
        while(l--) {
            fn = filters[l];
            if( typeof fn === "function" ) {
                if(false === fn(message)) {
                    return false;
                }
            }
        }
        return true;
    };

    utils.can._ = {};

    utils.when = function (can, callback) {
        utils.when._[can] = utils.when._[can] || [];
        var listeners = utils.when._[can];
        if('function' === typeof callback) {
            listeners.push(callback);
            utils.when(can);
        } else if(listeners.length && utils.can(can)) {
             utils.when._[can] = listeners.filter(function (listener) {
                listener({_action:can});
                return false;
            });
        }
        return utils;
    };

    utils.when._ = {};




    utils.oprop = function (proto, name, value) {
        Object.defineProperty(proto, name, {
                "value": value,
                "writable": true,
                "enumerable": true,
                "configurable": true
        });
    };

    utils.parents = function (el, selector) {
        return el.parentNode ? (
            (-1 !== Array.prototype.indexOf.call(el.parentNode.querySelectorAll(selector), el)) ? el : utils.parents(el.parentNode, selector)
        ) : null;
    };

    utils.removeOnAnimationEnd = function(element, callback, scope){
        return utils.removeOnEvent('webkitAnimationEnd', element, callback, scope);
    };

    utils.removeOnTransitionEnd = function(element, callback, scope){
        return utils.removeOnEvent('webkitTransitionEnd', element, callback, scope);
    };

    utils.removeOnEvent = function (event, element, callback, scope) {
        var fn = callback,
            thisObject = scope,
            el = element;
        callback = scope = element = null;
        if (el) {
            el.addEventListener(event, function(ev){
                if(ev.target === el && el.parentNode){
                    el.parentNode.removeChild(el);
                    if(typeof fn === "function"){
                        fn.call(thisObject, el);
                    }
                }
            }, false);
        }
        return el;
    };

    utils.attachRemoteConsole = function(host){
        var weinre = document.createElement('script');
        weinre.type = 'text/javascript';
        weinre.src = 'http://' + host + '/target/target-script-min.js#anonymous';
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(weinre, s);
    };

    utils['extends'] = function (child, Parent) {
        try{
            child.prototype = new Parent();
            child.prototype.constructor = child;
            child.prototype.parent = Parent;
        } catch (e) {
            child.prototype = utils.extend(child.prototype, Parent.prototype, {
                constructor: child,
                parent: Parent
            });
        } finally {
            return child;
        }
    };

    utils.publish = function (message, data) {
        var publisher = wooga.castle, parts, delimiter = ':';
        if( -1 !== message.indexOf(delimiter)){
            parts = message.split(delimiter);
            publisher = utils.getPublisher(parts[0])||publisher;
            message = parts[1];
        }
        publisher.publish(message, data);
        return this;
    };

    utils.subscribe = function (message, subscriber, scope) {
        var publisher = wooga.castle, parts, delimiter = ':';
        if( -1 !== message.indexOf(delimiter)){
            parts = message.split(delimiter);
            publisher = utils.getPublisher(parts[0])||publisher;
            message = parts[1];
        }
        publisher.subscribe(message, subscriber, scope);
        return this;
    };

    utils.unsubscribe = function (message, subscriber, scope) {
        var publisher = wooga.castle, parts, delimiter = ':';
        if( -1 !== message.indexOf(delimiter)){
            parts = message.split(delimiter);
            publisher = utils.getPublisher(parts[0])||publisher;
            message = parts[1];
        }
        publisher.unsubscribe(message, subscriber, scope);
        return this;
    };


    utils.isSPA = function () {
        return window.navigator.standalone || wooga.castle.isNativeWrapper();
    };


    utils.getElementTop = function (node) {
        var top = 0;
        while (node.offsetParent) {
            top += node.offsetTop;
            node = node.offsetParent;
        }
        return top - wooga.castle.game.worldView.scrollTop;
    };


    utils.getElementLeft = function (node) {
        var left = 0;
        while (node.offsetParent) {
            left += node.offsetLeft;
            node = node.offsetParent;
        }
        return left - wooga.castle.game.worldView.scrollLeft;
    };

    utils.disabler = function () {
        return false;
    };

    utils.getEntityImageUrl = function (entityKey) {
        return utils.urlForEntityImage((wooga.castle.entityDefinitions[entityKey] || 0).url);
    };

    utils.goldDelta = function (cost) {
        return Math.abs(cost - wooga.castle.playerData.gold);
    };

    utils.goldDeltaMessage = function (originalCost, desiredAction) {
        return 'You need ' + utils.goldDelta(originalCost) + ' more gold to ' + (desiredAction || 'do that');
    };


    wooga.castle.utils = utils;

}());
