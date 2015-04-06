/**
 * # HTTP Response Object
 *
 * In the DecafJS http context, a Response represents the stream of data going to the client over the socket.
 *
 * A Response instance provides members for handling the http protocol, handshakes, setting cookies, response headers, etc.
 *
 * This page documents the most basic form of the Response object.  Add-ons for DecafJS may add additional decoration/members to the request object.
 */
/** @private */
/*global require, exports, toString, decaf, java */

"use strict";

var mimeTypes = require('mimetypes').mimeTypes,
    GZIP      = require('GZIP').GZIP;

/*
 * Hash containing HTTP status codes and the messages associated with them.
 */
var responseCodeText = {
    100 : 'Continue',
    101 : 'Switching Protocols',
    200 : 'OK',
    201 : 'Created',
    202 : 'Accepted',
    203 : 'Non-Authoritative Information',
    204 : 'No Content',
    205 : 'Reset Content',
    206 : 'Partial Content',
    300 : 'Multiple Choices',
    301 : 'Moved Permanently',
    302 : 'Found',
    303 : 'See Other',
    304 : 'Not Modified',
    305 : 'Use Proxy',
    307 : 'Temporary Redirect',
    400 : 'Bad Request',
    401 : 'Unauthorized',
    402 : 'Payment Required', // note RFC says reserved for future use
    403 : 'Forbidden',
    404 : 'Not Found',
    405 : 'Method Not Allowed',
    406 : 'Not Acceptable',
    407 : 'Proxy Authentication Required',
    408 : 'Request Timeout',
    409 : 'Conflict',
    410 : 'Gone',
    411 : 'Length Required',
    412 : 'Precondition Failed',
    413 : 'Request Entity Too Large',
    414 : 'Request-URI Too Long',
    415 : 'Unsupported Media Type',
    416 : 'Request Range Not Satisfiable',
    417 : 'Expectation Failed',
    500 : 'Internal Server Error',
    501 : 'Not Implemented',
    502 : 'Bad Gateway',
    503 : 'Service Unavailable',
    504 : 'Gateway Timeout',
    505 : 'HTTP Version Not Supported'
};

/**
 * ## new Response(os, req) : response
 *
 * Create an instance of an HTTP Response object.
 *
 * Response instances are typically automatically created by http.Child
 *
 * Various bits of the response are queued up and sent as headers when the response body is written to for the first time.
 *
 * ### Arguments:
 * - {net.OutputStream} os - a DecafJS net/OutputStream representing the socket to send the resposne to.
 * - {Request} req - the already initialized Request object for the incoming request.
 *
 * The req object is examined to handle protocol, such as keep alive.
 *
 * @param {OutputStream} os OutputStream to send response to
 * @param {Request} req http request object
 * @constructor
 */
function Response( os, req ) {
    this.os = os;
    this.req = req;
    this.headersSent = false;
    this.status = 200;
    this.contentLength = 0;
    this.cookies = null;
    this.headers = {};
    this.proto = this.req.proto;
}
/** @private */
decaf.extend(Response.prototype, {
    /**
     * ## res.destroy()
     *
     * This method is meant to be called internally by the http server at the end of a request.
     */
    destroy     : function () {
        var me = this,
            os = me.os;

        if ( me.chunked ) {
            os.writeln('0');
            os.writeln('');
            me.flush();
        }
        me.chunked = false;
    },
    /**
     * ## res.setCookie(key, value, expires, path, domain) : chainable
     *
     * Set a cookie for the response.  You may set mutiple cookies by calling this method more than once before the request is completed and headers are sent.
     *
     * Once the browser receives the cookie, it will send it over and over for each request, until the cookie is unset or expires.
     *
     * ### Arguments:
     * - {string} key - name of the cookie
     * - {string} value - value of the cookie
     * - {date | string} expires - optional expiration date of the cookie.  Defaults to as long as the browser is open.
     * - {string} path - optional path for the cookie. Defaults to /.
     * - {string} domain - optional domain for the cookie.
     *
     * Hint: it is really easy to set the expires parameter as a JavaScript Date Object.
     *
     * @param key
     * @param value
     * @param expires
     * @param path
     * @param domain
     */
    setCookie   : function ( key, value, expires, path, domain ) {
        var cookie = {
            value : value
        };
        if ( expires ) {
            expires = toString.apply(expires) === '[object Date]' ? expires.toGMTString() : expires;
            cookie.expires = expires;
        }
        if ( path ) {
            cookie.path = path;
        }
        else {
            cookie.path = '/';
        }
        if ( domain ) {
            cookie.domain = domain;
        }
        this.cookies = this.cookies || {};
        this.cookies[ key ] = cookie;
        return this;
    },
    /**
     * ## res.unsetCookie(key) : chainable
     *
     * Clear a cookie.
     *
     * Once the browser receives the ehader to clear the cookie, that cookie will no longer be sent by the client.
     *
     * ### Arguments:
     * {string} key - name of cookie to clear
     *
     * @param key
     */
    unsetCookie : function ( key ) {
        var now = new Date().getTime() / 1000;
        var yesterday = now - 86400;
        this.cookies = this.cookies || {};
        var cookie = this.cookies[ key ] || {};
        cookie.path = cookie.path || '/';
        cookie.expires = new Date(yesterday * 1000).toGMTString();

        this.cookies[ key ] = cookie;
        return this;
    },
    /**
     * ## res.writeHead(status, headers) : chainable
     *
     * Set response status and headers.
     *
     * Only the queued variables in the response are modified.  The headers are sent when the response body is sent.
     *
     * Note that you will likely want to set at least the Content-Type header.
     *
     * ### Arguments:
     * - {number} status - HTTP status, e.g. 200, 404, etc.
     * - {hash object} headers - headers to add to the response
     *
     * ### Example:
     * ```javascript
     * res.writeHead(200, { 'Content-type', 'text/html' });
     * ```
     *
     * @param {int} status HTTP status, e.g. 200 (for OK), 404 (not found), etc.
     * @param {object} headers hash containing headers to be added to the response headers.
     */
    writeHead   : function ( status, headers ) {
        var me = this;

        decaf.extend(this.headers, headers);
        this.status = status;
        return this;
    },
    /**
     * ## res.send(status, body) : chainable
     *
     * Send a response.
     *
     * ### Synopsis:
     * ```javascript
     * // application/json
     * res.send(200, obj); // send 200 status and obj as JSON
     * res.send(obj); // send 200 status and obj as JSON
     * // text/html
     * res.send('hello, world'); // 200 status, 'hello world' as string
     * // HTTP errors
     * // res.send(404); // send 404, not found
     * ```
     *
     * This method determines the type of the thing to be sent and pretty much does the right thing.
     *
     * If the body to be sent is a string, the content-type header is set to text/html.
     *
     * If the body to be sent is an array or object, then the JSON representation will be sent with content-type set to application/json.
     *
     * If the optional status code is not provided, then 200 is assumed.
     *
     * If the only argument is a number, it is assumed to be a status code and a response body string is automatically sent (e.g. OK for 200, Not Found for 404, etc.)
     *
     * This method is inspired by res.send() of ExpressJS.
     *
     * @param {int} status - optional HTTP status code (e.g. 200, 404, etc.)
     * @param {string|object|array|number} body - optional thing to be sent as the response
     */
    send        : function ( status, body ) {
        if ( typeof status === 'number' ) {
            if ( body === undefined ) {
                this.writeHead(status, { 'Content-Type' : 'text/html' });
                this.end(responseCodeText[ status ] || ('Unknown status ' + status));
                return this;
            }
        }
        else if ( body === undefined ) {
            body = status;
            status = this.status || 200;
        }

        if ( typeof body === 'string' ) {
            this.writeHead(status, { 'Content-Type' : 'text/html ' });
            this.end(body);
        }
        else {
            this.writeHead(status, { 'Content-Type' : 'application/json' });
            this.end(JSON.stringify(body));
        }
        return this;
    },
    /**
     * ## res.sendFile(filename, modifiedSince) : chainable
     *
     * Send a file to the client.
     *
     * The mime type is determined from the file's .extension.
     *
     * If the modifiedSince parameter is set to a GMT date string, then if-modified-since header will be added to the response, and 304 response generated appropriately.
     *
     * ### Arguments:
     * - {string} filename - path to file to send
     * - {string | date} modifiedSince - optional date of if-modified-since header in the request
     *
     * @param {string} filename name of file to send
     * @param {boolean} modifiedSince false to disable 304 if-modified-since processing
     */
    sendFile    : function ( filename, modifiedSince ) {
        var os        = this.os,
            headers   = this.headers,
            extension = filename.indexOf('.') !== -1 ? filename.substr(filename.lastIndexOf('.') + 1) : '',
            file      = new java.io.File(filename),
            modified  = file.lastModified(),
            size      = file.length();

        if ( modified === 0 ) {
            throw new Error('404');
        }

        headers[ 'Content-Type' ] = mimeTypes[ extension ] || 'text/plain';
        modified = parseInt(modified / 1000, 10);
        headers[ 'last-modified' ] = new Date(modified * 1000).toGMTString();

        if ( modifiedSince ) {
            if ( typeof modifiedSince === 'string' ) {
                modifiedSince = Date.parse(modifiedSince) / 1000;
            }
            if ( modified < modifiedSince ) {
                this.status = 304;
                this.sendHeaders();
                return;
            }
        }

        try {
            var inFile    = new java.io.FileInputStream(filename),
                buf       = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, 4096 * 16),
                remaining = size,
                offset    = 0,
                actual;

            this.status = 200;
            headers[ 'Content-Length' ] = remaining;
            this.sendHeaders();
            os.flush();

            while ( remaining > 0 ) {
                actual = inFile.read(buf);
                if ( actual <= 0 ) {
                    break;
                }
                os.writeBytes(buf, 0, actual);
                offset += actual;
                remaining -= actual;
            }
            inFile.close();
            os.flush();
        }
        catch ( e ) {
            e.dumpText();
        }
        return this;
    },
    /**
     * ## res.sendBytes(bytes, mimeType, lastModified, modifiedSince) : chainable
     *
     * Send a Java byte[] array to the client.
     *
     * This method is useful if you read in a file as a byte array and want to be able to send it over and over again from RAM.
     *
     * Sending from RAM is faster than streaming the contents of a file from the filesystem to the socket.
     * @param {byte[]} bytes array of bytes to send
     * @param {string} mimeType mime-type to send (content-type)
     * @param {int} lastModified timestamp byte array last modified
     * @param {string|int} modifiedSince if-modified-since request header value
     */
    sendBytes   : function ( bytes, mimeType, lastModified, modifiedSince ) {
        var os      = this.os,
            headers = this.headers,
            size    = bytes.length;
        headers[ 'Content-Type' ] = mimeType;
        if ( lastModified ) {
            lastModified = parseInt(lastModified / 1000, 10);
            headers[ 'last-modified' ] = new Date(lastModified * 1000);
            if ( modifiedSince ) {
                if ( typeof modifiedSince === 'string' ) {
                    modifiedSince = Date.parse(modifiedSince);
                }
                modifiedSince = parseInt(modifiedSince / 1000, 10);
                if ( lastModified <= modifiedSince ) {
                    this.status = 304;
                    this.sendHeaders();
                    this.flush();
                    return this;
                }
            }
        }
        headers[ 'Content-Length' ] = size;
        this.sendHeaders();
        this.flush();

        os.writeBytes(bytes, 0, size);
        os.flush();
        return this;
    },
    /**
     * ## res.sendHeaders() : chainable
     *
     * Send response headers to the client.  Headers may only be sent once.  Calling this a second time has no effect.
     *
     * This method is typically called internally by the http server logic.
     *
     */
    sendHeaders : function () {
        var me      = this,
            os      = me.os,
            headers = me.headers;

        if ( me.headersSent ) {
            return this;
        }
        os.writeln(me.proto + ' ' + me.status + ' ' + responseCodeText[ me.status ]);
        os.writeln('Date: ' + new Date().toGMTString());
        for ( var key in headers ) {
            if ( headers.hasOwnProperty(key) ) {
                os.writeln(key + ': ' + headers[ key ]);
            }
        }
        if ( me.cookies && !me.headers[ 'Set-Cookie' ] ) {
            decaf.each(me.cookies, function ( cookie, key ) {
                var out = 'Set-Cookie: ' + key + '=' + encodeURIComponent(cookie.value);
                if ( cookie.expires ) {
                    out += '; Expires=' + cookie.expires;
                }
                if ( cookie.path ) {
                    out += '; Path=' + cookie.path;
                }
                if ( cookie.domain ) {
                    out += '; Domain=' + encodeURIComponent(cookie.domain);
                }
                os.writeln(out);
            });
        }
        os.writeln('');
        me.headersSent = true;
        return this;
    },
    /**
     * ## res.setHeader(key, value) : chainable
     *
     * Set response header
     *
     * ### Arguments:
     * - {string} key - name of header
     * - {string} value - value for header
     *
     * @param {string} key name of header
     * @param {string} value value of header
     */
    setHeader   : function ( key, value ) {
        this.headers[ key ] = value;
        return this;
    },
    /**
     * ## res.write(s) : chainable
     *
     * Write string to response.
     *
     * If headers aren't sent, this will send headers with Transfer-Encoding: chunked.
     *
     * The write() and each successive one will be sent as a chunk.
     *
     * ### Arguments:
     * - {string|byte array} s - string to write
     *
     * @param {string} s string to write
     */
    write       : function ( s ) {
        var me = this,
            os = me.os;

        if ( !me.headersSent ) {
            me.setHeader('Transfer-Encoding', 'Chunked');
            me.sendHeaders();
            me.chunked = true;
        }
        os.writeln(s.length.toString(16));
        os.writeln(s);
        os.flush();
        return this;
    },
    /**
     * ## res.end(body, gzip) : chainable
     *
     * Complete response, sending headers if not sent, and provided body, optionally gzipping the response.
     *
     * ### Arguments:
     * - {string} body - the body of the response
     * - {boolean} gzip - if true, the body will be gzip compressed
     *
     * @param {string} body - body of response
     */
    end         : function ( body, gzip ) {
        var os      = this.os,
            headers = this.headers;

        if ( body ) {
            if ( toString.apply(body) === '[object Array]' ) {
                body = body.join('\n');
            }
            body = decaf.toJavaByteArray(body);
            if ( gzip ) {
                body = GZIP.compress(body);
                headers[ 'Content-Encoding' ] = 'gzip';
            }
            headers[ 'Content-Length' ] = body.length;
        }
        this.sendHeaders();
        if ( body ) {
            if ( typeof body === 'string' ) {
                os.write(body);
            }
            else {
                os.flush();
                os.writeBytes(body, 0, body.length);
            }
        }
        os.flush();
        return this;
    },
    /**
     * ## res.stop()
     *
     * Complete request handling.
     *
     * This method does not return.  The request is assumed to be completed.
     *
     * You can call this from within nested methods to terminate/complete the request.
     */
    stop        : function () {
        throw 'RES.STOP';
    },
    /**
     * ## res.flush() : chainable
     *
     * Flush the response output stream.
     *
     * The output stream may be buffered.  This method causes any buffered bytes to be sent to the client immediately.
     *
     */
    flush       : function () {
        this.os.flush();
        return this;
    },
    /**
     * ## res.redirect(url)
     *
     * Issue a 303 redirect to the specified URI, which may be relative.
     *
     * This method does not return.
     *
     * ### Arguments:
     * - {string} url - the url to redirect to
     *
     * @param {string} url
     */
    redirect    : function ( url ) {
        var me = this,
            os = me.os;

        me.status = 303;
        var base;
        if ( url.substr(0, 7) !== 'http://' && url.substr(0, 8) !== 'https"://' ) {
            base = 'http://';
            base += me.req.host;
            if ( me.port !== 80 ) {
                base += ':' + me.req.port;
            }
            url = base + url;
        }
        me.headers[ 'Location' ] = url;
        me.end();
        me.stop();
    }
    /** @private */
});

decaf.extend(exports, {
    responseCodeText : responseCodeText,
    Response         : Response
});
