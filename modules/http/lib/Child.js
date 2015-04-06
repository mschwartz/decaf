/**
 * @module http
 * @submodule Child
 * @private
 */

/*!
 * @private
 * @ignore
 */
/*global require, exports, log, sync, java, io */
(function() {
    "use strict";

    global.io = global.io || 'net';

    var Thread = require('Threads').Thread,
        InputStream = require(io).InputStream,
        OutputStream = require(io).OutputStream,
//        InputStream = require('net').InputStream,
//        OutputStream = require('net').OutputStream,
        Request = require('Request').Request,
        Response = require('Response').Response,
        WebSocket = require('WebSocket').WebSocket;

    /**
     * # HTTP Child
     *
     * Thread to handle HTTP requests.
     *
     * There are typically numChildren (see Server.listen) Child threads spawned at start.  You will not spawn Child threads yourself.
     *
     * The Child logic is two nested loops.  The outer loop accepts connections.  The inner loop processes requests on the accepted connection until the connection is closed or until the HTTP protocol requires the connection to be closed (Connection: close).
     *
     * If a request is an upgrade to WebSocket, the thread becomes dedicated to servicing the socket.
     *
     * A Request and Response object are created for each request handled.
     *
     * ### Events:
     * - startRequest(req, res) is fired as soon as request and response objects are created
     * - endRequest is fired when the request has completed
     *
     * Note that many requests may occur over a single socket connection between browser and server.
     *
     * ### See:
     *
     * - http/Request.js
     * - http/Response.js
     * - http/WebSocket.js
     * - net/Socket.js
     * - net/InputStream.js
     * - net/OutputStream.js
     *
     *
     * @param {Socket} serverSocket the Socket to accept connections from
     * @param {object} server instance of the http Server that spawned this child
     * @constructor
     */
    function Child(serverSocket, server) {
        var me = this;      // current Thread

        me.on('exit', function() {
            new Thread(Child, serverSocket, server).start();
        });

        var accept = sync(function() {
            return serverSocket.accept();
        });

        var fn = server.fn,
            webSockets = server.webSockets;

        while (true) {
            var sock = serverSocket.accept();
//            var sock = accept();

            var is = new InputStream(sock),
                os = new OutputStream(sock);

            var keepAlive = true;
            while (keepAlive) {
                try {
//                    var start = new Date().getTime(); // java.lang.System.nanoTime();
                    keepAlive = keepAlive && handleRequest.call(this, is, os, fn, webSockets);
                    me.fire('endRequest');
//                    var elapsed = new Date().getTime() - start; // java.lang.System.nanoTime() - start;
//                    console.log(elapsed);
                }
                catch (e) {
                    if (e === 'THREAD.EXIT') {
                        throw e;
                    }
                    if (e === 'EOF') {
                        break;
                    }
                    if (e.dumpText) {
                        e.dumpText();
                    }
                    else if (e === 'RES.STOP') {
                        continue;
                    }
                    else {
                        console.exception(e);
                    }
                    keepAlive = false;
                }
            }
            is.destroy();
            os.destroy();
            sock.destroy();
        }
    }

    /**
     * ## private handleRequest(is, os, fn, webSockets)
     *
     * This is a private method called by HTTP Child threads to handle a single request.
     *
     * A Request instance and a Response instance is created for each request.
     *
     * This method handles connection upgrade to websocket.  If an upgrade occurs, the function does not return until the websocket is closed.
     *
     * This method handles HTTP/1.1 keep-alive requests as well.
     *
     * @param is
     * @param os
     * @param fn
     * @param webSockets
     * @returns {boolean}
     */
    function handleRequest(is, os, fn, webSockets) {
        var request = new Request(is),
            response = new Response(os, request),
            keepAlive = true;

        this.req = request;
        this.res = response;
        request.threadId = this.threadId;
        request.scope = this;

        this.fire('startRequest', request, response);

        var connection = (request.headers['connection'] || '').toLowerCase(),
            headers = response.headers;
        if (connection === 'upgrade') {
            if (request.headers['upgrade'].toLowerCase() !== 'websocket') {
                return false;
            }
            var parts = request.uri.split('/'),
                part = parts[0] || parts[1];
            if (webSockets[part]) {
                var ws = new WebSocket(request, response);
                webSockets[part](ws);    // socket connect
                ws.run();                       // handle the socket until close, etc.
            }
            return false;
        }
        else if (connection === 'keep-alive') {
            headers['Connection'] = 'Keep-Alive';
            headers['keep-alive'] = 'timeout: 5; max = 10000000';
        }
        else {
            headers['Connection'] = 'close';
            keepAlive = false;
        }
        if (fn.call(this, request, response) === false) {
            headers['Connection'] = 'close';
            keepAlive = false;
        }
        response.destroy();
        return keepAlive;
    }

    /** @private */


    decaf.extend(exports, {
        Child : Child
    });

}());
