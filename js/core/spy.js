define(function () {
    'use strict';
    var Observer = function () {
            var _this = this;
            _this.initialize = function (value) {
                _this._value = value;
                _this._subscribers = [];
                _this._beforeHandlers = [];
            };
            _this._notify = function (subscriber, byForce) {
                subscriber(_this._value, byForce);
            };
            _this.subscribe = function (subscriber) {
                var subscribers = _this._subscribers;
                if (typeof subscriber != "function") throw new Error("The subscriber must be a function.");
                if (subscribers.indexOf(subscriber) == -1) {
                    subscribers.push(subscriber);
                }
                return {	// return subscriber
                    dispose: function () {
                        var pos = subscribers.indexOf(subscriber);
                        if (pos > -1) {
                            subscribers.splice(pos, 1);
                        }
                    },
                    notify: function () {
                        _this._notify(subscriber, true);
                    },
                    beforeChange: function (handler) {
                        _this.beforeChange(handler);
                    }
                }
            };
            _this.beforeChange = function (handler) {
                var handlers = _this._beforeHandlers;
                if (typeof handler != "function") throw new Error("beforeChange handler must be a function.");
                if (handlers.indexOf(handler) == -1) {
                    handlers.push(handler);
                }
                return {
                    dispose: function () {
                        var pos = handlers.indexOf(handler);
                        if (pos > -1) {
                            handlers.splice(pos, 1);
                        }
                    }
                }
            };
            _this.notifyAll = function () {
                _this._subscribers.forEach(function (subscriber) {
                    _this._notify(subscriber, true);
                });
            };
            _this._setValue = function (value, byForce) {
                if (byForce || JSON.stringify(_this._value) !== JSON.stringify(value)) {
                    var count = _this._beforeHandlers.length;
                    for (var i = 0; i < count; i++) {
                        if (!_this._beforeHandlers[i](value)) return;
                    }
                    _this._value = value;
                    _this.notifyAll();
                }
            };
            _this._getValue = function () {
                return _this._value;
            };
        },
        arrayProtos = [
            {name: "addTo", isChanger: true},
            {name: "concat"},
            {name: "displace", isChanger: true},
            {name: "indexOf"},
            {name: "join"},
            {name: "length"},
            {name: "push", isChanger: true},
            {name: "pop", isChanger: true},
            {name: "reverse", isChanger: true},
            {name: "shift", isChanger: true},
            {name: "slice", isChanger: true},
            {name: "sort", isChanger: true},
            {name: "splice", isChanger: true},
            {name: "toLocaleString"},
            {name: "toString"},
            {name: "split"},
            {name: "unshift", isChanger: true}
        ];
    return {
        observable: function (initValue) {
            var observer = new Observer();
            observer.initialize(initValue);
            var result = function () {
                if (arguments.length > 0) {
                    observer._setValue(arguments[0]);
                } else {
                    return observer._getValue();
                }
            };
            for (var proto in observer) {
                if (proto.indexOf("_") != 0) {
                    result[proto] = observer[proto];
                }
            }
            result.dispose = function(){
                observer = null;
                result = null;
            }
            return result;
        },
        observableArray: function (initValue) {
            initValue = initValue || [];
            if (typeof initValue != 'object' || !('length' in initValue)) throw new Error("The argument passed when initializing an observable array must be an array, or null, or undefined.");
            var result = this.observable(initValue), count = arrayProtos.length;
            for (var i = 0; i < count; i++) {
                var _this = arrayProtos[i];
                var proto = initValue[_this.name];
                if (typeof proto == "function" && _this.isChanger) {
                    result[_this.name] = function () {
                        result()[_this.name].apply(result(), arguments);
                        result.notifyAll();
                    }
                } else {
                    result[_this.name] = result()[_this.name];
                }
            }
            return result;
        }
    };
});