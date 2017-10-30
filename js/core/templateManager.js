define(['Mustache'], function (Mustache) {
    return {
        render: function (templateName, context, callback) {
            var key = 'text!../templates/' + templateName + '.html';
            require([key], function (template) {
                callback.apply(context, [Mustache.render(template, context)]);
            });
        }
    }
});