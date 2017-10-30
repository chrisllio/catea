define(['AnimationFrame'], function () {
    'use strict';
    return {
        /**
         * 合并dom对象属性到目标对象
         * @param target 目标对象
         * @param node  dom对象
         * @returns {*}
         */
        setProperties: function (target, node) {
            var mapper = {};
            for (var name in target) {
                if (target.hasOwnProperty(name))
                    mapper[name.toUpperCase()] = name;
            }
            $(node.attributes).each(function () {
                var name = mapper[this.nodeName.toUpperCase()],
                    value = this.value;
                if (value !== undefined && value !== null && typeof value === "string") {
                    if (value.indexOf("function!") === 0) {
                        value = typeof window[value] === "function" ? window[value]() : value;
                    } else if (value.indexOf("json!") === 0) {
                        value = JSON.parse(value);
                    }
                }
                target[name ? name : this.nodeName] = value;
            });
            return target;
        },
        /**
         * 查找并返回方法，可接受function或string，找不到时返回Null
         * @param value
         * @returns {*}
         */
        findFunction: function (value, context) {
            if (typeof value === "string") {
                if (value.length === 0) return null;
                var paths = value.split("."), func = (context ? context : window)[paths.shift()];
                while (paths.length > 0) {
                    func = func[paths.shift()];
                }
                return (func === undefined || func === null) ? null : func;
            } else if (typeof value === "function") {
                return value;
            } else {
                return null;
            }
        },
        apply: function () {
            var args = Array.prototype.slice.call(arguments), func = args.shift(), context = args.shift();
            func = typeof func === "string" ? window[func] : func;
            if (typeof func === "function") {
                return func.apply(context, args);
            } else {
                return undefined;
            }
        },
        atomicTypeOf: function (value) {
            var type = typeof value;
            if (type === 'number') {
                return isNaN(value) ? 'NaN' : type;
            } else if (type === 'object') {
                if (value === null) {
                    return 'null';
                } else if (value instanceof Array) {
                    return 'array';
                } else if (value instanceof Date) {
                    return 'date';
                } else {
                    return 'object';
                }
            } else {
                return type;
            }
        },
        getBoolean: function (value) {
            var type = this.atomicTypeOf(value);
            if (type === 'boolean') {
                return value;
            } else if (type === 'string') {
                if (value.toLowerCase() === 'true') {
                    return true;
                } else if (value.toLowerCase().startWith('function!')) {
                    var fn = this.findFunction(str.substring(9));
                    return (fn === null ? false : this.getBoolean(fn()));
                } else if (value.length === 0) {
                    return false;
                } else {
                    if (isNaN(value)) {
                        return false;
                    } else {
                        return !Number(value);
                    }
                }
            } else if (type === 'function') {
                return this.getBoolean(value());
            } else {
                return !!value;
            }
        },
        getString: function (value) {
            var type = this.atomicTypeOf(value);
            if (type === 'null' || type === 'undefined' || type === 'NaN') {
                return null;
            } else if (type === 'string') {
                if (value.toLowerCase().startWith('function!')) {
                    var fn = this.findFunction(str.substring(9));
                    return (fn === null ? false : this.getString(fn()));
                } else {
                    return value.length === 0 ? null : value;
                }
            } else if (type === 'function') {
                return this.getString(value());
            } else {
                return JSON.stringify(value);
            }
        },
        getArray: function (value) {
            var type = this.atomicTypeOf(value), _this = this;
            if (type === 'undefined' || type === 'null' || type === 'NaN') {
                return null;
            } else if (type === 'array') {
                return value;
            } else if (type === 'string') {
                if (value.toLowerCase().startWith('function!')) {
                    var fn = window[value.substring(9)];
                    if (typeof fn === 'function') {
                        var result = fn();
                        return _this.getArray(result);
                    } else {
                        return null;
                    }
                } else if (value.toLowerCase().startWith('array!')) {
                    var define = value.split('!'), length = define.length,
                        innerType = length > 2 ? define[1].toLowerCase() : '',
                        result = value.substring(6 + (innerType === '' ? 0 : innerType.length + 1)).split(',');
                    if (innerType === 'number') {
                        result.forEach(function (v, i) {
                            result[i] = _this.getNumber(v);
                        });
                    } else if (innerType === 'json') {
                        result.forEach(function (v, i) {
                            result[i] = JSON.parse(v);
                        });
                    } else if (innerType === 'object') {
                        result.forEach(function (v, i) {
                            result[i] = eval(v);
                        });
                    } else if (innerType === 'date') {
                        result.forEach(function (v, i) {
                            result[i] = _this.getDate(v);
                        });
                    } else if (innerType === 'boolean') {
                        result.forEach(function (v, i) {
                            result[i] = _this.getBoolean(v);
                        });
                    } else if (innerType === 'array') {
                        result.forEach(function (v, i) {
                            result[i] = _this.getArray(v);
                        });
                    }
                    return result;
                } else {
                    return value.split(',');
                }
            } else if (type === 'function') {
                return _this.getArray(value());
            } else {
                return [value];
            }
        },
        getNumber: function (value) {
            var type = this.atomicTypeOf(value), _this = this;
            if (type === 'number') {
                return value;
            } else if (type === 'null' || type === 'undefined' || type === 'NaN') {
                return null;
            } else if (type === 'function') {
                return _this.getNumber(value());
            } else {
                var result = value;
                if (type === 'string') {
                    if (value.length === 0) {
                        result = null;
                    } else if (value.toLowerCase().startWith('function!')) {
                        var fn = window[value.substring(9)];
                        if (typeof fn === 'function') {
                            result = _this.getNumber(fn());
                        } else {
                            result = null;
                        }
                    } else {
                        result = Number(value);
                    }
                } else {
                    result = Number(value);
                }
                return (result === null || isNaN(result)) ? null : result;
            }
        },
        getDate: function (d) {
            if (d === null || d === undefined) return null;
            if (d instanceof Date) return d;
            if (typeof d === "number") return new Date(d);
            var result = d;
            if (!isNaN(result)) {
                result = result.toString();
                if (result.length >= 6) {
                    var year = result.substring(0, 4),
                        month = ( result.substring(4, 5) !== '0' && result.length < 8 ) ? result.substring(4, 5) : result.substring(4, 6),
                        day = result.substring(4 + month.length),
                        hour = day.length > 2 ? day.substring(2) : "08",
                        minute = hour.length > 2 ? hour.substring(2) : "00",
                        seconds = minute.length > 2 ? minute.substring(2) : "00";
                    var fix = function (s, toLength) {
                            if (s.length >= toLength) {
                                return s.substring(0, toLength);
                            } else if (s.length < toLength) {
                                var r = s;
                                for (var i = s.length; i < toLength; i++) {
                                    r = "0" + r;
                                }
                                return r;
                            }
                        },
                        month = fix(month, 2),
                        day = fix(day, 2),
                        hour = fix(hour, 2),
                        minute = fix(minute, 2),
                        seconds = fix(seconds, 2);
                    var ds = [year, month - 1, day, hour, minute, seconds],
                        ts = ['getFullYear', 'getMonth', 'getDate', 'getHours', 'getMinutes', 'getSeconds'];
                    result = new Date(year + "/" + month + "/" + day + " " + hour + ":" + minute + ":" + seconds);
                    for (var i = 0; i < 6; i++) {
                        if (Number(ds[i]) != result[ts[i]]()) return null;
                    }
                    return result;
                } else {
                    return null;
                }
            } else if (typeof d == "string") {
                if (d.startWith('function!')) {
                    var fn = window[d.substring(9)];
                    if (typeof fn === 'function') {
                        var result = fn();
                        return this.getDate(result);
                    } else {
                        return null;
                    }
                } else {
                    var result = d.replace(/[-年月]/g, '/').replace(/日/g, ' ').replace(/[时分]/g, ':').replace(/秒/g, ''),
                        ds = result.match(/\d+/g),
                        ts = ['getFullYear', 'getMonth', 'getDate', 'getHours', 'getMinutes', 'getSeconds'],
                        len = ds == null ? 0 : ds.length;
                    if (len < 3) return null;
                    result = new Date(result);
                    for (var i = 0; i < len; i++) {
                        if (Number(i == 1 ? (ds[i] - 1) : ds[i]) != result[ts[i]]() || isNaN(ds[i])) return null;
                    }
                    return result;
                }
            } else {
                return null;
            }
        },
        getStyleSize: function (value) {
            if (isNaN(value)) return value;
            else return value + "px";
        },
        isSupported: function (tagNam, attrName) {
            return attrName in document.createElement(tagNam);
        },
        execute: function (methodName, args, context) {
            return context[methodName].apply(context, args);
        },
        executeWithNextFrame: function (methodName, args, context, callback) {
            var _this = this;
            requestAnimationFrame(function () {
                var value = _this.execute(methodName, args, context);
                if (typeof callback === 'function') callback.apply(context, [value]);
            })
        },
        keyCodeTest: {
            ")": function (event) {
                return (event.keyCode || event.which) == 48 && event.shiftKey;
            },
            "!": function (event) {
                return (event.keyCode || event.which) == 49 && event.shiftKey;
            },
            "@": function (event) {
                return (event.keyCode || event.which) == 50 && event.shiftKey;
            },
            "#": function (event) {
                return (event.keyCode || event.which) == 51 && event.shiftKey;
            },
            "$": function (event) {
                return (event.keyCode || event.which) == 52 && event.shiftKey;
            },
            "%": function (event) {
                return (event.keyCode || event.which) == 53 && event.shiftKey;
            },
            "^": function (event) {
                return (event.keyCode || event.which) == 54 && event.shiftKey;
            },
            "&": function (event) {
                return (event.keyCode || event.which) == 55 && event.shiftKey;
            },
            "*": function (event) {
                return (event.keyCode || event.which) == 56 && event.shiftKey;
            },
            "(": function (event) {
                return (event.keyCode || event.which) == 57 && event.shiftKey;
            },
            "{": function (event) {
                return (event.keyCode || event.which) == 219 && event.shiftKey;
            },
            "}": function (event) {
                return (event.keyCode || event.which) == 221 && event.shiftKey;
            },
            "<": function (event) {
                return (event.keyCode || event.which) == 188 && event.shiftKey;
            },
            ">": function (event) {
                return (event.keyCode || event.which) == 190 && event.shiftKey;
            },
            "?": function (event) {
                return (event.keyCode || event.which) == 191 && event.shiftKey;
            },
            "|": function (event) {
                return (event.keyCode || event.which) == 220;
            },
            "\"": function (event) {
                return (event.keyCode || event.which) == 222 && event.shiftKey;
            },
            ":": function (event) {
                return (event.keyCode || event.which) == 186 && event.shiftKey;
            },
            "~": function (event) {
                return (event.keyCode || event.which) == 192 && event.shiftKey;
            },
            "[": function (event) {
                return (event.keyCode || event.which) == 219;
            },
            "]": function (event) {
                return (event.keyCode || event.which) == 221;
            },
            ",": function (event) {
                return (event.keyCode || event.which) == 188;
            },
            ".": function (event) {
                return (event.keyCode || event.which) == 190;
            },
            "/": function (event) {
                return (event.keyCode || event.which) == 191;
            },
            "'": function (event) {
                return (event.keyCode || event.which) == 222;
            },
            ";": function (event) {
                return (event.keyCode || event.which) == 186;
            },
            "`": function (event) {
                return (event.keyCode || event.which) == 192;
            },

            "\\": function (event) {
                return (event.keyCode || event.which) == 103;
            }
        }
    }
});