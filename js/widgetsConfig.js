define(function () {
    return {
        textBox: {
            // 开发与发布定义
            path: 'module/textBox',
            buildType: 'base',
            // 组件定义
            renderType: 1,      // 渲染类型 1-form 2-grid 3-render
            valueType: String,   // 值类型，未定义表示组件没有值
            //dataType: Array    // 渲染数据类型，未定义表示组件没有渲染数据
            WaitForInitRender: false    // 是否等待渲染（_render方法）结束后才继续执行后续代码
        }
    };
});
