var compress = require('koa-compress');
var logger = require('koa-logger');
var serve = require('koa-static');

var session = require('koa-generic-session');
var redisStore = require('koa-redis');
var http = require("http");
var redisConfig = require("./config.json").redis;
var config = require("./config.json").redis;
const schedule = require("./libs/schedule.js");

var path = require("path");
var koa = require('koa');

var app = module.exports = koa();

app.keys = ['keys', 'keykeys'];

app.use(session({
    store: redisStore(config),
    key: "user_login",
    prefix: "user:info",
    ttl: 24 * 60 * 1000 * 60,
    errorHandler: function(err) {
        console.log(err)
    }
}));

app.use(logger());
app.use(compress({
    threshold: '200kb'
}));

app.use(serve(path.join(__dirname, '/manager/debug/')));
app.use(serve(path.join(__dirname, '/statics')));

var appRouter = require('./router');
appRouter(app);

var koaServer = http.createServer(app.callback());

//初始化发邮件的计划任务
schedule.init();

if (!module.parent) {
    koaServer.listen(8910);

    console.log("Port", 8910, "listened");
}