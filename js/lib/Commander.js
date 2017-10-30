/**
 * ------------------------------------------------------------------------------------
 * - Commander                                                                        -
 * ------------------------------------------------------------------------------------
 * Description:
 * --------
 * This is a component that follows the AMD specification, it's purpose is to serializing asynchronous calls.
 * When you call the 'create' method, it will summon A bad-ass commander to command battles for you.
 * As a big man, commanders only need to do one thing every day: 'order' his 'unit' to execute a whole bunch of 'commands',
 * and use 'callback' to tell them to buy some beer for him when they return base.
 * Of course, if he's busy, he'll ignore your request and return 'false' to you and continue his other great wars, otherwise the answer will be a 'true'.
 * Yes, there should have a schedule, but his blond secretary is on vacation.
 * ------------------------------------------------------------------------------------
 * Example:
 * --------
 * require(['Commander'], function(Commander){
 *   var orderedOrNot = Commander.create().order(unit,[command-Shoot,command-Dance,command-ClimbBack], buyMeSomeBeer);
 * });
 * To command a battle, the commander need to issue a series of commands.
 * So, the 'Commands' is a two-dimensional array, for example: [command-Run,command-Jump……].
 * Each command is an One-dimensional array, for example: ['run', false(or true), 'one leg', 'fastest', 'don't cry'，……].
 * The meaning of the members in order is:
 *    Action Name :
 *        It's necessary.
 *    Waiting for the completion or not:
 *        true  - You must call the method 'notify' of additional parameter 'batman' to notice the Commander to continue next command.
 *        other - Means your method is synchronous. 'notify' method of 'batman' can still be called, it won't make any difference.
 *    arguments:  The rest arguments should be arranged in accordance with the definition of the method.
 *------------------------------------------------------------------------------------
 * @author Xris.Yang
 * @version 1.0.0
 * @license Commander.js 1.0.0 Copyright Xris.Yang.
 * Released under MIT license
 * ------------------------------------------------------------------------------------
 */
define(['Class'], function (Class) {
    'use strict';
    var LazyBatman = Class.extend({
            notify: function () {
                if (typeof this.order === 'function') {
                    this.order.apply(null, arguments);
                }
            },
            receive: function (order) {
                this.order = order;
                this.receive = function () {
                }
            }
        }),
        Commander = Class.extend({
            init: function () {
                var commander = this;
                commander.uuid = String.uuid();
                commander.busy = false;
                commander.fighted = 0;
                commander.lazyBatman = new LazyBatman();
                commander.lazyBatman.receive(function () {
                    if (commander.fighted >= commander.battleCount) {
                        commander.busy = false;
                    } else {
                        commander.fight();
                    }
                });

            },
            order: function (unit, commands, callback) {
                var commander = this;
                if (!(commands instanceof Array) || commands.length === 0) return;
                if (commander.busy) {
                    return false;
                } else {
                    commander.fighted = 0;
                    commander.busy = true;
                    commander.callback = callback;
                    commander.battleCount = commands.length;
                    commander.unit = unit;
                    commander.commands = commands;
                    commander.fight();
                    return true;
                }
            },
            callAction: function (action, command) {
                switch (typeof action) {
                    case 'string':
                        this.unit[action].apply(this.unit, command);
                        break;
                    case 'function':
                        action.apply(this.unit, command);
                        break;
                }
            },
            fight: function () {
                var commander = this;
                for (commander.fighted; commander.fighted < commander.battleCount; commander.fighted++) {
                    var command = [].slice.call(commander.commands[commander.fighted]),
                        actionName = command.length > 0 ? command.shift() : null,
                        async = (command.length > 0 ? command.shift() : false);
                    command.push(async === true ? commander.lazyBatman : {
                        notify: function () {
                        }
                    });
                    if (async === true) {
                        if (++commander.fighted >= commander.battleCount) {
                            commander.callAction(actionName, command);
                            if (typeof commander.callback === 'function') commander.callAction(commander.callback, []);
                            commander.busy = false;
                        } else {
                            commander.callAction(actionName, command);
                        }
                        break;
                    } else {
                        commander.callAction(actionName, command);
                        if (commander.fighted + 1 >= commander.battleCount) {
                            commander.callAction(commander.callback, []);
                            commander.busy = false;
                        }
                    }
                }
            }
        });
    return {
        create: function () {
            var commander = new Commander();
            return {
                order: commander.order.bind(commander)
            }
        }
    }
});