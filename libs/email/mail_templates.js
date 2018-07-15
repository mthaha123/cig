const { EmailModel } = require("../../repositories/mongoHelper.js");

module.exports.getTpls = function() {
    return new Promise((rs, rj) => {
        let ret = {};
        EmailModel.find({}, function(err,res) {
            res.forEach((cur) => {
                ret[cur.name] = {
                    title: cur.title,
                    content: cur.content
                }
            });

            rs(ret);
        })
    })

}

module.exports.template = {
    //到期通知（时间长）
    callBackPre: {
        title: "送检通知",
        content: `Dear All：
    下述仪器将于{date}到期，请归属单位及时协调在到期前将仪器送至计量管理中心校准，谢谢！
    本信息为系统自动发送，无需回复！`
    },
    // //到期通知 短
    // callBackNear: `Dear All：
    // 下述仪器将于{day}日内到期，请归属单位及时协调在到期前将仪器送至计量管理中心校准，如仪器过期未送校准，计量管理中心将强行隔离仪器，避免客户投诉及引起质量异常。谢谢！
    // 本信息为系统自动发送，无需回复！`,
    //异常通知
    timeout: {
        title: "待测超时通知",
        content: `Dear All：
    下述仪器已经过期未校准，请归属单位尽快确认仪器去向并签核系统中的异常处理单。
    本信息为系统自动发送，无需回复！`,
    },
    // 完成通知
    complete: {
        title: "检测完成通知",
        content: `Dear All：
    下述仪器已经完成校准，请归属单位从计量管理中心取走仪器。
    本信息为系统自动发送，无需回复！`,
    },
    // 错误通知
    error: {
        title: "异常通知",
        content: `Dear All：
    下述仪器异常处理流程请及时处理！
    本信息为系统自动发送，无需回复！`,
    },
    // 未处理清单
    report: {
        title: "每日处理通知",
        content: `各位计量管理员：
    下述清单未待处理清单，请及时处理避免过期
    本信息为系统自动发送，无需回复！`,
    },
    // 签核通知
    handle: {
        title: "签核通知",
        content: `各位计量管理员：
    下述清单流程签核中，请及时处理避免过期
    本信息为系统自动发送，无需回复！`
    },
    // 人员变动通知
    userchange: {
        title: "人员变通通知",
        content: `各位计量管理员：
    下述人员信息发生变更，请及时调整！
    本信息为系统自动发送，无需回复！`,
    },
    // 
    infochange: {
        title: "信息变更通知",
        content: `各位计量管理员：
    下述人员信息发生变更，请及时调整！
    本信息为系统自动发送，无需回复！`
    },
    pwd: {
        title: "密码找回",
        content: `您好：
    您的密码已被重置！
    重置后的初始密码为{pwd},
    请尽快登录系统修改密码`
    }
}

module.exports.SendType = {
    PreMonth: "callBackPre",
    PreWeek: "callBackPre",
    Pre3Day: "callBackPre",
    Pre1Day: "callBackPre",
    OverTime: "timeout",
    Complete: "complete",
    Error: "error",
    Report: "report",
    Handling: "handle",
    UserChange: "userchange",
    InfoChange: "infochange",
}