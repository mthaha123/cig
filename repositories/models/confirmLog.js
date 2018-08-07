"use strict"

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * deviceStatus 为设备当前的状态
 * 如果更新的下一个状态需要审批，那提交申请后  nextDeviceStatus  为待确认状态
 * toConfirm 0 待确认  1 确认  2 等待计量管理员确认
 */
var ConfirmLogSchema = new Schema({
    /**
     * 仪器信息_id
     */
    insCode:{type:String},
    insId: { type: String },
    insName:{ type: String},
    createTime: { type: Date },
    updateTime: { type: Date },
    //确认  0 待确认   1 确认完成    2 确认失败
    confirm: { type: String , default : "0" },
    /** 是否确认完成 */
    complete: { type: Boolean , default:false},
   /* 
        Keeper:确认完成后的保管人   fromKeeper:之前的保管人
   */
    keeper: { type: String },
    fromKeeper: { type: String , default :"无" },
    log: { type: Object },
},{timestamps:{
    createdAt: "createTime",
    updatedAt: "updateTime",
}}
);

module.exports = mongoose.model('confirmLogModel', ConfirmLogSchema, "cig_confirmLog");
