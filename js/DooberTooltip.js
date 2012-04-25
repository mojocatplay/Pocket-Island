/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */
(function () {
    "use strict";

    var utils = wooga.castle.utils,

    DooberTooltip = function(view, node, name) {
        this.view = view;
        this.name = name;
        this.root = node;
        DooberTooltip._instances[name] = this;

        this.attach();
        this.timeout = null;
    };

    DooberTooltip._instances = {};

    DooberTooltip.get = function ( key ) {
        return DooberTooltip._instances[key];
    };


    DooberTooltip.prototype.attach = function () {
        this.element = document.createElement('div');

        this.element.setAttribute('data-for', this.name);
        utils.addClass(this.element, 'doober-tooltip');
        if('coins' === this.name){
            this.parentElement = document.getElementById('coins');
            this.element.style.width = this.parentElement.offsetWidth + 'px';
        }
        this.root.appendChild(this.element);
    };

    DooberTooltip.prototype.add = function (amount) {
        if(this.busy){
            setTimeout( utils.bind(function(){
                this.add(amount);
            }, this), 300);
            return this;
        }
        if('coins' === this.name){
            this.element.style.width = this.parentElement.offsetWidth + 'px';
        }
        utils.toggleClass(this.element, 'on', true);
        if(this.timeout){
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(utils.bind(this.hide, this), 3000);
        return this;
    };

    DooberTooltip.prototype.hide = function () {
         utils.removeClass(this.element, 'on');
         var that = this;
         this.busy = true;
         setTimeout(function(){
             that.element.innerHTML = '';
             that.busy = false;
         }, 300);
    };

    wooga.castle.DooberTooltip = DooberTooltip;
    wooga.castle.subscribe('game/ready', function (message) {
        var node = document.createElement('div');
        utils.addClass(node, 'doober-tooltips');
        document.getElementById('main-stats').appendChild(node);
        ['coins', 'food', 'level', 'gold-in-goal-sceen'].map(function(name){
            var throwaway = new DooberTooltip(message.worldView, node, name);
        });
    });


}());
