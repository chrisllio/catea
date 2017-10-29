define(['Class'], function (Class) {
    'use strict';
    return Class.extend({
        init: function () {
            this.keys = [];
            this.entries = [];
        },
        put: function (key, value) {
            var index = this.keys.indexOf(key);
            if (index === -1) {
                this.keys.push(key);
                this.entries.push({
                    key: key,
                    value: value
                });
            } else {
                var entry = this.entries[index];
                entry.value = value;
            }
        },
        remove: function (key) {
            var index = this.keys.indexOf(key);
            if (index !== -1) {
                this.keys.splice(index, 1);
                this.entries.splice(index, 1);
            }
            return index;
        },
        get: function (key) {
            var index = this.keys.indexOf(key);
            if (index !== -1) {
                return this.entries[index].value;
            } else {
                return null;
            }
        },
        getKeys: function () {
            return this.keys;
        },
        clear: function () {
            this.keys.splice(0, this.keys.length);
            this.entries.splice(0, this.entries.length);
        }
    });
});