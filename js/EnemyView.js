/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */
(function () {
    "use strict";
    var utils = wooga.castle.utils;


    wooga.castle.EnemyView = function (view, entity) {

        wooga.castle.EntityView.call(this, view, entity);

        this.animating = false;
        this.frameIndex = 0;

        this.addEventHandler("touch", this.animatePunch, this);
        entity.addEventHandler("remove", this.remove, this);

        this.enemyDef = entity.definition;

        var gridUnit = this.view.gridUnit;

        this.dyingEnemyDef = this.view.game.entitiesDefinition["enemy/dying"];
        this.dyingEnemyImg = this.dyingEnemyDef.image;
        this.dyingEnemyWidth = this.dyingEnemyDef.width * gridUnit;
        this.dyingEnemyHeight = this.dyingEnemyDef.height * gridUnit;
        this.dyingEnemyOffsetX = (this.width - this.dyingEnemyWidth) / 2;
        this.dyingEnemyOffsetY = (this.height - this.dyingEnemyHeight - this.entity.definition.offsetY * gridUnit) / 2;
    };

    var EnemyView = wooga.castle.EnemyView;

    EnemyView.prototype = new wooga.castle.EntityView();
    EnemyView.prototype.constructor = EnemyView;


    EnemyView.prototype.drawStatic = function (x, y) {
        if (!this.animating) {
            wooga.castle.EntityView.prototype.drawStatic.call(this, x, y);
        }
    };

    EnemyView.prototype.drawDynamic = function (x, y) {
        if (this.animating) {
            this.draw(this.ctx, x, y);
        }
    };

    EnemyView.prototype.getImageFrame = function () {
        if (this.animating) {
            var w = this.width,
                h = this.height,
                frameIndex = this.frameIndex;

            return {
                x: frameIndex * w,
                y: 0,
                width: w,
                height: h
            };
        } else {
            return wooga.castle.EntityView.prototype.getImageFrame.call(this);
        }
    };


    EnemyView.prototype.animatePunch = function () {

        if(! utils.can('punch-enemy', this)){ return; }

        // ensure the enemy is only punched as many times has it has hp left before it dies
        if (this.entity.punchesLeftUntilKill > 0 && !this.animating) {
            --this.entity.punchesLeftUntilKill;
            this.animating = true;
            this.view.bufferCanvasChanges.push(this);

            this.whackAnimation();
        }
    };


    EnemyView.prototype.whackAnimation = function () {
        utils.publish('view:enemy/animation-start');
        // start whack animation
        var animationInterval = setInterval(utils.bind(function () {
            this.frameIndex++;

            // on end of animation
            if (this.frameIndex === this.entity.definition.animation.length) {
                clearInterval(animationInterval);
                this.onWhackAnimationEnd();
            }
        }, this), 1000 / 24);
    };

    EnemyView.prototype.onWhackAnimationEnd = function () {
        this.frameIndex = 0;
        this.entity.collectRewards(this.entity.definition.whackRewards);

        if(this.entity.punchesLeftUntilKill === 0) {
            // extend animation by killAnimation
            this.killAnimation();
        } else {
            // animation ends
            this.animating = false;
            utils.publish('view:enemy/animation-end');
            this.view.bufferCanvasChanges.push(this);
            this.entity.punch();
        }
    };


    EnemyView.prototype.killAnimation = function () {
        // replace sprite by poof img
        this.swapSprites(this.dyingEnemyImg, this.dyingEnemyWidth, this.dyingEnemyHeight, true);

        var animKillInterval = setInterval(utils.bind(function () {
            this.frameIndex++;

            // on end of kill animation
            if (this.frameIndex === this.dyingEnemyDef.animation.length) {
                clearInterval(animKillInterval);
                this.onKillAnimationEnd();
            }
        }, this), 800 / 24);
    };


    EnemyView.prototype.onKillAnimationEnd = function () {
        this.frameIndex = 0;
        this.entity.collectRewards(this.entity.definition.killRewards);
        this.animating = false;
        utils.publish('view:enemy/animation-end');
        this.view.bufferCanvasChanges.push(this);

        // restore enemy img
        var gridUnit = this.view.gridUnit;
        this.swapSprites(this.enemyDef.image, this.enemyDef.width * gridUnit, this.enemyDef.height * gridUnit, false);

        this.entity.punch();
    };


    EnemyView.prototype.swapSprites = function (img, width, height, addOffset) {
        var gridUnit = this.view.gridUnit;
        this.image = img;
        this.width = width;
        this.height = height;

        this.x =  addOffset ? this.x + this.dyingEnemyOffsetX/2 : this.x - this.dyingEnemyOffsetX/2;
        this.y =  addOffset ? this.y + this.dyingEnemyOffsetY/2 : this.y - this.dyingEnemyOffsetY/2;
    };


    EnemyView.prototype.remove = function () {
        this.view.removeEntityView(this);
    };


}());