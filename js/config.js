define(function(){
    'use strict';
    var requireConfig={
        //baseUrl: 'js/',
        paths: {
            // dependencies
            text:'lib/requirejs/text',
            Mustache:'lib/mustache.min',
            jquery:'lib/jqueryjs/jquery-1.11.2.min',
            json2: 'lib/json2',
            Class: 'lib/Class',
            AnimationFrame: 'lib/requestAnimationFrame',
            Map: 'lib/Map',
            Commander: 'lib/Commander',
            // core
            uiConstants: 'core/uiConstants',
            UiBase: 'core/uiBase',
            prototype: 'core/prototype',
            UiManager: 'core/uiManager',
            utils: 'core/utils',
            Spy: 'core/spy',
            RequireProxy: 'core/require-proxy',
            // config
            WidgetsConfig: './widgetsConfig'
        },
        shim: {}
    };
    return {
        initialize: function(widgetsConfig){
            for(var configName in widgetsConfig) {
                if(widgetsConfig.hasOwnProperty(configName)) {
                    var config = widgetsConfig[configName];
                    requireConfig.paths[configName] = config.path? config.path: ('module/' + configName);
                }
            }
            requirejs.config(requireConfig);
        }
    }
});