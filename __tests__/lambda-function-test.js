const {test} = require('./test-util')

module.exports = eva => {
    test(eva,
        `
            (begin
                (def onClick(fn)
                    (begin
                        (var x 10)
                        (var y 10)
                        (fn (+ x y))
                    )
                )
                (onClick (lambda (data) (* data 10)))
            )
        `,
        200
        );

    // Immediately-invoked lamdba expression - IILE:
    test(eva,
        `
            ((lambda (x) (* x x)) 2)
        `,
        4
    );
    // save lamdba to a variable
    test(eva,
    `(begin
        (var square (lambda (x) (* x x)))
        (square 2)
    )
    `,
    4
    );
}
