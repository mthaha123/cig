var parse = require("co-body");
var dictSvc = require("../services/dict");
var statusSvc = require("../services/status");

/** @type {Object} 所有的对象的增删改查字段设置 */
var ModelFieldSetting = require("../modeltranform/dict.js");

function getWhereStr(type, keyword) {
    if (!keyword) {
        return {};
    }

    let { keywordFields } = ModelFieldSetting[type];

    let obj = {};

    if (Object.keys(keywordFields).length == 1) {
        for (let key of keywordFields) {
            obj[key] = new RegExp(keyword);
        }
    } else {
        let list = [];
        for (let key of keywordFields) {
            let obj = {};
            obj[key] = new RegExp(keyword);
            list.push(obj);
        }

        obj["$or"] = list;
    }


    return obj;
}

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
    //用户相关
    getList: function*(type) {
        // let { keyword, pageNo, pageSize } = yield parse(this);
        let whereObj = getWhereStr(type, this.query.keyword);
        if(this.query.toConfirmStatus){
            whereObj.isInit = true;
            whereObj.keeper = new RegExp(this.session.userInfo._id)
        }
        var ret = yield dictSvc.getList(type, whereObj, this.query.pageNo, this.query.pageSize);
        this.body = {
            success: true,
            result: ret.list,
            total: ret.total
        }
    },
    getItem: function*(type, id) {
        var item = yield dictSvc.get(type, id);
        this.body = {
            success: true,
            result: item
        }
    },
    updateDict: function*(type, id) {
        let params = yield parse(this);
        let userId = this.session.userInfo.userId;
        var item;
        if (type == "insInfo") {
            item = yield statusSvc.updateInsInfo(id, getSaveItem(type, params),userId);
        } else if(type == "depInfo"){
            item = yield dictSvc.updateDepInfo(type, id, getSaveItem(type, params),userId);
        }else{
            item = yield dictSvc.update(type, id, getSaveItem(type, params));
        }

        this.body = {
            success: true,
            result: item._id
        }
    },
    saveDict: function*(type, id) {
        let params = yield parse(this);
        let userId = this.session.userInfo.userId;
        var item = yield dictSvc.save(type, getSaveItem(type, params), ModelFieldSetting[type].uniqueList);
        if(type == "insInfo"){//创建仪器信息要保管人确认
            let insId = item.toObject()._id;
            yield statusSvc.createConfirmLog(insId,item.toObject(),userId).catch(err => {
                console.log("createConfirmLog failed", err.message);
                console.log(err);
                return;
            });
        }
        this.body = {
            success: true,
            result: item._id
        }
    },
    deleteDict: function*(type, id) {
        yield dictSvc.remove(type, id);
        let userId = this.session.userInfo.userId;
        if(type == "insInfo"){
            yield statusSvc.completeCancelTest(id,userId);
        }
        this.body = {
            success: true
        }
    },
    //获取无效且是保管人员的员工
    getInvalidList: function*(){
        // let params = yield parse(this);
        let whereObj = getWhereStr("user", this.query.keyword);
        whereObj.isValid = {$ne: true};
        var ret = yield dictSvc.getInvalidList(whereObj, this.query.pageNo, this.query.pageSize);
        this.body = {
            success: true,
            result: ret.list,
            total: ret.total
        }
    },
    //获取日志信息
    getRecodeList: function*(){
        let whereObj = getWhereStr("test", this.query.keyword);
        whereObj.complete = true;
        whereObj.hasReport = true;
        var ret = yield dictSvc.getRecodeList(whereObj, this.query.pageNo, this.query.pageSize);
        this.body = {
            success: true,
            result: ret.list2,
            total: ret.total
        }
    }
}