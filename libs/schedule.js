const schedule = require('node-schedule');
const moment = require("moment");
const notify = require("./notify.js");
const { InsInfoModel, TestModel } = require("../repositories/mongoHelper.js");
const statusSvc = require("../controllers/statuCtrl.js");
const { statusCode } = require("../modeltranform/statusrule.js");
const co = require("co");


const userSvc = require("../services/user.js");

const period = {
    month: '0 0 0 1 * *',
    day: "0 0 1 * * *",
    // month: '1/10 * * * * *',
    // day: "1/10 * * * * *"
}

function excute(rule, task) {
    return schedule.scheduleJob(rule, task);
}


function notifyError(deviceList) {
    return co(function*() {
        yield notify.notifyAdmin("error", deviceList);
    })
}

function notifyKeeper(deviceList, overTime, type) {
    return co(function*() {
        for (let device of deviceList) {
            let keeper = device.keeper.split("&")[0];
            yield notify.notifyKeeper(type || (overTime ? "timeout" : "callBackPre"), [keeper], [device], device.endDate);
        }
    })
}

function getRecieveDeviceByDay(condition, status = statusCode.normal) {
    let endDateCondition = condition;

    return new Promise((rs, rj) => {
        InsInfoModel.find({ "endDate": endDateCondition, "status": status }, (err, res) => {
            if (err) {
                console.log(err);
                rj(err);
            } else {
                rs(res);
            }
        });
    }).then(data => {
        if (data && data.length) {
            return data;
        } else {
            return [];
        }
    }).catch(err => {
        console.log(err);
        return [];
    })
}


function monthHandler() {
    co(function*() {
        //下个月1号的0点作为本次获取的时间节点
        let monthEndDate = moment().add(2, "M").format("YYYY-MM-01 00:00:00");
        let monthStartDate = moment().add(1, "M").format("YYYY-MM-01 00:00:00");

        let list = yield getRecieveDeviceByDay({
            "$lt": new Date(monthEndDate),
            // "$gt": new Date(monthStartDate)
        });

        // 将所有本月待检仪器状态设置为recieve
        for (let insInfo of list) {
            yield statusSvc.createTest(insInfo.id);
        }

        // 通知召回1
        yield notifyKeeper(list);
    });
}

function getDeviceByTest(list) {
    if (list && list.length) {
        list = list.map(cur => {
            return cur.insId;
        })
    } else {
        list = [];
    }
    return new Promise((rs, rj) => {
        InsInfoModel.find({ _id: { $in: list } }, (err, res) => {
            if (err) {
                console.log(err);
                rj(err);
            } else {
                rs(res);
            }
        });
    }).then(data => {
        if (data && data.length) {
            return data;
        } else {
            return [];
        }
    }).catch(err => {
        return [];
    })
}

// 日报 获取需要处理的签核
function getDayForHandle() {
    return new Promise((rs, rj) => {
        TestModel.find({ "toConfirm": { $in: ["2", '1'] }, deviceStatus: "3", complete: false }, (err, res) => {
            if (err) {
                console.log(err);
                rj(err);
            } else {
                rs(res);
            }
        });
    }).then(data => {
        if (data && data.length) {
            return data;
        } else {
            return []
        }
    }).catch(err => {
        return [];
    })
}

// 获取超时未拿到的仪器
function getOverTimeList() {
    return new Promise((rs, rj) => {
        InsInfoModel.find({ status: "7" }, (err, res) => {
            if (err) {
                console.log(err);
                rj(err);
            } else {
                rs(res);
            }
        });
    }).then(data => {
        if (data && data.length) {
            return data;
        } else {
            return []
        }
    }).catch(err => {
        return [];
    })
}

function updateOverTime(list) {
    list = list.map(cur => {
        return cur._id;
    })
    return new Promise((rs, rj) => {
        InsInfoModel.update({ _id: { $in: list } }, { status: "7" }, (err, res) => {
            if (err) {
                console.log(err);
            } else {
                rs(res);
            }
        });
    }).then(() => {
        TestModel.update({ _id: { $in: list } }, { deviceStatus: "7", toConfirm: '1', nextDeviceStatus: "" }, (err, res) => {
            if (err) {
                console.log(err);
            } else {

            }
        });
    }).catch(err => {
        console.log(err);
    });
}

function dayHandler() {
    console.log("handleDayTask", moment().format("YYYY-MM-DD HH:mm:ss"));
    let secondCallEndDate = moment().add(7, "d").format("YYYY-MM-DD 00:00:00");
    let thirdCallEndDate = moment().add(3, "d").format("YYYY-MM-DD 00:00:00");
    let forthCallEndDate = moment().add(1, "d").format("YYYY-MM-DD 00:00:00");
    let overdueCallEndDate = moment().format("YYYY-MM-DD 00:00:00")

    co(function*() {
        //获取各个阶段设备列表
        let c2List = yield getRecieveDeviceByDay({
            "$lt": new Date(secondCallEndDate),
            "$gt": new Date(thirdCallEndDate),
        });
        let c3List = yield getRecieveDeviceByDay({
            "$lt": new Date(thirdCallEndDate),
            "$gt": new Date(forthCallEndDate),
        });
        let c4List = yield getRecieveDeviceByDay({
            "$lt": new Date(forthCallEndDate),
            "$gt": new Date(overdueCallEndDate),
        });

        console.log(`send count: c2List ${c2List.length},c3List ${c3List.length},c4List:${c4List.length} `);
        // 通知召回234
        yield notifyKeeper(c2List);
        yield notifyKeeper(c3List);
        yield notifyKeeper(c4List);
        let coList = yield getRecieveDeviceByDay({
            "$lt": new Date(overdueCallEndDate)
        });

        let hasoList = yield getOverTimeList();
        console.log(`send count: coList ${coList.length}, hasoList ${hasoList.length}`);
        // 每天发送异常列表到责任人 5
        notifyKeeper(hasoList, false, "error")


        // 发送超时通知 6
        yield notifyKeeper(coList.concat(hasoList), true);

        // 自动更新超时状态 
        if (coList && coList.length) {
            yield updateOverTime(coList)
        }
        // 告知管理员异常流程处理 8
        yield notify.notifyAdmin("timeout", coList)

        let dayForHandleTestList = yield getDayForHandle();
        let dayForHandleList = yield getDeviceByTest(dayForHandleTestList);

        console.log(`send count: dayForHandleList ${dayForHandleList.length}`);
        if (dayForHandleList && dayForHandleList.length)
            // 日报功能 7
            yield notify.notifyAdmin("report", dayForHandleList)
    });
}
//每个月1日执行，向本月需要检测的一起发邮件
function initMonthSendList() {
    // excute(period.month, monthHandler);
}

//每天执行，检测是否需要发催收邮件
function initDayEveryCheck() {
    excute(period.day, dayHandler);
}

// 每天检查待召回
function initDayEveryCheck() {
    excute(period.day, monthHandler);
}

function initUserImport() {
    excute(period.day, function() {
        //获取催收邮件的时间节点
        co(function*() {
            yield userSvc.import();
        });
    });
}

module.exports = {
    init() {
        initMonthSendList();
        initDayEveryCheck();
        initUserImport();
        // monthHandler();
        // dayHandler();
    }
}