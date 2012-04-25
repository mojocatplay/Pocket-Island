/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */
(function () {
    "use strict";
    var MigrationRunner = function(user, migrations){
        this.user = user;
        this.migrations = migrations || [];
        this.latestVersion = this.migrations[this.migrations.length - 1].version;
    };

    MigrationRunner.prototype.userHasLatestVersion = function (){
        return this.user.dataVersion === this.latestVersion;
    };

    MigrationRunner.prototype.run = function (cb){
        if(this.userHasLatestVersion()){
            return;
        }

        this.migrations.forEach(function(migration){
            if(this.user.dataVersion >= migration.version){
                return;
            }
            migration.run(this.user);
            if(Number.POSITIVE_INFINITY !== migration.version) {
                this.user.dataVersion = migration.version;
            }
        }, this);
    };

    wooga.castle.MigrationRunner = MigrationRunner;


    wooga.castle.utils.subscribe('have player data', function (message) {
        var migrationRunner = new wooga.castle.MigrationRunner(message.game.playerData, wooga.castle.migrations);
        migrationRunner.run();
    });
}());
