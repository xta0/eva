const {test} = require('./test-util')

module.exports = eva => {

    // math functions:
    test(eva, `(+ 1 5)`, 6);
    test(eva, `(+ (+ 3 2) 5)`, 10);
    test(eva, `(+ 5 (+ 3 2))`, 10);
    test(eva, `(+ (+ 3 2) (+ 4 4))`, 13);

    // comparison:
    test(eva, `(> 1 5)`, false);
    test(eva, `(< 1 5)`, true);
    test(eva, `(<= 1 5)`, true);
    test(eva, `(>= 1 5)`, false);
    test(eva, `(= 5 5)`, true);

};