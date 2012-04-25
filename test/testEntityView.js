/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga, buster, sinon, assert, refute */
(function() {
    "use strict";

    buster.testCase("wooga.castle.EntityView test case", {

        setUp: function() {
            this.ev = new wooga.castle.EntityView();
        },

        "test drawDynamic draws collision grid above the entity when there's a collision after the drop": function() {
            this.ev.dynamic = 1;
            this.ev.isDraggable = true;

            var drawBaseGridStub = sinon.stub(this.ev, "drawBaseGrid");
            var drawStub = sinon.stub(this.ev, "draw");

            this.ev.isCollidingCache = true;

            this.ev.drawDynamic(0, 0);

            assert(drawStub.calledBefore(drawBaseGridStub));
        },

        "test drawDynamic draws collision grid below the entity when there's no collision after the drop": function() {
            this.ev.dynamic = 1;
            this.ev.isDraggable = true;

            var drawBaseGridStub = sinon.stub(this.ev, "drawBaseGrid");
            var drawStub = sinon.stub(this.ev, "draw");

            this.ev.isCollidingCache = false;

            this.ev.drawDynamic(0, 0);

            assert(drawBaseGridStub.calledBefore(drawStub));

        },

        "test isColliding calls Entity.prototype.isColliding with correct parameters and changes collision status": function() {

            wooga.castle.utils.extend(this.ev, {
                x: 5,
                y: 50,
                entity: {
                    x: 15,
                    y: 150,
                    definition: {
                        offsetY: 1
                    },
                    isColliding: function() {}
                },
                view: {
                    gridUnit: 32,
                    mapWidth: 16,
                    mapHeight: 24
                }
            });

            var isCollidingStub = sinon.stub(this.ev.entity, "isColliding");
            isCollidingStub.returns(true);

            this.ev.isColliding();

            var result = {
                x: 5 / 32 - 16 / 2,
                y: 50 / 32 - 24 / 2 - 1
            };

            assert(isCollidingStub.calledWithExactly(result));

            assert(this.ev.isColliding);
        }

    });

}());
