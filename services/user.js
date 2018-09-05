const parseString = require('xml2js').parseString;
const request = require("request");
const { userImportUrl } = require("../config.json");
const { UserModel, InsInfoModel, TestModel } = require("../repositories/mongoHelper.js");
const md5 = require("md5");
const fs = require("fs");
const path = require("path");
const moment = require("moment");
const co = require("co");

function getUserList() {
    return new Promise((rs, rj) => {
        // rs(require("../test/userlist.json"));
        request({
            uri: userImportUrl,
            method: "POST",
            form: {
                Badge: "all"
            }
        }, (err, res) => {
            if (err) {
                rj(err);
            } else {
                rs(res)
            }
        });
    }).then(data => {
        data = data.body.replace(/&lt;/g, "<").replace(/&gt;/g, ">");

        return new Promise((rs, rj) => {
            parseString(data, function(err, result) {
                if (err) {
                    let fileName = moment().format("YYYY-MM-DD_HH:mm:ss.json");
                    fs.writeFile(`${path.dirname(__dirname)}/statics/errors/${fileName}`, data, { encoding: "utf-8" }, terr => {
                        console.log("writeComplete");
                        rj(err);
                    })
                } else {
                    if (result.string.DOC && result.string.DOC.length) {
                        rs(result.string.DOC[0]);
                    } else rs([]);
                }
            });
        });
    }).catch(err => {
        console.warn("get User List error:", err.message);
        console.log(err);
        return {
            Row: []
        };
    });
}

function saveUser(user) {
    return new Promise((rs, rj) => {
        UserModel.findOne({ userId: user.Badge[0],isDelete:{$ne:true} }, (err, res) => {
            if (err) {
                rj(err);
            } else {
                rs(res);
            }
        })
    }).then(data => {
        if (data) {
            console.log(`user ${user.Name[0]} exist, updating`)
            if(user.Email[0]!=="无"){
                return new Promise((rs, rj) => {
                    UserModel.update(
                        { userId: user.Badge[0] },
                        { $set:
                            {
                                "Email": user.Email[0],
                                isValid: user.Status[0]=="在职"?true:false,
                                isLock: user.Status[0]=="在职"?false:true
                            }
                        },
                        (err, res) => {
                            if (err) {
                                console.warn("update", user.Name[0], "Error:", err);
                                rj(err);
                            } else {
                                rs(res);
                            }
                        }
                    )
                });
            }else{
                return new Promise((rs, rj) => {
                    UserModel.update(
                        { userId: user.Badge[0] },
                        { $set:
                            {
                                isValid: user.Status[0]=="在职"?true:false,
                                isLock: user.Status[0]=="在职"?false:true
                            }
                        },
                        (err, res) => {
                            if (err) {
                                console.warn("update", user.Name[0], "Error:", err);
                                rj(err);
                            } else {
                                rs(res);
                            }
                        }
                    )
                });
            }
        } else {
            var model = new UserModel({
                "name": user.Name[0],
                "Email": user.Email[0],
                "role": 0,
                "userId": user.Badge[0],
                "isInit": true,
                "password": "1234",
                isLock: false,
                isValid: user.Status=="在职"?true:false
            });

            return new Promise((rs, rj) => {
                model.save((err, res) => {
                    if (err) {
                        console.warn("save", type, "Error:", err);
                        rj(err);
                    } else {
                        console.log(`save user ${user.Name[0]} complete`)
                        rs(res);
                    }
                })
            });
        }
    }).catch(err => {
        console.log(err);
    })
}

function validateUserEmail(userId, email) {
    return new Promise((rs, rj) => {
        UserModel.find({
            userId,
            Email: email
        }, (err, res) => {
            if (err) {
                rj(err);
            } else {
                rs(res);
            }
        });
    }).then(res => {
        if (res && res.length) {
            return res[0]
        } else {
            return null;
        }
    }).catch(err => {
        console.log(err);
        return null;
    })
}

function getUser(userId, password) {
    return new Promise((rs, rj) => {
        UserModel.find({
            userId,
            $or: [{ password: md5(password) }, { password }]
        }, (err, res) => {
            if (err) {
                rj(err);
            } else {
                rs(res);
            }
        });
    }).then(res => {
        if (res && res.length) {
            return res[0]
        } else {
            return null;
        }
    }).catch(err => {
        console.log(err);
        return null;
    })
}

function updatePassword(userId, password, init, isMd5 = true) {
    return new Promise((rs, rj) => {
        UserModel.update({ "userId": userId }, { password: isMd5 ? md5(password) : password, isInit: init }, (err, res) => {
            if (err) {
                console.warn("update password Error:", err);
                rj(err);
            } else {
                rs(res);
            }
        })
    });
}

function updateLock(userId, isLock) {
    return new Promise((rs, rj) => {
        UserModel.update({ "userId": userId }, { isLock }, (err, res) => {
            if (err) {
                console.warn("update password Error:", err);
                rj(err);
            } else {
                rs(res);
            }
        })
    });
}

function updateKeeper(from, to) {
    return new Promise((rs, rj) => {
        InsInfoModel.update({ keeper: from }, { keeper: to }, function(err, res) {
            if (err) {
                rj(err);
            } else {
                rs();
            }
        })
    }).catch(err => {
        console.log("update keeper user error", err.message);
        console.log(err);
        return err;
    })
}

function updateTestChain(testInfo) {
    return new Promise(function(rs, rj) {
        TestModel.update({ _id: testInfo._id }, testInfo, function(err, res) {
            if (err) {
                rj(err);
            } else {
                rs(res)
            }
        })
    }).catch(err => {
        console.log(`Save updated testInfo ${testInfo._id} error:`, err.message);
        console.log(err);
        return false;
    })
}

function updateChain(from, to) {
    return new Promise((rs, rj) => {
        TestModel.find({ complete: false }, function(err, res) {
            if (err) {
                rj(err);
            } else {
                rs(res);
            }
        });
    }).then(data => {
        if (data && data.length) {
            let list = data.map(function(cur) {
                return cur.toObject();
            });

            let updateList = [];
            for (let item of list) {
                // 未审批完成的测试
                if (item.confirmChain.length > item.completeChain.length) {
                    let index = item.confirmChain.indexOf(from);
                    // 说明还未审批到该人
                    if (index >= item.completeChain.length) {
                        item.confirmChain[index] = to;
                    }
                }

                if (item.forUser == from) {
                    item.forUser = to;
                }

                updateList.push(item);
            }

            return updateList;
        } else
            return [];
    }).then(function(list) {
        return co(function*() {
            for (let item of list) {
                yield updateTestChain(item);
            }
        });
    }).catch(err => {
        console.log("update test chain error:", err.message);
        console.log(err);
        return err;
    })
}

module.exports = {
    import: function*() {
        let ret = yield getUserList();
        let list = ret.Row;

        for (let user of list) {
            yield saveUser(user);
        }
    },
    validateUserEmail,
    updateUserResetPwd: function*(userId, pwd) {
        yield updatePassword(userId, pwd, true, false)
    },
    generateInitPwd: function() {
        var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split("");
        var npwd = new Array();
        for (let i = 0; i < 6; i++) {
            npwd.push(chars[Math.round(Math.random() * chars.length)]);
        }
        console.log("generate pad", npwd.join(""));
        return npwd.join("");
    },
    login: function*(userId, password) {
        return yield getUser(userId, password);
    },
    resetPassword: function*(userId, password, init = false) {
        yield updatePassword(userId, password, init)
    },
    lockUser: function*(userId) {
        yield updateLock(userId, true);
    },
    releaseLock: function*(userId) {
        yield updateLock(userId, false);
    },
    changeUserAuthTo: function*(from, to) {
        yield updateKeeper(from, to);
        yield updateChain(from, to);
    }
}