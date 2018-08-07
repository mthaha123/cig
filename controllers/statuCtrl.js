let parse = require("co-body");
let statusSvc = require("../services/status.js");
let { statusRule, completeStatus, statusCode, needProve } = require("../modeltranform/statusrule.js");
let dictSvc = require("../services/dict.js");
let { notifyKeeper } = require("../libs/notify.js");
const del = require("del");
const path = require("path")
function statusChangeCheck(current, to) {
    return statusRule.indexOf(current + "=>" + to) > -1;
}

function statusChangeProveCheck(current, to) {
    return needProve.indexOf(current + "=>" + to) > -1;
}

function isProcessComplete(status) {
    return completeStatus.indexOf(status) > -1;
}

module.exports = {
    /**
     * 查询状态
     * toUserConfirm 待确认
     * toConfirm 加签中
     * toChange  流程待变更
     */
    getDeviceList: function*() {
        let { keyword, pageNo, statusList, pageSize, forStatusList } = yield parse(this);

        let queryStatus = [];
        // 查询需要自己操作的项目
        queryStatus.push("selfConfirm");

        // 如果有计量管理员权限则用户statusList 选择有效
        // 没有权限只选择待用户审核的项目
        if (this.session.userInfo.authList.indexOf("00008") > -1) {
            if (statusList && statusList.length) {
                queryStatus = queryStatus.concat(statusList);
            } else {
                queryStatus = [];
            }
        }

        let currentUser = this.session.userInfo._id + "&" + this.session.userInfo.name;
        let ret = yield statusSvc.getDeviceByStatus(queryStatus, currentUser, forStatusList, pageNo, pageSize, keyword)

        this.body = {
            success: true,
            result: ret.list,
            total: ret.total
        }
    },
    clearNoneInfo: function*() {
        yield statusSvc.clearNoneInfo();
        this.body = {
            success: true
        }
    },
    createTest: function*(id) {
        let insId, userId;
        if (typeof(id) != "object") {
            insId = id;
            userId = "System";
            targetStatus = "1";
        } else {
            let params = yield parse(this);
            insId = params.insId;
            userId = this.session.userInfo.userId;
            targetStatus = "3";

            let authList = this.session.userInfo.authList;
            if (authList.indexOf("00000") == -1) {
                this.body = {
                    success: false,
                    message: "您没有权限执行此操作"
                }

                return;
            }
        }

        // if (!(yield statusSvc.hasInit(insId))) {
        //     this.body = {
        //         success: false,
        //         message: "仪器还没有被保管员确认，无法进行测试"
        //     }
        //     return;
        // }

        let exist = yield statusSvc.existTest(insId);
        if (!exist) {
            let ret = yield statusSvc.startTest(insId, userId, targetStatus);

            yield statusSvc.updateDevStatus(ret);

            if (id)
                this.body = {
                    success: true
                }
        } else {
            yield statusSvc.updateDevStatus({
                deviceStatus: targetStatus,
                toConfirm: "1",
                nextDeviceStatus: "",
            });
            if (id)
                this.body = {
                    success: false,
                    message: "该设备正在检测中"
                }
        }
    },
    removeAttachFile: function*() {
        let { id, "path":filePath } = yield parse(this);

        yield del([path.dirname(__dirname) + "/statics" + filePath]);

        yield statusSvc.removeAttachFile(id, filePath);
        this.body = {
            success: true
        }
    },
    changeAppliction: function*(testId) {
        let { to, note, filePath, confirmChain } = yield parse(this);

        let authList = this.session.userInfo.authList;

        if (authList.indexOf("00008") == -1) {
            this.body = {
                success: false,
                message: "您没有权限执行此操作"
            }

            return;
        }

        let testInfo = yield statusSvc.getTestInfo(testId);
        if (testInfo.toConfirm == "0") {
            this.body = {
                success: false,
                message: "该检测需要等待状态确认"
            }
            return;
        }

        if (to == "8" && !testInfo.hasReport) {
            this.body = {
                success: false,
                message: "该测试需要等待报告上传"
            }
            return;
        }

        if (statusChangeCheck(testInfo.deviceStatus, to)) {
            let tUserInfo = this.session.userInfo._id + "&" + this.session.userInfo.name + "&" + this.session.userInfo.userId;
            let ret = yield statusSvc.changeStatus(testInfo, to, note, filePath, statusChangeProveCheck(testInfo._doc.deviceStatus, to), confirmChain, tUserInfo);

            yield statusSvc.updateDevStatus(ret);

            if (to == '8' && !confirmChain) {
                let devInfo = yield dictSvc.get("insInfo", { _id: testInfo.insId })
                notifyKeeper("complete", [devInfo.keeper.split("&")[0]], [devInfo]);
            }

            if (to == '7' && !confirmChain) {
                let devInfo = yield dictSvc.get("insInfo", { _id: testInfo.insId })
                notifyKeeper("error", [devInfo.keeper.split("&")[0]], [devInfo]);
            }

            if (!confirmChain && isProcessComplete(to)) {
                let devInfo = yield dictSvc.get("insInfo", { _id: testInfo.insId })
                yield statusSvc.completeTest(testInfo._id, to);

            }
            this.body = {
                success: true
            }
        } else {
            this.body = {
                success: false,
                message: "状态转换不符合规则"
            }
        }
    },
    proveStatus: function*(testId) {
        let { note, filePath } = yield parse(this);
        let testInfo = yield statusSvc.getTestInfo(testId);

        let authList = this.session.userInfo.authList;

        // 审批流程结束后需要计量管理员
        if (testInfo.toConfirm == "2" && authList.indexOf("00008") == -1) {
            this.body = {
                success: false,
                message: "您没有权限执行此操作"
            }
            return;
        }

        if (testInfo.toConfirm != "1") {
            if (testInfo.confirmChain && testInfo.confirmChain.length != testInfo.completeChain.length) {
                let userId = this.session.userInfo._id + "&" + this.session.userInfo.name;
                if (userId != testInfo.forUser) {
                    this.body = {
                        success: false,
                        message: "您没有权限执行此操作"
                    }
                    return;
                }
            }

            let tUserInfo = this.session.userInfo._id + "&" + this.session.userInfo.name + "&" + this.session.userInfo.userId;
            let ret = yield statusSvc.proveTestChange(testInfo, note, filePath, tUserInfo);

            yield statusSvc.updateDevStatus(ret);


            //TODO: 增加不同类型邮件的发送
            // yield statusSvc.updateEndDate(devInfo);
            if (ret.deviceStatus == '8') {
                let devInfo = yield dictSvc.get("insInfo", { _id: testInfo.insId })
                notifyKeeper("complete", [devInfo.keeper.split("&")[0]], [devInfo]);
            }
            if (isProcessComplete(ret.deviceStatus)) {
                let devInfo = yield dictSvc.get("insInfo", { _id: testInfo.insId })
                // 完成检测
                yield statusSvc.completeTest(testInfo._id, ret.deviceStatus);
            }

            this.body = {
                success: true
            }
        } else {
            this.body = {
                success: false,
                message: "状态转换有误"
            }
        }
    },
    rejectChange: function*(testId) {
        let { note, filePath } = yield parse(this);
        let testInfo = yield statusSvc.getTestInfo(testId);

        if (testInfo.toConfirm != "1") {
            if (testInfo.confirmChain) {
                let userId = this.session.userInfo._id + "&" + this.session.userInfo.name;
                if (userId != testInfo.forUser) {
                    this.body = {
                        success: false,
                        message: "您没有权限执行此操作"
                    }
                    return;
                }
            }

            let ret = yield statusSvc.rejectChange(testInfo, note, filePath, this.session.userInfo._id + "&" + this.session.userInfo.name);

            let result = yield statusSvc.updateDevStatus(ret);

            if (result) {
                this.body = {
                    success: true
                }
            } else {
                this.body = {
                    success: false,
                    message: "保存失败"
                }
            }

        } else {
            this.body = {
                success: false,
                message: "状态转换有误"
            }
        }
    },
    confirmInit: function*() {
        let { id } = yield parse(this);
        let testInfo = yield dictSvc.get("insInfo", id);
        let userId = this.session.userInfo.userId;
        if (testInfo.keeper.split("&")[0] == this.session.userInfo._id) {
            yield statusSvc.setInit(id, false);
            yield statusSvc.completeClog(testInfo,userId);
            this.body = {
                success: true
            }
        } else {
            this.body = {
                success: false,
                message: "您没有权限进行此操作"
            }
        }
    }
}