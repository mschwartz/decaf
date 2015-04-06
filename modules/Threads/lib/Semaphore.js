/*!
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 7/2/13
 * Time: 3:37 PM
 * To change this template use File | Settings | File Templates.
 */

/*global java */

"use strict";

var TimeUnit      = java.util.concurrent.TimeUnit,
    ReentrantLock = java.util.concurrent.locks.ReentrantLock;

/**
 * # Sempahores
 *
 * A semaphore enables control of access to critical sections of code or data structures.
 *
 * A semaphore is owned by the thread that last successfully obtained a lock on it and that has not unlocked it.
 *
 * ### Example:
 * ```javascript
 * var Thread = require('Threads').Thread,
 *     Semaphore = require('Threads').Semaphore,
 *     lock = new Semaphore();
 *
 * new Thread(function() {
 *     lock.lock(); // obtain the semaphore
 *     Thread.sleep(10);
 *     lock.unlock();
 * }).start();
 *
 * new Thread(function() {
 *      Thread.sleep(2);
 *      lock.lock();
 *      console.log('awake');
 *      lock.unlock();
 * }).start();
 *
 * //=> "awake" 10 seconds after starting the program
 * ```
 *
 * Semaphores are fine grained locking.  Two threads might be contending for one semaphore while another two might be contending for a second one.  The existance of the first does not affect the threads contending for the second.
 * @module Threads
 */

/**
 * ## new Semaphore() : semaphore
 *
 * Construct a new sempahore.
 *
 * You will typically share the semaphore returned between two or more threads.
 *
 * ### Returns:
 * - {semaphore} instance of a sempahore
 *
 * ### Example:
 * ```javascript
 * var semaphore = new Semaphore();
 * ```
 *
 * @class Semaphore
 * @constructor
 */
function Semaphore() {
    this.sem = new ReentrantLock();
}

decaf.extend(Semaphore.prototype, {
    /**
     * ## semaphore.lock()
     *
     * Lock the semaphore.  Blocks the caller until the lock is obtained.
     *
     * @method lock
     */
    lock    : function () {
        this.sem.lock();
    },
    /**
     * ## semaphore.trylock(timeout) : boolean
     *
     * Try to acquire the lock, with optional timeout.
     *
     * The lock is obtained only if it is free at the time of invocation.
     *
     * ### Arguments:
     * - {number} timeout - number of millisseconds to wait on the lock before failing
     *
     * ### Returns:
     * - true if the lock was obtained
     * @method tryLock
     * @param {int} timeout - optional timeout in ms
     */
    tryLock : function ( timeout ) {
        return timeout ? this.sem.trylock(timeout, TimeUnit.MILLISECONDS) : this.sem.trylock();
    },
    /**
     * ## sempahore.unlock()
     *
     * Unlock the semaphore.
     *
     * @method unlock
     */
    unlock  : function () {
        this.sem.unlock();
    },
    /**
     * ## semaphore.isMine() : boolean
     *
     * Determine if current thread is owner of the lock on a Sempahore.
     *
     * ### Returns:
     * - true if current thread holds the lock on the Semaphore
     *
     * @method isMine
     * @returns {boolean} mine - true if current thread holds the lock on the Semaphore
     */
    isMine  : function () {
        return this.sem.isHeldByCurrentThread();
    }
/** @private */
});

decaf.extend(exports, {
    Semaphore : Semaphore
});
