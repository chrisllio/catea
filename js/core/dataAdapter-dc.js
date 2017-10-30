define(['dataCenter', 'Class'], function (dc, Class) {
    return Class.extend({
        init: function (name, controller) {
            this.name = name;
            this.controller = controller;
            dc.addListener(controller,name,function(value){
                controller.value(value);
            });
        },
        get: function () {
            return dc.get(this.name);
        },
        set: function (value) {
            dc.set(this.name, value, this.controller);
            console.log(value)
        }
    })
});