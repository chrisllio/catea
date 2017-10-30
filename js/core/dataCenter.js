define(function () {
    /**
     * path语法
     * 支持：
     * 1）a.b.c.d 某一个数据对象，或者数据对象中的属性
     * 2) a.b.c.d[0~n]监听Array某一行
     * 3) a.b.c[0~n].d 监听Array某一行中某一列的值，可能是string等基本对象，可能是jsObject
     * 4) a.b.c[0].d.e[0] 实现Array嵌套
     */
    var
        /**
         * 以dataObj、dataSet的格式存放数据.key为path
         * @type {{}}
         */
        cache = {},
        /**
         * 存放数据变化监听器
         * @type {{}}
         */
        listener = {},
        checkArrayRegex = /\[[\d]*]/,
        parseArrayIndexRegex = /[^\[]+(?=])/g,
        dataCenter = {
            getJSON: function (path) {
                return JSON.stringify(this.get(path));
            },
            /**
             * 从数据中心中获取数据
             * @param path 数据路径a.b.c.d的格式
             * @param context 上下文数据，如果指定上下文，则会相对于这个上下文根据dataPath查找
             * @returns {{}}
             */
            get: function (path) {
                if (path == null || path == undefined || path.length == 0) return undefined;
                var result;
                if (checkArrayRegex.test(path)) {
                    var paths = path.split("."), data = cache;
                    while (paths.length && data) {
                        var next = paths.shift();
                        if (checkArrayRegex.test(next)) {//c[0] 还有 c[0][1][2]
                            data = data[next.substring(0, next.indexOf("["))];
                            if (data) {
                                var matches = next.match(parseArrayIndexRegex);
                                if (matches instanceof Array) {
                                    for (var i = 0; i < matches.length; i++) {
                                        var _data = data[matches[i]];
                                        if (_data === undefined) {
                                            return undefined;
                                        }
                                        if (_data === null) {
                                            return i + 1 === matches.length ? null : undefined;
                                        } else {
                                            data = data[matches[i]];
                                        }
                                    }
                                } else {
                                    return undefined;
                                }
                            }
                        } else {
                            data = data[next];
                        }
                    }
                    result = data;
                } else {
                    result = fromContext(path, cache);
                }
                return result;
            },
            /**
             * 更新数据中心中的数据。
             * @param path 数据路径
             * @param value 值
             * @param observer 数据更新者
             */
            set: function (path, value, observer) {
                if (path == null || path == undefined || path.length == 0) return;
                //当传入的值与数据中心的值相同时，则不更新
                if (!(value instanceof Array) && this.get(path) === value) return;
                //更新数据中心,当数据中心中不存在数据层次结构时，需要构造.设置数据
                modify(path, value);
                trigger(path, observer);
            },
            /**
             * 添加数据监听事件
             * @param observer 数据观察者
             * @param path 数据位置描述 字符串或者 {path : "",column:""}
             * @param updateFunc 数据变化事件
             * @param beforeUpdate 数据变化事件执行前事件，当返回false时，数据变化事件回调将不会执行。
             *
             */
            addListener: function (observer, path, updateFunc, beforeUpdate) {//添加监听器
                if (path == null || path == undefined || path.length == 0) return;
                var _path = typeof path == "string" ? path : JSON.stringify(path), targets = listener[_path];
                if (targets == null) {
                    targets = [];
                    listener[_path] = targets;
                }
                var target = {
                    path: path,
                    observer: observer,
                    update: updateFunc,
                    beforeUpdate: beforeUpdate
                };
                targets.push(target);

                return {
                    trigger: function () {
                        _trigger(typeof path == "string" ? path : path.path, _path, [target], {});
                    }
                };
            },
            /**
             * 移除数据监听
             * @param observer 数据观察者
             * @param path 数据位置描述
             */
            removeListener: function (observer, path) {
                var remove = function (targets, observer) {
                    if (targets instanceof Array) {
                        for (var index = 0; index < targets.length; index++) {
                            if (targets[i].observer === observer) {
                                targets.splice(index, 1);
                                return;
                            }
                        }
                    }
                };
                if (path) {
                    path = parseJSON(path);
                    remove(listener[path], observer);
                } else {
                    for (path in listener) {
                        remove(listener[path], observer);
                    }
                }
            }

        };
    function parseJSON(json) {
        try {
            return JSON.parse(json);
        } catch (e) {
            return json;
        }
    }
    function fromContext(path, target) {
        var _paths = path instanceof Array ? path : path.split(".");
        while (_paths.length && target) {
            var nodeName = _paths.shift();
            target = target.hasOwnProperty(nodeName) ? target[nodeName] : undefined;
        }
        return target;
    }

    /**
     * 数据路径构造方法
     * @param path 数据路径 a.b.c.d
     */
    function constructor(path) {
        //请求后台，返回数据结构、元数据
        var paths = path.split("."), last = paths.pop(), data = cache;
        while (paths.length) {
            var src = paths.shift();
            if (checkArrayRegex.test(src)) {
                var matches = src.match(parseArrayIndexRegex), key = src.split(checkArrayRegex).join("");
                if (data[key] == null || data[key] == undefined) {
                    data[key] = [];
                }
                data = data[key];
                if (matches instanceof Array) {
                    for (var i = 0; i < matches.length; i++) {
                        var arrayIndex = Number(matches[i]);
                        if (!data[arrayIndex]) {
                            if ((matches.length - 1) == index) {
                                data[arrayIndex] = {};
                            } else {
                                data[arrayIndex] = [];
                            }
                        }
                        data = data[arrayIndex];
                    }
                }
            } else {
                if (data[src] == null || data[src] == undefined) {
                    data[src] = {};
                }
                data = data[src];
            }
        }
        if (checkArrayRegex.test(last)) {
            var key = last.substring(0, last.indexOf("[")), matches = last.match(parseArrayIndexRegex);
            data[key] = [];
            data = data[key];
            if (matches instanceof Array) {
                for (var i = 0; i < matches.length; i++) {
                    if (i == matches.length - 1) {
                        data[Number(matches[i])] = null;
                    } else {
                        data = data[Number(matches[i])] = [];
                    }
                }
            }
        } else {
            data[last] = null;
        }
    }

    function modify(path, value) {
        var find = dataCenter.get(path);
        if (find == undefined) {
            constructor(path);
        }
        if (checkArrayRegex.test(path)) {
            var paths = path.split("."), last = paths.pop(),
                data = paths.length == 0 ? cache : dataCenter.get(paths.join("."));
            //前一个 a.b.c a.b.c[0] a.b.c[0][1]   d d[0] d[0][1]
            if (checkArrayRegex.test(last)) {
                data = data[last.substring(0, last.indexOf("["))];
                var matches = last.match(parseArrayIndexRegex);
                if (matches instanceof Array) {
                    for (var i = 0; i < matches.length; i++) {
                        if (i == matches.length - 1) {
                            data[Number(matches[i])] = value;
                        } else {
                            data = data[Number(matches[i])];
                        }
                    }
                }
            } else {
                data[last] = value;
            }
        } else {
            if (path.indexOf(".") == -1) {
                cache[path] = value;
            } else {
                var paths = path.split("."),
                    propertyName = paths.pop();
                dataCenter.get(paths.join("."))[propertyName] = value;
            }
        }
    }


    /**
     * path:a.b.c[0][1].d.e[1].f
     * 通知次序:
     * a
     * a.b
     * a.b.c
     * a.b.c[0]
     * a.b.c[0][1]
     * a.b.c[0][1].d
     * a.b.c[0][1].d.e
     * a.b.c[0][1].d.e[1]
     * a.b.c[0][1].d.e[1].f
     */

    function replaceCommon(aPath, bPath, callback) {
        var paths = aPath.split("."),
            keyPaths = bPath.split("."),
            commons = [];
        while (paths.length > 0 && keyPaths.length > 0 && keyPaths[0] === paths.shift()) {
            commons.push(keyPaths.shift());
        }
        if (commons.length != 0) {
            paths = aPath.split(".");
            paths.splice(0, commons.length);
            keyPaths = bPath.split(".");
            keyPaths.splice(0, commons.length);
            callback(paths, keyPaths);
        } else {
            callback(aPath.split("."), bPath.split("."));
        }
    }

    function _trigger(path, listenerKey, targets, observer) {
        listenerKey = parseJSON(listenerKey);
        if (typeof listenerKey == "string") {
            replaceCommon(path, listenerKey, function (paths, keyPaths) {
                var runnable = false;
                if (keyPaths.length == 0 || paths.length == 0) {
                    runnable = true;
                } else {
                    var A = paths[0], B = keyPaths[0];
                    if (A.split(checkArrayRegex).join("") == B.split(checkArrayRegex).join("") && (A.indexOf(B) != -1 || B.indexOf(A) != -1)) {
                        runnable = true;
                    }
                }
                if (runnable) {
                    if (targets instanceof Array) {
                        for (var i = 0; i < targets.length; i++) {
                            var target = targets[i];
                            if (observer !== target.observer && (target.beforeUpdate === null || target.beforeUpdate === undefined || target.beforeUpdate.apply(target, [path]))) {
                                target.update.apply(target.observer, [dataCenter.get(listenerKey)]);
                            }
                        }
                    }
                }
            });
        } else if (listenerKey.hasOwnProperty("path") && listenerKey.hasOwnProperty("column")) {
            replaceCommon(path, listenerKey["path"], function (paths, keyPaths) {
                var update = function (rowIndex) {
                    if (targets instanceof Array) {
                        for (var i = 0; i < targets.length; i++) {
                            var target = targets[i];
                            if (target.beforeUpdate === null || target.beforeUpdate === undefined || target.beforeUpdate.apply(target, [path])) {
                                target.update.apply(target.observer, [dataCenter.get(listenerKey["path"]), rowIndex, listenerKey["column"]]);
                            }
                        }
                    }
                };

                if (paths.length == 0 || keyPaths.length == 0) {
                    update(-1);
                } else {
                    var A = paths.join("."),
                        B = keyPaths.join("."),
                        ACB = (A !== B && paths[0].split(checkArrayRegex).join("") == keyPaths[0].split(checkArrayRegex).join("") && A.indexOf(B) != -1),
                        BCA = (A !== B && paths[0].split(checkArrayRegex).join("") == keyPaths[0].split(checkArrayRegex).join("") && B.indexOf(A) != -1),
                        index = ACB ? Number(A.replace(B, "").match(parseArrayIndexRegex)[0]) : -1;
                    if ((ACB || BCA) && (paths.length == 1 || paths[1] == listenerKey["column"])) {
                        update(index);
                    }
                }
            });

        }
    }

    function trigger(path, observer) {
        for (var listenerKey in listener) {
            _trigger(path, listenerKey, listener[listenerKey], observer);
        }
    }

    return dataCenter;
});