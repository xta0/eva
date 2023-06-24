class Environment {
    constructor(record={}, parent = null){
        this.record = record;
        this.parent = parent;
    }
    define(name, value) {
        this.record[name] = value;
        return value;
    }
    assign(name, value) {
        this.resolve(name).record[name] = value;
        return value;
    }
    lookup(name) {
        return this.resolve(name).record[name];
    }
    // identifier resolution
    resolve(name){
        if(this.record.hasOwnProperty(name)){
            return this;
        }
        if (this.parent == null){
            throw new ReferenceError(`Variable "${name}" is undefined.`)
        }
        return this.parent.resolve(name);
    }
}

module.exports = Environment;