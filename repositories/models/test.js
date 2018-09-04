"use strict"

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * deviceStatus 为设备当前的状态
 * 如果更新的下一个状态需要审批，那提交申请后  nextDeviceStatus  为待确认状态
 * toConfirm 0 待确认  1 确认  2 等待计量管理员确认
 */
var TestSchema = new Schema({
    /**
     * 仪器信息_id
     */
    insCode:{type:String},
    insId: { type: String },
    createTime: { type: Date },
    toConfirm: { type: String },
    fromWho:{type:String},
    /**
     * 审批链
     * @type {String}
     * user1->user2->user3
     */
    confirmChain: { type: Array },
    /**
     * 已经完成的审批链
     * @type {String}
     * user1->user2
     */
    completeChain: { type: Array },
    /**
     * 需要专人审核
     * @type {String}
     */
    forUser: { type: String },    //当前审批人

    /** 是否测试完成 */
    complete: { type: Boolean },
    /*
        1、receive:  待召回待校验仪器
        2、normal：正常使用中的仪器
        3、test: 已召回待校验的仪器
        4、pause: 暂停使用的仪器
        5、remove: 转售、退运等纳入移除类仪器
        6、limit：部分功能失效的仪器
        7、diagnose: 异常单已发出待召回
        8、send out:  已校验完毕待取件
        9、NT: 免校验类仪器
    */
    deviceStatus: { type: String },
    nextDeviceStatus: { type: String },
    log: { type: Object },
    startStatus: { type: String },
    endStatus: { type: String },
    // 是否上传报告
    hasReport: { type: Boolean },
});

module.exports = mongoose.model('TestModel', TestSchema, "cig_test");
