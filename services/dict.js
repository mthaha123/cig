const { UserModel, InsInfoModel, InsCodeModel, DepModel, EmailModel,supplierModel,TestModel,confirmLogModel,MatCodeModel,materialsModel} = require("../repositories/mongoHelper");
const mongoose = require('mongoose');
const co =require('co');
const _=require('lodash');

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
                    return _.assign(a._doc,{insName:b[0].name});
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
            ModelDict["depInfo"].find().distinct("keeper").exec(function(err, res) {
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
                return val.split("&")[1];
            });
            return new Promise((rs, rj) => {
                ModelDict["user"].find(whereObj)
                .in('name',list)
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
            ModelDict[type].remove({ "_id": id }, (err) => {
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
        var exQueryObj = {};
        for (let key of uniqueList) {
            exQueryObj[key] = item[key];
        }

        var exist = yield Model.findOne(exQueryObj);
        if (exist) {
            throw {
                notify: true,
                message: "用户名已存在"
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
    }
}
