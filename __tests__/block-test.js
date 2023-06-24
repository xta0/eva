const assert = require('assert');
const testUtil = require('./test-util')

module.exports = eva => {
    // Blcoks:
    assert.strictEqual(eva.eval([
        'begin',
        ['var', 'x', 10],
        ['var', 'y', 20],
        ['+', ['*', 'x', 'y'], 30],
    ]), 230);

    assert.strictEqual(eva.eval([
        'begin',
            ['var', 'x', 10],
            ['begin',
                ['var', 'x', 20],
                'x'
            ],
        'x',
    ]),10);

    assert.strictEqual(eva.eval(
    ['begin',
        ['var', 'foo', 10],
        ['var', 'bar', ['begin',
            ['var', 'x', ['+', 'foo', 10]],
            'x'
        ]],
        'bar' //return y
    ]
    ), 20)

    // variable assignment
    assert.strictEqual(eva.eval(
    ['begin',
        ['var', 'data', 10],
        ['begin',
            ['set', 'data', 100]
        ],
        'data'
    ]
    ), 100)

    testUtil.test(eva,
        `
        (begin
            (var x 10)
            (var y 20)
            (+ (* x 10 ) y)
        )
        `
        ,
        120
    );

};