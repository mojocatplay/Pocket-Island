/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga, EJS, console */
(function () {
    "use strict";
    var utils = wooga.castle.utils;

    var net = Object.create(null);

    net.json = function (url, data, type) {

        if (typeof data === "object") {
            data = JSON.stringify(data);
        }

        var result = new utils.Deferred();

        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status < 400 && xhr.status !== 0) {
                    try{
                    result.callback({
                        data: xhr.responseText ? JSON.parse(xhr.responseText.replace(/^POST\{/, '{')) : null
                    });}
                    catch( e ) {
                        console.log(url);
                        console.log(xhr.responseText);
                        result.callback({data: null});
                    }
                } else {
                    result.errback({
                        data: xhr.status,
                        xhr: xhr
                    });
                }
            }
        };

        xhr.open(type, url);

        xhr.setRequestHeader("Content-Type", "application/json");

        // we need this header to authenticated with the server
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.send(data);

        return result;
    };

    net.deleteJSON = function (url, data){
        return net.json(url, data, "DELETE");
    };

    net.postJSON = function (url, data) {
        return net.json(url, data, 'POST');
    };

    net.putJSON = function (url, data) {
        return net.json(url, data, "PUT");
    };

    net.getJSON = function (url, isAsync) {
        if(typeof isAsync === 'undefined'){
            isAsync = true;
        }

        var result = new utils.Deferred(),
            xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status < 400) {
                    try{
                    result.callback({
                        data: JSON.parse(xhr.responseText)
                    });}
                    catch(e){console.log(74);}
                } else {
                    result.errback();
                }
            }
        };

        xhr.open('GET', url, isAsync);

        xhr.send();


        return result;

    };

    net.getCached = function(url){
        var result = new utils.Deferred();

        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status < 400) {
                    result.callback({
                        data: xhr.responseText
                    });
                } else {
                    result.errback();
                }
            }
        };

        xhr.open('GET', url);

        xhr.send();

        return result;
    };

    net.get = function (url) {
        return net.getCached(url);
    };
    net.getTemplate = function (url){
        var request = net.getCached(url);
        request.addCallback(function(response){
            response.data = (new EJS({text: response.data})).render({
                urlFor: utils.urlFor
            });
        });
        return request;
    };

    wooga.castle.net = net;

}());
