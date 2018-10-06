const { UserModel, InsInfoModel, InsCodeModel, DepModel, EmailModel,supplierModel,TestModel,confirmLogModel,MatCodeModel,materialsModel} = require("../repositories/mongoHelper");
const mongoose = require('mongoose');
const co =require('co');
const _=require('lodash');
var statusSvc = require("../services/status");

var ModelDict = {
    user: UserModel,
    insInfo: InsInfoModel,
    insCode: InsCodeModel,
    depInfo: DepModel,
    email: EmailModel,
    supplier: supplierModel,
    confirmLog: confirmLogModel,
    matCode: MatCodeModel,
    materials: materialsModel
}

function getInsInfoById(val){
    return new Promise((rs, rj) => {
        ModelDict["insInfo"].find({_id:mongoose.Types.ObjectId(val.insId)}).exec(function(err,res){
            if (err) {
                console.warn("getRecodeList", "Error:", err);
                rj(err);
            } else {
                rs(res);
            }
        });
    });
    // .then((valList)=>{
    //     val.insName = valList[0].name;
    //     return val;
    // });
}
module.exports = {
    getList: function(type, whereObj = {}, pageNo = 0, pageSize = 10) {
        whereObj.isDelete = {$ne:true};
        pageSize = parseInt(pageSize);
        pageNo = parseInt(pageNo);
        return new Promise((rs, rj) => {
            ModelDict[type].find(whereObj).skip(parseInt(pageNo) * pageSize).limit(pageSize).exec(function(err, res) {
                if (err) {
                    console.warn("getList", type, "Error:", err);
                    rj(err);
                } else {
                    rs(res);
                }
            });
        }).then(list => {
            if (pageNo == 0) {
                return new Promise((rs, rj) => {
                    ModelDict[type].count(whereObj, function(err, res) {
                        if (err) {
                            console.warn("getList", type, "Error:", err);
                            rj(err);
                        } else {
                            rs({
                                list,
                                total: res
                            });
                        }
                    });
                });
            }
            return {
                list
            }
        }).then(data => {
            return data;
        }).catch(err => {
            console.log("get List info error:", err.message);
            console.log(err);
            return {
                list: [],
                total: 0
            }
        })
    },
    // 获取流水信息
    getRecodeList: function* ( whereObj = {}, pageNo = 0, pageSize = 10) {
        pageSize = parseInt(pageSize);
        pageNo = parseInt(pageNo);
        return new Promise((rs, rj) => {
            TestModel.find(whereObj).sort({_id: -1}).skip(parseInt(pageNo) * pageSize).limit(pageSize).exec(function(err, res) {
                if (err) {
                    console.warn("getRecodeList", type, "Error:", err);
                    rj(err);
                } else {
                    rs(res);
                }
            });
        }).then((list)=>{
            return Promise.all(list.map(function (val){
                return getInsInfoById(val);
                
            })
        ).then((result)=>{
                let list2 = _.zipWith(list,result,(a,b)=>{
                    return _.assign(a._doc,{insName:b[0].name,insinfo:b});
                })
                if (pageNo == 0) {
                    return new Promise((rs, rj) => {
                        TestModel.count(whereObj, function(err, res) {
                            if (err) {
                                console.warn("getRecodeList","Error:", err);
                                rj(err);
                            } else {
                                rs({
                                    list2,
                                    total: res
                                });
                            }
                        });
                    });
                }
                return {
                    list2
                }
            })
        }).then((data)=>{
            return data;
        }).catch(err => {
            console.log("get recodeList info error:", err.message);
            console.log(err);
            return {
                list: [],
                total: 0
            }
        })
    },
    getInvalidList: function( whereObj = {}, pageNo = 0, pageSize = 10) {
        pageSize = parseInt(pageSize);
        pageNo = parseInt(pageNo);
        return new Promise((rs, rj) => {
            ModelDict["depInfo"].find({isDelete:{$ne:true}}).distinct("keeper").exec(function(err, res) {
                if (err) {
                    console.warn("getInvalidList Error:", err);
                    rj(err);
                } else {
                    rs(res);
                }
            });
        }).then((list) => {
            list = list.map(function(val){
                // return mongoose.Types.ObjectId(val.split("&")[0]);
                return val.split("&")[0];
            });
            return new Promise((rs, rj) => {
                ModelDict["user"].find(whereObj)
                .in('_id',list)
                .skip(parseInt(pageNo) * pageSize)
                .limit(pageSize)
                .exec(function(err, res) {
                    if (err) {
                        console.warn("getInvalidList", "Error:", err);
                        rj(err);
                    } else {
                        rs(res);
                    }
                });
            });
        }).then(list => {
            if (pageNo == 0) {
                return new Promise((rs, rj) => {
                    ModelDict["user"].count(whereObj, function(err, res) {
                        if (err) {
                            console.warn("getInvalidList", "Error:", err);
                            rj(err);
                        } else {
                            rs({
                                list,
                                total: res
                            });
                        }
                    });
                });
            }
            return {
                list
            }
        }).then(data => {
            return data;
        }).catch(err => {
            console.log("get invalidList info error:", err.message);
            console.log(err);
            return {
                list: [],
                total: 0
            }
        })
    },
    remove: function(type, id) {
        return new Promise((rs, rj) => {
            ModelDict[type].update({ "_id": id },{"isDelete":true}, (err) => {
                if (err) {
                    console.warn("remove", type, id, "Error:", err);
                    rj(err)
                } else {
                    rs();
                }
            })
        })
    },
    get: function(type, id) {
        return new Promise((rs, rj) => {
            ModelDict[type].findById(id, (err, res) => {
                if (err) {
                    console.warn("getDetail", type, id, "Error:", err);
                    rj(err)
                } else {
                    rs(res);
                }
            })
        });
    },
    save: function*(type, item, uniqueList) {
        var Model = ModelDict[type];
        if(uniqueList.length){
            var exQueryObj = {};
            for (let key of uniqueList) {
                exQueryObj[key] = item[key];
            }
            exQueryObj.isDelete = {$ne:true};
            
            var exist = yield Model.findOne(exQueryObj);
            if (exist) {
                throw {
                    notify: true,
                    message: "用户名已存在"
                }
            }
        }
        var model = new Model(item);
        return new Promise((rs, rj) => {
            model.save((err, res) => {
                if (err) {
                    console.warn("save", type, "Error:", err);
                    rj(err);
                } else {
                    rs(res);
                }
            })
        });
    },
    update: function(type, id, item) {
        return new Promise((rs, rj) => {
            ModelDict[type].update({ "_id": id }, item, (err, res) => {
                if (err) {
                    console.warn("update", type, id, "Error:", err);
                    rj(err);
                } else {
                    rs(res);
                }
            })
        });
    },
    //更新部门信息，修改部门保管人时要同时更新仪器信息的保管人
    updateDepInfo:function*(type,id,item,userId){
        //
        let data = yield ModelDict[type].findById({ "_id": id });
        yield ModelDict[type].update({ "_id": id }, item);
        if(data.keeper != item.keeper){//如果更换了保管人，该部门的仪器更换保管人
            let list = yield ModelDict["insInfo"].find({"depCode":item.name,"isValid":{$ne: true}});
            if(list&&list.length){
                for(l of list){
                    if(l.isInit == false){//对于保管人确认过的仪器添加保管人确认记录
                        l.fromKeeper = l.keeper;
                        l.keeper = item.keeper;
                        yield statusSvc.completeClog(l,userId,l.fromKeeper);
                    }
                }
                yield ModelDict["insInfo"].updateMany({"depCode":item.name,"isValid":{$ne: true}},{"keeper":item.keeper});
            }
        }
        return item;
    }
}
