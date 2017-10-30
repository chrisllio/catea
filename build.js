(function () {
    var config = {
        appDir: './',//源目录
        baseUrl: './js',  //指定js文件基本路径。
        dir: './build/',//目标目录：将压缩的文件保存到 build文件夹，命名不限。
        paths: null,
        shim: {},
        modules: [{
            name: 'catea',
            exclude: ['module', 'jquery']
        }, {
            name: 'catea-all',
            create: true,
            include: ['catea'],
            exclude: ['module', 'jquery']
        }],
        findNestedDependencies: true,
        removeCombined: false,
        fileExclusingRegExp: /^(r|build)\.js$|^(.git)|^(.js)|^(.vscode)$/
    };
    // read configs from project start. -- by Xris.Yang
    var cleanUp = function (code) {
        var _code = code;
        _code = _code.replace(/\/\/[^\n]*/g, "");
        _code = _code.replace(/\/\*(\s|.)*?\*\//g, "");
        _code = _code.replace(/\s+/g, '');
        _code = _code.replace(/[\r]/g, "");
        _code = _code.replace(/[\n]/g, "");
        return _code;
    }
    // requirejs config
    var requirejsConfig = readFile("./js/config.js", "utf-8"),  // readFile is defined in r.js, code here is in it's scope.
        requirejsPaths = requirejsConfig.substring(requirejsConfig.indexOf('paths'));
    requirejsPaths = cleanUp(requirejsPaths.substring(requirejsPaths.indexOf('{'), requirejsPaths.indexOf('}') + 1));
    config.paths = (new Function('return ' + requirejsPaths))();
    config.paths.catea = 'catea';
    //delete config.paths.WidgetsConfig;  //delete it, otherwise it will cause an error: 'modules share the same URL'

    // requirejs shim
    // var requirejsShim = requirejsConfig.substring(requirejsConfig.indexOf('shim'));
    // requirejsShim = cleanUp(requirejsShim.substring(requirejsShim.indexOf('{'), requirejsShim.indexOf('}')+1));
    // config.shim = (new Function('return '+requirejsShim))();

    // widget config
    var requirejsWidgets = requirejsConfig.substring(requirejsConfig.indexOf('widgets'));
    requirejsWidgets = cleanUp(requirejsWidgets.substring(requirejsWidgets.indexOf('{'), requirejsWidgets.indexOf('return')));
    var leftRegex = new RegExp('{', 'g'), rightRegex = new RegExp('}', 'g'),
        leftCount = requirejsWidgets.match(leftRegex), rightCount = requirejsWidgets.match(rightRegex),
        removeCount = (!rightCount ? 0 : rightCount.length) - (!leftCount ? 0 : leftCount.length);
    for (var i = 0; i < removeCount; i++) {
        requirejsWidgets = requirejsWidgets.substring(0, requirejsWidgets.lastIndexOf('}'));
    }
    var widgets = (new Function('return ' + requirejsWidgets))();
    // read configs from project end.

    // create widget modules and classification modules start.  -- by Xris.Yang
    // Merge templates into widgets but ignore other dependencies by encapsulate 'require' into 'RequireShell'. by Xris.Yang
    for (var name in widgets) {
        if (widgets.hasOwnProperty(name)) {
            var cfg = widgets[name], path = cfg.path, type = cfg.buildType;
            // 将模板与组件压缩到一起
            config.paths[name] = path ? path : ('module/' + name);
            // 将组件加入模块定义，排除其他依赖
            config.modules.push({name: name, exclude: ['RequireProxy', 'jquery', 'module']});
            // 制作完整模块、制作仅包含某类组件的模块
            var findMyType = false;
            config.modules.forEach(function (module, index) {
                findMyType = findMyType || module.name === 'catea-' + type;
                if (module.name === 'catea-all' || findMyType) {
                    config.modules[index].include.push(name);
                    return false;
                }
            });
            if (!findMyType) {
                config.modules.push({
                    name: 'catea-' + type,
                    create: true,
                    include: ['catea', name],
                    exclude: ['module', 'jquery']
                });
            }
        }
    }
    // create widget modules and classification modules end.
    return config;
}());