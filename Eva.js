const Environment = require('./Environment')
const Transformer = require('./Transformer')
const evaParser = require ('./parser/evaParser')
const fs = require('fs');

class Eva {
    /*
     * Creates an Eva instance with the global environment
     */
    constructor(global = GlobalEnvironment) {
        this.global = global;
        this._transformer = new Transformer()
    }
    /*
    * Evaluates global code wrapping into a block
    */
    evalGlobal(exp){
        return this._evalBody(
            exp,
            this.global
        )
    }
    /*
    * Evaluates an expression in the given environment
    */
    eval(exp, env = this.global) {
        if(this._isNumber(exp)){
            return exp;
        }
        if (this._isString(exp)){
            return exp.slice(1, -1)
        }

        // --------------------------
        // Blocks
        if (exp[0] === 'begin') {
            const blockEnv = new Environment({}, env)
            return this._evalBlock(exp, blockEnv);
        }

        // ---------------------------
        // Variable declaration:

        if (exp[0] === 'var') {
            const [_, name, value] = exp;
            return env.define(name, this.eval(value, env));
        }
        // ---------------------------
        // Variable update: (sef foo 10)
        // (set (prop self x) x)
        if (exp[0] === 'set') {
            const [_, ref, value] = exp;

            // assign to a property
            if (ref[0] === 'prop'){
                const [_, instance, propName] = ref
                const instanceEnv = this.eval(instance, env);

                return instanceEnv.define(
                    propName,
                    this.eval(value, env),
                );
            }
            return env.assign(ref, this.eval(value, env));
        }

        //-----------------------------
        // Variable access:
        if (this._isVariableName(exp)) {
            return env.lookup(exp);
        }

        //-----------------------------
        // if-expressions
        if (exp[0] === 'if') {
            const [_tag, condition, consequent, alternative] = exp
            if(this.eval(condition, env)) {
                return this.eval(consequent, env)
            }
            return this.eval(alternative, env)
        }

        //-----------------------------
        // while-expressions:
        if (exp[0] === 'while') {
            const [_tag, condition, block] = exp
            let result;
            while(this.eval(condition,env)){
                result = this.eval(block,env);
            }
            return result
        }

        //-----------------------------
        // for-loop: syntactic sugar for while
        if (exp[0] === 'for'){
            const whileExp = this._transformer.transformForToWhile(exp)
            return this.eval(whileExp, env)
        }

        //-----------------------------
        // ++: syntactic sugar for (set x ( + x 1))
        if(exp[0] === '++') {
            const setExp = this._transformer.transformIncToSet(exp)
            return this.eval(setExp, env)
        }

        //-----------------------------
        // --: syntactic sugar for (set x ( - x 1))
        if(exp[0] === '--') {
            const setExp = this._transformer.transformDecToSet(exp)
            return this.eval(setExp, env)
        }

        //-----------------------------
        // function declaration: (def square (x) (* x x))
        //
        // syntactic sugar for: (var sqaure (lambda (x) (* x x)))
        if (exp[0] === 'def') {
            // const [_tag, name, params, body] = exp;
            // const fn = {
            //     params,
            //     body,
            //     env, //closure! parent scope
            // };
            // // register fn to the current env
            // return env.define(name, fn);

            // Another way to implement is to use lambda expression
            // JIT-transpile to a variable declaration
            // const varExp = ['var', name, ['lambda', params, body]]
            const varExp = this._transformer.transformDefToLambda(exp)
            return this.eval(varExp, env)
        }

        //-----------------------------
        // Switch: (switch (cond1  block1)..)
        // syntactic sugar for nested if-expressions
        if (exp[0] === 'switch') {
            const ifExp = this._transformer.transformSwitchToIf(exp)
            return this.eval(ifExp, env)
        }

        //-----------------------------
        // Lambda function: (lambda (x) (* x x))
        if (exp[0] === 'lambda') {
            // lambda is just an anonymous function
            const [_tag, params, body] = exp;
            return {
                params,
                body,
                env, //closure! parent scope
            };
        }

        //-----------------------------
        // Class declaration: (class <Name> <Parent> <Body>)
        if (exp[0] === 'class'){
            const [_tag, name, parent, body] = exp;
            // a class is an environment!
            // a storage of methods and shared properties
            const parentEnv = this.eval(parent, env) || env;
            const classEnv = new Environment({}, parentEnv);
            this._evalBody(body, classEnv);
            return env.define(name, classEnv);
        }

        //-----------------------------
        // Super expressions: (super <ClassName>)
        if (exp[0] === 'super') {
            const [_tag, className] = exp;
            return this.eval(className, env).parent
        }

        //-----------------------------
        // Class instantiation: (new <Class> <Arguments>...)
        if (exp[0] === 'new') {
            const classEnv = this.eval(exp[1], env)
            // an instance of a class is an environment!
            // the `parent` component of the instance environment is set to its class
            const instanceEnv = new Environment({}, classEnv);

            const args = exp.slice(2).map(arg => this.eval(arg, env))
            this._callUserDefinedFunction(classEnv.lookup('constructor'), [instanceEnv, ...args]);
            return instanceEnv;
        }

        //-----------------------------
        // property access: (prop <instance> <name>)
        // (prop p cacl)
        if (exp[0] === 'prop') {
            const [_tag, instance, name] = exp
            const instanceEnv = this.eval(instance, env)
            return instanceEnv.lookup(name);
        }

        //-----------------------------
        // Module declaration: (module <name> <body>)
        if (exp[0] === 'module') {
            const [_tag, name, body] = exp
            const moduleEnv = new Environment({}, env)
            this._evalBody(body, moduleEnv);
            return env.define(name, moduleEnv);
        }

        //-----------------------------
        // Module import: (import <name>)
        if (exp[0] === 'import') {
            const [_tag, name] = exp;
            const moduleSrc = fs.readFileSync(
                `${__dirname}/modules/${name}.eva`,
                'utf-8'
            );
            const body = evaParser.parse(`(begin ${moduleSrc})`)
            const moduleExp = ['module', name, body]
            return this.eval(moduleExp, this.global)
        }


        //-----------------------------
        // function calls
        //
        // (print "Hello World")
        // (+ x 5)
        // (< foo bar)
        if (Array.isArray(exp)) {
            const fn = this.eval(exp[0], env);
            const args = exp.slice(1).map(arg => this.eval(arg, env));
            // 1. native function:
            if(typeof fn === 'function') {
                const result = fn(...args);
                return result
            }
            // 2. user-defined function:
            return this._callUserDefinedFunction(fn, args)

        }
        throw `Unimplemented: ${JSON.stringify(exp)}`;
    }

    _callUserDefinedFunction(fn, args){
        const activationRecord = {}; //store local variables and function parameters
        // pre-install all the params to the environment
        fn.params.forEach((param, index)=>{
            activationRecord[param] = args[index]
        })
        const activationEnv = new Environment(
            activationRecord,
            fn.env, // closure, static scope
        )
        return this._evalBody(fn.body, activationEnv)
    }

    _evalBody(body, env) {
        if(body[0] === 'begin'){
            return this._evalBlock(body, env);
        }
        return this.eval(body, env)
    }

    _evalBlock(block, env) {
        let result;
        const [_tag, ...expressions] = block
        expressions.forEach(exp => {
            result = this.eval(exp, env);
        });
        return result;
    }

    _isNumber(exp) {
        return typeof exp === 'number'
    }

    _isString(exp) {
        return typeof exp === 'string' && exp[0] === '"' && exp.slice(-1) === '"';
    }

    _isVariableName(exp) {
        return typeof exp === 'string' && /^[+\-*/<>=a-zA-Z0-9_]+$/.test(exp);
    }
}

const GlobalEnvironment = new Environment({
    null: null,
    true: true,
    false: false,
    VERSION: '0.1',

    // Math:
    '+'(op1, op2) {
        return op1 + op2
    },
    '-'(op1, op2) {
        if(op2 === null || op2 === undefined){
            return -op1
        }
        return op1 - op2
    },
    '*'(op1, op2) {
        return op1 * op2
    },
    '/'(op1, op2) {
        return op1 / op2
    },

    // Comparison:
    '>'(op1, op2) {
        return op1 > op2
    },
    '>='(op1, op2) {
        return op1 >= op2
    },
    '<'(op1, op2) {
        return op1 < op2
    },
    '<='(op1, op2) {
        return op1 <= op2
    },
    '='(op1, op2) {
        return op1 === op2
    },

    // Console output:
    print(...args) {
        console.log(...args)
    }
});


module.exports = Eva;