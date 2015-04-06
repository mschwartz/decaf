/*!
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 7/2/13
 * Time: 4:57 PM
 * To change this template use File | Settings | File Templates.
 */

/**
 * @module Threads
 */

/** @private */

/*global sync, exports, java */
"use strict";

/**
 * # Condition Variables
 *
 * A condition instance provides a mechanism for one or ore threads to wait until the Condition is notified by another thread.
 *
 * ## Example:
 * ```javascript
 * var Thread = require('Threads').Thread,
 *     Condition = require('Threads').Condition;
 *
 * var condition = new Condition();
 *
 * new Thread(function() {
 *     this.on('exit', function() {
 *         console.log('first thread exiting');
 *     });
 *     Thread.sleep(5);
 *     condition.notify();
 *     Thread.sleep(2);
 * }).start();
 *
 * new Thread(function() {
 *     this.on('exit', function() {
 *         console.log('second thread exiting');
 *     });
 *     Thread.sleep(2);
 *     condition.wait();
 *     console.log('Second thread notified');
 * }).start();
 *
 * // outputs:
 * // Second thread notified (5 seconds later)
 * // second thread exiting
 * // first thread exiting (2 seconds later)
 * ```
 */

/**
 * ## new Condition() : condition
 *
 * Construct a new Condition variable
 *
 * ### Returns:
 * - {Condition} instance of a condition variable
 *
 * @constructor
 */
function Condition() {
    var me = this;

    /** @private */
    me.variable = new java.lang.Object();
    /**
     * ## condition.wait()
     *
     * Wait for a notify.
     *
     * @method wait
     */
    this.wait = sync(function () {
        me.variable.wait();
    }, me.variable);
    /**
     * ## condition.notify()
     *
     * Awaken one thread that is waiting on this condition variable.
     *
     * @method notify
     */
    this.notify = sync(function () {
        me.variable.notify();
    }, me.variable);
    /**
     * ## condition.notifyAll()
     *
     * Notify all threads waiting on this Condition instance.
     *
     * @method notifyAll
     */
    this.notifyAll = sync(function () {
        me.variable.notifyAll();
    }, me.variable);
}
decaf.extend(Condition.prototype, {
    /**
     * ## condition.destroy()
     *
     * Destroy condition variable
     *
     * @method destroy
     */
    destroy : function () {
        this.notifyAll();
    }
    /** @private */
});

decaf.extend(exports, {
    Condition : Condition
});
