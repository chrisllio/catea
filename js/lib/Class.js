define(function () {
    var initializing = false, fnTest = /xyz/.test(function () {
        xyz;
    }) ? /\b_super\b/ : /.*/;
    this.Class = function () {
    };
    Class.extend = function (prop) {
        var _super = this.prototype;
        initializing = true;
        var prototype = new this(), _static = {};
        initializing = false;

        // Copy the properties over onto the new prototype
        for (var name in prop) {
            if ("_static" == name.toLowerCase()) {
                _static = prop[name];
                continue;
            }
            // Check if we're overwriting an existing function
            prototype[name] = typeof prop[name] == "function" && typeof _super[name] == "function" && fnTest.test(prop[name]) ?
                (function (name, fn) {
                    return function () {
                        var tmp = this._super;
                        this._super = _super[name];
                        var ret = fn.apply(this, arguments);
                        this._super = tmp;
                        return ret;
                    };
                })(name, prop[name]) :
                prop[name];
        }
        function Class() {
            if (!initializing && this.init) {
                this.init.apply(this, arguments);
                //add by hubo
                if (this.ready) {
                    this.ready.apply(this);
                }
            }
        }

        for (var name in _static) {
            Class[name] = _static[name];
        }

        Class.prototype = prototype;
        Class.prototype.constructor = Class;
        Class.extend = arguments.callee;
        return Class;
    };
    return Class;
});