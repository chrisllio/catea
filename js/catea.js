'use strict';
require(['config'], function (requireConfig) {
    var widgetsConfig = requireConfig.widgets;
    for (var configName in widgetsConfig) {
        if (widgetsConfig.hasOwnProperty(configName)) {
            var config = widgetsConfig[configName];
            requireConfig.paths[configName] = config.path ? config.path : ('module/' + configName);
        }
    }
    requirejs.config(requireConfig);
    if (window.jQuery) {
        define('jquery', [], function () {
            return window.jQuery
        });
    }
    if (window.JSON && window.JSON.parse) {
        define('json2', [], function () {
            window.JSON
        });
    }
    require(['UiManager', 'jquery', 'dataCenter', 'dataAdapter-default', 'prototype', 'Commander', 'json2', 'text', 'RequireProxy'], function (UiManager, $, dataCenter) {
        $.catea = $.extend($.catea, {}, {
            DataCenter: dataCenter,
            UiManager: UiManager
        });
        var before = window.pre_init, after = window.init;
        if (typeof before === 'function') {
            before();
        }
        if (typeof before === 'function' || typeof after === 'function') {
            UiManager.initialize(document, function () {
                if (typeof window.init === 'function') window.init();
            });
        }
    });

});