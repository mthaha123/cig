const fs = require("fs");
const path = require("path");
const parse = require("co-body");
const del = require("del");
const thunkify = require("thunkify");
const notify = require("../libs/notify.js");
const commonSvc = require("../services/common");
const statusSvc = require("../services/status.js");
const { statusCode } = require("../modeltranform/statusrule.js");
const _ = require("lodash");
const moment = require("moment");
var iconv = require('iconv-lite');

const configSvc = require("../services/config.js");

module.exports = {
    downloadfile: function*() {
        this.attachment(path.basename(this.query.path));
        this.body = fs.createReadStream(path.dirname(__dirname) + "/statics" + this.query.path);
    },
    sendEmail: function*() {
        let { content, email } = yield parse(this);

        yield notify.sendMail(email, "", content, content);
        this.body = {
            success: true,
        }
    },
    upload: function*() {
        if (!this.request.is('multipart/*'))
            return;

        let rs = fs.createReadStream(this.request.fields.file[0].path);

        let toFilePath = path.dirname(__dirname) + "/statics/files/" + this.request.fields.file[0].name;

        let randNum = new Date().getTime();
        if(fs.existsSync(toFilePath)){
            let strs = this.request.fields.file[0].name.split(".");
            if(strs.length>=2){
                var ext = strs.pop();
                var filenamenoext = strs.join(".");
            }
            toFilePath = path.dirname(__dirname) + "/statics/files/"+ filenamenoext+`_${randNum++}`+"."+ext;
        }
        rs.pipe(fs.createWriteStream(toFilePath));
        let isSync = this.query.sync;

        this.body = {
            success: true,
            result: "/files/" + path.basename(toFilePath)
        };
    },
    remove: function*() {
        let { deletePath } = yield parse(this);

        let filePath = path.dirname(__dirname) + "/statics" + deletePath;

        yield del([filePath]);

        this.body = {
            success: true
        }
    },
    downloadFile: function*(dpath) {
        dpath = decodeURIComponent(dpath);
        let filePath = path.dirname(__dirname) + "/statics" + dpath;
        this.attachment(path.basename(filePath));
        this.body = fs.createReadStream(filePath);
    },
    importInsList: function*() {
        let { importFileId } = yield parse(this);
        let importFilePath = path.dirname(__dirname) + "/statics" + importFileId;
        let content = yield commonSvc.getImportContent(importFilePath);
        // content = iconv.encode(content,'utf8').toString();
        if (content) {
            let list = yield commonSvc.importInsList(content[0]);
            if (typeof(list) == "string") {
                this.body = {
                    success: false,
                    message: list
                }
                return;
            }
            // for (let id of list) {
            //     yield statusSvc.setInit(id.toString());
            // }
            this.body = {
                success: true,
                message: "导入成功"
            }
        } else {
            this.body = {
                success: false,
                message: "未找到相关文件或文件格式有误"
            }
        }
    },
    importReport: function*() {
        let { importFileId } = yield parse(this);
        let importFilePath = path.dirname(__dirname) + "/statics" + importFileId;

        //导入报告名称格式{code}_{name}_{date}_{status}
        let rname = path.basename(importFilePath)

        rname = rname.split("_");

        let startDate = rname[2];

        // let fileName = rname.split("_")[3] + "." + path.basename(importFilePath).extname;
        let testInfo = yield statusSvc.getDeviceByCode(rname[0]);
        if (!testInfo) {
            this.body = {
                success: false,
                message: `${path.basename(importFilePath)}序列号有误或者文件名称有误`
            }
            return;
        }

        // 更新校验日期
        function getDateStr(str) {
            if (str.length == 8) {
                let strs = str.split("");
                strs.splice(4, 0, "-");
                strs.splice(7, 0, "-");
                return strs.join("");
            } else {
                return "";
            }
        }

        startDate = getDateStr(startDate);

        if (!moment(startDate).isValid()) {
            this.body = {
                success: false,
                message: `${path.basename(importFilePath)}报告日期错误`
            }
            return;
        }
        let updateRet = yield statusSvc.updateStartDate(testInfo, startDate);
        console.log("更新仪器的校验时间:", updateRet);

        let userId = this.session.userInfo._id + "&" + this.session.userInfo.name;
        yield statusSvc.uploadReport(testInfo, "导入报告", importFileId, userId);
        this.body = {
            success: true,
            message: "导入成功"
        }
    },
    getMenuList: function*() {
        let authList = this.session.userInfo.authList;
        let menuListRet = [];

        let menuList = yield configSvc.getConfig("menuList");

        if (menuList && menuList.value)
            menuList.value.forEach(cur => {
                let ret = { title: cur.title };
                ret.href = cur.href;
                ret.itemList = [];
                cur.itemList.forEach(item => {
                    if (authList.indexOf(item.authCode) > -1) {
                        ret.itemList.push(_.assign({}, item));
                    }
                });

                menuListRet.push(ret);
            });

        this.body = {
            success: true,
            result: menuListRet
        }
    },
    getetInfoListHeader: function*() {
        let listHeader = yield configSvc.getConfig("viewHeader");
        let retList = [];
        let extendListHeader = yield configSvc.getConfig("extendHeader");
        this.body = {
            success: true,
            result: {
                listHeader: listHeader.value,
                extendListHeader: extendListHeader.value
            }
        }
    },
    setInfoListHeader: function*() {
        let { viewList, extendConfig } = yield parse(this);
        let ret1 = yield configSvc.saveConfig("viewHeader", viewList.map(cur => {
            if (cur.view == "true") {
                cur.view = true;
            } else {
                cur.view = false;
            }

            return cur;
        }));

        extendConfig = extendConfig || [];
        let ret2 = yield configSvc.saveConfig("extendHeader", extendConfig.map(cur => {
            if (cur.view == "true") {
                cur.view = true;
            } else {
                cur.view = false;
            }

            return cur;
        }));

        let ret = "" || ret1;
        ret = ret || ret2;

        this.body = {
            success: !!!ret,
            message: ret
        }
    },
    getAuthList: function*() {
        let authList = this.session.userInfo.authList;
        this.body = {
            success: true,
            result: authList
        }
    },
    getInsLog: function*() {
        let { id } = yield parse(this);
        let log = yield statusSvc.getLog(id);
        this.body = {
            success: true,
            result: log
        }
    },
    exportInsList: function*() {
        let listHeader = yield configSvc.getConfig("viewHeader");
        let extendHeaderList = yield configSvc.getConfig("extendHeader");
        let ret = yield commonSvc.exportList(listHeader.value, extendHeaderList.value);
        this.body = {
            success: true,
            result: ret
        };
    },
    downloadFile: function*(file) {
        this.body = fs.createReadStream(path.dirname(__dirname) + "/tmp/" + file);
    }
}