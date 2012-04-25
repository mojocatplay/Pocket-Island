/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */
(function () {

    "use strict";

    var absoluteX, absoluteY;

    var dragStartHandler = function (event) {
        absoluteX = this.scrollLeft - event.x;
        absoluteY = this.scrollTop - event.y;

        this.isScrolling = true;
    };

    var dragHandler = function (event) {
        this.scrollTo(event.x + absoluteX, event.y + absoluteY);
    };

    var dragEndHandler = function (event) {
        this.isScrolling = false;
    };

    wooga.castle.WorldViewScrollabilityMixin = {

        initScrollability: function () {
            this.center();
            this.addEventHandler("dragstart", dragStartHandler, this);
            this.addEventHandler("drag", dragHandler, this);
            this.addEventHandler("dragend", dragEndHandler, this);
        },

        center: function(){
            this.scrollLeft = 0;
            this.scrollTop = Math.round(this.offsetHeight - this.mapHeight*this.gridUnit);
            this.publish('centered', this);
        },

        centerToTile: function(x, y){
            this.scrollTo((this.offsetWidth * 0.5-(this.mapWidth * 0.5 + x) * this.gridUnit),
                          (this.offsetHeight * 0.5-(this.mapHeight * 0.5 + y) * this.gridUnit));
        },

        scrollTo: function (scrollLeft, scrollTop) { // TODO: optimize it a lot!
            if(! this.isDragAllowed) {
                return;
            }

            this.setScrollLeft(Math.round(scrollLeft)).setScrollTop(Math.round(scrollTop));

            this.fireEvent('scrolled', this);

        },

        setScrollLeft: function (scrollLeft) {
            if(! this.isDragAllowed) {
                return;
            }
            var minOffsetX = Math.round(this.canvas.width - this.mapWidth * this.gridUnit),
                maxOffsetX = 0;

            var newOffsetX = scrollLeft;
            if (newOffsetX > maxOffsetX) {
                newOffsetX = maxOffsetX;
            } else if (newOffsetX < minOffsetX) {
                newOffsetX = minOffsetX;
            }

            if (this.offsetWidth < this.mapWidth * this.gridUnit) {
                this.scrollLeft = newOffsetX;
            }

            return this;

        },

        setScrollTop: function (scrollTop) {
            if(! this.isDragAllowed) {
                return;
            }
            var minOffsetY = Math.round(this.canvas.height - this.mapHeight * this.gridUnit),
                maxOffsetY = 0;

            var newOffsetY = scrollTop;
            if (newOffsetY > maxOffsetY) {
                newOffsetY = maxOffsetY;
            } else if (newOffsetY < minOffsetY) {
                newOffsetY = minOffsetY;
            }

            if (this.offsetHeight < this.mapHeight * this.gridUnit) {
                this.scrollTop = newOffsetY;
            }

            return this;

        }
    };

}());
