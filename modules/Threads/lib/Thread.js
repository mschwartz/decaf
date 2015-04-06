/*global exports, builtin, java */

"use strict";
var process = require('process');

var threads      = {},
    javaThreads  = {},
    threadCount  = 0,
    nextThreadId = 0;

var addThread = sync(function(threadId, thread) {
    threads[threadId] = thread;
    threadCount++;
}, threads);

var removeThread = sync(function(threadId) {
    if (threads[threadId]) {
        delete threads[threadId];
        threadCount--;
    }
}, threads);

/** @module Thread */

/**
 * # Decaf Threads Module
 *
 * Decaf provides an API for spawning and manipulating JavaScript running in JVM threads.  Think of these as
 * true JavaScript threads.
 *
 * By default, a Decaf application has just one thread, the "main" thread.  If you spawn additional threads,
 * they share the global address space with the main thread and each other.  This means they can access the
 * same global variables, call the same functions, and so on.
 *
 * Hannes Wallnöfer wrote a great article about how Threaded JavaScript works here:
 * - http://hns.github.io/2011/05/12/threads.html
 *
 * Using Decaf Threads is trivial:
 *
 * ```javascript
 * var Thread = require('Threads').Thread;
 *
 * var myThread = new Thread(function() {
 *      while (!Thread.interrupted()) {
 *          Thread.sleep(1);
 *          console.log('Thread alive');
 *      }
 *  });
 *
 *  myThread.start();
 *  // myThread is now running and printing "Thread alive" every second.
 *
 *  // let's let it run for 10 seconds
 *  Thread.sleep(10);
 *
 * // Now let's interrupt it (it will exit its while loop)
 * myThread.interrupt();
 * ```
 *
 * ### Observable Threads
 *
 * Decaf Thread instances are observable.  That is, they support event listeners and firing arbitrary events per thread.
 *
 * WHen a Thread exits, an "exit" event will be fired on the thread instance.  You might use this to spawn a new thread to replace the one that is exiting.
 *
 * You may listen on any other events by name and fire those on the thread instance as well.
 *
 * ### Thread instance "this"
 *
 * Each Thread instance has a "this" that points at an object with Thread local information.  You may store thread local data on the "this.data" object if you choose.
 *
 * In fact, many of the Decaf modules (add ons, repositories) store per-thread data on the "this" per thread.
 *
 * ### Passing arguments to Threads
 *
 * The Decaf implementation of Threads allows you to specify arguments to be passed to your Thread function.
 *
 * ```javascript
 * var Thread = require('Threads').Thread;
 *
 * var myThread = new Thread(function(a, b, c) {
 *    this.on('exit', function() {
 *        console.log('myThread exited');
 *    });
 *    console.log('a = ' + a);
 *    console.log('b = ' + b);
 *    console.log('c = ' + c);
 * }, 1, 2, 3);
 *
 * myThread.start();
 * // => a = 1
 * // => b = 2
 * // => c = 3
 * // and myThread exits:
 * // => myThread exited
 * ```
 */

/**
 * ## new Thread(fn, ...arguments) : Thread
 *
 * Create a new Thread
 *
 * Note: the thread isn't started, it is only created.  You must call the start() method of the newly created thread to start it running.
 *
 * ### Arguments:
 * - fn {function} - the function to be run in a new JVM thread
 * - ...arguments - optional arguments that will be passed to the function when the thread is started
 *
 * ### Returns:
 * - A reference to the "this" object for the new Thread.
 *
 * ### Example:
 *
 * ```javascript
 * var thread = new Thread(myThreadFunction);
 * ```
 *
 * @class Thread
 * @param {Function} fn - function to run as thread
 * @constructor
 */
function Thread(fn) {
    var args = [];
    for (var i = 1, len = arguments.length; i < len; i++) {
        args.push(arguments[i]);
    }
    decaf.extend(this, {
        fn        : fn,
        args      : args,
        lockCount : 0,
        data      : {}
    });
}

/**
 * ## static Thread.exit();
 *
 * Exit the currently running thread
 *
 * @method exit
 */
Thread.exit = function () {
    // THREAD.EXIT is caught to implement Decaf handling of Thread termination
    throw 'THREAD.EXIT';
};

/** @private */
var mainThread = {
    on : function () {

    }
};

/**
 * ## static Thread.currentThread() : Thread
 *
 * Get current Thread
 *
 * ### Returns
 * - {thread} "this" of currently running Thread.
 *
 * @method currentThread
 */
Thread.currentThread = function () {
    var t = java.lang.Thread.currentThread();
    return threads[t] || mainThread;
};

/**
 * ## static Thread.threadCount() : number
 *
 * Returns the number of threads created (not necessarily started).
 *
 * ### Returns:
 * - {number} - the number of threads created.
 *
 * @returns {number}
 */
Thread.threadCount = function() {
    return threadCount;
};

/**
 * ## static Thread.sleep(seconds)
 *
 * Puts the current thread to sleep.  In other words, defer to other running threads for specified number of seconds.
 *
 * A thread that is asleep blocks.  That is, it won't consume any CPU time until it is awaken.
 *
 * ### Arguments:
 * - {number} seconds - number of seconds to sleep.
 *
 * @method sleep
 * @param seconds
 */
Thread.sleep = function (seconds) {
    process.sleep(seconds);
};

/**
 * ## static Thread.usleep(millseconds)
 *
 * Puts the current thread to sleep.  In other words, defer to other running threads for specified number of milliseconds
 *
 * ### Arguments:
 * - {number} milliseconds - number of milliseconds to sleep.
 *
 * @method usleep
 * @param milliseconds
 */
Thread.usleep = function (milliseconds) {
    process.usleep(milliseconds);
};

/**
 * ## static Thread.interrupted() : boolean
 *
 * Check to see if current thread has been interrupted.
 *
 * A thread may interrupt another thread by calling it interrupt() method.
 *
 * ### Returns:
 * - true if current thread has been interrupted.
 */
Thread.interrupted = function () {
    return java.lang.Thread.interrupted();
};

decaf.extend(Thread.prototype, {
    /**
     * ## thread.start()
     *
     * Start the thread running
     *
     * @method start
     */
    start       : function () {
        var me = this;
        me.thread = new java.lang.Thread(new java.lang.Runnable({run : me.runHandler, scope : me})).start();
    },
    /**
     * ## thread.Interrupt()
     *
     * Interrupt the thread
     */
    interrupt   : function () {
        this.thread.interrupt();
    },
    /**
     * @private
     * @method runHandler
     */
    runHandler  : function () {
        var me = this.scope,
            t = java.lang.Thread.currentThread();

        addThread(t, me);
        try {
            me.fn.apply(me, me.args);
        }
        catch (e) {
            if (e !== 'THREAD.EXIT') {
                console.log(e.toString());
            }
        }
        finally {
            me.exitHandler(me);
        }
    },
    /**
     *
     * @private
     * @method exitHandler
     * @param me
     */
    exitHandler : function (me) {
        me.fire('exit');
        if (me.lockCount) {
            // unlock any mutexes
        }
        removeThread(me);
    }
});

/** @private */
decaf.extend(Thread.prototype, decaf.observable);

builtin.onIdle(function() {
    return threadCount != 0;
});

exports.Thread = Thread;
