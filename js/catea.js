'use strict';
require(['config', './widgetsConfig'], function (config, widgetsConfig) {
    //document.createElement('textBox');
    config.initialize(widgetsConfig);
    require(['UiManager', 'jquery', 'Commander'], function (UiManager, $) {
        $.catea = $.extend($.catea, {}, {uiManager:UiManager});
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