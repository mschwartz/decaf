/*!
 * Created by mschwartz on 3/14/15.
 */

/*global global */

/**
 * # Unit Test framework
 */
/** @private */
(function() {
    var testNumber = 1;

    /**
     * ## desrcribe(description, fn)
     *
     * @param description
     * @param fn
     */
    function describe(description, fn) {
        testNumber = 1;
        console.log('--------------------');
        console.log('Unit Test: ' + description);
        if (fn() !== false) {
            console.log('    SUCCEEDED');
        }
    }

    /**
     * ## it(description, fn)
     *
     *
     * @param description
     * @param fn
     * @returns {*}
     */
    function it(description, fn) {
        console.log('- Test #' + testNumber + ': ' + description);
        testNumber++;
        return fn();
    }

    /** @private */
    global.describe = describe;
    global.it = it;

}());
