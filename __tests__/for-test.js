const {test} = require('./test-util')

module.exports = eva => {
    // test for
    test(eva,
    `
    (begin
        (var y 0)
        (for
            (var x 10)
            (> x 0)
            (set x (- x 1))
            (begin
                (++ y)
            )
        )
        y
    )
    `,
    10
    );
}