/**
 * # HTTP Server
 *
 * @module http
 * @submodule Server
 */
/** @private */
/*global require, java, io */
"use strict";

global.io = global.io || 'net';

var Child   = require('Child').Child,
    Thread  = require('Threads').Thread,
    Socket  = require(io).Socket,
    process = require('process');

/**
 * ## new Server(func) : server
 *
 * Construct a new HTTP server, calling the given function for each request.
 *
 * ### Arguments:
 * {function} func - the function to be called for each request
 *
 * func has the following signature:
 * ```func(req, res)```
 * - {Request} req - request Object
 * - {Respnose} res - response Object
 *
 * @constructor
 *
 * @param func
 */
function Server( func ) {
    this.fn = func;
    this.webSockets = {};
}
/** @private */
decaf.extend(Server.prototype, {
    /**
     * ## server.listen(port, bindAddress, numChildren) : chainable
     *
     * Start the http server running, listening on the spedified port and IP address, with the given umber of Child threads spawned.
     *
     * ### Arguments:
     * - {number} port - the port to listen on, e.g. 80, 8080, 9090, etc.
     * - {string} bindAddress - IP address to listen on, '127.0.0.1' for localhost, '0.0.0.0' for ANY.
     * - {number} numChildren - optional number of Child threads to spawn.  Defaults to 50.
     *
     * @memberOf http.Server
     * @method listen
     * @param port
     * @param bindAddress
     * @param numChildren
     * @return {*}
     */
    listen    : function ( port, bindAddress, numChildren ) {
        numChildren = numChildren || 50;
        try {
            var serverSocket = new Socket();
            serverSocket.listen(port, bindAddress, 100);
        }
        catch ( e ) {
            java.lang.System.out.println(e.toString());
            process.exit(1);
        }
        for ( var i = 0; i < numChildren; i++ ) {
            new Thread(Child, serverSocket, this).start();
        }
        return this;
    },
    /**
     * ## server.webSocket(path, onConnect) : chainable
     *
     * Bind a WebSocket listener to the server at the given path.
     *
     * ### Arguments:
     * - {string} path - URI path for WebSocket connections
     * - {function} onConnect - method called for each connected socket
     *
     * onConnect has the following signature:
     * ```onConnect(sock)```
     * - {WebSocket} sock - WebSocket ready to write to or bind listeners
     *
     * ### See Also:
     * - http/WebSocket.js
     *
     * @memberOf http.Server
     * @method webSocket
     * @param path
     * @param onConnect
     * @return {*}
     */
    webSocket : function ( path, onConnect ) {
        this.webSockets[ path ] = onConnect;
        return this;
    }
    /** @private */
});

/**
 * ## static createServer(func) : server
 *
 * NodeJS style createServer static method.
 * 
 * ### Arguments:
 * - {function} func - function to call for each request
 * 
 * @method createServer
 *
 * @param {Function} func function to handle requests
 * @return {Server}
 */
function createServer( func ) {
    return new Server(func);
}

/** @private */
decaf.extend(exports, {
    createServer : createServer
});
