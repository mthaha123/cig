const { sendMail } = require("./email/index.js");
const { UserModel, InsInfoModel } = require("../repositories/mongoHelper");
const statusrule = require("../modeltranform/statusrule.js");
const co = require("co");
const moment = require("moment")

function getUserEmailList(list) {
    let whereObj = {
        _id: {
            $in: list
        }
    };

    return new Promise((rs, rj) => {
        UserModel.find(whereObj, (err, res) => {
            if (err) {
                rj(err);
            } else {
                rs(res)
            }
        })
    }).then(function(data) {
        if (data && data.length) {
            return data.map(cur => {
                return cur.Email;
            })
        } else {
            return [];
        }

    }).catch(err => {
        return [];
    });
}

function getDeviceList(list) {
    let whereObj = {
        _id: {
            $in: list.map(cur => {
                return cur.id
            })
        }
    };

    return new Promise((rs, rj) => {
        InsInfoModel.find(whereObj, (err, res) => {
            if (err) {
                rj(err);
            } else {
                rs(res)
            }
        })
    }).then(function(data) {
        if (data && data.length) {
            return data.map(cur => {
                return cur.email;
            })
        } else {
            return [];
        }

    }).catch(err => {
        return [];
    });
}

function getAdminList() {

    return new Promise((rs, rj) => {
        UserModel.find({ authList: "00008" }, (err, res) => {
            if (err) {
                rj(err);
            } else {
                rs(res)
            }
        })
    }).then(function(data) {
        if (data && data.length) {
            // return data.map(cur => {
            //     return cur.Email;
            // })
            let emails = data.map(cur =>{return cur.Email});
            let em=[];
            for(let email of emails){
                if (email != "无"){
                    em.push(email);
                }
            }
            return em;
        } else {
            return [];
        }

    }).catch(err => {
        return [];
    });
}

function getDeviceListNotify(list) {
    if (list && list.length) {
        return list.map(cur => {
            return `<tr><td>${cur.code}</td><td>${cur.No}</td><td>${cur.name}</td><td>${cur.modelNo}</td></tr>`;
        })
    } else {
        return [];
    }
}

//每日报表中仪器清单信息
function getReportList(list) {
    if (list && list.length) {
        return list.map(cur => {
            cur.deviceStatus = statusrule.statusList[parseInt(cur.deviceStatus)-1].label;
            return `<tr><td>${cur.insCode}</td><td>${cur.insName}</td><td>${cur.deviceStatus}</td></tr>`;
        })
    } else {
        return [];
    }
}
//签核通知中仪器清单信息
function getHandleList(list) {
    if (list && list.length) {
        return list.map(cur => {
            cur.deviceStatus = statusrule.statusList[parseInt(cur.deviceStatus)-1].label;
            cur.nextDeviceStatus = statusrule.statusList[parseInt(cur.nextDeviceStatus)-1].label;
            return `<tr><td>${cur.insCode}</td><td>${cur.insName}</td><td>${cur.deviceStatus}</td><td>${cur.nextDeviceStatus}</td></tr>`;
        })
    } else {
        return [];
    }
}

function getUserListNotify(list) {
    if (list && list.length) {
        return list.map(cur => {
            return `<tr><td>${cur.name}</td><td>${cur.userId}</td></tr>`;
        })
    } else {
        return [];
    }
}
function getInfoChangeList(list) {
   return list.map(cur => {
       let keeper = cur.keeper.split("&")[1];
       let fromkeeper = cur.fromKeeper =="无"?"无":cur.fromKeeper.split("&")[1];
       return `<tr><td>${cur.insCode}</td><td>${cur.insName}</td><td>${fromkeeper}</td><td>${keeper}</td></tr>`;
   })
}

function getCompleteList(list) {
   return list.map(cur => {
       let keeper = cur.keeper.split("&")[1];
       let insCode = cur.insCode.split("&")[1];
       return `<tr><td>${insCode}</td><td>${keeper}</td><td>校验完毕</td></tr>`;
   })
}

module.exports.notifyPwd = function(pwd, email) {
    return co(function*() {
        yield sendMail("pwd", [email], [], { pwd });
    })
}

module.exports.notifyAdmin = function(type, deviceList, date = "") {
    return co(function*() {
        let userList = yield getAdminList();
        let list;
        switch(type){
            case "infochange": list = getUserListNotify(deviceList);break;
            case "report": list = getReportList(deviceList);break;
            case "handle" : list = getHandleList(deviceList);break;
            default:   list = getDeviceListNotify(deviceList);
        }
        yield sendMail(type, userList, list, { date: moment(date).format("YYYY-MM-DD") });
    })
}

//提醒保管人并通知管理员
module.exports.notifyKeeper = function(type, userList, deviceList) {
    return co(function*() {
        let tmpuserList = yield getUserEmailList(userList);
        let ccRecipients  = yield getAdminList();   //抄送给管理员
        let list;
        switch(type){
            case "userchange": list = getInfoChangeList(deviceList); break;
            case "complete": list = getCompleteList(deviceList);break;
            case "handle": list = getHandleList(deviceList);break;
            default:   list = getDeviceListNotify(deviceList);
        }
        yield sendMail(type, tmpuserList, list,false,ccRecipients);
    })
}