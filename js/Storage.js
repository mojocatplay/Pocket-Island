/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga, console, $, LocalFileSystem */
(function () {

    "use strict";

    // kind of "interface" for strategy pattern
    wooga.castle.Storage = {

        storageTypes: {},
        config: '',
        path: 'customLocalStorage.txt',

        save: function(key, data) {
            var storage = this.storageTypes[this.config];
            if(storage) {
                storage.save(key, data);
            }
        },

        restore: function(key) {
            var storage = this.storageTypes[this.config];
            if(storage) {
                return storage.restore(key);
            }
        },
        removeItem: function(key) {
            var storage = this.storageTypes[this.config];
            if(storage) {
                storage.removeItem(key);
            }
        },
        clear: function(){
            var storage = this.storageTypes[this.config];
            if(storage) {
                storage.clear();
            }
        }


    };


    // wrapping localStorage
    wooga.castle.Storage.storageTypes.local = {
        save: function(key, data) {
            localStorage[key] = JSON.stringify(data);
        },
        restore: function(key) {
            return localStorage[key];
        },
        removeItem: function(key){
            localStorage.removeItem(key);
        },
        clear: function(){
            localStorage.clear();
        }

    };


    // actual implementation of ios storage
    wooga.castle.Storage.storageTypes.ios = {
        customStorage: {},
        readData: {},

        save: function(key, data) {
            var self = wooga.castle.Storage.storageTypes.ios;
            self.customStorage[key] = data;
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, self.write, self.fail);
        },
        restore: function(key) {
            var self = wooga.castle.Storage.storageTypes.ios;
            var jsonData = self.read();
            return JSON.stringify(self.readData[key]);
        },
        removeItem: function(key) {
            var self = wooga.castle.Storage.storageTypes.ios;
            delete this.customStorage[key];
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, self.write, self.fail);
        },
        clear: function(){
            var self = wooga.castle.Storage.storageTypes.ios;
            this.customStorage = {};
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, self.write, self.fail);
        },

        /*
         * Helper for phonegap file storage
         */
        write: function(fileSystem, file) {
            var self = wooga.castle.Storage.storageTypes.ios;
            fileSystem.root.getFile('customLocalStorage.txt', {create: true},
                    function(fileEntry) {
                        fileEntry.createWriter(
                                function(writer) {
                                    //writer.onwrite = function(evt) {};
                                    writer.write(JSON.stringify(self.customStorage));
                                },
                                self.fail);
                    },
                    self.fail);
        },
        read: function() {
            var self = wooga.castle.Storage.storageTypes.ios;
            var readData = "default";
             $.ajax({ url : '../../Documents/customLocalStorage.txt',
                async: false,
                success : function(data){
                    self.readData = JSON.parse(data);
                }});
        },
        fail: function(error) {
            console.log("sth. went wrong in wooga.castle.Storage");
            console.log(error.code);
        }
    };


}());
