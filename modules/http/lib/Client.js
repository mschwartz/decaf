/*global java */
/**
 * # HTTP Client
 *
 * This class allows you to perform HTTP requests.
 *
 * ### Example (get):
 * ```javascript
 * var Client = require('http').Client;
 *
 * var get = new Client('http://yahoo.com').get();
 * console.log('status: ' + get.status);                // e.g. 200, 404...
 * console.log('responseText: ' + get.responseText);    // HTML
 *
 * // post a form with field names username and password
 * var post = new Client('http://example.com/login')
 *              .post{{ username: 'user', password: 'pass' });
 *
 * console.log('status: ' + post.status);
 * console.log('responseText: ' + post.responseText);
 * ```
 *
 *
 */
/**
 * @private
 */
var URL = java.net.URL,
    HttpUrlConnection = java.net.HttpUrlConnection,
    BufferedReader = java.io.BufferedReader,
    InputStreamReader = java.io.InputStreamReader,
    DataOutputStream = java.io.DataOutputStream,
    //{URL, HttpUrlConnection} = java.net,
    //{BufferedReader, InputStreamReader, DataOutputStream} = java.io,
    toJavaByteArray = decaf.toJavaByteArray;

/**
 * ## new Client(url) : client
 *
 * Construct a HTTP Client
 *
 * After the GET/POST operation is complete, you can inspect these members of the Client object:
 *
 * {string} status - HTTP status (e.g. 200, 404, etc.)
 * {string} responseMessage - HTTP response message (e.g. OK, NOT FOUND, etc.)
 * {string} responseText - the text of the HTTP response from the server (typically the HTML or JSON it sent us)
 *
 * @param {string} url URL to connect to
 * @constructor
 */
function Client( url ) {
    this.conn = new URL(url).openConnection();
}

/**
 * @private
 * @param conn
 * @returns {string}
 */
function getResponseText( conn ) {
    var rd,
        response = [],
        line;

    try {
        rd = new BufferedReader(new InputStreamReader(conn.getInputStream()));
    }
    catch (e) {
        rd = new BufferedReader(new InputStreamReader(conn.getErrorStream()));
    }
    while ((line = rd.readLine())) {
        response.push(String(line));
    }
    rd.close();
    return response.join('\n');
}

decaf.extend(Client.prototype, {
    /**
     * ## client.setFollowRedirects(state) : chainable
     * Set client to follow (or not) redirects sent by server.
     *
     * ### Arguments:
     * - {boolean} state - true to follow redirects (default is false)
     *
     * @param {boolean} state true to follow redirects (default is false)
     * @chainable
     */
    setFollowRedirects : function( state ) {
        this.conn.setInstanceFollowRedirects(state);
        return this;
    },

    /**
     * ## client.setHeader(key, value) : chainable
     *
     * Set a request header
     *
     * ### Arguments:
     * - {string} key - key of header to set
     * - {string} value - value of header to set
     *
     * @param {string} key name of header to set
     * @param {string} value value of header to set
     * @chainable
     */
    setHeader : function( key, value ) {
        this.conn.setRequestProperty(key, value);
        return this;
    },

    /**
     * ## client.post(form) : chainable
     *
     * Post a form or JSON to the connection
     *
     * The form data is a hash of name/value pairs; name is name of the form field, value is the value.
     *
     * If the form argument is a string, it is assumed to be a object serialized as a JSON .string
     *
     * The value returned is the client object.  It can be inspected for responseText, responseCode, etc.
     *
     * ### Arguments:
     * - {hash object | string} form - hash object representing form data, or serialized JSON string.
     *
     *
     * @param {object} form the form data
     * @chainable
     */
    post : function( form ) {
        var me = this,
            conn = me.conn,
            formData,
            contentType;

        if (decaf.isString(form)) {
            formData = form;
            contentType = 'application/json';
        }
        else {
            formData = [];
            contentType = 'application/x-www-form-urlencoded';

            decaf.each(form, function( value, key ) {
                formData.push(key + '=' + value);
            });
            formData = formData.join('&');
        }

        conn.setDoOutput(true);
        conn.setDoInput(true);
        conn.setUseCaches(false);
        conn.setRequestMethod('POST');
        conn.setRequestProperty('Content-Type', contentType);
        conn.setRequestProperty('charset', 'utf-8');
        conn.setRequestProperty('Content-Length', '' + toJavaByteArray(formData).length);

        var wr = new DataOutputStream(conn.getOutputStream());
        wr.writeBytes(formData);
        wr.flush();
        wr.close();

        conn.disconnect();
        me.responseText = getResponseText(conn);
        try {
            me.status = conn.getReponseCode();
            console.dir(me.status);
        }
        catch (e) {
            me.status = 200;
        }
        me.responseMessage = conn.getResponseMessage();
        delete me.conn;
        return me;
    },

    /**
     * ## client.get() : chainable
     *
     * Issue GET request to the connection.
     *
     * The value returned is the client object.  It can be inspected for responseText, responseCode, etc.
     *
     * @chainable
     */
    get : function() {
        this.conn.setRequestMethod('GET');
        this.responseText = getResponseText(this.conn);
        this.status = this.conn.getResponseCode();
        this.responseMessage = String(this.conn.getResponseMessage());
        this.conn.disconnect();
        delete this.conn;
        return this;
    }
    /** @private */
});

decaf.extend(exports, {
    Client : Client
});
