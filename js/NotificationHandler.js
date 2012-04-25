/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */


(function () {

    "use strict";

    var ContractState = wooga.castle.House.ContractState;

    var NotificationHandler = function (game) {

       if (!wooga.castle.isNativeWrapper()) {return;}

        this.game = game;
        this.notificationCandidates = [];
        this.timeFrames = [5*60, 30*60, 5*60*60, 13*60*60, 23.5*60*60, 25*60*60];
        this.filteredNotifs = [];
        this.initFilteredNotifs();


        game.subscribe("contract/start", this.startHandler, this);
        game.subscribe("construction/start", this.startHandler, this);

        wooga.castle.subscribe("game/ready", function (message) {
            if (this.notificationCandidates.length === 0) { // on game startup check if there are existing contracts
                game.entities.forEach(function (entity) {
                    if (this.isAllowed(entity)) {
                        if (entity.contractState === ContractState.STARTED || entity.contractState === ContractState.CONSTRUCTION) {
                            this.addNotifCandidate(entity);
                        }
                    }
                }, this);
                this.filterNotifications();
                this.scheduleIosNotifs(this.filteredNotifs);
            }
        }, this);
    };

    NotificationHandler.prototype.isAllowed = function(entity) {
        return entity.is(['any house', 'farm', 'unlockable']);
    };


    NotificationHandler.prototype.startHandler = function(message) {
        if (!this.isAllowed(message.entity)) { return; }

        setTimeout(wooga.castle.utils.bind(function () { // wait until contract times are set on entity
            this.removeOutdatedNotifs(message);
            this.addNotifCandidate(message.entity);
            this.filterNotifications();
            this.scheduleIosNotifs(this.filteredNotifs);
        }, this), 20);
    };


    NotificationHandler.prototype.initFilteredNotifs = function(){
        var i;
        for (i = 0; i < this.timeFrames.length-1; i++){
            this.filteredNotifs[i] = -1;
        }
    };


    NotificationHandler.prototype.removeOutdatedNotifs = function(message){
        var i,j;
        var now = Date.now();
        for (i = this.notificationCandidates.length - 1; i >= 0; i--) {
            if (this.notificationCandidates[i].date < now){
                this.notificationCandidates.splice(i, 1);
            }
        }

        for (j = 0; j < this.filteredNotifs.length; j++) {
            if (this.filteredNotifs[j] !== -1 && this.filteredNotifs[j].date < now) {
                this.filteredNotifs[j] = -1;
            }
        }
    };


    NotificationHandler.prototype.addNotifCandidate = function(entity){
        var i, old, requiredTime, oldStartTime, newStartTime, timeSpent;

        // update old candidate with new date if new contract started in less than 20% of elapsed time
        for (i = this.notificationCandidates.length - 1; i >= 0; i-- ) {
            old = this.notificationCandidates[i];
            if (entity.definition.name === old.entity.definition.name) {
                if (entity.contractStartTime && entity.contract.requiredTime === old.entity.contract.requiredTime) {
                    requiredTime = entity.contract.requiredTime;
                    newStartTime = entity.contractStartTime;
                } else if (entity.constructionStartTime && entity.contract.constructionTime === old.entity.contract.constructionTime) {
                    requiredTime = entity.contract.constructionTime;
                    newStartTime = entity.constructionStartTime;
                }

                if (newStartTime) {
                    oldStartTime = old.date - requiredTime;
                    timeSpent = Date.now() - oldStartTime;
                    if (timeSpent < requiredTime * 0.2) {
                        old.date = newStartTime + requiredTime;
                        return;
                    }
                }
            }
        }


        // Add new candidate if there are no notifs for that type yet or no old notif has been updated
        var notificationDate = entity.constructionStartTime ?
                                entity.constructionStartTime + entity.contract.constructionTime :
                                entity.contractStartTime + entity.contract.requiredTime;
        this.notificationCandidates.push({
            date: notificationDate,
            entity: entity
        });
    };



    NotificationHandler.prototype.filterNotifications = function(){

        var intervalStart, intervalEnd,
            timeFromNowToNotif,
            i, j;

        for (i = 0; i < this.notificationCandidates.length; i++) {
            timeFromNowToNotif = this.notificationCandidates[i].date - Date.now();

            for (j = 0; j < this.filteredNotifs.length; j++) {
                intervalStart = this.timeFrames[j] * 1000;
                intervalEnd = this.timeFrames[j+1] * 1000;


                if (timeFromNowToNotif > intervalStart && timeFromNowToNotif <= intervalEnd) {
                    if (this.filteredNotifs[j] !== -1) {
                        if (this.filteredNotifs[j].date > this.notificationCandidates[i].date) {
                            this.filteredNotifs[j] = this.notificationCandidates[i];
                        }
                    } else {
                        this.filteredNotifs[j] = this.notificationCandidates[i];
                    }
                    break;
                }
            }
        }
    };


    NotificationHandler.prototype.scheduleIosNotifs = function(notifList){
        var myDate, i, id, msg = '';

        // delete old and create new iOS notificationCandidates
        if (window.plugins && window.plugins.localNotification && window.plugins.localNotification.cancelAll) {
            window.plugins.localNotification.cancelAll();
        }

        for (i = 0; i < notifList.length; i++) {
            if (notifList[i] !== -1) {

                myDate = new Date();
                myDate.setSeconds((new Date()).getSeconds() + Math.round( (notifList[i].date - Date.now()) / 1000 ));

                if (notifList[i].entity.is("any house")) {
                    msg = 'A ' + notifList[i].entity.definition.name.toLowerCase() + ' is waiting for tax collection!';
                }
                if (notifList[i].entity.is("farm")) {
                    msg = 'Your ' + this.game.entitiesDefinition[notifList[i].entity.seedName].name.toLowerCase() +' want to be harvested!';
                }
                if (notifList[i].entity.is("unlockable")) {
                    msg = notifList[i].entity.definition.name + ' is waiting to be revealed!';
                }
                if (notifList[i].entity.is("ship")) {
                    msg = 'The drydock has been repaired!';
                }


                id = (notifList[i].date + i.toString());

                if (window.plugins && window.plugins.localNotification && window.plugins.localNotification.add) {
                    window.plugins.localNotification.add({  date: myDate,
                                                            message: msg,
                                                            badge: 0,
                                                            id: id });
                }
            }
        }
    };


    wooga.castle.NotificationHandler = NotificationHandler;

}());





