/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */
(function () {
    "use strict";
    var utils = wooga.castle.utils;
    utils.can('have goal icon', utils.disabler);

    var GoalsDrawer = function (manager){
        this.manager = manager;
        this.build();
    };


    GoalsDrawer.prototype.build = function () {
        var div = document.getElementById('goals-drawer');
        if(!div ){
            div = document.createElement('div');
            div.id = 'goals-drawer';
            this.manager.rootNode.appendChild(div);
        }
        this.element = div;
        this.buildIcons();
        utils.can.remove('have goal icon', utils.disabler);
    };


    GoalsDrawer.prototype.buildIcons = function () {
        var icon = this._readyIcon();
        this.manager.lines.map(function (line) {
            this.buildIcon(line, icon);
        }, this);
    };

    GoalsDrawer.prototype._readyIcon = function () {
        var icon = document.createElement('a');
        icon.className = 'goalIcon';
        var figure = document.createElement('figure');
        icon.appendChild(figure);
        return icon;
    };

    GoalsDrawer.prototype.buildIcon = function (line, icon) {
        var that = this;
        icon = icon? icon.cloneNode(true) : this._readyIcon();
        icon.setAttribute('data-line-id', line.line.id);
        line.icon = icon;
        line.updateIcon = function () {
            var src = this.getGoalIcon();
            if(this.icon) {
                this.icon.firstChild.style.background = 'url(' + src + ') 50% 50% no-repeat';
                this.icon.className = 'goalIcon';
            }
        };
        line.updateIcon();
        icon.addEventListener('click', function ( ev ) {
            that.manager.hide();
            line.show();
        }, false);
        that.element.appendChild(icon);
    };


    GoalsDrawer.prototype.show = function () {
    };

    GoalsDrawer.prototype.hide = function () {
    };

    wooga.castle.GoalsDrawer = GoalsDrawer;

}());
