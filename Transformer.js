/*
AST Transformer
*/

class Transformer {
    /*
    Translates `def` (function declaration)
    into a variable declaration with a lambda expression
     */
    transformDefToLambda(exp) {
        const [_tag, name, params, body] = exp;
        return ['var', name, ['lambda', params, body]];
    }
    transformSwitchToIf(exp) {
        const [_tag, ...cases] = exp;
        const ifExp = ['if', null, null, null]

        let current = ifExp
        for(let i=0; i<cases.length-1; i++){
            const [currentCond, currentBlock] = cases[i];
            current[1] = currentCond
            current[2] = currentBlock
            const next = cases[i+1]
            const [nextCond, nextBlock] = next
            current[3] = nextCond === 'else'? nextBlock : ['if', null, null, null];
            current = current[3]
        }
        return ifExp
    }
    transformForToWhile(exp) {
        const [_tag, init, cond, modifier, block] = exp;
        const whileExp = ['begin', init, ['while', cond, ['begin', block, modifier]]]
        return whileExp
    }
    transformIncToSet(exp) {
        const [_tag, name] = exp;
        const setExp = ['set', name, ['+', name, 1]]
        return setExp
    }
    transformDecToSet(exp) {
        const [_tag, name] = exp;
        const setExp = ['set', name, ['-', name, 1]]
        return setExp
    }
}

module.exports = Transformer;