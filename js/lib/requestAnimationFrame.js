define(function() {
    // 兼容处理
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||    // Webkit中此取消方法的名字变了
                                      window[vendors[x] + 'CancelRequestAnimationFrame'];
    }
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
            var id = window.setTimeout(function() {
                callback(currTime + timeToCall);
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }
    // var requestFrames = function(functions, callback){
    //     var _functions = functions instanceof Array? [].slice.call(functions): [functions];
    //     if(_functions && _functions.length > 0) {
    //         requestAnimationFrame(function(){
    //             var func = _functions.shift();
    //             func = typeof func === "string" ? window[func] : func;
    //             func && typeof func === "function" && func();
    //             requestFrames(_functions, callback);
    //         });
    //     }else{
    //         var _final = typeof callback === "string" ? window[callback] : callback;
    //         _final && typeof _final === "function" && _final();
    //     }
    // };
    // return {
    //     requestFrames: requestFrames
    // }
});