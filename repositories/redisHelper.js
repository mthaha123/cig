var Pool = require("generic-pool").Pool;
var cmdlist = require("./rediscmds");
var config = require("../config.json").redisConfig;
var channelConfig = require("../config.json").channelConfig;
var uuid = require("uuid");

var pool = new Pool({
    name: "redis",
    create: function(callback) {
        var redisClient = require('redis').createClient(config);

        callback(null, redisClient);
    },
    destroy: function(client) {
        client.quit();
    },
    max: 15,
    min: 2,
    idleTimeoutMillis: 30000,
    log: false
});


/** 用于订阅消息的redis client */

var subscribeClient = null;
/**
 * 输出redis操作的promise
 */
cmdlist.forEach(function(current) {
    module.exports[current] = function() {
        var args = Array.prototype.slice.apply(arguments, [0]);

        return new Promise(function(rs, rj) {
            pool.acquire(function(err, client) {
                if (err) {
                    console.log(new Date() + ": redis get client error:" + err.message);
                    rj(err);
                    return;
                } else {
                    args.push(function(err, result) {
                        if (err) {
                            rj(err);
                            pool.release(client);
                            return;
                        } else {
                            pool.release(client);
                            rs(result);
                        }
                    });

                    client[current].apply(client, args);
                }
            });
        });
    }
});

// redis 的多channel订阅实现
function SubDispacther() {
    this.subDict = {};
    this.client = require('redis').createClient(config);
}

SubDispacther.prototype = {
    sub: function(channel, cb) {
        if (!this.subDict.hasOwnProperty(channel)) {
            this.subDict[channel] = {};
            this.client.subscribe(channel);
        }

        var cbId = uuid.v4();
        this.subDict[channel][cbId] = cb;

        return cbId;
    },
    init: function() {
        var handle = this.handle.bind(this);
        this.client.on('message', handle);

        // 监听订阅
        this.client.on('subscribe',
            function(channel, count) {
                console.log("channel:" + channel + " is subscribed, count:" + count);
            }
        );

        // 监听解除订阅
        this.client.on('unsubscribe',
            function(channel, count) {
                console.log("channel:" + channel + " is unsubscribed, count:" + count);
            }
        );

        // 监听错误
        this.client.on("error",
            function(err) {
                console.warn("err" + err);
            }
        );
    },
    handle: function(channel, message) {
        var cbListObj = this.subDict[channel];

        for (var key in cbListObj) {
            try {
                var result = JSON.parse(message);
            } catch (e) {
                console.warn(e);
            }
            cbListObj[key](result || message);
        }
    },
    destroy: function(channel, cbId) {
        if (this.subDict.hasOwnProperty(channel) && this.subDict[channel].hasOwnProperty(cbId)) {
            delete this.subDict[channel][cbId];
        }
    }
}

var subDispatcher = new SubDispacther();
subDispatcher.init();

module.exports.subscribe = subDispatcher.sub.bind(subDispatcher);
module.exports.destroy = subDispatcher.destroy.bind(subDispatcher);

module.exports.obj2array = function(obj) {
    var ret = [];
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            ret.push(key);
            if (typeof(obj[key]) == "string")
                ret.push(obj[key]);
            else {
                ret.push(JSON.stringify(obj[key]))
            }
        }
    }

    return ret;
}


module.exports.array2obj = function(array) {
    var obj = {};
    if (array.length == 0) {
        return obj;
    }

    for (var i = 0; i < array.length;) {
        obj[array[i]] == array[i + 1];
        i += 2;
    }

    return obj;
}
