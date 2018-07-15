var route = require("koa-route");
var dictCtrl = require("./controllers/dictCtrl");

var router = require("koa-router")();
var body = require('koa-better-body')
var commonSvc = require("./controllers/common.js");
var userCtrl = require("./controllers/user");

var statusCtrl = require("./controllers/statuCtrl.js");

module.exports = function(app) {
    app.use(route.get("/cig/clearNone", statusCtrl.clearNoneInfo));
    app.use(route.post("/cig/login", userCtrl.login));
    app.use(route.post("/cig/checkUrlLogin", userCtrl.checkoutLogin));
    app.use(route.post("/cig/resetPassword", userCtrl.resetPassword));
    app.use(route.post("/cig/resetUserPassword", userCtrl.resetUserPassword));
    app.use(route.post("/cig/resetUserOwnPassword", userCtrl.resetUserOwnPassword));
    app.use(route.post("/cig/importInsList", commonSvc.importInsList));
    app.use(route.post("/cig/importReport", commonSvc.importReport));

    app.use(route.post("/cig/getDeviceByStatus", statusCtrl.getDeviceList));
    //测试开始测试
    app.use(route.post("/cig/startTest", statusCtrl.createTest));
    app.use(route.get("/cig/downloadfile", commonSvc.downloadfile));
    app.use(route.post("/cig/sendEmail", commonSvc.sendEmail));

    app.use(route.post("/cig/removeFile", commonSvc.remove));
    app.use(route.post("/cig/removeAttachFile", statusCtrl.removeAttachFile));
    
    app.use(route.get("/cig/downloadfile/:dpath", commonSvc.downloadFile))

    app.use(route.post("/cig/provetest/:id", statusCtrl.proveStatus));
    app.use(route.post("/cig/rejecttest/:id", statusCtrl.rejectChange));
    app.use(route.post("/cig/changestatus/:id", statusCtrl.changeAppliction));

    app.use(route.post("/cig/confirmInit", statusCtrl.confirmInit));

    router.post("/cig/uploadfile", body({
        formLimit: "20mb"
    }), commonSvc.upload);
    app.use(router.routes());

    app.use(route.post("/cig/getMenuList", commonSvc.getMenuList));
    app.use(route.post("/cig/getHeaderList", commonSvc.getetInfoListHeader));
    app.use(route.post("/cig/getHeaderSet", commonSvc.getetInfoListHeaderSet));
    app.use(route.post("/cig/setHeaderList", commonSvc.setInfoListHeader));
    app.use(route.post("/cig/getAuthList", commonSvc.getAuthList));
    app.use(route.post("/cig/getInsLog", commonSvc.getInsLog));
    app.use(route.post("/cig/exportInsList", commonSvc.exportInsList));
    app.use(route.get("/cig/download/:file", commonSvc.downloadFile));

    app.use(route.post("/cig/common/importUser", userCtrl.importUser));
    app.use(route.post("/cig/transferAuth", userCtrl.changeUserAuthTo));

    app.use(route.get('/cig/:type/:id', dictCtrl.getItem));
    app.use(route.get('/cig/:type', dictCtrl.getList));
    app.use(route.patch("/cig/:type/:id", dictCtrl.updateDict));
    app.use(route.post("/cig/:type", dictCtrl.saveDict));
    app.use(route.delete("/cig/:type/:id", dictCtrl.deleteDict));
}
