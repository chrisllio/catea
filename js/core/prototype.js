/**
 * Created by obladi on 15/8/18.
 */
(function () {
    'use strict';
    if (!Function.prototype.bind) {
        Function.prototype.bind = function (oThis) {
            if (typeof this !== "function") {
                throw new TypeError(
                    "Function.prototype.bind - what is trying to be bound is not callable");
            }
            var aArgs = Array.prototype.slice.call(arguments, 1), fToBind = this, fNOP = function () {
            }, fBound = function () {
                return fToBind.apply(this instanceof fNOP && oThis ? this
                    : oThis || window, aArgs.concat(Array.prototype.slice
                    .call(arguments)));
            };
            fNOP.prototype = this.prototype;
            fBound.prototype = new fNOP();
            return fBound;
        };
    }

    Date.prototype.toJSON = Date.prototype.toString = function () {
        var y = this.getFullYear();
        var m = this.getMonth() + 1;
        var d = this.getDate();
        return y + '-' + (m < 10 ? ('0' + m) : m) + '-' + (d < 10 ? ('0' + d) : d);
    };

    Date.prototype.term = function (num, type) {
        var result = new Date(this.getFullYear(), this.getMonth(), this.getDate());
        if (!type || type === 'year') {
            result.setYear(this.getFullYear() + num);
            //处理2月份问题，选择2月份29号时，上一年应该为2月份最后一天而不是三月份第一天
            if (result.getMonth() !== this.getMonth()) {
                result.setMonth(this.getMonth());
                result.setDate(this.getDate() - 1);
            }
        } else if (type === 'month') {
            result.setMonth(this.getMonth() + num);
        } else if (type === 'day') {
            result.setTime(this.getTime() + 1000 * 60 * 60 * 24 * num);
        }
        return result;
    };

    String.uuid = function () {
        var result = [];
        for (var i = 1; i <= 32; i++) {
            var n = Math.floor(Math.random() * 16.0).toString(16);
            result.push(n);
            if ((i === 8) || (i === 12) || (i === 16) || (i === 20))
                result.push("-");
        }
        return result.join("");
    };

    String.prototype.trim = function () {
        var str = this,
            str = str.replace(/^\s\s*/, ''),
            ws = /\s/,
            i = str.length;
        while (ws.test(str.charAt(--i))) ;
        return str.slice(0, i + 1);
    };

    String.prototype.replaceSpace = function (split) {
        return this.trim().replace(/\s+/g, " ").split(split ? split : "");
    };

    String.prototype.endWith = function (str) {
        return new RegExp(str + "$").test(this);
    };

    String.prototype.startWith = function (str) {
        return new RegExp("^" + str).test(this);
    };

    if (!("forEach" in Array.prototype)) {
        Array.prototype.forEach = function (callback, context) {
            for (var i = 0; i < this.length; i++) {
                typeof callback === "function" ? callback.call(context, this[i], i, this) : null;
            }
        }
    }

    Array.prototype.displace = function (from, to, replace) {
        var fv = this[from], tv = this[to];
        if (replace) {
            this.splice(from, 1, tv);
            this.splice(to, 1, fv);
        } else {
            if (from > to) {
                this.splice(to, 1, fv, tv);
                this.splice(from + 1, 1);
            } else {
                this.splice(from, 1);
                this.splice(to, 1, fv, this[to]);
            }
        }
    };
    Array.prototype.addTo = function (data, to) {
        if (to > 0) {
            var _data = [].concat(this.slice(0, to), data, this.slice(to)), length = this.length;
            this.splice.apply(this, [0, length].concat(_data));
        } else {
            if (to == 0 && this.length == 0) {
                this.push(data);
            } else {
                this.unshift(data);
            }
        }
    };
    Array.prototype.indexOf = function (data, filter) {
        var result = -1, i = 0, length = this.length, item = null;
        for (; i < length; i++) {
            item = this[i];
            if ((filter && filter.apply(item, [i, data])) || (data == item)) {
                result = i;
                break;
            }
        }
        return result;
    };

    Array.prototype.split = function (length) {
        var result = [], i = 0, j = 0, newArray, size = (Math.floor(this.length / length) + this.length % length);
        for (; i < size; i++) {
            newArray = [];
            for (j = 0; j < length; j++) {
                if (this[length * i + j]) {
                    newArray.push(this[length * i + j]);
                }
            }
            result.push(newArray);
        }
        return result;
    };

})();