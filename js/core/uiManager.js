define(['Class', 'UiBase', 'AnimationFrame', 'Spy', 'utils', 'Map', 'WidgetsConfig', 'prototype'], function (Class, Base, AnimationFrame, Spy, utils, Map, WidgetsConfig) {
    'use strict';
    var $ = window.$,
        widgetMap = new Map(),
        controllerShellDataName = '__widget_shEll_dAta_keY_',
        controllerWidgetNameKey = '__widget_nAMe_dAta_keY_',
        widgetClassName = 'catea-widget',
        widgetTypeAttrName = 'catea-type',
        register = function (widgetName, callback) {
            var widgetClass = widgetMap.get(widgetName + '.class');
            if (widgetClass) {
                callback();
            } else {
                require([widgetName], function (Widget) {
                    var parentClass = null;
                    if (Widget.parent) {
                        parentClass = widgetMap.get(Widget.parent + '.class');
                    }
                    if (Widget.parent && !parentClass) {
                        register(Widget.parent, function () {
                            register(widgetName, callback);
                        });
                    } else {
                        if (Widget.core) {
                            var methods = {};
                            for (var methodName in Widget.methods) {
                                if (!methodName.startWith('_') && Widget.methods.hasOwnProperty(methodName)) {
                                    var fn = Widget.methods[methodName];
                                    if (Widget.core[methodName]) {
                                        throw new Error('Widget \'' + widgetName + '\' already has a member named \'' + methodName + '\', please rename your method.');
                                    } else {
                                        methods[methodName] = fn;
                                    }
                                }
                            }
                            widgetMap.put(widgetName + '.class', (parentClass ? parentClass : Class).extend($.extend({}, Widget.core, methods, {validaters: Widget.validaters}, {messages: Widget.messages})));
                            widgetMap.put(widgetName + '.methods', methods);
                            widgetMap.put(widgetName + '.settings', Widget.settings);
                            widgetMap.put(widgetName + '.defaults', Widget.defaults);
                            widgetMap.put(widgetName + '.dataRenderer', Widget.dataRenderer);
                            $.fn[widgetName] = function () {
                                var args = Array.prototype.slice.call(arguments),
                                    _widgetName = $(this).data(controllerWidgetNameKey);
                                if (args.length === 0 || typeof args[0] === 'string') {
                                    return _widgetName === widgetName ? $.fn.execute.apply(this, args) : undefined;
                                } else {
                                    return $.catea.uiManager.render.apply($.catea.uiManager, [this, widgetName].concat(args));
                                }
                            }
                        }
                        callback();
                    }
                });
            }
        },
        manager = {
            render: function (element, widgetName, options, renderCallback) {
                var $element = $(element), shell = $element.data(controllerShellDataName);
                if (shell) {
                    throw new Error('This node{id:' + $element.attr('id') + ',name:' + $element.attr('name') + ',class:' + $element.attr('class') + '} cannot be rendered repeatedly.');
                } else {
                    register(widgetName, function () {
                        var opts = $.extend({}, widgetMap.get(widgetName + '.defaults'), utils.setProperties($.extend({}, widgetMap.get(widgetName + '.defaults')), element), options),
                            widgetClass = widgetMap.get(widgetName + '.class'),
                            methods = widgetMap.get(widgetName + '.methods'),
                            widgetSetting = widgetMap.get(widgetName + '.settings'),
                            dataRenderer = widgetMap.get(widgetName + '.dataRenderer');
                        new widgetClass(element, opts, widgetSetting, widgetName, dataRenderer ? new dataRenderer : null, function () {
                            var controller = this;
                            shell = {
                                execute: function () {
                                    if (arguments.length === 0) return;
                                    var args = Array.prototype.slice.call(arguments);
                                    var methodName = args.shift();
                                    if (typeof methodName === 'string') {
                                        return this[methodName].apply(this, args);
                                    }
                                }
                            };
                            for (var methodName in methods) {
                                if (!methodName.startWith('_') && methods.hasOwnProperty(methodName)) {
                                    (function (name) {
                                        shell[name] = function () {
                                            var ret = controller[name].apply(controller, arguments);
                                            return ret === controller ? this : ret;
                                        }
                                    })(methodName);
                                }
                            }
                            $element.data(controllerShellDataName, shell);
                            $element.data(controllerWidgetNameKey, widgetName);
                            var callback = typeof renderCallback === 'function' ? renderCallback : window[renderCallback];
                            if (callback) callback();
                        });
                    });
                }
            },
            initialize: function (container, callback) {
                var $container = $(container), widgetSelectors = ['.' + widgetClassName], tagMap = {}, _this = this;
                for (var name in WidgetsConfig) {
                    if (WidgetsConfig.hasOwnProperty(name)) {
                        widgetSelectors.push(name);
                        tagMap[name.toUpperCase()] = name;
                    }
                }
                var selector = widgetSelectors.join(','), $targets = $container.find(selector).not(function () {
                    return $(this).parents(selector).length > 0;
                });
                var result = 0, success = 0;
                $targets.each(function () {
                    var widgetName = tagMap[($(this).attr(widgetTypeAttrName) || this.tagName).toUpperCase()];
                    success++;
                    _this.render(this, widgetName, {}, function () {
                        result++;
                        if (result === success && typeof callback === 'function') {
                            callback();
                        }
                    });
                });

            },
            widgetTypeAttrName: widgetTypeAttrName,
            widgetClassName: widgetClassName
        };
    $.fn.execute = function () {
        var $element = $(this), shell = $element.data(controllerShellDataName);
        if (shell) {
            return arguments.length === 0 ? shell : shell.execute.apply(shell, arguments);
        } else {
            throw new Error('Can not call \'execute\' of a not rendered node {id:' + $element.attr('id') + ',name:' + $element.attr('name') + ',class:' + $element.attr('class') + '} .');
        }
    };
    return manager;
});