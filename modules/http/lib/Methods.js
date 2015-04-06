/*!
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 6/28/13
 * Time: 9:41 AM
 * To change this template use File | Settings | File Templates.
 */

/** @private */
decaf.extend(exports, {
    /**
     * ## methods : array of strings
     *
     * Array of the various HTTP protocol methods (get, post, etc.)
     *
     * The values are lowercase.
     *
     * ### Example:
     *
     * ```javascript
     * var metods = require('http').methods;
     *
     * console.log(methods[0]); // => get
     * ```
     *
     * @name methods
     * @type array
     */
    methods : [
        'get',
        'post',
        'put',
        'head',
        'delete',
        'options',
        'trace',
        'copy',
        'lock',
        'mkcol',
        'move',
        'propfind',
        'proppatch',
        'unlock',
        'report',
        'mkactivity',
        'checkout',
        'merge',
        'm-search',
        'notify',
        'subscribe',
        'unsubscribe',
        'patch'
    ]
    /** @private */
});