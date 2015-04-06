Decaf JVM Threads Support
=========================

Since Decaf runs in Rhino which runs on top of the JVM, native JVM threads and associated APIs are supported.

The following example illustrates how trivial it is to use Threads in Decaf.

```javascript
// Demonstrate threads in Decaf
var Thread = require('Threads').Thread;

var sharedGlobal = 0;

// decaf will call main() after initialization
function main() {
    new Thread(function() {
        while (1) {
            Thread.sleep(1);
            console.log('sharedGlobal = ' + sharedGlobal);
        }
    }).start();
    new Thread(function() {
        while (1) {
            Thread.sleep(1);
            sharedGlobal++;
        }
    }).start();
}
```

The global sharedGlobal variable is accessed by both threads.  

What the program does not demonstrate is thread safety.  You might expect the first thread to print:
```
sharedGlobal = 1
sharedGlobal = 2
sharedGlobal = 3
sharedGlobal = 4
sharedGlobal = 5
```

Since there is a race condition between the two threads, you might see output like this:
```
sharedGlobal = 2
sharedGlobal = 3
sharedGlobal = 4
sharedGlobal = 5
```

This is because the second thread might get the chance to increment sharedGlobal twice before the first thread runs.

## sync(fn, locl) : function

Return a synchronized function

Rhino provides a global sync() function that returns a function that is synchronized.  

When two or more threads attempting to execute a synchronized function, only one will enter the subroutine and the other(s) will block until the subroutine is exited.  There is no guarantee on the order the threads will get to enter the routine.

### Arguments:
- fn {function} - User function that will be synchronized
- lock {object} - Optional (any arbitrary) object to synchronize on

The optional obj argument allows you to synchronize methods against an object.  If this argument is not present, then the global object is used by default.
 
If you do not specify the optional lock object, then all your synchronized methods will block, only allowing one thread at a time to enter ANY of them.

If you do specify the optional lock object, you may control which methods may be simultaneously entered by multiple threads.  A fine grain means of synchronization.

To clarify this, see the following two examples.

### Example 1:

The following example uses synchronized methods to assure only one thread accesses sharedGlobal at a time:

```javascript
// Demonstrate threads in Decaf
var Thread = require('Threads').Thread;

var sharedGlobal = 0;

// only one thread at a time may enter any of these methods:
// bumpShared()
// getShared()
// logShared()

var bumpShared = sync(function() {
    sharedGlobal++;
});

var getShared = sync(function() {
    return sharedGlobal;
});

var logShared = sync(function() {
    console.log('shared');  // note global is not accessed here...
});

// decaf will call main() after initialization
function main() {
    new Thread(function() {
        while (1) {
            Thread.sleep(1);
            console.log('sharedGlobal = ' + getShared());
        }
    }).start();
    new Thread(function() {
        while (1) {
            Thread.sleep(1);
            bumpShared();
        }
    }).start();
}
```

### Example 2:

```javascript
// Demonstrate threads in Decaf
var Thread = require('Threads').Thread;

var sharedGlobal = 0;

// only one thread at a time may enter any of these methods:
// bumpShared()
// getShared()
// 
// However:
// logShared() can be entered while one of those other two are entered by another thread because logShared() is synchronized on global(this).

var bumpShared = sync(function() {
    sharedGlobal++;
}, sharedGlobal);

var getShared = sync(function() {
    return sharedGlobal;
}, sharedGlobal);

var logShared = sync(function() {
    console.log(sharedGlobal);
});

// decaf will call main() after initialization
function main() {
    new Thread(function() {
        while (1) {
            Thread.sleep(1);
            console.log('sharedGlobal = ' + getShared());
        }
    }).start();
    new Thread(function() {
        while (1) {
            Thread.sleep(1);
            bumpShared();
        }
    }).start();
}
```

## Semaphores

Decaf implements Semaphores as another means of blocking access to global variables from multiple threads concurrently.  

Semaphores are implemented on top of java.util.concurrent.locks.ReentrantLock.

## Conditions

Decaf implements Conditions as a means for threads to signal one another and to wait for those signals in a blocking/friendly manner.
