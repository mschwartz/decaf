/*!
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 7/23/13
 * Time: 9:08 AM
 */

"use strict";

/*global java */

/**
 * # GZIP (Singleton)
 *
 * Provides GZIP compression method.  GZIP can be used for general purpose compression of byte arrays or strings.
 *
 * This class is mostly used by the http server to provide gzipped enconding.
 *
 * ### Example:
 *
 * ```javascript
 * var GZIP = require('http').GZIP;
 * console.dir({ gzipped: GZIP.compress('hello, world') });
 * ```
 */
var GZIP = {
    /**
     * ## GZIP.compress(what) : byte array
     *
     * static GZIP Compress a string or byte array.
     *
     * ### Arguments:
     * - {string | byte array} what - the string or byte array to compress
     *
     * ### Returns:
     * - {byte array} compressed data
     *
     * @param s
     * @returns {*|byte[]|Array.<byte>}
     */
    compress: function(s) {
        if (typeof s === 'string') {
            s = decaf.toJavaByteArray(s);
        }
        var os = new java.io.ByteArrayOutputStream(),
            gz = new java.util.zip.GZIPOutputStream(os);
        gz.write(s, 0, s.length);
        gz.finish();
        return os.toByteArray();
    }
};
/** @private */
decaf.extend(exports, {
    GZIP: GZIP
});
