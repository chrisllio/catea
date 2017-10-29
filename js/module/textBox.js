define(['RequireProxy'], function (Proxy) {
    'use strict';
    var Base = Proxy.get('UiBase'), utils = Proxy.get('utils'), Spy = Proxy.get('Spy');
    // 'text!../templates/textBox.html'
    return {
        parent: 'UiBase',
        core: {
            commands: function () {
                return [
                    // The command group is a two-dimensional array, for example: [command1,command2……]
                    // Each command is an One-dimensional array, complete example as: ['methodName', false(or true), arg1, arg2……].
                    // methodName: This is necessary.
                    // asynchronous: true  - You must call the method 'notify' of additional parameter 'batman' to notice the Commander to continue next command.
                    //               other - Means your method is synchronous. 'notify' method of 'batman' can still be called, it won't make any difference.
                    // arguments:  They should be arranged in accordance with the definition of the method.
                    ['initVars'],               // Declare Initialize variables
                    ['initRender', true],   // Initial rendering
                    ['initProps'],              // Set initialize properties
                    ['initCss',],   // Initialize CSS
                    ['initEvents'],             // Binding events for this main dom object
                    ['initSubscribers'],        // Subscribe variables
                    ['value', false, this.options.defaultValue], // Set initialize value
                    ['afterInit']               // Other processes
                ];
            },
            initVars: function () {
                var controller = this, opts = controller.options;
                controller.isReadonly = Spy.observable(utils.getBoolean(opts.readonly));
                controller.disabled = Spy.observable(utils.getBoolean(opts.disabled));
                controller.valueLength = Spy.observable(0);
                controller.unSupportPlaceholder = !utils.isSupported('input', 'placeholder');
            },
            initRender: function (batman) {
                var controller = this, $element = $(controller.element);
                if ($element[0].tagName.toUpperCase() !== 'INPUT') {
                    require(['text!../templates/textBox.html'], function (template) {
                        requestAnimationFrame(function () {
                            $element.empty().append(template);
                            controller.$input = $element.children('input');
                            batman.notify();
                        });
                    });
                } else {
                    controller.$input = $element;
                    batman.notify();
                }
            },
            initProps: function () {
                var controller = this, opts = controller.options, $input = controller.$input;
                controller.element.type = 'text';
                $input.attr('maxlength', opts.maxlength).attr('spellcheck', utils.getBoolean(opts.spellcheck));
                if (!controller.unSupportPlaceholder) $input.attr('placeholder', opts.placeholder);
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
                validateDely = validateDely === null? 300: validateDely;
                $input.bind('input propertychange', function () {
                    var value = controller.$input.val();
                    controller.value(controller.unSupportPlaceholder && $input.not(':focus') && value === opts.placeholder ? null : value);
                    if (validate) {
                        if (validateTimer !== null) clearTimeout(validateTimer);
                        validateTimer = setTimeout(function () {
                            controller.validate.apply(controller);
                        }, validateDely);
                    }
                });
                $input.bind('click focus', function () {
                    if (controller.unSupportPlaceholder && controller.value() === null) {
                        $input.val(null);
                        $input.removeClass('empty');
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
                if (controller.unSupportPlaceholder) {
                    $input.bind('blur', function () {
                        if (controller.value() === null) {
                            $input.addClass('empty');
                            $input.val(opts.placeholder);
                        }
                    });
                }
            },
            initSubscribers: function () {
                var controller = this, $input = controller.$input, opts = controller.options;
                controller.isReadonly.subscribe(function (readonly) {
                    readonly ? $input.attr('readonly', 'readonly') : $input.removeAttr('readonly');
                }).notify();
                controller.disabled.subscribe(function (disabled) {
                    disabled ? $input.attr('disabled', true) : $input.removeAttr('disabled');
                }).notify();
                var valueObserver = controller._value.subscribe(function (value) {
                    $input.val(value);
                    controller.valueLength(value === null ? 0 : value.length);
                });
                if (controller.unSupportPlaceholder) {
                    valueObserver.beforeChange(function (_value) {
                        var value = controller.convertValue(_value);
                        if (value === null && $input.not(':focus')) {
                            $input.val(opts.placeholder);
                            return false;
                        } else {
                            return true;
                        }
                    });
                }
            },
            afterInit: function () {
                var controller = this, $input = controller.$input;
                if (controller.unSupportPlaceholder && controller.value() === null && $input.not(':focus')) {
                    $input.addClass('empty');
                    $input.val(controller.options.placeholder);
                }
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
                var controller = this;
                controller.minlength === undefined ? controller.minlength = utils.getNumber(controller.options.minlength) : '';
                var minLength = controller.minlength;
                if (minLength !== null && minLength > 0) {
                    var value = this.value();
                    if (value === null || value.length < minLength) {
                        return 'minlength'
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
            minlength: '{{options.prompt}}未达最小长度：{{minlength}}',
            pattern: '{{options.prompt}}{{options.pattern-prompt}}'
        }),
        defaults: $.extend({}, Base.defaults, {
            name: null,
            prompt: '录入内容',
            required: false,
            defaultValue: null,
            placeholder: null,
            textAlign: 'left',
            maxlength: null,
            minlength: -1,
            className: null,
            readonly: false,
            disabled: false,
            width: '100%',
            pattern: null,
            'pattern-prompt': null,
            spellcheck: false,
            validate: true,
            'validate-delay': 300,
            'validate-handler': function(errorMsgArray){

            }
            //illegal: "(){}[]%;\"\'"  Keep it for a while, The function of disabling keystrokes is not fully available.
        }),
        dataRenderer: null,
        settings: $.extend({}, Base.settings, {
            valueType: String
        })
    }
});