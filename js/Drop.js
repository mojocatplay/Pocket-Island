/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */
(function (wc) {
    "use strict";
    var Drop = function (config) {
        this.message = {
            item: config.item,
            entityView: config.entityView,
            element: null,
            drop: this
        };
        wc.utils.publish('house/drop', this.message);
        wc.playerData.collectedItems.push(config.item);
        wc.utils.publish('request save');
        this.config = config;
        this.item = config.item;
        setTimeout(this.message.element._click, 10 * 1000);
        wc.utils.subscribe('game:drydock/started-stage-repair', function (message) {
            if (message.entity.definition.requiredItem === this.item) {
                this.message.element._click();
            }
        }, this);
    };


    wc.utils.subscribe('game/ready', function () {

        wc.utils.subscribe('game:contract/collect', function (message) {
            if (!message.entity.is('statichouse')) {
                return;
            }
            var requiredItem = {
                    item: message.entity.definition.drops,
                    entity: message.entity
                },
                drop;
            wc.utils.publish('game:drydock/get required item', requiredItem);
            if (requiredItem.item && wc.playerData.collectedItems.indexOf(requiredItem.item) === -1) {
                drop = new Drop({
                    item: requiredItem.item,
                    entityView: message.entityView,
                    entity: message.entity
                });
            }

        });
    });


    wc.Drop = Drop;
}(wooga.castle));
