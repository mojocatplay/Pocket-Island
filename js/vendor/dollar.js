(function (window, undefined) {

    var dollar = {};

    dollar.ajax = function (options) {

        var http = new XMLHttpRequest(), formData = null, i;

        options.error = options.error||function () {};

        http.onreadystatechange = function () {

            if(http.readyState == 4) {
                if(options.dataType && ("" + options.dataType).toLowerCase() === "json") {
                    try{
                        options.success(JSON.parse(this.responseText));
                    } catch (e) {
                        options.error(e);
                    }
                } else {
                    options.success(this.responseText);
                }
            }
        };

        http.onerror = function () {
         //   wooga.log('there was an error processing the request');
         //   wooga.log(arguments);
        };
        if(options.data) {
            formData = [];
            for(i in options.data) {
                formData.push( encodeURIComponent(i) + '=' +  encodeURIComponent(options.data[i]));
            }
            formData = formData.join('&');
        }

        http.open(options.type || 'GET', options.url, undefined !== options.async ? options.async : true);
        http.setRequestHeader('content-type', options.contentType ? options.contentType : 'application/x-www-form-urlencoded');
        http.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        http.send(formData);
    };

    window.$ = dollar;

})(window);
