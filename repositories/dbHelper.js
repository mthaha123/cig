"use strict"
var mysql = require('mysql');
var wrapper = require('co-mysql');
var _ = require("lodash");
// var thunkify = require('thunkify');

// var tunnel = require('tunnel-ssh');

// var result = require("../lib/resultCode");

var pool = null;

// var config = {
//     host: '202.69.27.120',
//     username: 'web',
//     password: "web.120",
//     dstPort: 3306,
//     localPort: 3000
// };

/**
 * 通过TUNNEL连接mysql
 */
// var server = tunnel(config, function(error, result) {
//     console.log('connected');

//     try {
//         pool = mysql.createPool({
//             host: '127.0.0.1',
//             port: "3000",
//             user: 'root',
//             password: '123456'
//         });
//     } catch (err) {
//         console.log(err);
//     }
// });

/**
 * 正常连接MYSQL
 */
try {
    var pool = mysql.createPool({
        host: '139.196.37.109',
        user: 'root',
        password: 'Ssj890623',
        database: 'spider',
        port: '3306',
        connectionLimit: 20,
        charset: 'UTF8'
    });
    console.log("MySQL connected");
} catch (err) {
    console.log("MySQL connect error:" + err);
}


var helper = {
    ExcuteQuery: function*(sql) {
        var p = wrapper(pool);

        try {
            var rows = yield p.query(sql);
            return rows;
        } catch (e) {
            console.log(sql, JSON.stringify(e));
            throw e;
        }
    },
    ExcuteNoQuery: function*(sql) {
        var p = wrapper(pool);
        try {
            yield p.query(sql);
        } catch (e) {
            console.log(sql, JSON.stringify(e));
            throw e;
        }
    },
    tplExcute: function*(tpl, obj) {
        var p = wrapper(pool);
        obj = obj || {};
        var sql = "";
        try {
            sql = _.template(tpl)(obj);
            return yield p.query(sql);
        } catch (e) {
            console.log(sql, JSON.stringify(e));
            throw e;
        }
    }
}

module.exports = helper;
