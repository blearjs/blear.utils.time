'use strict';


require('blear.polyfills.time');

var date = require('blear.utils.date');


/**
 * 下一次，尽快异步执行
 * @param callback
 * @returns {Object|number}
 */
exports.nextTick = function (callback) {
    return setTimeout(function () {
        callback();
    }, 0);
};


/**
 * 下一帧，大约 16 ms
 * @param callback {Function} 回调
 * @returns {Object|number}
 */
var nextFrame = exports.nextFrame = function (callback) {
    return requestAnimationFrame(function () {
        callback();
    });
};


/**
 * 取消下一帧，大约 16 ms
 * @param frameId {*} 帧
 * @returns {Object|number}
 */
var cancelFrame = exports.cancelFrame = function (frame) {
    return cancelAnimationFrame(frame);
};


/**
 * 生成 interval
 * @param builder
 * @returns {Function}
 */
var buildInterval = function (builder) {
    return function (callback, interval) {
        var now = date.now();
        var timer = {
            id: 0,
            times: 0,
            startTime: now,
            timeStamp: now,
            elapsedTime: 0,
            intervalTime: 0,
            stopTime: 0
        };
        var lastTime = timer.startTime;
        var flash = function () {
            if (timer.stopTime) {
                return;
            }

            timer.id = builder(function () {
                var now = date.now();
                timer.elapsedTime = now - timer.startTime;
                timer.intervalTime = now - lastTime;
                timer.times += 1;
                timer.timeStamp = now;
                lastTime = now;
                // setIntervalFrame(function(next){
                //     // 当前事情做完在进入下一帧计算
                //     next();
                // });
                if (callback.length === 1) {
                    callback(flash);
                }
                // setIntervalFrame(function(){
                //     // 连续执行
                // });
                else {
                    callback();
                    flash();
                }
            }, interval || 1);
        };

        flash();

        return timer;
    };
};


/**
 * 取消 interval
 * @param unbuilder
 * @returns {Function}
 */
var unbuildInterval = function (unbuilder) {
    return function (timer) {
        timer.stopTime = date.now();
        unbuilder(timer.id);
    };
};


/**
 * 执行循环定时
 * @param callback
 * @returns {{id: number, times: number, startTime: number, timeStamp: number, elapsedTime: number}}
 */
exports.setInterval = buildInterval(setTimeout);


/**
 * 清空循环定时器
 * @param frame {Object} 帧信息
 */
exports.clearInterval = unbuildInterval(clearTimeout);


/**
 * 执行循环帧动画
 * @param callback
 * @returns {{id: number, times: number, startTime: number, timeStamp: number, elapsedTime: number}}
 */
exports.setIntervalFrame = buildInterval(nextFrame);


/**
 * 清空循环帧动画
 * @param frame {Object} 帧信息
 */
exports.clearIntervalFrame = unbuildInterval(cancelFrame);
