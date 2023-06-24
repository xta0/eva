const assert = require('assert')
const evaParser = require('../parser/evaParser')

function test(eva, code, expected) {
    const exp = evaParser.parse(`(begin ${code})`);
    // console.log("exp: ", exp)
    result = eva.evalGlobal(exp)
    assert.strictEqual(result, expected)
}

module.exports = {
    test,
};