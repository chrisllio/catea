define(['RequireProxy'], function (Proxy) {
    'use strict';
    // These modules should be already loaded.
    var Base = Proxy.get('UiBase'), utils = Proxy.get('utils'), Spy = Proxy.get('Spy'), TemplateManager = Proxy.get('TemplateManager'), $ = Proxy.get('jquery');
    // 'text!../templates/textBox.html'
    return {
        parent: 'UiBase',
        core: {
            commands: function () {
                return [
                    // The command group is a two-dimensional array, for example: [comma nd1,command2……]
                    // Each command is an One-dimensional array, complete example as: ['methodName', false(or true), arg1, arg2……].
                    // methodName: This is necessary.
                    // asynchronous: true  - You must call the method 'notify' of additional parameter 'batman' to notice the Commander to continue next command.
                    //               other - Means your method is synchronous. 'notify' method of 'batman' can still be called, it won't make any difference.
                    // arguments:  They should be arranged in accordance with the definition of the method.
                    ['initVars'],               // Declare Initialize variables
                    ['initRender', true],       // Initial rendering
                    ['initProps'],              // Set initialize properties
                    ['initCss'],   // Initialize CSS
                    ['initEvents'],             // Binding events for this main dom object
                    ['initSubscribers'],        // Subscribe variables
                    ['afterInit'],              // Other processes
                    ['updateDom']

                ];
            },
            initVars: function () {
                var controller = this, opts = controller.options;
                controller.isReadonly = Spy.observable(utils.getBoolean(opts.readonly));
                controller.disabled = Spy.observable(utils.getBoolean(opts.disabled));
                controller.valueLength = Spy.observable(0);
                var header = opts.header, headerValueTupe = utils.atomicTypeOf(header);
                controller.header = headerValueTupe === 'string'? {text:header}: header;
            },
            initRender: function (batman) {
                var controller = this;
                TemplateManager.render('textBox', controller, function(html){
                    controller.$conatiner = $(html);
                    controller.$input = controller.$conatiner.find('.catea-input');
                    batman.notify();
                });
            },
            updateDom: function(){
                $(this.element).append(this.$conatiner);
            },
            initProps: function () {
                var controller = this, opts = controller.options, $input = controller.$input;
                controller.element.type = 'text';
                $input.attr('maxlength', opts.maxlength).attr('spellcheck', utils.getBoolean(opts.spellcheck));
                $input.attr('placeholder', opts.placeholder);
            },
            initCss: function () {
                var controller = this, opts = controller.options;
                controller.$input
                    .addClass(opts.className)
                    .addClass(opts.size)
                    .css({
                        'text-align': utils.getStyleSize(opts.textAlign),
                        width: opts.width
                    });
            },
            initEvents: function () {
                var controller = this, opts = controller.options, $input = controller.$input,
                    validate = utils.getBoolean(opts.validate), validateDely = utils.getNumber(opts['validate-delay']),
                    validateTimer = null;
                validateDely = validateDely === null ? 300 : validateDely;
                $input.bind('input propertychange', function () {
                    var value = $input.val();
                    if(utils.getString(value) === controller.value()) return;
                    controller.value(value);
                    if (validate) {
                        if (validateTimer !== null) clearTimeout(validateTimer);
                        validateTimer = setTimeout(function () {
                            controller.validate.apply(controller);
                        }, validateDely);
                    }
                });
                // Keep it for a while, The function of disabling keystrokes is not fully available.
                // var illegalMatch = [];
                // if (opts.illegal) {
                //     for (var i = 0; i < opts.illegal.length; i++) {
                //         var matcher = utils.keyCodeTest[opts.illegal.charAt(i)];
                //         matcher && illegalMatch.push(matcher);
                //     }
                // }
                $input.bind('keydown', function (event) {
                    var keyCode = event.keyCode || event.which;
                    if (keyCode === 13) {
                        //$input.focusNext(event);
                        return false;
                    } else if (keyCode === 27) {
                        $input.blur();
                    }
                    // Keep it for a while, The function of disabling keystrokes is not fully available.
                    // var match = false;
                    // if (keyCode != 16) {
                    //     $(illegalMatch).each(function () {
                    //         if (this(event)) {
                    //             match = true;
                    //             return false;
                    //         }
                    //     });
                    // }
                    // return match == false ? true : false;
                });
            },
            initSubscribers: function () {
                var controller = this, $input = controller.$input;
                controller.isReadonly.subscribe(function (readonly) {
                    readonly ? $input.attr('readonly', 'readonly') : $input.removeAttr('readonly');
                }).notify();
                controller.disabled.subscribe(function (disabled) {
                    disabled ? $input.attr('disabled', true) : $input.removeAttr('disabled');
                }).notify();
                controller._value.subscribe(function (value) {
                    $input.val(value);
                    controller.valueLength(value === null ? 0 : value.length);
                }).notify();
            },
            afterInit: function () {

            }
        },
        methods: $.extend({}, Base.methods, {
            disable: function () {
                this.disabled(true);
                return this;
            },
            enable: function () {
                this.disabled(false);
                return this;
            },
            readonly: function () {
                var controller = this;
                if (arguments.length === 0) {
                    return controller.isReadonly();
                } else {
                    controller.isReadonly(utils.getBoolean(arguments[0]));
                    return controller;
                }
            }
        }),
        validaters: $.extend({}, Base.validaters, {
            required: function () {
                if (utils.getBoolean(this.options.required) && this.value() === null) return 'required';
            },
            minlength: function () {
                var minLength = utils.getNumber(this.options.minlength);
                if (minLength !== null && minLength > 0) {
                    if (this.valueLength() < minLength) {
                        return 'minlength'
                    }
                }
            },
            maxlength: function () {
                var maxLength = utils.getNumber(this.options.maxength);
                if (maxLength !== null && maxLength > 0) {
                    if (this.valueLength() > maxLength) {
                        return 'maxlength'
                    }
                }
            },
            pattern: function () {
                var pattern = this.options.pattern, value = this.value();
                if (value && value.toString().length > 0 && pattern && new RegExp(pattern, "g").test(value.toString()) === false) {
                    return 'pattern';
                }
            }
        }),
        messages: $.extend({}, Base.messages, {
            required: '{{options.prompt}}不能为为空',
            minlength: '{{options.prompt}}未达最小长度：{{options.minlength}}，当前：{{valueLength}}',
            maxlength: '{{options.prompt}}超过最大长度：{{options.maxlength}}，当前：{{valueLength}}',
            pattern: '{{options.prompt}}{{options.pattern-prompt}}'
        }),
        defaults: $.extend({}, Base.defaults, {
            name: null,
            prompt: '录入内容',
            header: null,
            required: false,
            defaultValue: null,
            placeholder: null,
            textAlign: 'left',
            maxlength: null,
            minlength: null,
            className: null,
            readonly: false,
            disabled: false,
            width: '100%',
            pattern: null,
            'pattern-prompt': null,
            spellcheck: false,
            validate: true,
            'validate-delay': 300,
            'validate-handler': function (errors, element) {
                var $el = $(this.element);
                if (errors && errors.length > 0) {
                    var $errorBox = $el.next('.catea-error-prompt');
                    if ($errorBox.length === 0) {
                        $errorBox = $('<span class="catea-error-prompt"></span>');
                        $errorBox.insertAfter($el);
                    }
                    $errorBox.html('* ' + errors.join('；<br>* ')).show();
                    $el.removeClass('success').addClass('error');
                } else {
                    $(element).next('.catea-error-prompt').empty().hide();
                    $el.removeClass('error').addClass('success');
                }
            }
            //illegal: "(){}[]%;\"\'"  Keep it for a while, The function of disabling keystrokes is not fully available.
        }),
        dataRenderer: null,
        settings: $.extend({}, Base.settings, {
            valueType: String
        })
    }
});