define(function(){
    'use strict';
    var requireConfig={
        //baseUrl: 'js/',
        paths: {
            config: './config',
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
            TemplateManager: 'core/templateManager',
            RequireProxy: 'core/require-proxy'
        },
        shim: {},
        widgets: {
            textBox: {
                // 开发与发布定义
                path: 'module/textBox',
                buildType: 'base',
                // 组件定义
                renderType: 1,          // 渲染类型 1-form 2-grid 3-render
                valueType: String,      // 值类型，未定义表示组件没有值
                //dataType: Array       // 渲染数据类型，未定义表示组件没有渲染数据
                WaitForInitRender: false    // 是否等待渲染（_render方法）结束后才继续执行后续代码
            }
        }
    };
    return requireConfig;
});