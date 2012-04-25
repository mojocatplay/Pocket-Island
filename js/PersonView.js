/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true, bitwise:true */
/*global wooga */

(function () {

    "use strict";

    var PersonView = wooga.castle.PersonView = function (person, worldView) {
        this.definition = wooga.castle.entityDefinitions[wooga.castle.Person.DEFINTION_URI];

        this.entity = person;

        this.zIndex = this.definition.zIndex || 0;

        this._worldView = worldView;

        this.width = person.width * wooga.castle.GRID_UNIT;
        this.height = person.height * wooga.castle.GRID_UNIT;

        this.image = this.definition.image;
        this.spriteRatio = 1.3125;

        this.frameWidth = this.image.width / this.definition.animationLength;
        this.frameHeight = this.definition.height * this._worldView.gridUnit * this.spriteRatio;

        this.frameIndex = 0;

        this.color = Math.floor(Math.random() * 1000) % 5;

        this.frameX = 0;
        this.frameY = (this.spriteRatio  * this._worldView.gridUnit)* this.color * 2;


        person.addEventHandler("move", function () {
            this.updatePosition(person, this._worldView);
        }, this);

        person.addEventHandler("update walk direction", function (message) {
           this.updateImage(message.direction);
        }, this);
    };

    PersonView.prototype.updatePosition = function () {
        this.x = (this.entity.x * wooga.castle.GRID_UNIT + this._worldView.mapWidthPx / 2) | 0;
        this.y = (this.entity.y * wooga.castle.GRID_UNIT + this._worldView.mapHeightPx / 2) | 0;
    };

    PersonView.prototype.updateImage = function(walkDirection) {

        switch(walkDirection){
            case wooga.castle.Person.WalkDirection.RIGHT:
                this.frameY = (this._worldView.gridUnit * this.spriteRatio * this.color * 2) + this._worldView.gridUnit * this.spriteRatio;
                break;
            case wooga.castle.Person.WalkDirection.LEFT:
                this.frameY = (this.spriteRatio * this._worldView.gridUnit * this.color * 2);
                break;
        }
    };


    PersonView.prototype.draw = function (ctx, x, y) {
        x += Math.sin(Date.now() / 50);
        y += Math.sin(Date.now() / 50);

        ctx.drawImage(
                this.image,
                this.frameX, this.frameY, this.frameWidth, this.frameHeight,
                x, y, this.width, this.height);
    };

    PersonView.prototype.drawStatic = function () {};
    PersonView.prototype.drawDynamic = function () {};

}());
