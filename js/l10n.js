/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga */
(function () {
    "use strict";
    var utils = wooga.castle.utils,
        l10n = Object.create(null),
        c = function (value) {
            return {
                "value": value,
                "writable": false,
                "enumerable": true,
                "configurable": true
            };
        };

    Object.defineProperty(l10n, "domains", c(Object.create(null)));

    Object.defineProperty(l10n, "domain", c(function (domain, value) {
        l10n.domains[domain] = value;
        return this;
    }));

    Object.defineProperty(l10n, "get", c(function (key) {
        return utils.deep(this.domains, key);
    }));

    Object.defineProperty(l10n, "set", c(function (key, value, domain) {
        domain = domain || "*";
        if(! this.domains[domain]) {
            this.domains[domain] = Object.create(null);
        }
        this.domains[domain][key] = value;
        return this;
    }));

    Object.defineProperty(l10n, "translate", c(function (key, domain) {
        domain = domain || "*";
        if(! this.domains[domain]) {
            return key;
        }
        return this.domains[domain][key] || key;
    }));


    wooga.castle.l10n = l10n;

    window.l = function (key, domain) {
        return l10n.translate(key, domain);
    };

    window.l.set = function () {
        return l10n.set.apply(l10n, arguments);
    };

}());
