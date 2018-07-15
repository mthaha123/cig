const { sendMail } = require("./email/index.js");
const { UserModel, InsInfoModel } = require("../repositories/mongoHelper");
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

function getDeviceListNotify(list) {
    if (list && list.length) {
        return list.map(cur => {
            return `${cur.code} ${cur.No} ${cur.name} ${cur.modelNo}`;
        })
    } else {
        return [];
    }
}

module.exports.notifyPwd = function(pwd, email) {
    return co(function*() {
        yield sendMail("pwd", [email], [], { pwd });
    })
}

module.exports.notifyAdmin = function(type, deviceList, date = "") {
    return co(function*() {
        let userList = yield getAdminList();
        yield sendMail(type, userList, getDeviceListNotify(deviceList), { date: moment(date).format("YYYY-MM-DD") });
    })
}

module.exports.notifyKeeper = function(type, userList, deviceList, date = "") {
    return co(function*() {
        let tmpuserList = yield getUserEmailList(userList);

        yield sendMail(type, tmpuserList, getDeviceListNotify(deviceList), { date: moment(date).format("YYYY-MM-DD") });
    })
}