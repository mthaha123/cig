const schedule = require('node-schedule');
const moment = require("moment");
const notify = require("./notify.js");
const { InsInfoModel, TestModel,DepModel } = require("../repositories/mongoHelper.js");
const statusSvc = require("../controllers/statuCtrl.js");
const { statusCode } = require("../modeltranform/statusrule.js");
const co = require("co");
const dictSvc = require("../services/dict");
const xlsx = require("node-xlsx");
const commonSvc = require("../services/common.js");

const userSvc = require("../services/user.js");

const period = {
    month: '0 0 0 1 * *',
    day: "0 0 1 * * *",
    day2: "0 37 22 * * *",
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
/* //通知仪器保管人以及相关主管，并抄送计量管理员
function notifyKeeper(deviceList, overTime, type) {
    return co(function*() {
        for (let device of deviceList) {
            let reciever = [];
            let keeper = device.keeper.split("&")[0];
            reciever.push(keeper);
            let depCode = device.depCode;
            let dep = yield DepModel.findOne({name:depCode});//获取部门领导相关信息
            if(dep){
                if(dep.manager) reciever.push(dep.manager.split("&")[0]);
                if(dep.proxer)  reciever.push(dep.proxer.split("&")[0]);
                if(dep.staff)  reciever.push(dep.staff.split("&")[0]);
            }
            yield notify.notifyKeeper(type || (overTime ? "timeout" : "callBackPre"), reciever, [device], device.endDate);
            // todo  通知计量管理员
        }
    })
} */

//按部门通知仪器保管人以及相关主管，并抄送计量管理员
function notifyKeeper(devicelist, type) {
    return co(function*() {
        let deviceList = [];
        let dep = [];
        let reciever;
        for (let device of devicelist) {
            let depCode = device.depCode;
            let index = dep.indexOf(depCode);
            if(index ==-1){
                dep.push(depCode);
                deviceList.push([device]);
            }else{
                deviceList[index].push(device);
            }
        }
        if(dep && dep.length){
            for(let i =0;i<dep.length;i++){
                reciever = [];
                let department = yield DepModel.findOne({name:dep[i]});//获取部门领导相关信息
                if(department){
                    if(department.keeper) reciever.push(department.keeper.split("&")[0]);
                    if(department.manager) reciever.push(department.manager.split("&")[0]);
                    if(department.proxer)  reciever.push(department.proxer.split("&")[0]);
                    if(department.staff)  reciever.push(department.staff.split("&")[0]);
                    //判断type类型
                    switch(type){
                        case "forthCallBack" : {
                            if(department.seniorManager) reciever.push(department.seniorManager.split("&")[0]);
                            break;
                        }
                        case "error" : {
                            if(department.seniorManager) reciever.push(department.seniorManager.split("&")[0]);
                            break;
                        }
                        case "timeout":{
                            if(department.seniorManager) reciever.push(department.seniorManager.split("&")[0]);
                            if(department.generalManager) reciever.push(department.generalManager.split("&")[0]);
                            break;
                        }
                        default: break;
                    }
                    yield notify.notifyKeeper(type, reciever,deviceList[i]);
                }
            }
        }
    })
}

function getRecieveDeviceByDay(condition, status = statusCode.normal) {
    let endDateCondition = condition;
    let stat = {"$in":[statusCode.receive,status]}
    return new Promise((rs, rj) => {
        InsInfoModel.find({ "endDate": endDateCondition, "status": stat,"testType":{"$in":["0","1"]},"isDelete":{$ne:true} }, (err, res) => {
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

//每月1号检查下月前到期需召回的仪器
function monthHandler() {
    co(function*() {
        //下个月1号的0点作为本次获取的时间节点
        let monthEndDate = moment().add(2, "M").format("YYYY-MM-01 00:00:00");
        let monthStartDate = moment().add(1, "M").format("YYYY-MM-01 00:00:00");

        let list = yield getRecieveDeviceByDay({
            "$lt": new Date(monthEndDate),
            // "$gt": new Date(monthStartDate)
        });

        // 将所有下月待检仪器状态设置为recieve
        for (let insInfo of list) {
            yield statusSvc.createTest(insInfo.id);    //创建测试并修改仪器表中仪器状态
        }

        // 第一次通知召回提醒
        yield notifyKeeper(list,"callBackPre");
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
        InsInfoModel.find({ status: "7",isDelete:{$ne:true} }, (err, res) => {
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
//更新过期仪器状态
function updateOverTime(list) {
    list = list.filter(cur =>{
        if(cur.testType=="0"||cur.testType=="1"){
            return true;
        }else{
            return false;
        }
    })
    list = list.map(cur => {
        return cur.id;
    })
    return new Promise((rs, rj) => {
        InsInfoModel.updateMany({ _id: { $in: list } }, { status: "7" }, (err, res) => {
            if (err) {
                console.log(err);
            } else {
                rs(res);
            }
        });
    }).then(() => {
        TestModel.updateMany({ insId: { $in: list } }, { deviceStatus: "7", toConfirm: '1', nextDeviceStatus: "" }, (err, res) => {
            if (err) {
                console.log(err);
            } else {

            }
        });
    }).catch(err => {
        console.log(err);
    });
}

//获取未完结流程仪器，除待召回仪器
function* getHandleList(){
    let whereObj = {
        complete : false,
        deviceStatus:{$ne:"1"}
    }
    let ret = yield dictSvc.getRecodeList(whereObj, 0, 100);
    return ret.list2;
}

//获取签核中的仪器信息
function* getDayforConfirmList(){
    let whereObj = {
        toConfirm: "2",
        complete : false,
        deviceStatus:{$ne:"1"}
    }
    let ret = yield dictSvc.getRecodeList(whereObj, 0, 100);
    return ret.list2;
}

//获取变更保管人信息
function* getDayforKeeperList(){
    let whereObj = {
        complete:false,
        confirm:"0"
    }
    let ret = yield dictSvc.getList("confirmLog", whereObj, 0, 100);
    return ret.list;
}

//通知取件信息
function* notifyCompleteList(){
    let whereObj ={
        complete:true,
        deviceStatus:"8"
    }
    let ret = yield dictSvc.getRecodeList(whereObj, 0, 100);
    if(ret.list2&&ret.list2.length){
        ret.list2.map(cur => {
            return cur.insInfo;
        })
        notifyKeeper(ret.list2,"complete");
    }
}

//每天检查仪器是否要到期
function dayHandler() {
    console.log("handleDayTask", moment().format("YYYY-MM-DD HH:mm:ss"));
    let secondCallEndDate = moment().add(7, "d").format("YYYY-MM-DD 00:00:00");
    let secondCallStartDate = moment().add(6, "d").format("YYYY-MM-DD 00:00:00");
    let thirdCallEndDate = moment().add(3, "d").format("YYYY-MM-DD 00:00:00");
    let thirdCallStartDate = moment().add(2, "d").format("YYYY-MM-DD 00:00:00");
    let forthCallEndDate = moment().add(1, "d").format("YYYY-MM-DD 00:00:00");
    let forthCallStartDate = moment().format("YYYY-MM-DD 00:00:00");
    let overdueCallEndDate = moment().format("YYYY-MM-DD 00:00:00")

    co(function*() {
        //获取各个阶段设备列表
        let c2List = yield getRecieveDeviceByDay({
            "$lt": new Date(secondCallEndDate),
            "$gt": new Date(secondCallStartDate),
        },statusCode.receive);
        let c3List = yield getRecieveDeviceByDay({
            "$lt": new Date(thirdCallEndDate),
            "$gt": new Date(thirdCallStartDate),
        },statusCode.receive);
        let c4List = yield getRecieveDeviceByDay({
            "$lt": new Date(forthCallEndDate),
            "$gt": new Date(forthCallStartDate),
        },statusCode.receive);

        console.log(`send count: c2List ${c2List.length},c3List ${c3List.length},c4List:${c4List.length} `);
        // 通知召回234
        yield notifyKeeper(c2List,"secondCallBack");
        yield notifyKeeper(c3List,"thirdCallBack");
        yield notifyKeeper(c4List,"forthCallBack");

        //获取过期仪器信息并通知
        let coList = yield getRecieveDeviceByDay({
            "$lt": new Date(overdueCallEndDate)
        });
        // 发送过期通知 （5）
        yield notifyKeeper(coList, "timeout");

        let hasoList = yield getOverTimeList();
        // console.log(`send count: coList ${coList.length}, hasoList ${hasoList.length}`);
        // 每天发送异常列表到责任人 (7)
        notifyKeeper(hasoList, "error");


        // 自动更新超时状态 
        if (coList && coList.length) {
            yield updateOverTime(coList)
        }

        //每日报表提醒(8)
        let dayForHandleList = yield getHandleList();
        // let dayForHandleTestList = yield getDayForHandle();                  
        // let dayForHandleList = yield getDeviceByTest(dayForHandleTestList);

        // console.log(`send count: dayForHandleList ${dayForHandleList.length}`);
        if (dayForHandleList && dayForHandleList.length){
            // 日报功能 7
            yield notify.notifyAdmin("report", dayForHandleList)
        }

        //签核中邮件通知 （9）
        let dayforConfirmList = yield getDayforConfirmList();
        if (dayforConfirmList && dayforConfirmList.length){
            yield notify.notifyAdmin("handle", dayforConfirmList);
        }

        //保管人变更通知(10)
        let dayforKeeperList = yield getDayforKeeperList();
        if (dayforKeeperList && dayforKeeperList.length){
            for(ckeeper of dayforKeeperList){
                let reciever = [];
                reciever.push(ckeeper.keeper.split("&")[0]) ;
                if(ckeeper.fromKeeper !="无"){
                    reciever.push(ckeeper.fromKeeper.split("&")[0]);
                }
                yield notify.notifyKeeper("userchange", reciever,[ckeeper]);
            }
        }

        //完成校准通知（6）
        yield notifyCompleteList();

        yield userImport();
    });
}
//每个月1日执行，向本月需要检测的一起发邮件
function initMonthSendList() {
    excute(period.month, monthHandler);
}

//每天执行，检测是否需要发催收邮件
function initDayEveryCheck() {
    excute(period.day, dayHandler);
}

// // 每天检查待召回
// function initDayEveryCheck() {
//     excute(period.day, monthHandler);
// }

//每天定时更新用户信息，如发现无效且为科室信息中登记过的员工,发送邮件
function initUserImport() {
    excute(period.day, userImport);
}

function* userImport() {
        
   
    yield userSvc.import();
    let whereObj = {isValid:{$ne: true}};
    let ret = yield dictSvc.getInvalidList(whereObj, 0, 100);
    if(ret.total&&ret.list.length){
        // 重要人员离职通知(10)
        yield notify.notifyAdmin("infochange",ret.list);
    }

}
function initUpdataList(){
    excute(period.day2, updateInsList);
}

function updateInsList(){
    co(function*(){
        var content = xlsx.parse("inslist.xlsx");
        let list = yield commonSvc.UpdateInsList(content[0]);
    })
}

module.exports = {
    init() {
        initMonthSendList();     //每月1号提醒下月到期仪器
        initDayEveryCheck();     //每天检查仪器是否要到期
        // initUpdataList();
        // initUserImport();        //每天定时更新用户信息，如发现无效且为科室信息中登记过的员工,发送邮件
        // monthHandler();
        // dayHandler();
    }
}