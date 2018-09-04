const { TestModel, InsInfoModel, InsCodeModel, DepModel,confirmLogModel } = require("../repositories/mongoHelper");
const moment = require("moment");
const { statusCodeView, statusList } = require("../modeltranform/statusrule")
const _ = require("lodash");
const notify = require("../libs/notify.js");
const co = require("co")

function getStatusName(code) {
    for (let item of statusList) {
        if (item.statusCode == code) {
            return item.label;
        }
    }

    return "";
}

module.exports = {
    updateDevStatus: function(testInfo) {
        let _id = testInfo.insId;

        return new Promise((rs, rj) => {
            InsInfoModel.update({ _id }, {
                status: testInfo.deviceStatus,
                toConfirm: testInfo.toConfirm,
                nextStatus: testInfo.nextDeviceStatus,
            }, (err, res) => {
                if (err) {
                    rj(err);
                } else {
                    rs(res);
                }
            })
        }).catch(err => {
            console.log("update devStatus error:", err.message);
            console.log(err);

            return "";
        });
    },
    updateInsInfo: function* (id, item, userId) {
        let self = this;
        return new Promise((rs, rj) => {
            InsInfoModel.find({ _id: id }, (err, res) => {
                if (err) {
                    rj(err);
                } else {
                    rs(res);
                }
            })
        }).then(data => {
            if (data && data.length) {
                data = data[0].toObject();
                let cancelTest = Promise.resolve();
                
                //修改保管人信息，建立保管人确认文档
                if(data.keeper != item.keeper){
                    if(data.isInit == true){ //说明目前是更换保管人状态
                        let cLog = {
                            message: "更换保管人为"+item.keeper.split("&")[1],
                            time: moment().format("YYYY-MM-DD HH:mm:ss"),
                            operator: userId,
                        };
                        cancelTest =new Promise((rs, rj) => {
                            confirmLogModel.find({insId: id, complete: false},(err, res) => {
                                if (err) {
                                    rj(err);
                                } else {
                                    rs(res);
                                }
                            })
                        }).then((confirmLogData)=>{
                            let log = (confirmLogData[0].log || []).concat([cLog]);
                            let updateObj = {
                                keeper: item.keeper,
                                log
                            }; 
                            if(item.keeper == confirmLogData[0].fromKeeper){
                                updateObj.confirm = 1;
                                item.isInit = false;
                            }
                            return new Promise((rs,rj)=>{
                                confirmLogModel.update({ _id: confirmLogData[0]._id },updateObj,(err,res) =>{
                                    if (err) {
                                        rj(err);
                                    } else {
                                        rs(res);
                                    }
                                })
                            })
                        });
                    }else{
                        item.isInit = true;  //标志修改了保管人
                        //添加保管人确认文档到数据库
                        cancelTest = this.createConfirmLog(id,item,userId,data);
                        /* let model = new confirmLogModel({
                            insId : id,
                            insCode : item.code,
                            insName: item.name,
                            keeper: item.keeper,
                            fromKeeper: data.keeper,
                            log: [{
                                time: moment().format("YYYY-MM-DD HH:mm:ss"),
                                message: "更换保管人为"+item.keeper.split("&")[1],
                                operator: userId,
                            }]
                        });
                        cancelTest =new Promise((rs, rj) => {
                            model.save((err, res) => {
                                if (err) {
                                    rj(err);
                                } else {
                                    rs(res);
                                }
                            })
                        }); */
                    }

                }

                if (data.status != item.status) {
                    item.toConfirm = "1";
                    item.nextStatus = "";
                    cancelTest =cancelTest.then(function(){
                        return new Promise((rs, rj) => {
                            TestModel.find({ insId: id, complete: false }, (err, res) => {
                                if (err) {
                                    rj(err);
                                } else {
                                    if (res && res.length) {
                                        let obj = res[0].toObject();
                                        self.completeTest(obj._id, item.status).then(rs, rj)
                                    }
                                    rs()
                                }
                            });
                        })
                    })
                }

                return cancelTest.then(function() {
                    return new Promise((rs, rj) => {
                        InsInfoModel.update({ _id: id },
                            item,
                            (err, res) => {
                                if (err) {
                                    rj(err);
                                } else {
                                    rs(res);
                                }
                            });
                    });
                }, function() {
                    new Promise((rs, rj) => {
                        InsInfoModel.update({ _id: id },
                            item,
                            (err, res) => {
                                if (err) {
                                    rj(err);
                                } else {
                                    rs(res);
                                }
                            });
                    });
                });
            } else {
                return "";
            }
        }).catch(err => {
            console.log("update Device info error:", err.message);
            console.log(err);

            return "";
        });
    },
    completeTest: function(_id, status) {
        return new Promise((rs, rj) => {
            TestModel.update({ _id }, { complete: true, endStatus: getStatusName(status) }, (err, res) => {
                if (err) {
                    rj(err);
                } else {
                    rs(res);
                }
            })
        }).catch(err => {
            console.log("update complete status error:", err.message);
            console.log(err);
            return "";
        });
    },
    removeAttachFile:function(id,path){
        return co(function*(){
            let ret = yield TestModel.find({_id: id});
            if(ret && ret.length){
                let obj = ret[0].toObject();
                let logs = obj.log;
                logs.forEach(cur=>{
                    if(cur.filePath&&cur.filePath.length){
                        if(cur.filePath.indexOf(path)>-1){
                            cur.filePath.splice(cur.filePath.indexOf(path),1);
                        }
                    }
                })

                yield TestModel.update({_id:id},{log:logs})
            }
        })
    },
    clearNoneInfo:function(){
        return co(function*(){
            let list = yield TestModel.find({});
            for(let item of list){
                let ret  = yield InsInfoModel.find({_id: item.insId});
                if(!(ret&&ret.length)){
                    console.log("clear item:",item._id);
                    yield TestModel.remove({_id: item._id});
                }
            }

        })
    },
    /**
     * 查询状态
     * toUserConfirm 待确认
     * toConfirm 加签中
     * toChange  流程待变更
     */
    getDeviceByStatus: function(statusList, currentUser, forStatusList, pageNo = 0, pageSize = 100,keyword="") {
        let testWhereObject = { complete: false };
        let $or = [];
        let $and = [];
        pageSize = parseInt(pageSize);
        pageNo = parseInt(pageNo);
        for (let status of statusList) {
            switch (status) {
                case "toUserConfirm":
                    $or.push({ forUser: { $not: /.{0}|null/ } });
                    // statements_1
                    break;
                case "toConfirm":
                    $or.push({ toConfirm: { $not: /1/ } });
                    break;
                case "toChange":
                    $or.push({ toConfirm: 1 });
                    break;
                case "selfConfirm":
                    $or.push({ forUser: currentUser });
                    break;
                default:
                    // statements_def
                    break;
            }
        }

        if(forStatusList)
            $and.push({ deviceStatus: {$in: forStatusList} });

        if ($or.length){
            testWhereObject.$or = $or;
        }
        if($and.length)
            testWhereObject.$and = $and;
        if(keyword){
            testWhereObject.insCode = keyword;
        }
        return new Promise((rs, rj) => {
            TestModel.find(testWhereObject).skip(parseInt(pageNo) * pageSize).limit(pageSize).exec(function(err, res) {
                if (err) {
                    // console.warn("getList", type, "Error:", err);
                    rj(err);
                } else {
                    rs(res);
                }
            });
        }).then(res => {
            let whereObj = {};

            if (!res.length) {
                return [];
            }

            let resObj = (function(list) {
                let ret = {};
                for (let item of list) {
                    ret[item.insId] = item.toObject();
                }

                return ret;
            })(res);

            if (res.length) {
                whereObj = {
                    _id: {
                        $in: res.map(cur => {
                            return cur.insId
                        })
                    }
                };
            } else {
                throw new Error("为找到相关仪器信息");
            }

            return new Promise((rs, rj) => {
                InsInfoModel.find(whereObj).exec(function(err, res) {
                    if (err) {
                        // console.warn("getList", type, "Error:", err);
                        rj(err);
                    } else {
                        for (let item of res) {
                            console.log(resObj)
                            resObj[item._id.toString()].insInfo = item.toObject();
                        }

                        let retList = [];
                        for (let key in resObj) {
                            if(resObj[key].hasOwnProperty("insInfo")){
                                retList.push(resObj[key]);
                            }
                            
                        }

                        rs(retList);
                    }
                });
            });
        }).then(list => {
            if (pageNo == 0) {
                return new Promise((rs, rj) => {
                    TestModel.count(testWhereObject, function(err, res) {
                        if (err) {
                            // console.warn("getList", type, "Error:", err);
                            rj(err);
                        } else {
                            rs({
                                list,
                                total: res
                            });
                        }
                    });
                });
            } else {
                return {
                    list
                }
            }
        }).catch(err => {
            console.log("get device test list error:", err.message);
            console.log(err);
            return {
                list: [],
                total: 0
            }
        });
    },
    existTest: function(insId) {
        return new Promise((rs, rj) => {
            TestModel.find({ insId, complete: false }, (err, res) => {
                if (err) {
                    rj(err);
                } else {
                    rs(res);
                }
            });
        }).then(data => {
            if (data && data.length) {
                return true;
            } else {
                return false;
            }
        }).catch(err => {
            console.log("query exist test error:", err.message);
            console.log(err);
            return false;
        })
    },
    hasInit: function(insId) {
        return new Promise((rs, rj) => {
            InsInfoModel.find({ _id: insId }, (err, res) => {
                if (err) {
                    rj(err);
                } else {
                    rs(res);
                }
            });
        }).then(data => {
            if (data && data.length) {
                data = data.toObject();
                return !data.isInit;
            } else {
                return false;
            }
        }).catch(err => {
            console.log("find insInfo is Init error:", err.message);
            console.log(err);
            return false;
        });
    },
    //创建测试
    // insId:仪器id   userId:创建人   targetStatus: 当前目标状态
    startTest: function(insId, userId, targetStatus) {
        return new Promise((rs, rj) => {
            InsInfoModel.find({ _id: insId }, (err, res) => {
                if (err) {
                    rj(err);
                } else {
                    rs(res);
                }
            })
        }).then(data => {
            if (data && data.length) {
                let logMsg;
                if (targetStatus == "1") {
                    logMsg = "到达检测时间，设备等待入库";
                } else {
                    logMsg = "仪器进入测试状态";
                }
                let insInfo = data[0].toObject();
                var model = new TestModel({
                    insId,
                    insCode: data[0].code,
                    toConfirm: "1",
                    deviceStatus: targetStatus,
                    nextDeviceStatus: "",
                    hasReport: false,
                    forUser: '',
                    complete: false,
                    createTime: new Date,
                    endStatus: "",
                    startStatus: getStatusName(insInfo.status),
                    log: [{
                        time: moment().format("YYYY-MM-DD HH:mm:ss"),
                        message: logMsg,
                        operator: userId
                    }]
                });

                return new Promise((rs, rj) => {
                    model.save((err, res) => {
                        if (err) {
                            rj(err);
                        } else {
                            rs(res);
                        }
                    })
                });
            } else {
                return "";
            }
        })
    },
    getDeviceByID: function(_id) {
        return new Promise((rs, rj) => {
            InsInfoModel.find({ _id }, function(err, res) {
                if (err) {
                    rj(err)
                } else {
                    rs(res)
                }
            })
        }).catch(err => {
            return [];
        })
    },
    getDeviceByCode: function(code) {
        return new Promise((rs, rj) => {
            InsInfoModel.find({ code }, function(err, res) {
                if (err) {
                    rj(err)
                } else {
                    if (res && res.length) {
                        rs(res[0]._id.toString());
                    } else {
                        rj("");
                    }
                }
            })
        }).then(id => {
            return new Promise((rs, rj) => {
                TestModel.find({ insId: id, complete: false }, function(err, res) {
                    if (err) {
                        console.warn(err);
                        rj(err);
                    } else {
                        if (res && res.length)
                            rs(res[0].toObject());
                        else rs();
                    }
                });
            })
        }).catch(err => {
            console.warn(err);
            return null;
        });
    },
    updateStartDate: function(testInfo, startDate) {
        return new Promise((rs, rj) => {
            InsInfoModel.find({ _id: testInfo.insId }, (err, res) => {
                if (err) {
                    rj(err);
                } else {
                    rs(res);
                }
            }).then(data => {
                if (data && data.length) {
                    data = data[0].toObject();
                    let { period, periodUnit } = data;
                    let endDate = moment(startDate).add(period, periodUnit).format("YYYY-MM-DD 00:00:00");

                    return new Promise((rs, rj) => {
                        InsInfoModel.update({ _id: testInfo.insId }, {
                            startDate,
                            endDate
                        }, (err, res) => {
                            if (err) {
                                rj(err);
                            } else {
                                rs(res);
                            }
                        });
                    });
                } else {
                    return "";
                }
            }).then(data => {
                return data;
            }).catch(err => {
                console.log("update insInfo start Date err:", err.message);
                console.log(err);
                return "";
            });
        });
    },
    uploadReport: function(testInfo, note, filePath, userId) {
        let updateObj;
        let cLog = {
            message: "导入报告",
            time: moment().format("YYYY-MM-DD HH:mm:ss"),
            operator: userId.split("&")[1],
            note
        };

        if (filePath) {
            cLog.filePath = [filePath];
        }
        let log = (testInfo.log || []).concat([cLog])
        updateObj = {
            log,
            hasReport: true
        };

        return new Promise((rs, rj) => {
            TestModel.update({ _id: testInfo._id }, updateObj, (err, res) => {
                if (err) {
                    rj(err);
                } else {
                    rs(_.assign({}, testInfo, updateObj));
                }
            })
        });
    },
    changeStatus: function(testInfo, to, note, filePath, toProve, confirmChain, userId) {
        let updateObj;
        userId = userId.split("&").slice(0, 2).join("&");
        // 如果有审批链进入确认流程
        if (confirmChain && confirmChain.length) {
            let cLog = {
                message: "更新状态" + statusCodeView[to] + "等待确认",
                time: moment().format("YYYY-MM-DD HH:mm:ss"),
                note: note,
                operator: userId.split("&")[1]
            };

            if (filePath) {
                cLog.filePath = filePath;
            }

            let log = (testInfo.log || []).concat([cLog]);
            updateObj = {
                nextDeviceStatus: to,
                toConfirm: "0",
                log,
                fromWho:userId
            };

            //增加审批链，并提醒第一个审批人
            if (confirmChain) {
                updateObj.confirmChain = confirmChain;
                updateObj.forUser = confirmChain[0];
                updateObj.fromWho = userId;
                let confirmer = confirmChain[0].split("&")[0]
                this.getDeviceByID(testInfo.insId).then(res=>{
                     notify.notifyKeeper("handle", [confirmer], res);
                })
                
            }
        } else {
            let cLog = {
                message: "更新状态 " + statusCodeView[to],
                time: moment().format("YYYY-MM-DD HH:mm:ss"),
                note: note,
                operator: userId.split("&")[1]
            };

            if (filePath) {
                cLog.filePath = filePath;
            }
            let log = (testInfo.log || []).concat([cLog])
            updateObj = {
                deviceStatus: to,
                toConfirm: "1",
                nextDeviceStatus: "",
                log
            };
        }

        return new Promise((rs, rj) => {
            TestModel.update({ _id: testInfo._id }, updateObj, (err, res) => {
                if (err) {
                    rj(err);
                } else {
                    rs(_.assign({}, testInfo.toObject(), updateObj));
                }
            })
        });
    },
    rejectChange: function(testInfo, note, filePath, userId) {
        return new Promise((rs, rj) => {
            let cLog = {
                message: "否决状态更新",
                time: moment().format("YYYY-MM-DD HH:mm:ss"),
                note: note,
                operator: userId.split("&")[1]
            };

            if (filePath) {
                cLog.filePath = [filePath];
            }

            let log = (testInfo.log || []).concat([cLog]);

            let updateObj = {
                completeChain: [],
                log
            };

            
            this.getDeviceByID(testInfo.insId).then(res=>{
                notify.notifyKeeper("reject", [testInfo.fromWho.split("&")[0]], res);
           });

            updateObj.toConfirm = '1';
            updateObj.forUser = '';
            updateObj.fromWho = "";
            updateObj.nextDeviceStatus = "";

            TestModel.update({ _id: testInfo._id }, updateObj, (err, res) => {
                if (err) {
                    rj(err.message);
                } else {
                    rs(_.assign({}, testInfo.toObject(), updateObj));
                }
            });
        });
    },
    proveTestChange: function(testInfo, note, filePath, userId) {
        return new Promise((rs, rj) => {
            userId = userId.split("&").slice(0, 2).join("&");
            let completeChain = testInfo.completeChain.slice(0);
            completeChain.push(userId);

            let cLog = {
                message: "确认状态更新",
                time: moment().format("YYYY-MM-DD HH:mm:ss"),
                note: note,
                operator: userId.split("&")[1]
            };

            if (filePath) {
                cLog.filePath = [filePath];
            }
            let log = (testInfo.log || []).concat([cLog]);

            if (testInfo.toConfirm == "2") {
                let updateObj = {};

                // TODO: role is 计量管理员
                updateObj.toConfirm = '1';
                updateObj.forUser = '';
                updateObj.fromWho = "";
                // updateObj.completeChain = [];
                updateObj.confirmChain = [];
                updateObj.deviceStatus = testInfo.nextDeviceStatus;
                updateObj.nextDeviceStatus = "";
                TestModel.update({ _id: testInfo._id }, updateObj, (err, res) => {
                    if (err) {
                        rj(err);
                    } else {
                        rs(_.assign({}, testInfo.toObject(), updateObj));
                    }
                });
                return;
            }

            let updateObj = {
                completeChain: completeChain,
                log
            };

            //判断审批链是否完成
            if (completeChain.length == testInfo.confirmChain.length) {
                //完成
                updateObj.toConfirm = '2';
                updateObj.forUser = testInfo.fromWho;
                // updateObj.deviceStatus = testInfo.nextDeviceStatus;
                // updateObj.nextDeviceStatus = "";
                //提醒计量管理员审批确认
            } else {
                //未完成  更新下一位审批人
                let releaseUser = testInfo.confirmChain.slice(completeChain.length).shift();
                updateObj.forUser = releaseUser;
                this.getDeviceByID(testInfo.insId).then(res=>{
                    notify.notifyKeeper("handle", [releaseUser.split("&")[0]], res);
                })
                
            }

            TestModel.update({ _id: testInfo._id }, updateObj, (err, res) => {
                if (err) {
                    rj(err);
                } else {
                    rs(_.assign({}, testInfo.toObject(), updateObj));
                }
            })
        });
    },
    getTestInfo: function(testId) {
        return new Promise((rs, rj) => {
            TestModel.findById(testId, (err, res) => {
                if (err) {
                    // console.warn("getDetail", type, id, "Error:", err);
                    rj(err)
                } else {
                    rs(res);
                }
            })
        })
    },
    //强行导入，转换状态
    transformReport: function() {
        var model = new TestModel({
            insId,
            toConfirm: "1",
            deviceStatus: "1",
            nextDeviceStatus: "",
            log: [{
                time: moment().format("YYYY-MM-DD HH:mm:ss"),
                message: "到达时间，设备等待入库",
                operator: "System"
            }]
        });

        return new Promise((rs, rj) => {
            model.save((err, res) => {
                if (err) {
                    rj(err);
                } else {
                    rs(res);
                }
            })
        });
    },
    updateEndDate: function(info, startDate) {
        // let sDate = startDate || moment();
        let endDate = moment(sDate).add(info.period, info.periodUnit);
        return new Promise((rs, rj) => {
            InsInfoModel.update({ _id: info._id }, {
                // startDate: moment(startDate),
                endDate
            }, (err, res) => {
                if (err) {
                    rj(err);
                } else {
                    rs(res);
                }
            });
        });
    },
    getLog: function(insId) {
        return new Promise((rs, rj) => {
            TestModel.find({ insId }, (err, res) => {
                if (err) {
                    rj(err);
                } else {
                    rs(res);
                }
            });
        }).then(data => {
            if (data && data.length) {
                let ret = Array.prototype.sort.call(data, function(a, b) {
                    if (a.createTime && b.createTime) {
                        return a.createTime.getTime() - b.createTime.getTime();
                    } else if (a.createTime) {
                        return 1;
                    } else {
                        return -1;
                    }

                });

                return ret.map(cur => {
                    let current = cur.toObject();
                    current.createTime = moment(current.createTime).format("YYYY-MM-DD");
                    return current;
                });

            } else {
                return [];
            }
        }, err => {
            console.log("get ins log err:", err.message);
            console.log(err);
            return [];
        });
    },
    setInit: function(insId, status = true) {
        return new Promise((rs, rj) => {
            InsInfoModel.update({ _id: insId }, { isInit: status }, function(err, res) {
                if (err) {
                    rj(err);
                } else {
                    rs();
                }
            })
        }).catch(err => {
            console.log("update ins init failed", err.message);
            console.log(err);
            return;
        })
    },
    createConfirmLog: function(insId,item,userId,data=null){ // 新建仪器信息时或修改保管人时，创建保管人更改记录
        let model = new confirmLogModel({
            insId : insId,
            insCode : item.code,
            insName: item.name,
            keeper: item.keeper,
            fromKeeper: data?data.keeper : "无",
            log: [{
                time: moment().format("YYYY-MM-DD HH:mm:ss"),
                message: "更换保管人为"+item.keeper.split("&")[1],
                operator: userId,
            }]
        });
        return new Promise((rs,rj)=>{
            model.save((err, res) => {
                if (err) {
                    rj(err);
                } else {
                    rs(res);
                }
            })
        })
    },
    completeClog: function(item,userId){
        let cLog = {
            message: item.keeper.split("&")[1]+"确认更换保管人",
            time: moment().format("YYYY-MM-DD HH:mm:ss"),
            operator: userId,
        };
        return new Promise((rs, rj) => {
            confirmLogModel.find({insId: item.id, complete: false},(err, res) => {
                if (err) {
                    rj(err);
                } else {
                    rs(res);
                }
            })
        }).then((confirmLogData)=>{
            if(!confirmLogData.length){
                let model = new confirmLogModel({
                    insId : item.id,
                    insCode : item.code,
                    insName: item.name,
                    keeper: item.keeper,
                    fromKeeper: "无",
                    complete: true,
                    confirm: "1",
                    log: [{
                        time: moment().format("YYYY-MM-DD HH:mm:ss"),
                        message: item.keeper.split("&")[1]+"确认更换保管人",
                        operator: userId,
                    }]
                });
                return new Promise((rs,rj)=>{
                    model.save((err, res) => {
                        if (err) {
                            rj(err);
                        } else {
                            rs(res);
                        }
                    })
                })
            }
            let log = (confirmLogData[0].log || []).concat([cLog]);
            let updateObj = {
                complete: true,
                confirm: "1",
                log
            }; 
            return new Promise((rs,rj)=>{
                confirmLogModel.update({ _id: confirmLogData[0]._id },updateObj,(err,res) =>{
                    if (err) {
                        rj(err);
                    } else {
                        rs(res);
                    }
                })
            })
        });
    } 
}