const Eva = require('../Eva')

const tests = [
    require('./self-eval-test.js'),
    require('./variable-test.js'),
    require('./math-test.js'),
    require('./block-test.js'),
    require('./if-test.js'),
    require('./while-test.js'),
    require('./built-in-function-test.js'),
    require('./user-defined-function-test.js'),
    require('./lambda-function-test.js'),
    require('./switch-test.js'),
    require('./for-test.js'),
    require('./class-test.js'),
    require('./module-test.js'),
    require('./import-test.js'),
]

const eva = new Eva();

tests.forEach(test => {
    test(eva)
});

eva.eval(['print', '"Hello"', '"World!"'])
console.log("All assertions passed!")