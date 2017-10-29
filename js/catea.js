'use strict';
require(['config', './widgetsConfig'], function (config, widgetsConfig) {
    config.initialize(widgetsConfig);
    var initialize = function ($) {
        require(['UiManager', 'Commander'], function (UiManager) {
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
    };
    var $ = window.$;
    if ($) {
        initialize($);
    } else {
        require(['jquery'], function ($) {
            initialize($);
        });
    }

});