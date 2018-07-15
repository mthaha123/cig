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

        if (type == "insInfo") {
            var item = yield statusSvc.updateInsInfo(id, getSaveItem(type, params));
        } else {
            var item = yield dictSvc.update(type, id, getSaveItem(type, params));
        }

        this.body = {
            success: true,
            result: item._id
        }
    },
    saveDict: function*(type, id) {
        let params = yield parse(this);
        var item = yield dictSvc.save(type, getSaveItem(type, params), ModelFieldSetting[type].uniqueList);
        this.body = {
            success: true,
            result: item._id
        }
    },
    deleteDict: function*(type, id) {
        yield dictSvc.remove(type, id);
        this.body = {
            success: true
        }
    }
}