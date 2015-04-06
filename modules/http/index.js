/**
 * @module http
 * @main http
 */


/**
 * # http module
 */

/*global require */

/**
 * ## exports
 */
(function() {
    "use strict";

    decaf.extend(exports, {
        createServer: require('./lib/Server').createServer,
        methods: require('./lib/Methods').methods,
        Child: require('./lib/Child'),
        Request: require('./lib/Request'),
        Response: require('./lib/Response'),
        WebSocket: require('./lib/WebSocket').WebSocket,
		Json: require('./lib/Json').Json,
        GZIP: require('./lib/GZIP').GZIP,
        Client: require('./lib/Client').Client
    });

}());
