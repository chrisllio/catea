'use strict';
require(['config'], function (requireConfig) {
    var widgetsConfig = requireConfig.widgets;
    for(var configName in widgetsConfig) {
        if(widgetsConfig.hasOwnProperty(configName)) {
            var config = widgetsConfig[configName];
            requireConfig.paths[configName] = config.path? config.path: ('module/' + configName);
        }
    }
    requirejs.config(requireConfig);
    if(window.jQuery) {
        define('jquery',[],function(){return window.jQuery});
    }
    require(['UiManager', 'jquery', 'Commander'], function (UiManager,$) {
        $.catea = $.extend($.catea, {}, {uiManager: UiManager});
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