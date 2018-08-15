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
    importMatCodeList: function*() {
        let { importFileId } = yield parse(this);
        let importFilePath = path.dirname(__dirname) + "/statics" + importFileId;
        let content = yield commonSvc.getImportContent(importFilePath);
        // content = iconv.encode(content,'utf8').toString();
        if (content) {
            let list = yield commonSvc.importMatCodeList(content[0]);
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
    exportMatCodeList: function*() {
        let ret = yield commonSvc.exportMatCodeList();
        this.body = {
            success: true,
            result: ret
        };
    },
}