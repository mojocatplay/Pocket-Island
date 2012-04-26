/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */

document.addEventListener('DOMContentLoaded', function () {

    "use strict";

    wooga.castle.DEV = wooga.castle.DEV || false;

    function q(id){
        return document.querySelector(id);
    }

    function click(id, cbk){
        var ele = q(id);
        if(ele) {
            ele.addEventListener("click",function(event){
                event.preventDefault();
                event.stopPropagation();
                cbk(event);
                return false;
            },false);
        } else {
            window.alert("id: "+id+" not found");
        }
    }


    click("#dev-menu button.cancel", function(){
        q("#dev-menu").classList.remove('active');
    });

    click("#coins", function(){
        q("#dev-menu").classList.add('active');
    });

    click("button[name=clear_storage]",function(event){
        if(window.confirm("All your progress will be loose. Continue?")){
            wooga.castle.Storage.clear();
            window.location.reload();
        }
    });

    click("button[name=giveme_xp]",function(){
        wooga.castle.xp.addXP(70);
    });

    click("button[name=reload]",function(event){
        window.location.reload();
    });

    click("button[name=activate_fast]",function(event){
        var edk;
        for(edk in wooga.castle.entityDefinitions){
            if (wooga.castle.entityDefinitions.hasOwnProperty(edk)) {
                var entityDefinition = wooga.castle.entityDefinitions[edk];
                if (entityDefinition.contract) {
                    entityDefinition.contract.requiredTime *= 0.0001;
                }
            }
        }
        q("button[name=activate_fast]").disabled =true;

    });

    click("button[name=giveme_money]",function(event){
        wooga.castle.playerData.gold += 10000;
    });

    click("button[name=giveme_food]",function(event){
        wooga.castle.playerData.food += 5000;
    });

    click("button[name=reconnect]",function(event){
        var oldValue = window.cookie;
        var answer = window.prompt("Insert an url WITHOUT the 'http://'", oldValue);
        if(answer){
            window.cookie = answer;
            window.location = "http://"+answer;
        }
    });

    click("button[name=unlock]",function(event){

        wooga.castle.game.entities.filter(function (e) {
            return e.definition['class'] === 'unlockable';
        }).forEach(function (e) {
            e.unlock();
            e.game.removeEntity(e);
            wooga.castle.game.worldView.removeEntityView(e.entityView);
        });

    });
    click("button[name=untree]",function(event){

        wooga.castle.game.entities.filter(function (e) {return (/tree/i).test(e.key);}).forEach(function (t) {
            t.game.removeEntity(t);
            t.entityView.view.removeEntityView(t.entityView);
        });
    });

    document.querySelector('#dev-menu h2').innerHTML = window.wooga.castle.version;

});
