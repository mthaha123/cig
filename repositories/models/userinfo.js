"use strict"

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userInfoSchema = new Schema({
    
    userId: { type: String, index: true },
    name: { type: String },
    Email: { type: String },
    role: { type: Number },
    isInit: { type: Boolean },
    password: { type: String },
    isLock: { type: Boolean },
    isValid:{ type: Boolean },
    authList: { type: Array },
    isDelete: { type: Boolean, default: false},
});

module.exports = mongoose.model('UserInfoModel', userInfoSchema, "cig_user");
