/*!
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 6/8/13
 * Time: 3:24 PM
 */

/** @private */

/*global exports */
"use strict";

var setInterval, setTimeout, clearInterval, clearTimeout;

/**
 * # Decaf timer emulation
 *
 * Methods that emulate the  global/window browser functions setTimeout(), clearTimeout(), setInterval(), and clearInterval() are provided as a module in Decaf.
 *
 * Since Decaf is synchronous and parallel, you could alternatively just call Thread.sleep() to delay execution of the next statements, or call Thread.sleep() in a loop to simulate setInterval().
 * ### Example:
 * ```
 * var setTimeout = require('Timers').setTimeout;
 *
 * setTimeout(function() {
 *    console.log('timed out');
 * }, 5000);
 *
 * // => timed out (after 5 second delay)
 * ```
 */
/**
 * ## setTimeout(fn, delay) : timer
 *
 * Execute a function after a specified time has passed.
 *
 * Note: the function may or may not be called in the same thread that called setTimeout().
 *
 * ### Arguments:
 * - {function} fn - function to be run
 * - {number} delay - number of milliseconds to wait before calling function
 *
 * ### Returns:
 * - timer - this variable can be used to call clearTimeout() to abort the timer.
 *
 * @param fn
 * @param delay
 * @returns {number}
 */
if ( NASHORN ) {
    setTimeout = function(fn, delay) {
        var timer = new Timer("setTimeout", true);
        timer.schedule(fn, delay);
        return timer;
    };
}
else {
    setTimeout = function ( fn, delay ) {
        var timer = new java.util.Timer(false);

        timer.schedule(new JavaAdapter(java.util.TimerTask, {
            run : function () {
                fn();
                clearTimeout(id);
            }
        }), delay);

        return timer;
    };
}

/**
 * ## clearTimeout(timer)
 *
 * Clear, or abort, a running setTimeout() timer.
 *
 * ### Arguments:
 * - {Timer} timer - the timer to cancel
 *
 * @param timer
 */
if ( NASHORN ) {
    clearTimeout = function(timer) {
        timer.cancel();
    }
}
else {
    clearTimeout = function ( timer ) {
        timer.cancel();
        timer.purge();
    };
}

/**
 * ## setInterval(fn, delay) : timer
 *
 * Repeatedly call a function every delay milliseconds.
 *
 * Note: the function may or may not be called in the same thread that called setTimeout().
 *
 * ### Arguments:
 * - {function} fn - the function to call
 * - {number} delay - the time to delay between calling function
 *
 * @param fn
 * @param delay
 * @returns {number}
 */
if ( NASHORN ) {
    setInterval = function ( fn, delay ) {
        // New timer, run as daemon so the application can quit
        var timer = new Timer("setInterval", true);
        timer.schedule(function () Platform.runLater(fn), delay, delay);
        return timer;
    };
}
else {
    setInterval = function ( fn, delay ) {
        var timer = new java.util.Timer(false);
        timer.schedule(new JavaAdapter(java.util.TimerTask, {
            run: fn
        }))
        timer.schedule(ids[ id ].task, delay, delay);
        return id;
    };
}
/**
 * ## clearInterval(timer)
 *
 * Clear, or abort, a running setInterval() timer.
 *
 * ### Arguments:
 * - {Timer} timer - the timer to cancel
 *
 * @param timer
 */
if ( NASHORN ) {
    clearInterval = function(timer) {
        timer.cancel();
    }
}
else {
    clearInterval = function ( timer ) {
        timer.cancel();
        timer.purge();
    };
}
/** @private */
decaf.extend(exports, {
    setTimeout    : setTimeout,
    clearTimeout  : clearTimeout,
    setInterval   : setInterval,
    clearInterval : clearInterval
});
