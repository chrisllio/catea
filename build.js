(function () {
    var config=  {
        appDir: './',//源目录
        baseUrl: './js',  //指定js文件基本路径。
        dir: './build/',//目标目录：将压缩的文件保存到 build文件夹，命名不限。
        paths: {
            // dependencies
            text: 'lib/requirejs/text',
            Mustache: 'lib/mustache.min',
            jquery: 'lib/jqueryjs/jquery-1.11.2.min',
            json2: 'lib/json2',
            Class: 'lib/Class',
            AnimationFrame: 'lib/requestAnimationFrame',
            Map: 'lib/Map',
            // core
            uiConstants: 'core/uiConstants',
            UiBase: 'core/uiBase',
            Templates: 'core/templates',
            prototype: 'core/prototype',
            UiManager: 'core/uiManager',
            utils: 'core/utils',
            Spy: 'core/spy',
            RequireProxy: 'core/require-proxy',
            // build
            Catea: 'catea',
        },
        shim: {},
        modules: [{
            name: 'Catea',
            exclude: ['jquery']
        },{
            name: 'catea-all',
            create: true,
            include: ['Catea'],
            exclude: ['jquery']
        }],
        findNestedDependencies: true,
        removeCombined: false,
        fileExclusingRegExp: /^(r|build)\.js$|^(.git)|^(.js)|^(.vscode)$/  //指定需要忽略的文件类型
    };
    /**
     * 从widgetsConfig.js复制要发布的组件数组
     */
    var widgets = {
        textBox: {
            // 组件名称
            path: 'module/textBox',    // 默认为：'module/'+name
            buildType: 'base'           // build时会据此创建包含不同组件的结果
        }
    };
    /**
     * 为将模板合并到组件但忽略其他依赖，将UI组件的require封装到RequireShell并跳过
     */
    for(var name in widgets) {
        if(widgets.hasOwnProperty(name)) {
            var cfg = widgets[name], path = cfg.path, type = cfg.buildType;
            // 将模板与组件压缩到一起
            config.paths[name] = path? path: ('module/' + name);
            // 将组件加入模块定义，排除其他依赖
            config.modules.push({name:name,exclude:['RequireProxy','jquery']});
            // 制作完整模块、制作仅包含某类组件的模块
            var findMyType = false;
            config.modules.forEach(function(module,index){
                findMyType = findMyType || module.name === 'catea-' + type;
                if( module.name === 'catea-all' || findMyType ) {
                    config.modules[index].include.push(name);
                    return false;
                }
            });
            if(!findMyType) {
                config.modules.push({
                    name: 'catea-' + type,
                    create: true,
                    include: ['catea', name],
                    exclude: ['jquery']
                });
            }
        }
    }
    return config;
}());