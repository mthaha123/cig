const fs = require("fs");
const path = require("path");
const parse = require("co-body");
const del = require("del");
var dictSvc = require("../services/dict");
const thunkify = require("thunkify");
const notify = require("../libs/notify.js");
const commonSvc = require("../services/common");
const statusSvc = require("../services/status.js");
const { statusCode } = require("../modeltranform/statusrule.js");
const {InsInfoModel,MatCodeModel,materialsModel} = require("../repositories/mongoHelper");
const _ = require("lodash");
const moment = require("moment");
var iconv = require('iconv-lite');
/** @type {Object} 所有的对象的增删改查字段设置 */
var ModelFieldSetting = require("../modeltranform/dict.js");

const configSvc = require("../services/config.js");

function getSaveItem(type, params) {
    let config = ModelFieldSetting[type];
    let obj = {};
    for (let field of config.insertFields) {
        if (typeof(field) == "string") {
            if (params.hasOwnProperty(field))
                obj[field] = params[field];
        } else {
            if (params.hasOwnProperty(field.name)) {
                obj[field.name] = params[field.name];
            } else {
                if (field.hasOwnProperty("default")) {
                    obj[field.name] = field.default;
                }
            }
        }

    }

    return obj;
}
module.exports = {
    addInsLog:function*(){
        let {form} = yield parse(this);
        let log = {ins:[]};
        let ins1 = form.insLog.split("_");
        log.ins = ins1;
        form.log = log;
        for(let insCode of ins1){
            if(!(yield InsInfoModel.findOne({code: insCode,isDelete:{$ne:true}}))){
                console.log(`添加仪器编号有误`);
                this.body = {
                    success: false,
                    message: "添加仪器编号有误",
                }
                return;
            }
        }
        if(ins1.length > form.num){
            this.body = {
                success: false,
                message: "添加仪器数过多",
            }
            return;
        }else if( ins1.length == form.num){
            form.complete = true;
        }
        var item = yield dictSvc.update("materials", form._id, getSaveItem("materials", form));
        
        this.body = {
            success: true,
            result: item._id
        }
        

    },
    importMaterialsList: function*() {
        let { importFileId } = yield parse(this);
        let importFilePath = path.dirname(__dirname) + "/statics" + importFileId;
        let content = yield commonSvc.getImportContent(importFilePath);
        // content = iconv.encode(content,'utf8').toString();
        if (content) {
            let list = yield commonSvc.importMaterialsList(content[0]);
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
    exportMaterialsList: function*() {
        let ret = yield commonSvc.exportMaterialsList();
        this.body = {
            success: true,
            result: ret
        };
    },
    updateType: function*(){
        let query = {
            type:"未确认",
            isDelete:{$ne:true} 
        };
        let num=0;
        //找出未确认状态的来料，之后对其更新
        let list = yield materialsModel.find(query);
        for(let i of list){
            i = i.toObject();
            let matcode = yield MatCodeModel.findOne({code: i.code,isDelete:{$ne:true}});
            if(matcode){
                i["type"] = matcode.type;
                if(i.type == "NA"){
                    i.complete = true;
                }
                yield dictSvc.update("materials", i._id, getSaveItem("materials", i));
                num++;
            }
        }
        //找出状态为NA的，更新为完成
        query = {
            type:"NA",
            isDelete:{$ne:true} 
        };
        list = yield materialsModel.find(query);
        for(let i of list){
            i = i.toObject();
            if(i.complete ==false){
                i.complete = true;
                yield dictSvc.update("materials", i._id, getSaveItem("materials", i));
                num++;
            }

        }
        this.body = {
            success: true,
            result:num,
        };
    },
}