define(['jquery', 'Class', 'uiConstants', 'Spy', 'utils', 'Commander', 'Mustache', 'TemplateManager'], function ($, Class, Constants, Spy, utils, Commander, Mustache) {
    'use strict';
    return {
        /**
         * ui-widget base class
         */
        core: {
            init: function (element, options, settings, widgetName, dataAdapter, renderCallback) {
                var controller = this;
                controller.widgetName = widgetName;
                var callBackFn = utils.findFunction(renderCallback);
                controller.renderCallback = callBackFn ? callBackFn : function () {
                };
                controller.settings = settings;
                controller.element = element;
                controller.options = options;
                controller.validateHandler = utils.findFunction(options['validate-handler']);
                controller.eventProxy = $({});
                if (controller.options.name && settings.valueType) {
                    controller._value = Spy[settings.valueType === Array ? 'observableArray' : 'observable'](null);
                    if (controller.options.name && dataAdapter) {
                        var adapter = new dataAdapter(controller.options.name, controller), initValue = adapter.get();
                        controller._value.subscribe(function (value) {
                            adapter.set(value);
                        });
                        controller.value(initValue === undefined? options.defaultValue: initValue);
                    } else {
                        controller.value(options.defaultValue);
                    }
                }
                if (settings.dataType) {
                    controller._data = Spy[settings.dataType === Constants.Array ? 'observableArray' : 'observable'](null);
                }
                var commands = controller.commands();
                commands.push(['renderCallback']);
                Commander.create().order(controller, commands);
            },
            commands: function () {
                return [];
            },
            _convert: function (value, type) {
                switch (type) {
                    case String:
                        return utils.getString(value);
                    case Array:
                        return utils.getArray(value);
                    case Date:
                        return utils.getDate(value);
                    case Boolean:
                        return utils.getBoolean(value);
                    default:
                        return value === undefined ? null : value;
                }
            },
            convertValue: function (value) {
                return this._convert(value, this.settings.valueType);
            },
            convertData: function (data) {
                return this._convert(data, this.settings.dataType);
            }
        },
        methods: {
            value: function (value) {
                var controller = this;
                if (controller._value) {
                    if (value === undefined) {
                        return controller._value();
                    } else {
                        controller._value(controller.convertValue(value));
                        return controller;
                    }
                }
            },
            data: function (data) {
                var controller = this;
                if (controller._data) {
                    if (data === undefined) {
                        return controller._data();
                    } else {
                        controller._data(controller.convertData(value));
                        return controller;
                    }
                }
            },
            fire: function (eventName) {
                this.eventProxy.trigger(eventName);
            },
            on: function (events, callback) {
                this.eventProxy.on(events, callback);
            },
            hide: function(){
                $(this.element).hide();
            },
            show: function(){
                $(this.element).show();
            },
            getSettings: function () {
                return this.settings;
            },
            getOptions: function () {
                return this.options;
            },
            getErrorMessages: function () {
                var controller = this, validaters = controller.validaters, messages = controller.messages, result = [],
                    validateHandler = controller.validateHandler;
                for (var validaterName in validaters) {
                    if (!validaterName.startWith('_') && validaters.hasOwnProperty(validaterName)) {
                        var fn = validaters[validaterName];
                        if (typeof  fn === 'function') {
                            var code = fn.apply(controller);
                            if (typeof code === 'string') {
                                result.push(Mustache.render(messages[code], controller));
                            }
                        }
                    }
                }
                if (typeof validateHandler === 'function') {
                    validateHandler.apply(controller, [result, controller.element]);
                }
                return result;
            },
            validate: function () {
                return this.getErrorMessages().length === 0;
            }
        },
        validaters: {},
        messages: {},
        defaults: {
            'validate-handler': null
        },
        dataRenderer: null,
        settings: {
            // core version
            'core-version': '1.0.0.20171031_alpha ',
            version: '1.0.0'
            // When widget is init , following actions of initRender wait for it's completion or not.
        }
    }
});